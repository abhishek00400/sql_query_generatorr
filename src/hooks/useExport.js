export function useExport() {
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function exportCSV(data, filename = 'export.csv') {
    const rows = Array.isArray(data) ? data : []
    if (rows.length === 0) {
      downloadBlob(new Blob([''], { type: 'text/csv;charset=utf-8' }), filename)
      return
    }

    const columns = Object.keys(rows[0] || {})
    const escapeVal = (v) => {
      const s = String(v ?? '')
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }

    const csv = [columns.join(',')]
      .concat(
        rows.map((r) => columns.map((c) => escapeVal(r[c])).join(','))
      )
      .join('\n')

    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename)
  }

  function exportJSON(data, filename = 'export.json') {
    const json = JSON.stringify(data ?? [], null, 2)
    downloadBlob(new Blob([json], { type: 'application/json;charset=utf-8' }), filename)
  }

  return { exportCSV, exportJSON }
}
