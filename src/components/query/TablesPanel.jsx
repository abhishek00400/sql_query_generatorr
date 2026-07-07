import React from 'react'
import { Database } from 'lucide-react'

const roleToBadge = {
  Filter: { cls: 'bg-info/15 text-info border-info/30', label: 'Filter' },
  Return: { cls: 'bg-accent/15 text-accent border-accent/30', label: 'Return' },
  Join: { cls: 'bg-warning/15 text-warning border-warning/30', label: 'Join' },
  Update: { cls: 'bg-warning/15 text-warning border-warning/30', label: 'Update' },
}

export default function TablesPanel({ tables = [] }) {
  const allPills = tables.map((t) => t.name)

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold text-text-primary">Tables involved</div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tables.map((t) => (
          <span key={t.name} className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/30 px-3 py-1 text-xs font-semibold text-text-secondary">
            <Database size={14} className="text-accent" />
            {t.name}
          </span>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-bg-primary/10">
        <table className="min-w-[520px]">
          <thead className="border-b border-border/60 bg-bg-elevated/40">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary">Table</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary">Column Used</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary">Role</th>
            </tr>
          </thead>
          <tbody>
            {tables.flatMap((t) =>
              (t.columns || []).map((c, idx) => (
                <tr key={`${t.name}-${idx}`} className="border-b border-border/30 last:border-b-0">
                  <td className="px-4 py-2 text-sm font-semibold text-text-secondary">{t.name}</td>
                  <td className="px-4 py-2 text-sm text-text-primary">{c.name}</td>
                  <td className="px-4 py-2">
                    {(() => {
                      const r = roleToBadge[c.role] || roleToBadge.Return
                      return (
                        <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold", r.cls].join(' ')}>
                          {r.label}
                        </span>
                      )
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

