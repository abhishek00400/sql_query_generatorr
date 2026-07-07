import React from 'react'
import { AlertTriangle, Info, ShieldCheck, Trash2 } from 'lucide-react'

export default function ImpactBadge({ impact }) {
  const type = impact?.type
  const estimatedRows = impact?.estimatedRows ?? 0
  const isDestructive = impact?.isDestructive

  const common = {
    base: 'mt-4 flex items-start gap-3 rounded-xl border p-4',
  }

  if (type === 'SELECT') {
    return (
      <div className={[common.base, 'border-info/40 bg-info/10 text-info'].join(' ')}>
        <Info className="mt-0.5" size={18} />
        <div>
          <div className="text-sm font-semibold">Estimated to return ~{estimatedRows} rows</div>
          <div className="mt-1 text-xs text-text-secondary">Read-only operation</div>
        </div>
      </div>
    )
  }

  if (type === 'UPDATE' || type === 'DELETE') {
    return (
      <div className={[common.base, 'border-warning/40 bg-warning/10 text-warning'].join(' ')}>
        <AlertTriangle className="mt-0.5" size={18} />
        <div>
          <div className="text-sm font-semibold">This will modify ~{estimatedRows} rows. This cannot be undone.</div>
          <div className="mt-1 text-xs text-text-secondary">Proceed carefully</div>
        </div>
      </div>
    )
  }

  // DROP/TRUNCATE
  return (
    <div className={[common.base, 'border-danger/40 bg-danger/10 text-danger'].join(' ')}>
      <Trash2 className="mt-0.5" size={18} />
      <div className="w-full">
        <div className="text-sm font-semibold">Destructive operation. This permanently deletes data.</div>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="checkbox"
            disabled
            checked={!!isDestructive}
            readOnly
            className="h-4 w-4 accent-danger"
            aria-label="Irreversible confirmation (mock)"
          />
          <span className="text-xs font-semibold">I understand this is irreversible</span>
        </div>
        <div className="mt-2 text-xs text-text-secondary">Execute button will require confirmation in ExecutePanel.</div>
      </div>
    </div>
  )
}

