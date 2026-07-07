import React, { useEffect } from 'react'
import { useSchemaStore } from '../store/useSchemaStore'
import EmptyState from '../components/ui/EmptyState'
import { Database } from 'lucide-react'

export default function SchemaPage() {
  const { selectedSchemaKey, parsedSchema, setSchema, isLoading } = useSchemaStore()

  useEffect(() => {
    if (!parsedSchema) setSchema('hr')
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Schema Viewer</h1>
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated/40 px-3 py-1 text-xs font-semibold text-text-secondary">
          <Database size={14} className="text-accent" />
          {isLoading ? 'Loading...' : selectedSchemaKey}
        </div>
      </div>

      {!parsedSchema ? (
        <div className="mt-6">
          <EmptyState type="schema" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {parsedSchema.tables?.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-bg-surface/30 p-5">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-text-primary">{t.name}</div>
                <div className="text-xs text-text-muted">~{t.columns?.length || 0} columns</div>
              </div>

              <div className="mt-4 space-y-2">
                {t.columns?.map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-3 border-t border-border/30 pt-2">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{c.name}</div>
                      <div className="text-xs text-text-muted">{c.type || ''}</div>
                    </div>
                    <div className="text-xs text-text-secondary">{(c.constraints || []).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

