const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');
const OpenAI = require('openai');
const multer = require('multer');
const xlsx = require('xlsx');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Global state for dual mode
let currentMode = 'none'; // 'excel', 'snowflake', or 'none'
let excelData = null;
let excelSchema = null;

// Simple in-memory SQL engine for Excel/CSV data
class SimpleSQLEngine {
  constructor(data) {
    this.data = data;
    this.columns = data.length > 0 ? Object.keys(data[0]) : [];
  }

  // Execute SQL-like queries on the data
  executeQuery(sql) {
    try {
      // Simple parsing for basic SQL operations
      const upperSQL = sql.toUpperCase();
      
      if (upperSQL.includes('SELECT *')) {
        return this.data;
      }
      
      if (upperSQL.includes('SELECT') && upperSQL.includes('FROM')) {
        // Extract column names from SELECT clause
        const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
        if (selectMatch) {
          const columns = selectMatch[1].split(',').map(col => col.trim());
          return this.data.map(row => {
            const newRow = {};
            columns.forEach(col => {
              if (col === '*') {
                Object.assign(newRow, row);
              } else {
                newRow[col] = row[col];
              }
            });
            return newRow;
          });
        }
      }
      
      if (upperSQL.includes('LIMIT')) {
        const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          return this.data.slice(0, limit);
        }
      }
      
      // Default: return all data
      return this.data;
    } catch (error) {
      console.error('Error executing query on Excel data:', error);
      return this.data;
    }
  }

  // Get schema information
  getSchema() {
    return this.columns.map(col => ({
      TABLE_NAME: 'EXCEL_DATA',
      COLUMN_NAME: col,
      DATA_TYPE: 'VARCHAR',
      IS_NULLABLE: 'YES'
    }));
  }
}

// Global SQL engine instance
let sqlEngine = null;

// Structured Output Module
class StructuredOutputGenerator {
  constructor() {
    this.sections = [];
  }

  // Generate structured response
  generateStructuredResponse(query, sqlQuery, data, summary, chartData) {
    const response = {
      query: {
        original: query,
        generated_sql: sqlQuery,
        timestamp: new Date().toISOString()
      },
      data_summary: {
        total_rows: summary.totalRows,
        total_columns: summary.columnCount,
        columns: summary.columnNames,
        data_types: {
          numeric: summary.hasNumericData,
          date: summary.hasDateData
        }
      },
      insights: this.generateInsights(data, summary),
      visualization: {
        suggested_chart_type: chartData.chartSuggestion,
        chart_data: chartData,
        chart_config: this.generateChartConfig(chartData)
      },
      results: {
        preview: data.slice(0, 10),
        full_count: data.length,
        sample_size: Math.min(10, data.length)
      },
      metadata: {
        processing_time: new Date().toISOString(),
        data_source: 'csv/excel',
        query_complexity: this.assessQueryComplexity(sqlQuery)
      }
    };

    return response;
  }

  // Generate insights from the data
  generateInsights(data, summary) {
    const insights = {
      data_quality: this.assessDataQuality(data),
      key_findings: this.extractKeyFindings(data, summary),
      recommendations: this.generateRecommendations(data, summary)
    };

    return insights;
  }

  // Assess data quality
  assessDataQuality(data) {
    if (!data || data.length === 0) {
      return { status: 'error', message: 'No data available' };
    }

    const sample = data.slice(0, 100); // Analyze first 100 rows
    const columns = Object.keys(data[0]);
    
    const qualityMetrics = {
      completeness: this.calculateCompleteness(sample, columns),
      consistency: this.assessConsistency(sample, columns),
      uniqueness: this.calculateUniqueness(sample, columns)
    };

    return {
      status: 'good',
      metrics: qualityMetrics,
      sample_size: sample.length,
      total_columns: columns.length
    };
  }

  // Calculate data completeness
  calculateCompleteness(data, columns) {
    const completeness = {};
    columns.forEach(col => {
      const nonEmpty = data.filter(row => row[col] && row[col].toString().trim() !== '').length;
      completeness[col] = (nonEmpty / data.length) * 100;
    });
    return completeness;
  }

