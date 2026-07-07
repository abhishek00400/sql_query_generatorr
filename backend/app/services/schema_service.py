from __future__ import annotations

import random
import re
from typing import Any

SAMPLE_SCHEMAS = {
    "hr": """
        CREATE TABLE Employee (
          ID INT PRIMARY KEY,
          Name VARCHAR(100) NOT NULL,
          DeptID INT,
          Salary DECIMAL(10,2),
          JoinDate DATE,
          FOREIGN KEY (DeptID) REFERENCES Department(ID)
        );
        CREATE TABLE Department (
          ID INT PRIMARY KEY,
          DepartmentName VARCHAR(100) NOT NULL
        );
        CREATE TABLE Salary_Grade (
          Grade VARCHAR(5) PRIMARY KEY,
          MinSalary DECIMAL(10,2),
          MaxSalary DECIMAL(10,2)
        );
    """,
    "student": """
        CREATE TABLE Student (
          ID INT PRIMARY KEY,
          Name VARCHAR(100) NOT NULL,
          CGPA DECIMAL(3,2),
          DeptID INT,
          EnrollmentYear INT,
          FOREIGN KEY (DeptID) REFERENCES Department(ID)
        );
        CREATE TABLE Department (
          ID INT PRIMARY KEY,
          DeptName VARCHAR(100) NOT NULL
        );
        CREATE TABLE Course (
          ID INT PRIMARY KEY,
          CourseName VARCHAR(200),
          Credits INT,
          DeptID INT
        );
        CREATE TABLE Enrollment (
          StudentID INT,
          CourseID INT,
          Grade VARCHAR(2),
          Semester VARCHAR(20),
          PRIMARY KEY (StudentID, CourseID)
        );
    """,
    "ecommerce": """
        CREATE TABLE Customer (
          ID INT PRIMARY KEY,
          Name VARCHAR(100) NOT NULL,
          Email VARCHAR(200) UNIQUE,
          City VARCHAR(100),
          CreatedAt DATETIME
        );
        CREATE TABLE Product (
          ID INT PRIMARY KEY,
          ProductName VARCHAR(200) NOT NULL,
          Price DECIMAL(10,2),
          Stock INT,
          CategoryID INT
        );
        CREATE TABLE Orders (
          ID INT PRIMARY KEY,
          CustomerID INT,
          OrderDate DATETIME,
          TotalAmount DECIMAL(10,2),
          Status VARCHAR(20),
          FOREIGN KEY (CustomerID) REFERENCES Customer(ID)
        );
        CREATE TABLE OrderItem (
          ID INT PRIMARY KEY,
          OrderID INT,
          ProductID INT,
          Quantity INT,
          UnitPrice DECIMAL(10,2),
          FOREIGN KEY (OrderID) REFERENCES Orders(ID),
          FOREIGN KEY (ProductID) REFERENCES Product(ID)
        );
    """,
}


def _split_sql_definitions(block: str) -> list[str]:
    parts: list[str] = []
    current: list[str] = []
    depth = 0
    quote = ""

    for char in block:
        if quote:
            current.append(char)
            if char == quote:
                quote = ""
            continue
        if char in {"'", '"', "`"}:
            quote = char
            current.append(char)
            continue
        if char == "(":
            depth += 1
        elif char == ")" and depth > 0:
            depth -= 1
        if char == "," and depth == 0:
            value = "".join(current).strip()
            if value:
                parts.append(value)
            current = []
            continue
        current.append(char)

    value = "".join(current).strip()
    if value:
        parts.append(value)
    return parts


def _clean_identifier(identifier: str) -> str:
    return identifier.strip().strip("`").split(".")[-1].strip("`")


