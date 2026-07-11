import * as React from 'react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

type StatCardProps = {
  label: string
  value: React.ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
}

function StatCard({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <p className={cn('text-sm text-muted-foreground', labelClassName)}>{label}</p>
        <p
          className={cn(
            'mt-1 text-3xl font-bold tracking-tight text-foreground tabular-nums',
            valueClassName,
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

export { StatCard }
export type { StatCardProps }
