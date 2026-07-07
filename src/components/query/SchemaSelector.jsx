import React, { useMemo } from 'react'
import { useSchemaStore } from '../../store/useSchemaStore'

const options = [
  { value: 'hr', label: 'Sample HR' },
  { value: 'student', label: 'Sample Student' },
  { value: 'ecommerce', label: 'Sample E-commerce' },
]

export default function SchemaSelector() {
  const { selectedSchemaKey, setSchema } = useSchemaStore()

  const selected = useMemo(() => options.find((o) => o.value === selectedSchemaKey) || options[0], [selectedSchemaKey])

  return (
    <div>
      <select
        value={selectedSchemaKey}
        onChange={(e) => setSchema(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg-elevated/30 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent transition"
        aria-label="Select schema"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="mt-3 rounded-lg border border-border/60 bg-bg-elevated/30 px-3 py-2 text-xs text-text-muted">
        Queries will use the connected database schema when a valid connection is available.
      </div>
    </div>
  )
}

