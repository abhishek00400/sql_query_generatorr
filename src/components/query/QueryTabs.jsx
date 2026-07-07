import React, { useMemo, useState } from 'react'
import QueryCard from './QueryCard'

export default function QueryTabs({ options = [] }) {
  const labels = useMemo(() => ['Option A', 'Option B', 'Option C'], [])
  const [activeIdx, setActiveIdx] = useState(0)

  const active = options[activeIdx] || options[0]

  return (
    <section>
      <div className="mb-4 flex gap-3 overflow-x-auto border-b border-border/60">
        {options.map((o, idx) => {
          const active = idx === activeIdx
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={[
                'pb-3 pr-2 text-sm font-semibold transition',
                active ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {labels[idx] || `Option ${idx + 1}`}
            </button>
          )
        })}
      </div>

      {active && <QueryCard option={active} />}
    </section>
  )
}

