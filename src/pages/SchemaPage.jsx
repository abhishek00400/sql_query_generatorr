import React, { useEffect, useRef } from 'react'
import { useSchemaStore } from '../store/useSchemaStore'
import { useSettingsStore } from '../store/useSettingsStore'
import EmptyState from '../components/ui/EmptyState'
import { Database, RefreshCw, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SchemaPage() {
  const fileInputRef = useRef(null)
  const { selectedSchemaKey, parsedSchema, setSchema, parseCustomSchema, loadDbSchema, isLoading } = useSchemaStore()
  const { connectionStatus, dbConfig, dbType } = useSettingsStore()

  useEffect(() => {
    if (!parsedSchema) setSchema('hr')
  }, [])

  const onFileSelected = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const sql = await file.text()
      if (!sql.trim()) {
        toast.error('The selected SQL file is empty')
        return
      }
      const res = await parseCustomSchema(sql)
      toast.success(`Loaded ${res.tables?.length || 0} tables from ${file.name}`)
    } catch (e) {
      toast.error(e?.message || 'Unable to parse SQL file')
    } finally {
      event.target.value = ''
    }
  }

  const onLoadDatabase = async () => {
    const payload = {
      host: dbConfig.host,
      port: dbConfig.port,
      dbName: dbConfig.dbName,
      username: dbConfig.username,
      password: dbConfig.password,
      type: dbType === 'postgres' ? 'postgresql' : 'mysql',
    }
    try {
      const res = await loadDbSchema(payload)
      toast.success(`Loaded ${res.tables?.length || 0} database tables`)
    } catch (e) {
      toast.error(e?.message || 'Unable to load database schema')
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Schema Viewer</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated/40 px-3 py-2 text-xs font-bold text-text-secondary hover:border-accent hover:text-text-primary"
          >
            <Upload size={14} />
            Import .sql
          </button>
          <button
            type="button"
            onClick={onLoadDatabase}
            disabled={connectionStatus !== 'connected' || isLoading}
            className={[
              'inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated/40 px-3 py-2 text-xs font-bold text-text-secondary',
              connectionStatus !== 'connected' || isLoading ? 'cursor-not-allowed opacity-50' : 'hover:border-accent hover:text-text-primary',
            ].join(' ')}
          >
            <RefreshCw size={14} />
            Load DB schema
          </button>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated/40 px-3 py-2 text-xs font-semibold text-text-secondary">
            <Database size={14} className="text-accent" />
            {isLoading ? 'Loading...' : selectedSchemaKey}
          </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept=".sql,text/sql,text/plain" onChange={onFileSelected} className="hidden" />

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

