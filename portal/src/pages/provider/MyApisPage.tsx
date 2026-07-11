import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { getManagedApis } from '@/lib/roles';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { FilterSelect } from '@/components/ui/filter-select';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { classificationBadgeVariant, lifecycleBadgeVariant } from '@/lib/catalog-badges';
import { CLASSIFICATIONS } from '@/config/classification';
import { LIFECYCLE_LABELS } from '@/config/lifecycle';
import type { API, Classification, LifecycleStatus } from '@/types';

export function MyApisPage() {
  const { state } = usePortal();
  const myApis = getManagedApis(state.apis, state.currentUser, state.activeRole);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = useMemo(() => {
    return myApis.filter((api) => {
      if (statusFilter && api.lifecycle_status !== statusFilter) return false;
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [myApis, query, statusFilter, classFilter]);

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
            to={ROUTES.provider.manage(api.api_id)}
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
        <h1 className="text-2xl font-bold">My APIs</h1>
        <Link to={ROUTES.provider.register} className={buttonVariants({ variant: 'primary' })}>
          Publish API
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
        resultLabel={`${filtered.length} of ${myApis.length} APIs`}
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
        emptyTitle={
          myApis.length === 0 ? "You haven't registered any APIs yet." : 'No APIs match your filters.'
        }
        emptyDescription={
          myApis.length === 0
            ? 'Publish your first API to make it available for review and subscription.'
            : 'Try adjusting your search or filter criteria.'
        }
        emptyAction={
          myApis.length === 0 ? (
            <Link to={ROUTES.provider.register} className={buttonVariants({ variant: 'primary' })}>
              Publish API
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}