  // Assess data consistency
  assessConsistency(data, columns) {
    const consistency = {};
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== undefined && val !== null);
      const uniqueValues = new Set(values);
      consistency[col] = {
        unique_count: uniqueValues.size,
        total_count: values.length,
        variety_score: uniqueValues.size / values.length
      };
    });
    return consistency;
  }

  // Calculate uniqueness
  calculateUniqueness(data, columns) {
    const uniqueness = {};
    columns.forEach(col => {
      const values = data.map(row => row[col]);
      const uniqueValues = new Set(values);
      uniqueness[col] = (uniqueValues.size / values.length) * 100;
    });
    return uniqueness;
  }

  // Extract key findings
  extractKeyFindings(data, summary) {
    const findings = [];
    
    if (summary.hasNumericData) {
      findings.push("Dataset contains numeric data suitable for statistical analysis");
    }
    
    if (summary.hasDateData) {
      findings.push("Date fields present - temporal analysis possible");
    }
    
    if (summary.totalRows > 100) {
      findings.push(`Large dataset with ${summary.totalRows} records`);
    }
    
    if (summary.columnCount > 5) {
      findings.push(`Multi-dimensional data with ${summary.columnCount} attributes`);
    }

    return findings;
  }

  // Generate recommendations
  generateRecommendations(data, summary) {
    const recommendations = [];
    
    if (summary.hasNumericData) {
      recommendations.push("Consider creating charts to visualize numeric trends");
    }
    
    if (summary.hasDateData) {
      recommendations.push("Time-series analysis could reveal temporal patterns");
    }
    
    if (summary.totalRows > 50) {
      recommendations.push("Large dataset - consider sampling for quick analysis");
    }

    return recommendations;
  }

  // Generate chart configuration
  generateChartConfig(chartData) {
    const config = {
      type: chartData.chartSuggestion,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };

    if (chartData.type === 'aggregated' && chartData.numericColumns) {
      config.data = {
        labels: chartData.numericColumns,
        datasets: [{
          label: 'Data Values',
          data: chartData.numericColumns.map(col => chartData.statistics[col]?.avg || 0)
        }]
      };
    }

    return config;
  }

  // Assess query complexity
  assessQueryComplexity(sqlQuery) {
    const complexity = {
      level: 'simple',
      features: []
    };

    if (sqlQuery.toUpperCase().includes('GROUP BY')) {
      complexity.level = 'medium';
      complexity.features.push('aggregation');
    }

    if (sqlQuery.toUpperCase().includes('WHERE')) {
      complexity.features.push('filtering');
    }

    if (sqlQuery.toUpperCase().includes('ORDER BY')) {
      complexity.features.push('sorting');
    }

    if (sqlQuery.toUpperCase().includes('JOIN')) {
      complexity.level = 'complex';
      complexity.features.push('joining');
    }

    return complexity;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Snowflake connection configuration
const snowflakeConfig = {
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: 'abhijes2@cisco.com', // Use your email address
  role: 'PUBLIC', // Try with PUBLIC role
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
  authenticator: 'externalbrowser', // Use browser-based SSO
  region: 'us-east-1', // Add region explicitly
};

// Create Snowflake connection
let connection;

async function connectToSnowflake() {
  try {
    connection = snowflake.createConnection(snowflakeConfig);
    console.log('🔐 Attempting to connect to Snowflake with browser-based SSO...');
    console.log('🌐 A browser window should open for authentication');
    console.log('📝 Note: Make sure to authenticate as user: ABHIJES2');
    
    await new Promise((resolve, reject) => {
      connection.connectAsync((err, conn) => {
        if (err) {
          if (err.code === 390322) {
            console.error('❌ User mismatch error:');
            console.error('   The authenticated user does not match ABHIJES2');
            console.error('   Please log out from your SSO provider and try again');
            console.error('   Make sure to authenticate as user: ABHIJES2');
          } else {
            console.error('❌ Error connecting to Snowflake:', err.message);
          }
          reject(err);
        } else {
          console.log('✅ Successfully connected to Snowflake via browser-based SSO');
          resolve(conn);
        }
      });
    });
  } catch (error) {
    console.error('❌ Failed to connect to Snowflake:', error.message);
    throw error;
  }
}

// Execute SQL query
async function executeQuery(sql) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    });
  });
}

