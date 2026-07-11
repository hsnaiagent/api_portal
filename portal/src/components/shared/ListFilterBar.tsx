import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="min-w-[200px] flex-1">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            icon={<Search />}
          />
        </div>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
      {(resultLabel || (hasActiveFilters && onClear)) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {resultLabel && <span>{resultLabel}</span>}
          {hasActiveFilters && onClear && (
            <Button type="button" variant="link" size="sm" onClick={onClear}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
