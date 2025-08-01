# AI SQL Assistant - Database Documentation & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Cisco VPN connection
- Snowflake SSO access
- OpenAI API key

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your credentials:
   - `SNOWFLAKE_ACCOUNT=CISCO.us-east-1`
   - `SNOWFLAKE_USER=abhijes2@cisco.com`
   - `SNOWFLAKE_ROLE=PUBLIC`
   - `SNOWFLAKE_DATABASE=ENGIT_DB`
   - `SNOWFLAKE_SCHEMA=ENGIT_ISDATAMART_BR`
   - `OPENAI_API_KEY=your_openai_key`

3. **Start the Application**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Open: `http://localhost:3001`
   - Authenticate with Snowflake SSO when prompted

## 📊 Database Schema Overview

### Database: `ENGIT_DB`
### Schema: `ENGIT_ISDATAMART_BR`

## 🗂️ Available Tables

### 1. **ACCOUNT_SUMMARY** (45,055 rows)
- **Purpose**: Account-level summaries and metrics
- **Key Columns**: Account information, summary statistics
- **Use Cases**: Account analysis, customer insights
- **Sample Query**: `SELECT * FROM ACCOUNT_SUMMARY LIMIT 10;`

### 2. **ADAPTER_UNITS** (989,946 rows)
- **Purpose**: Hardware adapter and unit information
- **Key Columns**: Adapter details, unit specifications
- **Use Cases**: Hardware inventory, capacity planning
- **Sample Query**: `SELECT * FROM ADAPTER_UNITS LIMIT 10;`

### 3. **COMPUTE_PHYSICALSUMMARIES** (1,170,323,270 rows)
- **Purpose**: Physical compute resource summaries
- **Key Columns**: Compute metrics, resource utilization
- **Use Cases**: Performance analysis, capacity planning
- **Sample Query**: `SELECT * FROM COMPUTE_PHYSICALSUMMARIES LIMIT 10;`

### 4. **COMPUTE_PHYSICALSUMMARIES_ENRICHED** (1,110,146,401 rows)
- **Purpose**: Enhanced compute summaries with additional data
- **Key Columns**: Enriched compute metrics, extended attributes
- **Use Cases**: Advanced analytics, detailed performance analysis
- **Sample Query**: `SELECT * FROM COMPUTE_PHYSICALSUMMARIES_ENRICHED LIMIT 10;`

### 5. **IAM_ACCOUNTS** (43,933,331 rows)
- **Purpose**: Identity and Access Management account data
- **Key Columns**: Account details, access permissions
- **Use Cases**: Security analysis, access management
- **Sample Query**: `SELECT * FROM IAM_ACCOUNTS LIMIT 10;`

### 6. **IAM_USERS** (93,857,572 rows)
- **Purpose**: User information and access details
- **Key Columns**: User details, permissions, access history
- **Use Cases**: User management, security audits
- **Sample Query**: `SELECT * FROM IAM_USERS LIMIT 10;`

### 7. **LICENSE_LICENSEINFOS** (594,523,572 rows)
- **Purpose**: Software license information and compliance
- **Key Columns**: License details, compliance status
- **Use Cases**: License management, compliance reporting
- **Sample Query**: `SELECT * FROM LICENSE_LICENSEINFOS LIMIT 10;`

### 8. **NETWORK_ELEMENTSUMMARIES** (85,221,396 rows)
- **Purpose**: Network infrastructure summaries
- **Key Columns**: Network metrics, element details
- **Use Cases**: Network analysis, infrastructure planning
- **Sample Query**: `SELECT * FROM NETWORK_ELEMENTSUMMARIES LIMIT 10;`

### 9. **VIRTUALIZATION_VIRTUALMACHINES** (799,800,311 rows)
- **Purpose**: Virtual machine information and metrics
- **Key Columns**: VM details, resource allocation
- **Use Cases**: Virtualization analysis, resource optimization
- **Sample Query**: `SELECT * FROM VIRTUALIZATION_VIRTUALMACHINES LIMIT 10;`

### 10. **TECHSUPPORTMANAGEMENT_ENDPOINTS** (267,542,300 rows)
- **Purpose**: Technical support endpoint information
- **Key Columns**: Endpoint details, support metrics
- **Use Cases**: Support analysis, endpoint management
- **Sample Query**: `SELECT * FROM TECHSUPPORTMANAGEMENT_ENDPOINTS LIMIT 10;`

## 🔍 Sample Queries for AI Assistant

### Basic Exploration
- "Show me the first 10 records from ACCOUNT_SUMMARY"
- "Display the structure of IAM_USERS table"
- "What are the available columns in LICENSE_LICENSEINFOS?"

### Analysis Queries
- "Find the top 5 accounts by size"
- "Show user distribution by region"
- "Analyze license compliance status"
- "Compare compute resources across different environments"

### Visualization Queries
- "Create a chart showing account distribution"
- "Plot user growth over time"
- "Show license usage trends"
- "Visualize network performance metrics"

## ⚠️ Important Notes

### Authentication
- **SSO Required**: Must use Cisco SSO authentication
- **VPN Connection**: Ensure VPN is connected before accessing
- **Browser Authentication**: Will open browser for SSO login
- **Timeout**: Authentication times out after 120 seconds

### Performance Considerations
- **Large Tables**: Some tables have hundreds of millions of rows
- **Query Limits**: Always use LIMIT clauses for large tables
- **Warehouse**: No warehouse required for read-only operations
- **Connection**: Connection established on first query

