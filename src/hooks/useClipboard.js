import { useCallback, useEffect, useState } from 'react'

export function useClipboard(timeoutMs = 2000) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), timeoutMs)
    return () => clearTimeout(t)
  }, [copied, timeoutMs])

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text || '')
      setCopied(true)
      return true
    } catch {
      // fallback
      try {
        const ta = document.createElement('textarea')
        ta.value = text || ''
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        return true
      } catch {
        return false
      }
    }
  }, [])

  return { copy, copied }
}
