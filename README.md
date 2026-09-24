# QueryMind AI 
**AI-Powered Natural Language to SQL Query Generator**

QueryMind AI is a full-stack web application that converts **plain-English requests into SQL queries** using Google's Gemini models. It provides schema-aware query generation, multiple SQL options, query explanations, query impact information, database execution, schema inspection, and query history.

The application is designed to reduce the need to manually write complex SQL queries while still allowing users to inspect, validate, select, and execute the generated SQL.

---

## Features

### Natural Language → SQL

Describe what you want in plain English instead of writing SQL manually.

Example:

```text
Show all employees earning more than 50000
```

QueryMind AI uses the selected database schema as context and generates SQL based on the available tables and columns.

---

### AI-Powered Query Generation

The backend integrates with **Google Gemini** through its Generative Language API.

The AI is instructed to:

* Use only tables and columns present in the supplied schema
* Respect requested filters, grouping, sorting, limits, and values
* Prefer explicit JOIN conditions
* Prefer sargable filtering conditions
* Avoid inventing columns
* Avoid unnecessary `SELECT *`
* Identify destructive operations
* Return structured JSON containing SQL, explanation, tables, impact, and validation information

The application can return up to **three query options** when useful, with the first option treated as the recommended option.

---

### Schema-Aware Generation

The SQL generator does not receive only the user's question.

It receives:

```text
Database Schema
       +
User's Natural Language Request
       ↓
     Gemini
       ↓
Generated SQL
```

This allows the model to generate queries based on the actual tables and columns available in the selected schema.

---

### Multiple Schema Sources

The application supports:

#### 1. Sample schemas

Built-in schemas currently include:

* HR
* Student
* E-Commerce

The HR schema, for example, contains:

```text
Employee
Department
Salary_Grade
```

The Student schema contains:

```text
Student
Department
Course
Enrollment
```

The E-Commerce schema contains:

```text
Customer
Product
Orders
OrderItem
```

---

#### 2. Custom SQL schema

Users can import a `.sql` file containing `CREATE TABLE` statements.

QueryMind parses the SQL and extracts:

* Table names
* Column names
* Data types
* Constraints
* Primary-key information

---

#### 3. Live database schema

QueryMind can connect to a live:

* MySQL database
* PostgreSQL database

It can inspect the database and load its tables and columns into the application.

---

### Database Connection Testing

Users can enter:

```text
Host
Port
Database Name
Username
Password
Database Type
```

The application provides a **Test Connection** operation before using the database.

The backend currently supports MySQL through PyMySQL and PostgreSQL through psycopg2.

---

### SQL Execution

Generated SQL can be executed directly against the connected database.

The application displays:

* Result columns
* Returned rows
* Row count
* Query results in a table

The backend also converts values such as dates, decimals, and byte values into JSON-safe representations before returning them to the frontend.

---

### Query Impact Information

Generated queries contain impact metadata such as:

```text
Type: SELECT
Estimated Rows: 50
Destructive: false
```

Supported query classifications include:

```text
SELECT
INSERT
UPDATE
DELETE
CREATE
DROP
TRUNCATE
```

This information is used by the frontend to determine how the query should be presented and whether additional confirmation is required.

---

### Destructive Query Protection

Queries that can modify or delete data receive additional handling in the UI.

For operations such as:

```text
UPDATE
DELETE
DROP
TRUNCATE
```

the application displays a confirmation step before execution.

`DROP` and `TRUNCATE` additionally require the user to acknowledge that the operation is potentially irreversible.

The backend also explicitly blocks:

```sql
DROP DATABASE
```

and `TRUNCATE` statements without a `WHERE` clause.

> **Important:** This should be considered application-level protection, not a complete database security layer. Production deployments should use restricted database users and proper database permissions.

---

### Query History

Generated queries can be stored in a local application database.

Each history entry stores:

```text
User Input
Generated SQL
Query Type
Schema Used
Estimated Rows
Creation Time
```

The history API supports:

* Fetching history
* Saving entries
* Deleting individual entries
* Clearing all history

The current default application database is SQLite (`querymind.db`), with PostgreSQL supported as a configurable alternative.

---

### Schema Viewer

The Schema Viewer allows users to inspect:

* Tables
* Columns
* Data types
* Constraints

It can display schemas loaded from SQL files or live databases.

---

### Mock Mode

The frontend supports a mock mode for development and UI testing.

Mock mode allows the application to operate without:

