import { useEffect, useMemo, useState } from 'react';

export interface PaginationResult<T> {
  page: number;
  setPage: (page: number) => void;
  pageItems: T[];
  totalPages: number;
  total: number;
  pageStart: number;
  pageEnd: number;
}

/**
 * Client-side pagination for large lists/tables. Resets to page 1 whenever the
 * result-set size changes (e.g. filters applied) and clamps out-of-range pages.
 */
export function usePagination<T>(items: T[], pageSize = 10): PaginationResult<T> {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [total]);

  const current = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );

  return {
    page: current,
    setPage,
    pageItems,
    totalPages,
    total,
    pageStart: total === 0 ? 0 : (current - 1) * pageSize + 1,
    pageEnd: Math.min(current * pageSize, total),
  };
}
