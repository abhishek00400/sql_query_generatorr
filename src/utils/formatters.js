export function formatTimestamp(date) {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()

  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffHr < 24) {
    if (diffHr <= 1) return '1 hour ago'
    return `${diffHr} hours ago`
  }
  if (diffDay < 7) {
    return `${diffDay} days ago`
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const m = monthNames[d.getMonth()]
  return `${m} ${d.getDate()}, ${d.getFullYear()}`
}

export function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, Math.max(0, maxLength - 1)) + '…'
}

export function formatRowCount(n) {
  if (typeof n !== 'number') return '0 rows'
  return `${n.toLocaleString()} rows`
}
