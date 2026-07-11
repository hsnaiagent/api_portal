import * as React from 'react'

import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

/** Prebuilt skeleton matching the ApiCard layout. */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-5 w-3/5" />
      <Skeleton className="mt-3 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-4/5" />
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="ml-auto h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

/** Prebuilt skeleton for a single list row. */
function ListRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-border bg-card p-4',
        className,
      )}
    >
      <Skeleton className="size-10 shrink-0 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-64" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

export { Skeleton, CardSkeleton, ListRowSkeleton }
