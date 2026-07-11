import { useMemo, useState } from 'react';

import { usePortal } from '@/store/AppStore';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useNotify } from '@/hooks/useNotify';
import {
  classificationBadgeVariant,
  lifecycleBadgeVariant,
} from '@/lib/catalog-badges';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { FilterSelect } from '@/components/ui/filter-select';
import { domains } from '@/data/domains';
import { CLASSIFICATIONS } from '@/config/classification';
import { LIFECYCLE_LABELS } from '@/config/lifecycle';
import type { API, Classification, LifecycleStatus } from '@/types';

export function AllApisPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [retireTarget, setRetireTarget] = useState<API | null>(null);

  const filtered = useMemo(() => {
    return state.apis.filter((api) => {
      if (domainFilter && api.domain_id !== domainFilter) return false;
      if (statusFilter && api.lifecycle_status !== statusFilter) return false;
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [state.apis, query, domainFilter, statusFilter, classFilter]);

  const hasActiveFilters = Boolean(query || domainFilter || statusFilter || classFilter);
  const { page, setPage, pageItems, totalPages, total, pageStart, pageEnd } = usePagination(
    filtered,
    12,
  );

  const confirmEmergencyRetire = () => {
    if (!retireTarget || !state.currentUser) return;
    const api = retireTarget;
    dispatch({
      type: 'UPDATE_API',
      payload: { api_id: api.api_id, patch: { lifecycle_status: 'emergency_retired' } },
    });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action: 'api.emergency_retired',
        entity_type: 'api',
        entity_id: api.api_id,
        payload: { from: api.lifecycle_status },
      },
    });
    notify('API emergency-retired', `${api.name} has been retired and access blocked.`, 'warning');
    setRetireTarget(null);
  };

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
        id: 'class',
        header: 'Class',
        cell: (api) => (
          <Badge variant={classificationBadgeVariant(api.classification)}>
            {CLASSIFICATIONS[api.classification].label}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'w-36',
        cell: (api) =>
          api.lifecycle_status !== 'emergency_retired' ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setRetireTarget(api)}
            >
              Emergency retire
            </Button>
          ) : null,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All APIs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Portal-wide catalog view with emergency lifecycle controls
        </p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name or description..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setDomainFilter('');
          setStatusFilter('');
          setClassFilter('');
        }}
        resultLabel={`${filtered.length} of ${state.apis.length} APIs`}
      >
        <FilterSelect
          value={domainFilter}
          onChange={setDomainFilter}
          placeholder="All domains"
          options={domains.map((d) => ({ value: d.domain_id, label: d.name }))}
          className="w-44"
        />
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
        data={pageItems}
        keyExtractor={(api) => api.api_id}
        emptyTitle={
          state.apis.length === 0 ? 'No APIs in the catalog yet' : 'No APIs match your filters'
        }
        emptyDescription={
          state.apis.length === 0
            ? 'APIs appear here once providers register and publish them.'
            : 'Try adjusting your search or filter criteria.'
        }
        emptyAction={
          hasActiveFilters ? (
            <button
              type="button"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              onClick={() => {
                setQuery('');
                setDomainFilter('');
                setStatusFilter('');
                setClassFilter('');
              }}
            >
              Clear filters
            </button>
          ) : undefined
        }
      />

      {filtered.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onPageChange={setPage}
          unit="APIs"
        />
      )}

      <ConfirmDialog
        open={retireTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRetireTarget(null);
        }}
        title={`Emergency-retire "${retireTarget?.name ?? ''}"?`}
        description="This immediately blocks all access and cannot be undone."
        confirmLabel="Emergency retire"
        confirmVariant="destructive"
        onConfirm={confirmEmergencyRetire}
      />
    </div>
  );
}
