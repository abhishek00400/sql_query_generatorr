import React, { useMemo, useState } from 'react'

export default function ExplanationPanel({ explanation }) {
  const bullets = explanation?.bullets || []
  const [expanded, setExpanded] = useState(false)

  const shown = expanded ? bullets : bullets.slice(0, 3)

  const canExpand = bullets.length > 3

  return (
    <div className="mt-4 rounded-lg border border-border/60 bg-bg-primary/10 p-4">
      <div className="text-sm font-semibold text-text-primary">What this query does</div>
      <ul className="mt-3 space-y-2">
        {shown.map((b, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="mt-0.5 text-accent">✦</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {canExpand && (
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-accent hover:text-accent-hover"
          onClick={() => setExpanded((s) => !s)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

