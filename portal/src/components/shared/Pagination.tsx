import { Pagination as UiPagination } from '@/components/ui/pagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageStart: number;
  pageEnd: number;
  onPageChange: (page: number) => void;
  unit?: string;
}

/** Admin list pagination — delegates to the shared design-system component. */
export function Pagination({
  page,
  totalPages,
  total,
  pageStart,
  pageEnd,
  onPageChange,
  unit = 'items',
}: PaginationProps) {
  return (
    <UiPagination
      page={page}
      pageCount={totalPages}
      total={total}
      pageStart={pageStart}
      pageEnd={pageEnd}
      onPageChange={onPageChange}
      unit={unit}
    />
  );
}
