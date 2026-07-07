export const sampleSchemas = {
  hr: `-- HR Database (mock)
CREATE TABLE Employee (
  EmpID INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  DeptID INT,
  Salary DECIMAL(10,2) NOT NULL,
  JoinDate DATE
);

CREATE TABLE Department (
  ID INT PRIMARY KEY,
  DepartmentName VARCHAR(120) NOT NULL
);

CREATE TABLE Salary_Grade (
  Grade VARCHAR(20) PRIMARY KEY,
  MinSalary DECIMAL(10,2) NOT NULL,
  MaxSalary DECIMAL(10,2) NOT NULL
);`,
  student: `CREATE TABLE Student (
  RollNo INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  CGPA DECIMAL(3,2) NOT NULL
);`,
  ecommerce: `CREATE TABLE Orders (
  OrderID INT PRIMARY KEY,
  CustomerID INT NOT NULL,
  City VARCHAR(80) NOT NULL,
  Amount DECIMAL(10,2) NOT NULL,
  CreatedAt DATE NOT NULL
);`,
}
