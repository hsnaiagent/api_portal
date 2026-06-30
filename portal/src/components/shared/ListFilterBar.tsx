import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface ListFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
  onClear?: () => void;
  hasActiveFilters?: boolean;
  resultLabel?: string;
}

export function ListFilterBar({
  query,
  onQueryChange,
  placeholder = 'Search...',
  children,
  onClear,
  hasActiveFilters,
  resultLabel,
}: ListFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
      {(resultLabel || (hasActiveFilters && onClear)) && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          {resultLabel && <span>{resultLabel}</span>}
          {hasActiveFilters && onClear && (
            <button type="button" onClick={onClear} className="text-brand-blue hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
