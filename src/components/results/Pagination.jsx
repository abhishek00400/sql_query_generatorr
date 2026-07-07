import React from 'react'

export default function Pagination({ page, totalPages, onPageChange }) {
  const maxButtons = 5
  const pages = []

  const start = Math.max(1, page - Math.floor(maxButtons / 2))
  const end = Math.min(totalPages, start + maxButtons - 1)

  for (let p = start; p <= end; p++) pages.push(p)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={[
          'rounded-lg border px-3 py-2 text-sm font-semibold transition',
          page <= 1 ? 'opacity-50 cursor-not-allowed border-border' : 'border-border bg-bg-elevated/30 text-text-secondary hover:text-text-primary',
        ].join(' ')}
      >
        Prev
      </button>

      <div className="flex items-center gap-2">
        {page > 3 && (
          <span className="px-2 text-sm text-text-secondary">…</span>
        )}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={[
              'rounded-lg border px-3 py-2 text-sm font-bold transition',
              p === page ? 'border-accent bg-accent/15 text-accent' : 'border-border bg-bg-elevated/30 text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
        {page < totalPages - 2 && (
          <span className="px-2 text-sm text-text-secondary">…</span>
        )}
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={[
          'rounded-lg border px-3 py-2 text-sm font-semibold transition',
          page >= totalPages ? 'opacity-50 cursor-not-allowed border-border' : 'border-border bg-bg-elevated/30 text-text-secondary hover:text-text-primary',
        ].join(' ')}
      >
        Next
      </button>
    </div>
  )
}

