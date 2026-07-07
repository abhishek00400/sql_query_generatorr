export const mockParsedSchema = {
  tables: [
    {
      name: 'Employee',
      columns: [
        { name: 'EmpID', type: 'INT', constraints: ['PRIMARY KEY'] },
        { name: 'Name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
        { name: 'DeptID', type: 'INT', constraints: ['FOREIGN KEY → Department.ID'] },
        { name: 'Salary', type: 'DECIMAL(10,2)', constraints: ['NOT NULL'] },
        { name: 'JoinDate', type: 'DATE', constraints: [] },
      ],
    },
    {
      name: 'Department',
      columns: [
        { name: 'ID', type: 'INT', constraints: ['PRIMARY KEY'] },
        { name: 'DepartmentName', type: 'VARCHAR(120)', constraints: ['NOT NULL'] },
      ],
    },
    {
      name: 'Salary_Grade',
      columns: [
        { name: 'Grade', type: 'VARCHAR(20)', constraints: ['PRIMARY KEY'] },
        { name: 'MinSalary', type: 'DECIMAL(10,2)', constraints: ['NOT NULL'] },
        { name: 'MaxSalary', type: 'DECIMAL(10,2)', constraints: ['NOT NULL'] },
      ],
    },
  ],
}
