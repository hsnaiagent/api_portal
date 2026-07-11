import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { usePortal } from '@/store/AppStore';
import { LIFECYCLE_TRANSITIONS, LIFECYCLE_LABELS } from '@/config/lifecycle';
import { CLASSIFICATIONS } from '@/config/classification';
import { LifecycleBadge } from '@/components/shared/LifecycleBadge';
import { NotFound } from '@/components/shared/NotFound';
import { useNotify } from '@/hooks/useNotify';
import { ROUTES } from '@/config/routes';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Classification, LifecycleStatus } from '@/types';

export function ApiManagePage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const api = state.apis.find((a) => a.api_id === id);
  const role = state.activeRole;

  const [editing, setEditing] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<LifecycleStatus | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    classification: 'internal' as Classification,
    tier: 1 as 1 | 2 | 3,
    tags: '',
  });

  if (!api)
    return (
      <NotFound
        title="API not found"
        message="This API does not exist or you no longer manage it."
        to={ROUTES.provider.myApis}
        actionLabel="Back to My APIs"
      />
    );

  const transitions = LIFECYCLE_TRANSITIONS[api.lifecycle_status];
  const canTransition = transitions?.allowedRoles.includes(role ?? 'developer');

  const audit = (action: string, payload?: Record<string, unknown>) => {
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
        entity_id: api.api_id,
        payload,
      },
    });
  };

  const confirmTransition = () => {
    if (!pendingTransition) return;
    const next = pendingTransition;
    dispatch({
      type: 'UPDATE_API',
      payload: { api_id: api.api_id, patch: { lifecycle_status: next } },
    });
    audit('api.lifecycle.changed', { from: api.lifecycle_status, to: next });
    notify('Lifecycle updated', `${api.name} moved to ${LIFECYCLE_LABELS[next]}.`, 'success');
    setPendingTransition(null);
  };

  const startEdit = () => {
    setDraft({
      name: api.name,
      description: api.description,
      classification: api.classification,
      tier: api.gateway_tier,
      tags: api.tags.join(', '),
    });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!draft.name.trim()) return;
    dispatch({
      type: 'UPDATE_API',
      payload: {
        api_id: api.api_id,
        patch: {
          name: draft.name.trim(),
          description: draft.description,
          classification: draft.classification,
          gateway_tier: draft.tier,
          tags: draft.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        },
      },
    });
    audit('api.metadata.updated');
    notify('API updated', `${draft.name} metadata saved.`, 'success');
    setEditing(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to={ROUTES.provider.myApis}
        className={buttonVariants({ variant: 'link', size: 'sm' })}
      >
        ← Back to My APIs
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{api.name}</h1>
          <LifecycleBadge status={api.lifecycle_status} />
        </div>
        {!editing && (
          <Button type="button" variant="secondary" size="sm" onClick={startEdit}>
            Edit metadata
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Edit metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="m-name" className="mb-1 block text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="m-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="m-desc" className="mb-1 block text-sm font-medium">
                Description
              </label>
              <Textarea
                id="m-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="m-class" className="mb-1 block text-sm font-medium">
                Classification
              </label>
              <Select
                value={draft.classification}
                onValueChange={(v) => v && setDraft({ ...draft, classification: v as Classification })}
              >
                <SelectTrigger id="m-class" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {CLASSIFICATIONS[c].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="m-tier" className="mb-1 block text-sm font-medium">
                Gateway tier
              </label>
              <Select
                value={String(draft.tier)}
                onValueChange={(v) => v && setDraft({ ...draft, tier: Number(v) as 1 | 2 | 3 })}
              >
                <SelectTrigger id="m-tier" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1 — Metadata only</SelectItem>
                  <SelectItem value="2">Tier 2 — Gateway proxied</SelectItem>
                  <SelectItem value="3">Tier 3 — Gateway native</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="m-tags" className="mb-1 block text-sm font-medium">
                Tags (comma-separated)
              </label>
              <Input
                id="m-tags"
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEdit} disabled={!draft.name.trim()}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">{api.description}</p>
      )}

      {canTransition && transitions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lifecycle actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transitions.next.map((next) => (
              <Button
                key={next}
                type="button"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setPendingTransition(next)}
              >
                Move to {LIFECYCLE_LABELS[next]}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={pendingTransition !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTransition(null);
        }}
        title={`Move "${api.name}" to ${pendingTransition ? LIFECYCLE_LABELS[pendingTransition] : ''}?`}
        description="This will update the API lifecycle status immediately."
        confirmLabel="Confirm"
        onConfirm={confirmTransition}
      />
    </div>
  );
}