* A live backend
* A Gemini API request
* A live MySQL/PostgreSQL database

The current `.env.example` enables mock mode by default:

```env
VITE_USE_MOCK=true
```

For live backend integration:

```env
VITE_USE_MOCK=false
```

The frontend API layer switches between mock data and real FastAPI endpoints based on this setting.

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │      User            │
                    │ Plain English Input  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │      + Vite          │
                    └──────────┬───────────┘
                               │
                    Natural Language +
                    Selected Schema
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ Schema Service  │        │   AI Service    │
        │                 │        │                 │
        │ Parse schema    │        │ Gemini API      │
        │ Load DB schema  │        │ Prompt + JSON   │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
                 └────────────┬─────────────┘
                              │
                              ▼
                     Generated SQL Options
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Query Selection      │
                    │ Explanation          │
                    │ Impact / Validation  │
                    └──────────┬───────────┘
                               │
                         User selects
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Query Execution    │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
              ┌───────────┐        ┌──────────────┐
              │   MySQL   │        │ PostgreSQL   │
              └───────────┘        └──────────────┘
                               │
                               ▼
                         Query Results
```

---

## Application Workflow

The main workflow consists of three stages.

### Step 1 — Describe the Request

The user enters a natural-language request.

Example:

```text
Show the top 10 employees with salary greater than 80000
```

The user can select the schema against which the query should be generated.

---

### Step 2 — Generate SQL

The frontend sends:

```text
User Input
+
Selected Schema
+
Optional Database Configuration
```

to:

```http
POST /api/query/generate
```

The backend obtains the relevant schema and sends it together with the user request to Gemini.

The generated response contains structured information such as:

```json
{
  "sql": "SELECT ...",
  "explanation": {
    "bullets": [
      "..."
    ]
  },
  "tables": [],
  "impact": {
    "type": "SELECT",
    "estimatedRows": 10,
    "isDestructive": false
  },
  "validation": []
}
```

The frontend can then display multiple generated query options.

---

### Step 3 — Execute SQL

After selecting a query, the user can execute it against the connected database.

The frontend sends:

```http
POST /api/query/execute
```

with:

```text
SQL
+
Database Configuration
```

The backend executes the query and returns:

```text
Columns
Rows
Row Count
```

The frontend displays the result in a table and provides result-export functionality.

---

# Tech Stack

## Frontend

| Technology               | Purpose                         |
| ------------------------ | ------------------------------- |
| React 18                 | User interface                  |
| Vite                     | Frontend build/development tool |
| React Router             | Application routing             |
| Zustand                  | Global state management         |
| Axios                    | Backend API communication       |
| Tailwind CSS             | UI styling                      |
| Lucide React             | Icons                           |
| React Hot Toast          | Notifications                   |
| React Syntax Highlighter | SQL/code display                |

The frontend dependencies and Vite scripts are defined in `package.json`.

---

## Backend

| Technology    | Purpose                          |
| ------------- | -------------------------------- |
| Python        | Backend language                 |
| FastAPI       | REST API framework               |
| Uvicorn       | ASGI server                      |
| SQLAlchemy    | Application database/history ORM |
| Pydantic      | Request/response validation      |
| PyMySQL       | MySQL connectivity               |
| psycopg2      | PostgreSQL connectivity          |
| sqlparse      | SQL parsing                      |
| HTTPX         | Gemini API requests              |
| python-dotenv | Environment configuration        |

These dependencies are defined in `backend/requirements.txt`.

---

## AI

**Google Gemini**

The backend communicates with Gemini through Google's Generative Language API.

The application uses the configured:

```env
GEMINI_API_KEY
GEMINI_MODEL
```

The default model configured by the backend is:

```text
gemini-1.5-pro
```

The frontend currently exposes model choices including:

```text
gemini-1.5-pro
gemini-2.5-flash
```

The actual live model is controlled by the backend environment configuration.

---

# Project Structure

```text
sql_query_generatorr/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── history.py
│   │   │
│   │   ├── routers/
│   │   │   ├── query.py
│   │   │   ├── schema.py
│   │   │   ├── history.py
│   │   │   ├── settings.py
│   │   │   └── sample_schema.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── query.py
│   │   │   ├── schema.py
│   │   │   ├── history.py
│   │   │   └── settings.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── db_service.py
│   │   │   ├── schema_service.py
│   │   │   └── history_service.py
│   │   │
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── src/
│   ├── api/
│   │   ├── client.js
│   │   ├── queryApi.js
│   │   ├── schemaApi.js
│   │   └── settingsApi.js
│   │
│   ├── components/
│   │   ├── query/
│   │   ├── results/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── pages/
│   │   ├── QueryPage.jsx
│   │   ├── HistoryPage.jsx
│   │   ├── SchemaPage.jsx
│   │   └── SettingsPage.jsx
│   │
│   ├── store/
│   │   ├── useQueryStore.js
│   │   ├── useSchemaStore.js
│   │   ├── useSettingsStore.js
│   │   └── useHistoryStore.js
│   │
│   ├── mock/
│   ├── constants/
│   └── App.jsx
│
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
├── TODO.md
└── README.md
```

---

# Backend API

## Query Generation

```http
POST /api/query/generate
```

Generates SQL options from:

```text
Natural-language request
+
Schema
+
Optional database configuration
```

---

## Query Execution

```http
POST /api/query/execute
```

Executes selected SQL against the configured database.

---

## Schema Parsing

```http
POST /api/schema/parse
```

Accepts either:

* SQL schema text
* Database configuration

and returns parsed tables and columns.

---

## Sample Schema

```http
GET /api/schema/sample/{key}
```

Available sample schemas include:

```text
hr
student
ecommerce
```

---

## Database Connection

```http
POST /api/db/test
```

Tests whether the supplied database credentials can establish a connection.

---

## AI Status

```http
GET /api/db/ai/status
```

Reports whether the backend has a Gemini API key configured.

---

## Query History

```http
GET /api/history/
POST /api/history/
DELETE /api/history/{entry_id}
DELETE /api/history/
```

The backend exposes CRUD-style operations for stored query history.

---

# Installation

## Prerequisites

Install:

* Node.js
* npm
* Python 3
* MySQL and/or PostgreSQL if using a live database
* Google Gemini API key for live AI generation

---

## 1. Clone the Repository

```bash
git clone https://github.com/abhishek00400/sql_query_generatorr.git
cd sql_query_generatorr
```

---

# 2. Install Frontend Dependencies

```bash
npm install
```

---

# 3. Install Backend Dependencies

Open a terminal inside the `backend` directory:

```bash
cd backend
pip install -r requirements.txt
```

---

# 4. Configure Backend Environment

Create:

```text
backend/.env
```

using:

```text
backend/.env.example
```

Example:

```env
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro

