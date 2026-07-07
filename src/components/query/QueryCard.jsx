import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQueryStore } from '../../store/useQueryStore'
import TypewriterSQL from '../ui/TypewriterSQL'
import ExplanationPanel from './ExplanationPanel'
import TablesPanel from './TablesPanel'
import ImpactBadge from './ImpactBadge'
import ValidationRow from './ValidationRow'

export default function QueryCard({ option }) {
  const { selectOption } = useQueryStore()

  const impact = option?.impact
  const validation = option?.validation || []

  return (
    <article className="rounded-xl border border-border bg-bg-surface/40 p-6">
      <div>
        <TypewriterSQL sql={option.sql} />
      </div>

      <ExplanationPanel explanation={option.explanation} />
      <TablesPanel tables={option.tables} />
      <ImpactBadge impact={impact} />
      <ValidationRow validation={validation} />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => selectOption(option)}
          className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white transition sm:w-auto"
        >
          ✦ Use this Query
        </button>
        <button type="button" className="w-full text-left text-sm font-semibold text-text-secondary hover:text-text-primary sm:w-auto">
          Regenerate
        </button>
      </div>
    </article>
  )
}