### Troubleshooting
1. **Authentication Timeout**: Clear browser cache and retry
2. **VPN Issues**: Ensure Cisco VPN is connected
3. **Role Issues**: Use PUBLIC role for basic access
4. **Connection Errors**: Restart server and re-authenticate

## 🛠️ Technical Architecture

### Frontend
- **Framework**: Vanilla HTML/JavaScript
- **Charts**: Chart.js for data visualization
- **Interface**: Modern, responsive design

### Backend
- **Framework**: Node.js with Express
- **Database**: Snowflake with SSO authentication
- **AI**: OpenAI GPT-3.5-turbo for SQL generation
- **Port**: 3001

### Data Flow
1. User submits natural language query
2. AI generates SQL query
3. SQL executed against Snowflake
4. Results processed and visualized
5. Charts and data displayed to user

## 📈 Usage Examples

### Example 1: Account Analysis
**Query**: "Show me the top 10 accounts by user count"
**AI Generated SQL**: `SELECT account_name, user_count FROM ACCOUNT_SUMMARY ORDER BY user_count DESC LIMIT 10;`

### Example 2: License Compliance
**Query**: "What's the license compliance status?"
**AI Generated SQL**: `SELECT compliance_status, COUNT(*) FROM LICENSE_LICENSEINFOS GROUP BY compliance_status;`

### Example 3: Performance Metrics
**Query**: "Show compute performance trends"
**AI Generated SQL**: `SELECT date, avg_performance FROM COMPUTE_PHYSICALSUMMARIES WHERE date >= DATEADD(day, -30, CURRENT_DATE()) ORDER BY date;`

## 🔧 Maintenance

### Regular Tasks
- Monitor authentication sessions
- Check OpenAI API usage
- Review query performance
- Update environment variables as needed

### Security
- Keep API keys secure
- Monitor access logs
- Regular security updates
- VPN connection maintenance

---

**Last Updated**: Current Date
**Version**: 1.0
**Status**: Production Ready 

## 📋 **Implementation Steps**

### **Step 1: Add New Dependencies**

Update `package.json` to include Excel processing and file upload:

```json
{
  "name": "enhanced-ai-sql-assistant",
  "version": "1.0.0",
  "description": "Enhanced AI SQL Assistant with Excel and Snowflake support",
  "main": "enhanced_server.js",
  "scripts": {
    "start": "node enhanced_server.js",
    "dev": "nodemon enhanced_server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.6.1",
    "express": "^4.21.2",
    "openai": "^4.104.0",
    "snowflake-sdk": "^1.15.0",
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

### **Step 2: Create Enhanced Server**

Create `enhanced_server.js` with the following features:

1. **Dual Input System**
   - Excel file upload via `/api/upload-excel`
   - Snowflake connection via `/api/connect-snowflake`
   - Mode switching between Excel and Snowflake

2. **Semantic Column Naming Tool**
   - `generateSemanticColumnNames()` function
   - Auto-update ABC.md with semantic names
   - Better query understanding

3. **Enhanced Query Processing**
   - Mode-aware SQL generation
   - Excel data simulation
   - Improved prompts

### **Step 3: Enhanced Frontend**

Update `public/index.html` to include:

1. **File Upload Interface**
   - Excel file upload button
   - Connection status display
   - Mode switching options

2. **Enhanced Query Interface**
   - Mode-aware query processing
   - Better error handling
   - Semantic name display

##  **Key Features**

### **1. Dual Input System**
```javascript
// Excel Mode
POST /api/upload-excel
// Upload Excel file → Process locally

// Snowflake Mode  
POST /api/connect-snowflake
// Connect to database → Process remotely
```

### **2. Semantic Column Naming**
```javascript
async function generateSemanticColumnNames(columns) {
  // LLM-based column name interpreter
  // Returns: COLUMN_NAME|SEMANTIC_NAME|DESCRIPTION
  // Updates ABC.md automatically
}
```

### **3. Mode-Aware Query Processing**
```javascript
// Excel Mode
const sqlQuery = await generateSQL(query, excelSchema, 'excel');
const results = await executeExcelQuery(sqlQuery);

// Snowflake Mode
const sqlQuery = await generateSQL(query, snowflakeSchema, 'snowflake');
const results = await executeSnowflakeQuery(sqlQuery);
```

## 📊 **User Workflow**

### **Option 1: Excel File**
1. Upload Excel file via web interface
2. System processes file and generates semantic names
3. Updates ABC.md with semantic column descriptions
4. User queries data using natural language
5. AI generates SQL-like queries for Excel data

### **Option 2: Snowflake Connection**
1. Click "Connect to Snowflake" button
2. Browser opens for SSO authentication
3. System connects to warehouse/database
4. Generates semantic names for existing tables
5. Updates ABC.md with semantic descriptions
6. User queries data using natural language

## 🔧 **Implementation Files**

### **1. enhanced_server.js** (Main server with dual input)
### **2. enhanced_frontend.html** (Updated UI with file upload)
### **3. semantic_tool.js** (LLM-based column naming)
### **4. excel_processor.js** (Excel file processing)
### **5. updated_ABC.md** (Auto-updated with semantic names)

## 🚀 **Benefits**

1. **Flexibility**: Support both Excel and Snowflake
2. **Semantic Understanding**: Better column name interpretation
3. **Auto-Documentation**: ABC.md updates automatically
4. **User Choice**: Let users decide input method
5. **Improved Queries**: Better SQL generation with semantic context

Would you like me to create the specific implementation files? I can start with the enhanced server and then move to the frontend updates. 