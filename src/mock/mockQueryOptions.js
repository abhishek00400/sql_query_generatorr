export const mockQueryOptions = [
  {
    sql: `SELECT e.*, d.DepartmentName
FROM Employee e
JOIN Department d ON e.DeptID = d.ID
WHERE e.Salary > 50000
ORDER BY e.Salary DESC;`,
    explanation: {
      bullets: [
        'Looks inside the Employee table',
        'Joins with the Department table to include department names',
        'Filters only employees earning more than ₹50,000',
        'Sorts results from highest to lowest salary',
      ],
    },
    tables: [
      { name: 'Employee', columns: [{ name: 'Salary', role: 'Filter' }, { name: '*', role: 'Return' }] },
      { name: 'Department', columns: [{ name: 'DepartmentName', role: 'Return' }] },
    ],
    impact: { type: 'SELECT', estimatedRows: 25, isDestructive: false },
    validation: [
      { status: 'pass', label: 'Syntax valid', detail: null },
      { status: 'pass', label: 'Tables found', detail: null },
      {
        status: 'warn',
        label: 'No index on Salary',
        detail: 'Adding an index on Salary will make this query 3–10x faster.',
      },
    ],
  },
  {
    sql: `SELECT * FROM Employee WHERE Salary > 50000;`,
    explanation: { bullets: ['Looks inside the Employee table', 'Filters employees with salary above ₹50,000', 'Returns all their columns'] },
    tables: [{ name: 'Employee', columns: [{ name: 'Salary', role: 'Filter' }, { name: '*', role: 'Return' }] }],
    impact: { type: 'SELECT', estimatedRows: 25, isDestructive: false },
    validation: [
      { status: 'pass', label: 'Syntax valid', detail: null },
      { status: 'pass', label: 'Tables found', detail: null },
      {
        status: 'warn',
        label: 'No index on Salary',
        detail: 'Adding an index on Salary will make this query 3–10x faster.',
      },
    ],
  },
]
