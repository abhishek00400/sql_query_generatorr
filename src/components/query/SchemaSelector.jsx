import React, { useMemo } from 'react'
import { useSchemaStore } from '../../store/useSchemaStore'

const sampleOptions = [
  { value: 'hr', label: 'Sample HR' },
  { value: 'student', label: 'Sample Student' },
  { value: 'ecommerce', label: 'Sample E-commerce' },
]

export default function SchemaSelector() {
  const { selectedSchemaKey, setSchema } = useSchemaStore()

  const options = useMemo(() => {
    const extra = []
    if (selectedSchemaKey === 'custom') extra.push({ value: 'custom', label: 'Imported SQL file' })
    if (selectedSchemaKey === 'database') extra.push({ value: 'database', label: 'Connected database' })
    return [...extra, ...sampleOptions]
  }, [selectedSchemaKey])

  const selected = useMemo(() => options.find((o) => o.value === selectedSchemaKey) || options[0], [selectedSchemaKey])

  return (
    <div>
      <select
        value={selectedSchemaKey}
        onChange={(e) => {
          if (e.target.value === 'custom' || e.target.value === 'database') return
          setSchema(e.target.value)
        }}
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
        Active schema: {selected.label}. Import SQL on the Schema page or connect a database in Settings.
      </div>
    </div>
  )
}

