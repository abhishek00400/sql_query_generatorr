import React from 'react'

function Illustration({ type }) {
  const common = 'stroke-text-secondary'
  if (type === 'history') {
    return (
      <svg width="84" height="84" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12a9 9 0 0 1 15.36-6.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 12a9 9 0 0 1-15.36 6.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'schema') {
    return (
      <svg width="84" height="84" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 12l2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="84" height="84" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 15l4 4 4-4 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function EmptyState({ type, ctaLabel, onCta }) {
  const map = {
    history: {
      title: 'No queries yet. Try your first one →',
      sub: 'Your past SQL generations will appear here.',
    },
    schema: {
      title: 'No schema loaded. Import a .sql file above.',
      sub: 'Or select a sample schema to begin instantly.',
    },
    results: {
      title: 'No results returned for this query.',
      sub: 'Try adjusting your filters or generating a new query.',
    },
  }

  const item = map[type] || map.results

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-bg-elevated/40 p-8 text-center">
      <div className="text-text-secondary">
        <Illustration type={type} />
      </div>
      <div className="max-w-md">
        <div className="text-lg font-bold text-text-primary">{item.title}</div>
        <div className="mt-2 text-sm text-text-secondary">{item.sub}</div>
      </div>
      {ctaLabel && onCta && (
        <button
          type="button"
          className="mt-1 rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white hover:bg-accent-hover"
          onClick={onCta}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}

