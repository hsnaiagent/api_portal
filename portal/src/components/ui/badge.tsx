import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-muted text-muted-foreground',
        brand: 'border-transparent bg-brand-subtle text-accent-foreground',
        info: 'border-transparent bg-link-subtle text-link-hover',
        outline: 'border-border-strong bg-transparent text-foreground',
        active:
          'border-transparent bg-status-active-bg text-status-active-foreground',
        pending:
          'border-transparent bg-status-pending-bg text-status-pending-foreground',
        deprecated:
          'border-transparent bg-status-deprecated-bg text-status-deprecated-foreground',
        rejected:
          'border-transparent bg-status-rejected-bg text-status-rejected-foreground',
      },
      withDot: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      withDot: false,
    },
  },
)

const dotColor: Record<string, string> = {
  active: 'bg-status-active',
  pending: 'bg-status-pending',
  deprecated: 'bg-status-deprecated',
  rejected: 'bg-status-rejected',
  brand: 'bg-brand',
  info: 'bg-link',
  neutral: 'bg-muted-foreground',
  outline: 'bg-foreground',
}

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>

function Badge({
  className,
  variant = 'neutral',
  withDot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, withDot, className }))}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            'size-1.5 rounded-full',
            dotColor[variant ?? 'neutral'],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
