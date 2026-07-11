import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

type FilterChipProps = {
  label: string
  active?: boolean
  /** Optional count shown on the trailing side (e.g. number of matches). */
  count?: number
  /** When provided, renders a removable "x". Called instead of onToggle. */
  onRemove?: () => void
  onToggle?: () => void
  className?: string
}

function FilterChip({
  label,
  active = false,
  count,
  onRemove,
  onToggle,
  className,
}: FilterChipProps) {
  return (
    <span
      className={cn(
        'group inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.8125rem] font-medium transition-colors',
        active
          ? 'border-brand bg-brand-subtle text-accent-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground',
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        className="inline-flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {label}
        {typeof count === 'number' && (
          <span
            className={cn(
              'rounded-full px-1.5 text-[0.6875rem] tabular-nums',
              active
                ? 'bg-brand/15 text-accent-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {count}
          </span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="-mr-1 inline-flex size-4 items-center justify-center rounded-full text-current/70 transition-colors hover:bg-brand/15 hover:text-current focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}

export { FilterChip }
export type { FilterChipProps }
