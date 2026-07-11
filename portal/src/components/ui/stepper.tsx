import * as React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export type StepperStep = {
  id: string | number
  label: string
}

type StepperProps = {
  steps: StepperStep[]
  currentStep: string | number
  className?: string
}

function Stepper({ steps, currentStep, className }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const isComplete = currentIndex > index
          const isCurrent = step.id === currentStep
          const isUpcoming = currentIndex < index

          return (
            <li key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                  isCurrent &&
                    'border-primary bg-primary text-primary-foreground',
                  isComplete &&
                    'border-border bg-muted text-foreground',
                  isUpcoming &&
                    'border-border bg-background text-muted-foreground',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isCurrent && 'bg-primary-foreground/20 text-primary-foreground',
                    isComplete && 'bg-primary text-primary-foreground',
                    isUpcoming && 'bg-muted text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {isComplete ? <Check className="size-3" /> : index + 1}
                </span>
                <span>{step.label}</span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  className="hidden h-px w-6 bg-border sm:block"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Stepper }
