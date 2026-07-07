import React, { useMemo, useState } from 'react'
import { useQueryStore } from '../../store/useQueryStore'
import SQLBlock from '../ui/SQLBlock'
import Spinner from '../ui/Spinner'
import Modal from '../ui/Modal'
import ResultsTable from '../results/ResultsTable'
import ExportButtons from '../results/ExportButtons'

export default function ExecutePanel() {
  const { selectedOption, queryResults, executeQuery, reset, step, isLoading } = useQueryStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [irreversibleOk, setIrreversibleOk] = useState(false)

  const sql = selectedOption?.sql || ''
  const impactType = selectedOption?.impact?.type

  const isDestructive = ['DROP', 'TRUNCATE'].includes((impactType || '').toUpperCase())
  const requiresModal = ['UPDATE', 'DELETE', 'DROP', 'TRUNCATE'].includes((impactType || '').toUpperCase())

  const canRun = !isLoading && (!isDestructive || irreversibleOk)

  const run = async () => {
    await executeQuery(sql)
    setConfirmOpen(false)
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-bg-surface/40 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-text-primary">Execute</div>
        <div className="text-xs text-text-muted">Mock execution</div>
      </div>

      <div className="mt-4">
        <SQLBlock sql={sql} />
      </div>

      {isDestructive && (
        <div className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={irreversibleOk}
            onChange={(e) => setIrreversibleOk(e.target.checked)}
            className="mt-1 h-4 w-4 accent-danger"
            id="irreversible"
          />
          <label htmlFor="irreversible" className="text-sm font-semibold text-danger">
            I understand this is irreversible
          </label>
        </div>
      )}

      <div className="mt-5">
        <button
          type="button"
          disabled={!canRun}
          onClick={() => {
            if (requiresModal) setConfirmOpen(true)
            else run()
          }}
          className={[
            'w-full rounded-lg bg-success px-6 py-3 text-sm font-bold text-white transition',
            !canRun ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110',
          ].join(' ')}
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner size="sm" /> Running
            </span>
          ) : (
            '▶ Run Query'
          )}
        </button>

        {isLoading && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-bg-elevated/60">
            <div className="h-full w-1/3 animate-pulse bg-success" />
          </div>
        )}
      </div>

      {queryResults && Array.isArray(queryResults.rows) && queryResults.rows.length > 0 && (
        <div className="mt-6">
          <ResultsTable columns={queryResults.columns} rows={queryResults.rows} />
          <div className="mt-4">
            <ExportButtons data={queryResults.rows} />
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            reset()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="w-full rounded-lg border border-border bg-bg-elevated/30 px-6 py-3 text-sm font-bold text-text-secondary hover:text-text-primary"
        >
          Ask something else →
        </button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={run}
        title="Confirm destructive action"
        message="This operation will modify/delete data. Proceed?"
        confirmLabel="Run"
        confirmVariant="danger"
      />
    </section>
  )
}

