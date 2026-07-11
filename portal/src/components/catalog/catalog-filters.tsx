import { SlidersHorizontal } from 'lucide-react';

import { FilterChip } from '@/components/ui/filter-chip';
import { CLASSIFICATIONS } from '@/config/classification';
import type { Classification, Domain } from '@/types';
import { cn } from '@/lib/utils';

type CatalogFiltersProps = {
  domainList: Domain[];
  domains: string[];
  classifications: Classification[];
  onToggleDomain: (domainId: string) => void;
  onToggleClassification: (classification: Classification) => void;
  onClearAll: () => void;
  domainCounts: Record<string, number>;
};

export function CatalogFilters({
  domainList,
  domains,
  classifications,
  onToggleDomain,
  onToggleClassification,
  onClearAll,
  domainCounts,
}: CatalogFiltersProps) {
  const activeCount = domains.length + classifications.length;
  const classificationKeys = Object.keys(CLASSIFICATIONS) as Classification[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Domain
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by domain">
          {domainList.map((domain) => (
            <FilterChip
              key={domain.domain_id}
              label={domain.name}
              count={domainCounts[domain.domain_id] ?? 0}
              active={domains.includes(domain.domain_id)}
              onToggle={() => onToggleDomain(domain.domain_id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Classification
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by classification"
          >
            {classificationKeys.map((c) => (
              <FilterChip
                key={c}
                label={CLASSIFICATIONS[c].label}
                active={classifications.includes(c)}
                onToggle={() => onToggleClassification(c)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className={cn(
              'ml-auto inline-flex h-8 items-center rounded-full px-3 text-[0.8125rem] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
              activeCount === 0
                ? 'cursor-not-allowed text-muted-foreground/50'
                : 'text-link hover:bg-link-subtle hover:text-link-hover',
            )}
          >
            Clear all{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
