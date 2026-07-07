import React from 'react'

export default function Badge({ type = 'default', label }) {
  const cls =
    type === 'success'
      ? 'bg-success/15 text-success border-success/30'
      : type === 'warning'
        ? 'bg-warning/15 text-warning border-warning/30'
        : type === 'danger'
          ? 'bg-danger/15 text-danger border-danger/30'
          : type === 'info'
            ? 'bg-info/15 text-info border-info/30'
            : 'bg-bg-elevated/70 text-text-secondary border-border'

  return (
    <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", cls].join(' ')}>
      {label}
    </span>
  )
}

