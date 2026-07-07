export function parseCreateTableSQL(sqlText) {
  const text = sqlText || ''
  const cleaned = text.replace(/[\r\n]+/g, ' ')

  const tableRegex = /CREATE\s+TABLE\s+([`"\[]?)([A-Za-z0-9_]+)\1\s*\(([\s\S]*?)\)\s*;?/gi

  const tables = []
  let match
  while ((match = tableRegex.exec(sqlText))) {
    const tableName = match[2]
    const body = match[3]

    const lines = body
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    const columns = []
    const constraints = {
      primaryKeys: [],
      foreignKeys: [],
    }

    for (const line of lines) {
      const upper = line.toUpperCase()

      // PRIMARY KEY (...) table constraint
      const pkMatch = upper.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i)
      if (pkMatch) {
        const cols = pkMatch[1]
          .split(',')
          .map((c) => c.trim().replace(/[`"\[]/g, '').replace(/\]/g, ''))
        constraints.primaryKeys.push(...cols)
        continue
      }

      // FOREIGN KEY (...) REFERENCES table(col)
      const fkMatch = upper.match(
        /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([A-Za-z0-9_]+)\s*\(([^)]+)\)/i
      )
      if (fkMatch) {
        const col = fkMatch[1].trim().replace(/[`"\[]/g, '').replace(/\]/g, '')
        const refTable = fkMatch[2].trim().replace(/[`"\[]/g, '').replace(/\]/g, '')
        const refCol = fkMatch[3].trim().replace(/[`"\[]/g, '').replace(/\]/g, '')
        constraints.foreignKeys.push({ col, refTable, refCol })
        continue
      }

      // Column definition: name type [constraints...]
      const colMatch = line.match(/^([`"\[]?)([A-Za-z0-9_]+)\1\s+([A-Za-z0-9_()]+)([\s\S]*)$/)
      if (!colMatch) continue

      const colName = colMatch[2]
      const dataType = colMatch[3]
      const rest = (colMatch[4] || '').toUpperCase()

      const colConstraints = []

      if (rest.includes('NOT NULL')) colConstraints.push('NOT NULL')
      if (rest.includes('PRIMARY KEY')) colConstraints.push('PRIMARY KEY')
      if (rest.includes('UNIQUE')) colConstraints.push('UNIQUE')

      columns.push({ name: colName, type: dataType, constraints: colConstraints })
    }

    // Apply table-level primary keys if any
    for (const pk of constraints.primaryKeys) {
      const c = columns.find((x) => x.name.toLowerCase() === pk.toLowerCase())
      if (c && !c.constraints.includes('PRIMARY KEY')) c.constraints.push('PRIMARY KEY')
    }

    // Add foreign key constraints
    for (const fk of constraints.foreignKeys) {
      const c = columns.find((x) => x.name.toLowerCase() === fk.col.toLowerCase())
      if (c) c.constraints.push(`FOREIGN KEY → ${fk.refTable}.${fk.refCol}`)
    }

    tables.push({ name: tableName, columns })
  }

  return { tables }
}
