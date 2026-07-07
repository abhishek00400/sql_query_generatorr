export const mockParsedSchema = {
  tables: [
    {
      name: 'Employee',
      columns: [
        { name: 'ID', type: 'INT', constraints: ['PRIMARY KEY'] },
        { name: 'Name', type: 'VARCHAR', constraints: [] },
        { name: 'DeptID', type: 'INT', constraints: ['FOREIGN KEY: Department.ID'] },
        { name: 'Salary', type: 'DECIMAL', constraints: [] },
        { name: 'JoinDate', type: 'DATE', constraints: [] },
      ],
    },
    {
      name: 'Department',
      columns: [
        { name: 'ID', type: 'INT', constraints: ['PRIMARY KEY'] },
        { name: 'DepartmentName', type: 'VARCHAR', constraints: [] },
      ],
    },
    {
      name: 'Salary_Grade',
      columns: [
        { name: 'Grade', type: 'VARCHAR', constraints: [] },
        { name: 'MinSalary', type: 'DECIMAL', constraints: [] },
        { name: 'MaxSalary', type: 'DECIMAL', constraints: [] },
      ],
    },
  ],
}

