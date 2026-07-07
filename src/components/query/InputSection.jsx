import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryStore } from '../../store/useQueryStore'
import { MAX_INPUT_LENGTH } from '../../constants/config'
import { samplePrompts } from '../../constants/samplePrompts'
import SchemaSelector from './SchemaSelector'
import Spinner from '../ui/Spinner'

export default function InputSection() {
  const { userInput, selectedSchema, isLoading, setUserInput } = useQueryStore()
  const textareaRef = useRef(null)

  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount((userInput || '').length)
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.min(el.scrollHeight, 10 * 24)
    el.style.height = `${Math.max(96, next)}px`
  }, [userInput])

  const enabled = useMemo(() => (userInput || '').trim().length > 0 && !isLoading, [userInput, isLoading])

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        // Action lives in store; called by component with event
        const btn = document.getElementById('generate-sql-btn')
        btn?.click?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="rounded-xl border border-border bg-bg-surface/40 p-6 transition-all">
      <h2 className="text-2xl font-semibold text-text-primary">What do you want to know?</h2>
      <p className="mt-1 text-sm text-text-secondary">Describe it in plain English — no SQL needed.</p>

      <div className="mt-4">
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 240)}px`
          }}
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-bg-primary/20 px-4 py-3 font-ui text-sm text-text-primary placeholder:text-text-muted focus:border-accent transition"
          placeholder="e.g. Show all employees earning more than ₹50,000 in the IT department"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-xs text-text-muted">Ctrl + Enter to generate</div>
          <div className={[count >= 450 ? 'text-danger' : 'text-text-muted', 'text-xs font-semibold'].join(' ')}>
            {count}/{MAX_INPUT_LENGTH}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          Example prompts
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {samplePrompts.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setUserInput(p.text)}
              className="shrink-0 rounded-full border border-border bg-bg-elevated/40 px-3 py-1 text-xs font-semibold text-text-secondary hover:border-accent hover:text-text-primary transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-text-secondary">Using schema:</div>
          <div className="flex-1">
            <SchemaSelector />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          id="generate-sql-btn"
          type="button"
          onClick={() => useQueryStore.getState().generateSQL()}
          disabled={!enabled}
          className={[
            'flex-1 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white transition',
            !enabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-hover',
          ].join(' ')}
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner size="sm" /> Generating
            </span>
          ) : (
            '✦ Generate SQL'
          )}
        </button>

        {(userInput || '').trim().length > 0 && (
          <button
            type="button"
            onClick={() => setUserInput('')}
            className="rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            Clear
          </button>
        )}
      </div>
    </section>
  )
}

