import * as React from 'react'
import { Inbox } from 'lucide-react'

import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  headerClassName?: string
  cellClassName?: string
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  className?: string
  tableClassName?: string
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = 'No results',
  emptyDescription,
  emptyAction,
  className,
  tableClassName,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        className={className}
        icon={<Inbox />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={keyExtractor(row)}>
              {columns.map((column) => (
                <TableCell key={column.id} className={column.cellClassName}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { DataTable }
