import React, { useState } from 'react'

function StatusPill({ status, label, onClick }) {
  const map = {
    pass: { cls: 'bg-success/15 text-success border-success/30', icon: '✅' },
    warn: { cls: 'bg-warning/15 text-warning border-warning/30', icon: '⚠' },
    fail: { cls: 'bg-danger/15 text-danger border-danger/30', icon: '❌' },
  }
  const normalized = status === 'success' ? 'pass' : status === 'warning' ? 'warn' : status === 'danger' ? 'fail' : status
  const m = map[normalized] || map.pass

  return (
    <button
      type="button"
      onClick={onClick}
      className={["rounded-full border px-3 py-1 text-xs font-bold transition", m.cls, onClick ? 'hover:opacity-90' : ''].join(' ')}
    >
      {m.icon} {label}
    </button>
  )
}

export default function ValidationRow({ validation = [] }) {
  const [expandedIdx, setExpandedIdx] = useState(null)

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold text-text-primary">Validation</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {validation.map((v, idx) => (
          <StatusPill
            key={idx}
            status={v.status}
            label={v.label}
            onClick={v.detail ? () => setExpandedIdx((cur) => (cur === idx ? null : idx)) : undefined}
          />
        ))}
      </div>

      {expandedIdx !== null && validation[expandedIdx] && validation[expandedIdx].detail && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border/60 bg-bg-primary/10 p-4">
          <div className="text-xs font-bold text-text-secondary">Details</div>
          <div className="mt-2 text-sm text-text-primary">{validation[expandedIdx].detail}</div>
        </div>
      )}
    </div>
  )
}

