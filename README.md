# 🤖 AI SQL Assistant for Snowflake

A simple AI-powered SQL assistant that can understand natural language queries, generate SQL, execute queries against your Snowflake database, and create visualizations.

## Features

- **Natural Language Processing**: Ask questions in plain English
- **AI-Powered SQL Generation**: Uses OpenAI to convert queries to SQL
- **Snowflake Integration**: Direct connection to your Snowflake database
- **Data Visualization**: Automatic chart generation based on data types
- **Clean Interface**: Modern, responsive web interface

## Prerequisites

- Node.js (v14 or higher)
- Snowflake account with Cisco SSO access
- OpenAI API key
- Access to your Snowflake database schema

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Snowflake Configuration (SSO Authentication)
SNOWFLAKE_ACCOUNT=CISCO
SNOWFLAKE_USER=ABHIJES2
SNOWFLAKE_ROLE=PUBLIC
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=ENGIT_DB
SNOWFLAKE_SCHEMA=ENGIT_ISDATAMART_BR

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
```

### 3. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file

### 4. Configure Snowflake Access

You'll need:
- **Warehouse**: The compute resource (e.g., `COMPUTE_WH`)
- **Database**: Your target database name
- **Schema**: The schema containing your tables
- **Role**: Your Snowflake role (e.g., `PUBLIC`)
- **SSO Authentication**: The system uses external browser authentication

### 5. Start the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The application will be available at: `http://localhost:3001`

## Usage

### 1. Access the Interface

Open your browser and go to `http://localhost:3001`

### 2. Ask Questions

Type natural language questions like:
- "Show me sales by month"
- "What are the top 10 customers?"
- "Display revenue trends over the last year"
- "Which products have the highest ratings?"

### 3. View Results

The application will:
1. Generate SQL based on your question
2. Execute the query against Snowflake
3. Display the generated SQL
4. Create an appropriate visualization
5. Show the raw data in a table

## Example Queries

Here are some example queries you can try:

```
"Show me the top 5 customers by total sales"
"Display monthly revenue for the last 12 months"
"What are the most popular products?"
"Show customer satisfaction scores by region"
"Display inventory levels by warehouse"
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Snowflake     │
│   (HTML/JS)     │◄──►│   (Node.js)     │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │   (GPT-3.5)     │
                       └─────────────────┘
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/query` - Process natural language query
- `GET /api/schema` - Get database schema information

## Troubleshooting

### Connection Issues

1. **Snowflake Connection Failed**
   - Verify your Snowflake credentials in `.env`
   - Check if your IP is whitelisted in Snowflake
   - Ensure your warehouse is active
   - Complete SSO authentication in the browser when prompted

2. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the API key has proper permissions

3. **Schema Issues**
   - Make sure your schema name is correct
   - Verify you have access to the INFORMATION_SCHEMA
   - Check if tables exist in the specified schema

### Common Error Messages

- `"Failed to connect to Snowflake"` - Check credentials and network
- `"Failed to process query"` - Check OpenAI API key and credits
- `"No data returned"` - Verify your schema has data and tables

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for sensitive information
- Consider using Snowflake's OAuth for production
- Implement proper authentication for production use

## Development

### Project Structure

```
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── public/           # Static files
│   └── index.html    # Frontend interface
├── .env              # Environment variables (create from env.example)
└── README.md         # This file
```

### Adding New Features

1. **Custom Chart Types**: Modify the `suggestChartType` function in `server.js`
2. **Additional Data Processing**: Extend the `cleanDataForVisualization` function
3. **New Query Types**: Update the OpenAI prompt in `generateSQL` function

## License

MIT License - feel free to modify and distribute.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your configuration matches the setup instructions
3. Check the browser console for JavaScript errors
4. Review the server logs for backend errors 