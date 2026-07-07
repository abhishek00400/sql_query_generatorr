import React, { useMemo } from 'react'
import { useSchemaStore } from '../../store/useSchemaStore'

const options = [
  { value: 'hr', label: 'HR Database' },
  { value: 'student', label: 'Student Database' },
  { value: 'ecommerce', label: 'E-commerce DB' },
  { value: 'custom', label: 'Custom Schema' },
]

export default function SchemaSelector() {
  const { selectedSchemaKey, setSchema, customSQL, parseCustomSchema } = useSchemaStore()

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

      {selected.value === 'custom' && (
        <div className="mt-3">
          <textarea
            value={customSQL}
            onChange={(e) => useSchemaStore.getState().setCustomSQL?.(e.target.value)}
            onBlur={() => {
              if ((customSQL || '').trim()) parseCustomSchema(customSQL)
            }}
            placeholder="Paste CREATE TABLE SQL here"
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-bg-primary/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent transition"
          />
          <div className="mt-2 text-xs text-text-muted">Paste CREATE TABLE SQL; schema will be parsed.</div>
        </div>
      )}

      {/* Detected table pills could be added after parsing; omitted for now */}
    </div>
  )
}

