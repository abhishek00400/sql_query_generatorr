import React, { useEffect } from 'react'
import { useHistoryStore } from '../store/useHistoryStore'
import EmptyState from '../components/ui/EmptyState'

export default function HistoryPage() {
  const { entries, loadFromStorage, filters } = useHistoryStore()

  useEffect(() => {
    loadFromStorage()
  }, [])

  const filtered = entries.filter((e) => {
    const q = (filters.search || '').toLowerCase()
    const matchSearch = !q || (e.input || '').toLowerCase().includes(q) || (e.sql || '').toLowerCase().includes(q)
    return matchSearch
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Query History</h1>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState type="history" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-xl border border-border bg-bg-surface/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{e.input}</div>
                  <div className="mt-2 text-xs text-text-muted">SQL: {String(e.sql || '').split('\n')[0]}</div>
                </div>
                <div className="text-xs text-text-secondary">{new Date(e.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

