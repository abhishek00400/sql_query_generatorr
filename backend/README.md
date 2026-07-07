# QueryMind AI Backend

This backend powers the QueryMind AI frontend with SQL generation, query execution, schema parsing, history storage, and database connection testing.

## Setup

1. Create a virtual environment

```bash
python -m venv venv
```

2. Activate it

```bash
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Copy and fill `.env`

```bash
copy .env.example .env
```

Add your `GEMINI_API_KEY` to `.env`.

5. Run the server

```bash
python main.py
```

Server starts at `http://localhost:5000`.

## API Endpoints

- `GET /` — Health check
- `POST /api/query/generate` — Generate SQL from natural language using Google Gemini
- `POST /api/query/execute` — Execute SQL on user's database
- `GET /api/history` — Get query history
- `POST /api/history` — Save history entry
- `DELETE /api/history/{id}` — Delete one entry
- `DELETE /api/history` — Clear all history
- `POST /api/schema/parse` — Read schema from user's DB
- `POST /api/db/test` — Test DB connection

## Backend integration guide

The frontend expects the following backend routes and payload shapes:

- `POST /api/query/generate`
  - Body: `{ input, schema }`
  - Returns: `{ options: [{ sql, explanation, tables, impact, validation }] }`

- `POST /api/query/execute`
  - Body: `{ sql, dbConfig }`
  - Returns: `{ columns, rows, rowCount }`

- `POST /api/db/test`
  - Body: `{ host, port, dbName, username, password, type }`
  - Returns: `{ success, message }`

- `POST /api/schema/parse`
  - Body: `{ sql }`
  - Returns: `{ tables: [...] }`

- `GET /api/history`
  - Returns: `{ entries: [...] }`

- `POST /api/history`
  - Body: `{ user_input, sql, query_type, schema_used, estimated_rows }`
  - Returns: saved entry object

- `DELETE /api/history/{id}`
  - Returns: `{ success: true, message }`

- `DELETE /api/history`
  - Returns: `{ success: true, deleted: count }`

## Notes

- The backend uses a local SQLite database by default.
- To connect the frontend in dev, set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=http://localhost:5000/api`.
