import React, { useEffect, useMemo, useState } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useTypewriter } from '../../hooks/useTypewriter'
import { useClipboard } from '../../hooks/useClipboard'
import SQLBlock from './SQLBlock'
import { Copy } from 'lucide-react'

export default function TypewriterSQL({ sql = '', speed = 18 }) {
  const { theme } = useSettingsStore()
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mql) return
    const onChange = () => setReducedMotion(!!mql.matches)
    onChange()
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  const enabled = !reducedMotion
  const { displayText, isDone } = useTypewriter(sql, speed, enabled)
  const current = useMemo(() => (enabled ? displayText : sql), [enabled, displayText, sql])

  const { copy, copied } = useClipboard(2000)

  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-10">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-bg-surface/20 px-3 py-2 text-xs font-bold text-text-secondary hover:border-accent/60 hover:text-text-primary"
          onClick={() => copy(sql)}
          aria-label="Copy SQL"
        >
          {copied ? 'Copied! ✓' : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>

      <SQLBlock sql={current || (isDone ? sql : '')} key={`${theme}-${enabled ? 'anim' : 'noanim'}`} />
    </div>
  )
}

