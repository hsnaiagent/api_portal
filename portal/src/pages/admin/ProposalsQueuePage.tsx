import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { AIBadge } from '@/components/ai/AIBadge';
import { useNotify } from '@/hooks/useNotify';
import { classificationBadgeVariant } from '@/lib/catalog-badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterSelect } from '@/components/ui/filter-select';
import { CLASSIFICATIONS } from '@/config/classification';
import type { Classification } from '@/types';

export function ProposalsQueuePage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const proposed = state.apis.filter((a) => a.lifecycle_status === 'proposed');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [workflowTip, setWorkflowTip] = useState<string>();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [rejectTarget, setRejectTarget] = useState<{ apiId: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    return proposed.filter((api) => {
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [proposed, query, classFilter]);

  const hasActiveFilters = Boolean(query || classFilter);

  const audit = (action: string, apiId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action,
        entity_type: 'api',
        entity_id: apiId,
      },
    });
  };

  const accept = (apiId: string, name: string) => {
    dispatch({
      type: 'UPDATE_API',
      payload: { api_id: apiId, patch: { lifecycle_status: 'under_review' } },
    });
    audit('api.proposal.accepted', apiId);
    notify('Proposal accepted', `${name} moved to Under Review.`, 'success');
  };

  const reject = () => {
    if (!rejectTarget) return;
    const { apiId, name } = rejectTarget;
    dispatch({
      type: 'UPDATE_API',
      payload: { api_id: apiId, patch: { lifecycle_status: 'rejected' } },
    });
    audit('api.proposal.rejected', apiId);
    notify('Proposal rejected', `${name} was rejected.`, 'warning');
    setRejectTarget(null);
  };

  const showWorkflow = async (apiId: string) => {
    setExpanded(apiId);
    const api = state.apis.find((a) => a.api_id === apiId);
    const res = await getAIResponse('AI_11_WorkflowSuggester', {
      classification: api?.classification,
    });
    setWorkflowTip(res?.text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Proposals Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review newly submitted API proposals before they enter the review workflow
        </p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search proposals..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setClassFilter('');
        }}
        resultLabel={`${filtered.length} of ${proposed.length} proposals`}
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
          title={proposed.length === 0 ? 'No proposals awaiting review' : 'No proposals match your filters'}
          description={
            proposed.length === 0
              ? 'When providers submit new APIs, they will appear here for triage.'
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
              <CardContent className="space-y-3 p-6">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{api.name}</p>
                    <p className="text-sm text-muted-foreground">{api.description}</p>
                  </div>
                  <Badge variant={classificationBadgeVariant(api.classification)}>
                    {CLASSIFICATIONS[api.classification].label}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => void showWorkflow(api.api_id)}
                >
                  <AIBadge label="AI-11" /> Workflow suggestion
                </Button>
                {expanded === api.api_id && workflowTip && (
                  <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground">
                    {workflowTip}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button type="button" onClick={() => accept(api.api_id, api.name)}>
                    Accept for review
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setRejectTarget({ apiId: api.api_id, name: api.name })}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        title={`Reject proposal for "${rejectTarget?.name ?? ''}"?`}
        description="The API will be marked as rejected and removed from the proposals queue."
        confirmLabel="Reject proposal"
        confirmVariant="destructive"
        onConfirm={reject}
      />
    </div>
  );
}
