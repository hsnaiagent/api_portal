import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<'div'> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        interactive &&
          'transition-all hover:border-border-strong hover:shadow-md focus-within:border-ring',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5 p-5', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        'text-base font-semibold leading-tight tracking-tight text-foreground text-balance',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        'text-sm leading-relaxed text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-5 pb-5', className)}
      {...props}
    />
  )
}

/** Horizontal metadata row (label/value pairs, tags, etc.). */
function CardMeta({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-meta"
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'mt-auto flex items-center gap-2 border-t border-border px-5 py-3.5',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardMeta,
  CardFooter,
}