def parse_raw_schema(sql_text: str) -> list[dict]:
    tables: list[dict] = []
    pattern = r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?((?:`?\w+`?\.)?`?\w+`?)\s*\((.*?)\)\s*(?:ENGINE|DEFAULT|CHARSET|COLLATE|COMMENT|;)"
    matches = re.finditer(pattern, sql_text, re.IGNORECASE | re.DOTALL)

    for match in matches:
        raw_name = _clean_identifier(match.group(1))
        columns_block = match.group(2)
        column_lines = _split_sql_definitions(columns_block)
        columns: list[dict] = []

        for line in column_lines:
            normalized = line.strip().upper()
            if normalized.startswith(("PRIMARY KEY", "FOREIGN KEY", "UNIQUE KEY", "KEY ", "INDEX ", "CONSTRAINT ")):
                continue

            parts = re.split(r"\s+", line, maxsplit=2)
            if len(parts) < 2:
                continue

            name = _clean_identifier(parts[0])
            type_text = parts[1].upper()
            constraints: list[str] = []
            if len(parts) > 2:
                constraints = [part.strip() for part in re.split(r"(?<!\w)AND|,", parts[2]) if part.strip()]
            if "NOT NULL" in line.upper():
                if "NOT NULL" not in constraints:
                    constraints.append("NOT NULL")
            if "PRIMARY KEY" in line.upper():
                if "PRIMARY KEY" not in constraints:
                    constraints.append("PRIMARY KEY")

            columns.append({"name": name, "type": type_text, "constraints": constraints})

        tables.append({"name": raw_name, "columns": columns, "rowCount": random.randint(100, 1000)})

    return tables


def get_schema_from_db(db_config: dict) -> list[dict]:
    from app.services.db_service import get_connection

    conn = get_connection(db_config)
    try:
        cursor = conn.cursor()
        if db_config["type"] == "mysql":
            cursor.execute("SHOW TABLES")
            tables = [list(row.values())[0] for row in cursor.fetchall()]
            result = []
            for table in tables:
                cursor.execute(f"SHOW COLUMNS FROM `{table}`")
                columns_data = cursor.fetchall()
                column_defs = []
                for col in columns_data:
                    constraints = []
                    if col.get("Key") == "PRI":
                        constraints.append("PRIMARY KEY")
                    if col.get("Null") == "NO":
                        constraints.append("NOT NULL")
                    if col.get("Key") == "MUL" and col.get("Comment"):
                        constraints.append(f"FOREIGN KEY: {col.get('Comment')}")
                    column_defs.append({
                        "name": col.get("Field"),
                        "type": col.get("Type"),
                        "constraints": constraints,
                    })
                cursor.execute(f"SELECT COUNT(*) AS total FROM `{table}`")
                row_count = cursor.fetchone().get("total", 0)
                result.append({"name": table, "columns": column_defs, "rowCount": int(row_count)})
            return result

        if db_config["type"] == "postgresql":
            cursor.execute(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
            )
            tables = [row["table_name"] for row in cursor.fetchall()]
            result = []
            for table in tables:
                cursor.execute(
                    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = %s",
                    (table,),
                )
                columns_data = cursor.fetchall()
                column_defs = []
                for col in columns_data:
                    constraints = []
                    if col.get("is_nullable") == "NO":
                        constraints.append("NOT NULL")
                    column_defs.append(
                        {"name": col.get("column_name"), "type": col.get("data_type"), "constraints": constraints}
                    )
                cursor.execute(f"SELECT COUNT(*) AS total FROM \"{table}\"")
                row_count = cursor.fetchone().get("total", 0)
                result.append({"name": table, "columns": column_defs, "rowCount": int(row_count)})
            return result

        raise ValueError("Unsupported database type for schema parsing")
    finally:
        try:
            cursor.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass


def schema_to_sql_string(tables: list[dict]) -> str:
    sql_fragments: list[str] = []
    for table in tables:
        lines = [f"CREATE TABLE {table['name']} ("]
        column_lines = []
        for column in table["columns"]:
            line = f"  {column['name']} {column['type']}"
            if column["constraints"]:
                line += " " + " ".join(column["constraints"])
            column_lines.append(line)
        lines.append(",\n".join(column_lines)
        )
        lines.append(");")
        sql_fragments.append("\n".join(lines))
    return "\n\n".join(sql_fragments)
