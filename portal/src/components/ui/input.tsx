import * as React from 'react'

import { cn } from '@/lib/utils'

type InputProps = React.ComponentProps<'input'> & {
  /** Icon rendered at the inline-start of the field (e.g. a search icon). */
  icon?: React.ReactNode
  /** Optional element rendered at the inline-end (e.g. a button or shortcut). */
  endAdornment?: React.ReactNode
}

function Input({ className, type = 'text', icon, endAdornment, ...props }: InputProps) {
  const field = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full rounded-lg border border-input bg-background text-sm text-foreground shadow-sm transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
        icon ? 'pl-9' : 'pl-3',
        endAdornment ? 'pr-3' : 'pr-3',
        className,
      )}
      {...props}
    />
  )

  if (!icon && !endAdornment) return field

  return (
    <div className="relative flex w-full items-center">
      {icon && (
        <span
          className="pointer-events-none absolute left-3 flex items-center text-muted-foreground [&_svg]:size-4"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {field}
      {endAdornment && (
        <div className="absolute right-1.5 flex items-center">{endAdornment}</div>
      )}
    </div>
  )
}

export { Input }
export type { InputProps }