// Check if connection is valid
async function checkConnection() {
  if (!connection) {
    console.log('🔄 No connection found, establishing new connection...');
    await connectToSnowflake();
  } else if (!connection.isUp()) {
    console.log('🔄 Connection lost, reconnecting to Snowflake...');
    await connectToSnowflake();
  }
  
  // Try to activate a warehouse for queries
  try {
    // First try to get available warehouses
    const warehouses = await executeQuery('SHOW WAREHOUSES');
    if (warehouses && warehouses.length > 0) {
      const firstWarehouse = warehouses[0].name;
      await executeQuery(`USE WAREHOUSE ${firstWarehouse}`);
      console.log(`✅ Warehouse activated: ${firstWarehouse}`);
    } else {
      console.log('⚠️ No warehouses available, trying without warehouse...');
    }
  } catch (warehouseError) {
    try {
      await executeQuery('USE WAREHOUSE COMPUTE_WH');
      console.log('✅ Warehouse activated: COMPUTE_WH');
    } catch (warehouseError2) {
      try {
        await executeQuery('USE WAREHOUSE WH_XS');
        console.log('✅ Warehouse activated: WH_XS');
      } catch (warehouseError3) {
        console.log('⚠️ Could not activate warehouse, trying without warehouse...');
        // Continue without warehouse - some operations might still work
      }
    }
  }
  
  console.log('✅ Connection ready for queries');
}

// Get database schema
async function getSchema() {
  try {
    await checkConnection();
    const sql = `
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.SNOWFLAKE_SCHEMA}'
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;
    return await executeQuery(sql);
  } catch (error) {
    console.error('Error getting schema:', error);
    return [];
  }
}

// AI-powered SQL generation
async function generateSQL(userQuery, schema) {
  try {
    // Limit schema to first 50 columns to avoid token limit
    const limitedSchema = schema.slice(0, 50);
    const schemaText = limitedSchema.map(col => 
      `${col.TABLE_NAME}.${col.COLUMN_NAME} (${col.DATA_TYPE})`
    ).join('\n');

    const prompt = `
You are an expert SQL developer for Snowflake. Given the following database schema and user query, generate a SQL query.

Database Schema:
${schemaText}

User Query: ${userQuery}

IMPORTANT: This database contains the following tables:
- ACCOUNT_SUMMARY: Account information and summaries
- ADAPTER_UNITS: Adapter and unit data
- COMPUTE_PHYSICALSUMMARIES: Physical compute summaries
- IAM_USERS: Identity and access management users
- LICENSE_LICENSEINFOS: License information
- NETWORK_ELEMENTSUMMARIES: Network element summaries
- VIRTUALIZATION_VIRTUALMACHINES: Virtual machine data
- TECHSUPPORTMANAGEMENT_ENDPOINTS: Technical support endpoints

SPECIAL INSTRUCTIONS:
- For warehouse-related queries, use: SHOW WAREHOUSES
- For table-related queries, use: SHOW TABLES
- For schema queries, use: SELECT * FROM INFORMATION_SCHEMA.TABLES

Generate a SQL query that:
1. Uses ONLY the tables listed above - do NOT reference any other tables
2. Uses appropriate tables and columns from the provided schema
3. Handles the user's intent correctly
4. Returns clean, structured data suitable for visualization
5. Uses proper Snowflake SQL syntax
6. If no specific table is mentioned, use SHOW TABLES or SELECT * FROM INFORMATION_SCHEMA.TABLES
7. Keep queries simple and avoid complex joins unless specifically requested
8. NEVER reference tables like 'SALES', 'CUSTOMERS', 'ORDERS' - these don't exist
9. For warehouse questions, use SHOW WAREHOUSES
10. For table questions, use SHOW TABLES

Return only the SQL query, no explanations or markdown formatting.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating SQL:', error);
    throw error;
  }
}

// Helper: Check for data file in uploads/ (Excel or CSV)
function findDataFile() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) return null;
  const files = fs.readdirSync(uploadsDir).filter(f => 
    f.endsWith('.xlsx') || f.endsWith('.xls') || f.endsWith('.csv')
  );
  if (files.length === 0) return null;
  return path.join(uploadsDir, files[0]); // Use the first data file found
}

// Helper: Process data file (Excel or CSV)
function processDataFile(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();
  
  let data;
  if (fileExtension === '.csv') {
    // Handle CSV files
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    
    data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  } else {
    // Handle Excel files
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(worksheet);
  }
  
  if (data.length === 0) throw new Error('Data file is empty');
  
  // Initialize SQL engine with the data
  sqlEngine = new SimpleSQLEngine(data);
  excelData = data;
  excelSchema = sqlEngine.getSchema();
  currentMode = 'excel';
  
  console.log(`✅ Data file processed: ${data.length} rows, ${Object.keys(data[0]).length} columns`);
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI SQL Assistant is running' });
});

// API: Connect to Snowflake
app.post('/api/connect-snowflake', async (req, res) => {
  try {
    await connectToSnowflake();
    currentMode = 'snowflake';
    res.json({ 
      success: true, 
      message: 'Connected to Snowflake successfully',
      mode: 'snowflake'
    });
  } catch (error) {
    console.error('Error connecting to Snowflake:', error);
    res.status(500).json({ 
      error: 'Failed to connect to Snowflake', 
      details: error.message 
    });
  }
});

