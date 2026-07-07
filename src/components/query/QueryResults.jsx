import React from 'react'
import { useQueryStore } from '../../store/useQueryStore'
import QueryTabs from './QueryTabs'
import QueryCard from './QueryCard'

export default function QueryResults() {
  const { generatedOptions } = useQueryStore()

  if (!generatedOptions || generatedOptions.length === 0) return null

  if (generatedOptions.length > 1) {
    return (
      <div className="fade-slide-down">
        <QueryTabs options={generatedOptions} />
      </div>
    )
  }

  return (
    <div className="fade-slide-down">
      <QueryCard option={generatedOptions[0]} />
    </div>
  )
}

