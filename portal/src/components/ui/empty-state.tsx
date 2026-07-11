import * as React from 'react'

import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <div
          className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-subtle text-brand [&_svg]:size-6"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-foreground text-balance">
        {title}
      </p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