// Process user query (updated to handle Excel/CSV data with SQL operations)
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Check for data file first (Excel or CSV)
    const dataFile = findDataFile();
    if (dataFile) {
      try {
        processDataFile(dataFile);
        
        // Generate SQL query using AI
        const sqlQuery = await generateSQL(query, excelSchema);
        
        // Execute query on data using SQL engine
        const results = sqlEngine.executeQuery(sqlQuery);
        
        // Process results similar to Snowflake
        const processedData = processDataLocally(results);
        
        // Generate structured output
        const outputGenerator = new StructuredOutputGenerator();
        const structuredResponse = outputGenerator.generateStructuredResponse(
          query, 
          sqlQuery, 
          results, 
          processedData.summary, 
          processedData.chartData
        );
        
        return res.json({
          success: true,
          mode: 'excel',
          message: `Using data file: ${path.basename(dataFile)}`,
          structured_output: structuredResponse
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to process data file', details: err.message });
      }
    } else {
      // No data file found - for testing, don't connect to Snowflake
      return res.status(200).json({
        mode: 'none',
        message: 'No Excel or CSV file found in uploads folder. Please place a data file in the uploads/ folder to test.',
        action: 'upload_data'
      });
    }
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query', details: error.message });
  }
});

// Get safe schema information (no sensitive details)
app.get('/api/schema', async (req, res) => {
  try {
    const schema = await getSchema();
    
    // Return only safe schema information
    const safeSchema = schema.map(col => ({
      tableName: col.TABLE_NAME,
      columnName: col.COLUMN_NAME,
      dataType: col.DATA_TYPE,
      isNullable: col.IS_NULLABLE === 'YES'
    }));
    
    res.json({ 
      schema: safeSchema,
      tableCount: [...new Set(safeSchema.map(col => col.tableName))].length,
      columnCount: safeSchema.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get schema' });
  }
});

// Helper functions - Local data processing only
function processDataLocally(data) {
  if (!data || data.length === 0) {
    return {
      summary: 'No data found',
      chartData: [],
      chartType: 'table',
      rowCount: 0
    };
  }
  
  const rowCount = data.length;
  const columns = Object.keys(data[0] || {});
  
  // Create safe summary without exposing sensitive data
  const summary = {
    totalRows: rowCount,
    columnCount: columns.length,
    columnNames: columns.map(col => col.replace(/[^a-zA-Z0-9_]/g, '')), // Sanitize column names
    hasNumericData: columns.some(col => 
      typeof data[0][col] === 'number' || !isNaN(parseFloat(data[0][col]))
    ),
    hasDateData: columns.some(col => 
      col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
    )
  };
  
  // Create safe chart data (aggregated, no raw data)
  const chartData = createSafeChartData(data, columns);
  
  // Determine chart type
  const chartType = determineChartType(data, columns);
  
  return {
    summary,
    chartData,
    chartType,
    rowCount
  };
}

function createSafeChartData(data, columns) {
  // Only return aggregated, non-sensitive information
  const numericColumns = columns.filter(col => 
    typeof data[0][col] === 'number' || !isNaN(parseFloat(data[0][col]))
  );
  
  if (numericColumns.length === 0) {
    return {
      type: 'summary',
      message: `Found ${data.length} records with ${columns.length} columns`
    };
  }
  
  // Create safe aggregated data
  const aggregated = {};
  numericColumns.forEach(col => {
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length > 0) {
      aggregated[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length
      };
    }
  });
  
  return {
    type: 'aggregated',
    numericColumns: Object.keys(aggregated),
    statistics: aggregated
  };
}

function determineChartType(data, columns) {
  if (!data || data.length === 0) return 'table';
  
  const numericColumns = columns.filter(col => 
    typeof data[0][col] === 'number' || !isNaN(parseFloat(data[0][col]))
  );
  const dateColumns = columns.filter(col => 
    col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
  );
  
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    return 'line';
  } else if (numericColumns.length > 1) {
    return 'bar';
  } else if (data.length <= 10) {
    return 'pie';
  } else {
    return 'table';
  }
}

// Initialize connection and start server
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 AI SQL Assistant server running on port ${PORT}`);
      console.log(`🌐 Access the application at: http://localhost:${PORT}`);
      console.log('📝 Note: Connection to Snowflake will be established on first query');
      console.log('🔐 SSO authentication will open in browser when needed');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error); 