APP_DB_URL=sqlite:///./querymind.db

PORT=5000
FRONTEND_URL=http://localhost:5173

ENV=development
```

The backend loads these values through `python-dotenv`.

---

# 5. Configure Frontend

Create:

```text
.env
```

in the project root.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=QueryMind AI
VITE_USE_MOCK=false
```

For frontend-only development, use:

```env
VITE_USE_MOCK=true
```

The repository's example environment currently uses mock mode by default.

---

# Running the Application

## Start Backend

From the project root:

```bash
npm run dev:backend
```

The backend runs on:

```text
http://127.0.0.1:5000
```

The FastAPI application exposes a root health endpoint:

```http
GET /
```

which returns:

```json
{
  "status": "QueryMind AI backend running",
  "version": "1.0.0"
}
```

---

## Start Frontend

In another terminal:

```bash
npm run dev
```

The Vite frontend runs on:

```text
http://localhost:5173
```

---

# Example

### User Input

```text
Show employees whose salary is greater than 80000
```

### Schema

```sql
CREATE TABLE Employee (
    ID INT PRIMARY KEY,
    Name VARCHAR(100),
    DeptID INT,
    Salary DECIMAL(10,2)
);
```

### Generated Query

```sql
SELECT *
FROM Employee
WHERE Salary >= 80000
LIMIT 50;
```

### Query Information

```text
Type: SELECT
Estimated Rows: 50
Destructive: false
```

The generated SQL, explanation, table/column information, impact, and validation metadata are returned as structured data from the AI service.

---

# State Management

QueryMind uses **Zustand** to manage application state.

### Query Store

Responsible for:

* User input
* Generation state
* Generated query options
* Selected query
* Query results
* Errors
* Query execution

### Schema Store

Responsible for:

* Selected schema
* Parsed schema
* Custom SQL schema
* Live database schema
* Schema loading state

### Settings Store

Responsible for:

* Database configuration
* Database type
* AI model
* AI status
* Theme
* Connection status
* Persistent frontend settings

---

# AI Query Generation Design

The backend constructs two main pieces of prompt context:

```text
System Instructions
        +
Database Schema
        +
User Request
```

