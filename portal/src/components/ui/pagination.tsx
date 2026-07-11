import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** When provided with pageStart/pageEnd, renders admin list-style footer. */
  total?: number
  pageStart?: number
  pageEnd?: number
  unit?: string
  className?: string
}

function getPages(page: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < pageCount - 1) pages.push('ellipsis')
  pages.push(pageCount)
  return pages
}

function PaginationControls({
  page,
  pageCount,
  onPageChange,
  numbered = false,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  numbered?: boolean
}) {
  const pages = numbered ? getPages(page, pageCount) : []

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size={numbered ? 'icon' : 'sm'}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
        {!numbered && <span>Prev</span>}
      </Button>

      {numbered ? (
        pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              {p}
            </button>
          ),
        )
      ) : (
        <span className="text-sm text-muted-foreground">
          Page {page} of {pageCount}
        </span>
      )}

      <Button
        variant="secondary"
        size={numbered ? 'icon' : 'sm'}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        {!numbered && <span>Next</span>}
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageStart,
  pageEnd,
  unit = 'items',
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null

  const hasSummary =
    total !== undefined && pageStart !== undefined && pageEnd !== undefined

  if (hasSummary) {
    return (
      <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
        <p className="text-sm text-muted-foreground">
          Showing {pageStart}–{pageEnd} of {total} {unit}
        </p>
        <PaginationControls page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    )
  }

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <PaginationControls
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
        numbered
      />
    </nav>
  )
}

export { Pagination }
