import React, { useMemo, useState } from 'react'
import { ROWS_PER_PAGE } from '../../constants/config'
import EmptyState from '../ui/EmptyState'
import Pagination from './Pagination'

export default function ResultsTable({ columns, rows }) {
  const cols = columns?.length ? columns : (rows?.[0] ? Object.keys(rows[0]) : [])
  const data = rows || []

  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE))

  const startIdx = (page - 1) * ROWS_PER_PAGE
  const endIdx = Math.min(data.length, startIdx + ROWS_PER_PAGE)

  const pageRows = data.slice(startIdx, endIdx)

  return (
    <div className="rounded-xl border border-border/60 bg-bg-primary/10 p-4">
      {data.length === 0 ? (
        <EmptyState type="results" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="overflow-y-auto">
                <table className="min-w-[720px]">
                  <thead className="sticky top-0 z-10 bg-bg-elevated/60 border-b border-border/60">
                    <tr>
                      {cols.map((c) => (
                        <th key={c} className="px-4 py-2 text-left text-xs font-semibold text-text-secondary">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-bg-surface/40' : 'bg-bg-elevated/30'}>
                        {cols.map((c) => (
                          <td key={c} className="px-4 py-2 text-sm text-text-primary">
                            {r[c]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

          <div className="mt-2 text-xs text-text-muted">
            Showing {data.length === 0 ? 0 : startIdx + 1}–{endIdx} of {data.length} results
          </div>
        </>
      )}
    </div>
  )
}