The schema is converted into a SQL-like representation before being passed to Gemini.

The AI is instructed to return structured JSON rather than free-form text.

This allows the application to directly process:

```text
SQL
Explanation
Tables
Columns
Impact
Validation
```

instead of trying to extract these fields from unstructured natural-language output.

The backend also normalizes the generated response and limits the result to up to three options.

---

# Schema Processing

The schema service supports two main paths.

### SQL Schema Parsing

The application can parse `CREATE TABLE` statements and extract table/column metadata.

### Live Database Introspection

For MySQL, the backend uses commands such as:

```sql
SHOW TABLES;
SHOW COLUMNS FROM table_name;
SELECT COUNT(*) ...
```

For PostgreSQL, it queries:

```text
information_schema.tables
information_schema.columns
```

to discover database structure.

---

# AI Response Reliability

The AI service contains additional handling for generated responses.

It:

1. Requests JSON-only output.
2. Extracts JSON from the model response.
3. Normalizes returned options.
4. Validates the presence of SQL.
5. Normalizes explanation, table, impact, and validation fields.
6. Caches generated responses for a limited period.
7. Can optionally use a schema-based fallback generator when configured.

The generation cache currently uses a **600-second TTL**.

---

# Security Considerations

QueryMind handles database credentials and generated SQL, so security is important.

### API Keys

The Gemini API key belongs in:

```text
backend/.env
```

and should **never be committed to Git**.

---

### Database Credentials

Database credentials are supplied to the backend for live database operations.

Production deployments should use:

* Least-privilege database accounts
* Restricted network access
* HTTPS
* Secret management
* Separate development and production credentials

---

### Generated SQL

LLM-generated SQL should not automatically be considered safe.

The current application performs some destructive-operation checks, but a production version should add stronger controls such as:

* SQL statement allowlists
* Read-only execution mode
* Parameterized execution where applicable
* Query timeout limits
* Resource limits
* Database permissions
* SQL parser-based validation
* Separate read/write database users

---

# Current Limitations

The current implementation has some areas that should be considered during further development:

* Generated SQL is produced by an LLM and therefore should be reviewed before execution.
* The current destructive-query protection is rule-based rather than a complete SQL security layer.
* Database credentials are supplied through the application's settings flow.
* The AI fallback generator is heuristic-based and should not be treated as equivalent to Gemini.
* SQL dialect behavior may differ between MySQL and PostgreSQL.
* Some schema metadata, particularly relationship information, is more limited for PostgreSQL than MySQL in the current implementation.
* Query-history storage is currently designed around a local application database by default.

---

# Future Improvements

Potential improvements include:

* SQL query optimization suggestions
* Query execution plan analysis
* Better JOIN relationship detection
* Read-only execution mode
* Parameterized query generation
* More robust SQL validation
* Query performance estimation
* Database permission management
* Authentication and user accounts
* Multi-user query history
* Query bookmarking
* More database engines
* Streaming AI responses
* Better PostgreSQL schema/foreign-key introspection
* Automatic query correction after execution errors
* Query comparison between generated alternatives
* Production deployment with Docker
* Automated tests and CI/CD

---

# What This Project Demonstrates

QueryMind AI demonstrates practical knowledge of:

* Full-stack web development
* React
* REST API design
* FastAPI
* Python
* SQL
* Database connectivity
* MySQL
* PostgreSQL
* SQLAlchemy
* Natural Language Processing
* Large Language Models
* Prompt engineering
* Structured LLM output
* Schema-aware AI generation
* State management with Zustand
* API integration with Axios
* Error handling
* Database introspection
* Query execution
* Application-level SQL safety controls

---

# Project Highlights

The core idea of QueryMind AI is:

```text
                    Natural Language
                           │
                           ▼
                    Schema Context
                           │
                           ▼
                    Gemini LLM
                           │
                           ▼
                  Structured SQL Options
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          SQL Query    Explanation    Query Impact
             │
             ▼
       User Selection
             │
             ▼
      Safety Confirmation
             │
             ▼
       Database Execution
             │
             ▼
        Query Results
```

The project therefore combines **database systems + SQL + backend development + AI/LLM integration** into a single end-to-end application.

---

# License

This project is currently maintained as a personal/academic project.

Add an explicit license file if you intend to distribute the project as open source.

---

# Author

**Abhishek Singh**

B.Tech Computer Science & Engineering
Graphic Era Hill University

GitHub: `abhishek00400`

