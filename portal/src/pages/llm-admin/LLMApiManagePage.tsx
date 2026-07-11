import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { FilterSelect } from '@/components/ui/filter-select';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { classificationBadgeVariant, lifecycleBadgeVariant } from '@/lib/catalog-badges';
import { CLASSIFICATIONS } from '@/config/classification';
import { LIFECYCLE_LABELS } from '@/config/lifecycle';
import type { API, Classification, LifecycleStatus } from '@/types';

export function LLMApiManagePage() {
  const { state } = usePortal();
  const llmApis = state.apis.filter((a) => a.domain_id === 'dom_ai');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = useMemo(() => {
    return llmApis.filter((api) => {
      if (statusFilter && api.lifecycle_status !== statusFilter) return false;
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [llmApis, query, statusFilter, classFilter]);

  const hasActiveFilters = Boolean(query || statusFilter || classFilter);

  const columns = useMemo<DataTableColumn<API>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (api) => <span className="font-medium">{api.name}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (api) => (
          <Badge variant={lifecycleBadgeVariant(api.lifecycle_status)} withDot>
            {LIFECYCLE_LABELS[api.lifecycle_status]}
          </Badge>
        ),
      },
      {
        id: 'classification',
        header: 'Classification',
        cell: (api) => (
          <Badge variant={classificationBadgeVariant(api.classification)}>
            {CLASSIFICATIONS[api.classification].label}
          </Badge>
        ),
      },
      {
        id: 'tier',
        header: 'Tier',
        cell: (api) => `Tier ${api.gateway_tier}`,
      },
      {
        id: 'actions',
        header: '',
        headerClassName: 'w-24',
        cellClassName: 'text-right',
        cell: (api) => (
          <Link
            to={ROUTES.llmAdmin.manage(api.api_id)}
            className={buttonVariants({ variant: 'link', size: 'sm' })}
          >
            Manage
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-foreground">My LLM APIs</h1>
        <Link to={ROUTES.llmAdmin.register} className={buttonVariants({ variant: 'primary' })}>
          Register LLM API
        </Link>
      </div>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name or description..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setStatusFilter('');
          setClassFilter('');
        }}
        resultLabel={`${filtered.length} of ${llmApis.length} APIs`}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={(Object.keys(LIFECYCLE_LABELS) as LifecycleStatus[]).map((s) => ({
            value: s,
            label: LIFECYCLE_LABELS[s],
          }))}
          className="w-44"
        />
        <FilterSelect
          value={classFilter}
          onChange={setClassFilter}
          placeholder="All classifications"
          options={(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => ({
            value: c,
            label: CLASSIFICATIONS[c].label,
          }))}
          className="w-48"
        />
      </ListFilterBar>
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(api) => api.api_id}
        emptyTitle={llmApis.length === 0 ? 'No LLM APIs registered yet' : 'No APIs match your filters'}
        emptyDescription={
          llmApis.length === 0
            ? 'Register your first LLM API to get started.'
            : 'Try adjusting your search or filter criteria.'
        }
        emptyAction={
          hasActiveFilters ? (
            <button
              type="button"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              onClick={() => {
                setQuery('');
                setStatusFilter('');
                setClassFilter('');
              }}
            >
              Clear filters
            </button>
          ) : llmApis.length === 0 ? (
            <Link to={ROUTES.llmAdmin.register} className={buttonVariants({ variant: 'primary', size: 'sm' })}>
              Register LLM API
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}
