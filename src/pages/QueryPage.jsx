import React from 'react'
import { useQueryStore } from '../store/useQueryStore'
import StepIndicator from '../components/ui/StepIndicator'
import InputSection from '../components/query/InputSection'
import QueryResults from '../components/query/QueryResults'
import ExecutePanel from '../components/query/ExecutePanel'

export default function QueryPage() {
  const { step } = useQueryStore()

  return (
    <div>
      <StepIndicator currentStep={step} />
      <InputSection />

      {step >= 2 && <QueryResults />}
      {step >= 3 && <ExecutePanel />}
    </div>
  )
}


