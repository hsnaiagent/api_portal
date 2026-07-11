import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { classificationBadgeVariant } from '@/lib/catalog-badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterSelect } from '@/components/ui/filter-select';
import { CLASSIFICATIONS } from '@/config/classification';
import type { API, Classification, LifecycleStatus } from '@/types';

export function PublishingQueuePage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const testing = state.apis.filter((a) => a.lifecycle_status === 'in_testing');
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [publishTarget, setPublishTarget] = useState<API | null>(null);

  const move = (apiId: string, next: LifecycleStatus, message: string) => {
    dispatch({ type: 'UPDATE_API', payload: { api_id: apiId, patch: { lifecycle_status: next } } });
    if (state.currentUser) {
      dispatch({
        type: 'ADD_AUDIT',
        payload: {
          audit_id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor_user_id: state.currentUser.user_id,
          actor_type: 'user',
          action: 'api.lifecycle.changed',
          entity_type: 'api',
          entity_id: apiId,
          payload: { to: next },
        },
      });
    }
    notify('Lifecycle updated', message, 'success');
  };

  const filtered = useMemo(() => {
    return testing.filter((api) => {
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [testing, query, classFilter]);

  const hasActiveFilters = Boolean(query || classFilter);

  const confirmPublish = () => {
    if (!publishTarget) return;
    move(publishTarget.api_id, 'published', `${publishTarget.name} is now published.`);
    setPublishTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Publishing Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          APIs in testing ready for final publish approval
        </p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search APIs awaiting publish..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setClassFilter('');
        }}
        resultLabel={`${filtered.length} of ${testing.length} APIs`}
      >
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title={testing.length === 0 ? 'No APIs awaiting publish' : 'No APIs match your filters'}
          description={
            testing.length === 0
              ? 'APIs move here when they reach the in-testing lifecycle stage.'
              : 'Try adjusting your search or filter criteria.'
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setClassFilter('');
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((api) => (
            <Card key={api.api_id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">{api.name}</p>
                  <Badge variant={classificationBadgeVariant(api.classification)}>
                    {CLASSIFICATIONS[api.classification].label}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => setPublishTarget(api)}>
                    Approve publish
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      move(api.api_id, 'in_development', `${api.name} returned to development.`)
                    }
                  >
                    Return to dev
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={publishTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPublishTarget(null);
        }}
        title={`Publish "${publishTarget?.name ?? ''}"?`}
        description="The API will become visible in the catalog and subscribable by consumers."
        confirmLabel="Publish"
        onConfirm={confirmPublish}
      />
    </div>
  );
}
