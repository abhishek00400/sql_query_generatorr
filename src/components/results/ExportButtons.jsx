import React from 'react'
import toast from 'react-hot-toast'
import { useExport } from '../../hooks/useExport'

export default function ExportButtons({ data }) {
  const { exportCSV, exportJSON } = useExport()

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => {
          exportCSV(data, 'querymind-results.csv')
          toast.success('CSV downloaded')
        }}
        className="flex-1 rounded-lg bg-bg-elevated/30 border border-border px-4 py-3 text-sm font-bold text-text-secondary hover:text-text-primary"
      >
        ⬇ Download CSV
      </button>
      <button
        type="button"
        onClick={() => {
          exportJSON(data, 'querymind-results.json')
          toast.success('JSON downloaded')
        }}
        className="flex-1 rounded-lg bg-bg-elevated/30 border border-border px-4 py-3 text-sm font-bold text-text-secondary hover:text-text-primary"
      >
        ⬇ Download JSON
      </button>
    </div>
  )
}

