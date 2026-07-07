import React from 'react'
import { Check } from 'lucide-react'

function StepCircle({ state, label }) {
  if (state === 'done') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success border border-success/30">
        <Check size={16} />
      </div>
    )
  }
  if (state === 'active') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent border border-accent/30">
        <span className="text-sm font-bold">{label}</span>
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated/70 text-text-muted border border-border">
      <span className="text-sm font-bold">{label}</span>
    </div>
  )
}

export default function StepIndicator({ currentStep = 1 }) {
  const steps = [1, 2, 3]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => {
          const state = s < currentStep ? 'done' : s === currentStep ? 'active' : 'inactive'
          return (
            <React.Fragment key={s}>
              <div className="flex flex-1 items-center gap-3">
                <StepCircle state={state} label={s} />
                <div className="hidden sm:block">
                  <div className={["text-sm font-semibold", state === 'active' ? 'text-accent' : 'text-text-secondary'].join(' ')}>
                    {s === 1 ? 'Ask' : s === 2 ? 'Review' : 'Execute'}
                  </div>
                </div>
              </div>
              {idx !== steps.length - 1 && (
                <div className="hidden flex-1 sm:block">
                  <div className={["h-0.5 w-full", s < currentStep ? 'bg-success' : 'bg-border'].join(' ')} />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

