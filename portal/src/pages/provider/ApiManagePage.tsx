import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePortal } from '@/store/AppStore';
import { LIFECYCLE_TRANSITIONS, LIFECYCLE_LABELS } from '@/config/lifecycle';
import { CLASSIFICATIONS } from '@/config/classification';
import { LifecycleBadge } from '@/components/shared/LifecycleBadge';
import { NotFound } from '@/components/shared/NotFound';
import { useNotify } from '@/hooks/useNotify';
import { ROUTES } from '@/config/routes';
import type { Classification, LifecycleStatus } from '@/types';

export function ApiManagePage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const api = state.apis.find((a) => a.api_id === id);
  const role = state.activeRole;

  const [editing, setEditing] = useState(false);
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

  const transition = (next: LifecycleStatus) => {
    if (!window.confirm(`Move "${api.name}" to ${LIFECYCLE_LABELS[next]}?`)) return;
    dispatch({
      type: 'UPDATE_API',
      payload: { api_id: api.api_id, patch: { lifecycle_status: next } },
    });
    audit('api.lifecycle.changed', { from: api.lifecycle_status, to: next });
    notify('Lifecycle updated', `${api.name} moved to ${LIFECYCLE_LABELS[next]}.`, 'success');
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
    <div className="space-y-6 max-w-2xl">
      <Link
        to={ROUTES.provider.myApis}
        className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline"
      >
        ← Back to My APIs
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{api.name}</h1>
          <LifecycleBadge status={api.lifecycle_status} />
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Edit metadata
          </button>
        )}
      </div>

      {editing ? (
        <div className="rounded-xl border bg-brand-white p-4 space-y-4">
          <h3 className="font-semibold text-sm">Edit metadata</h3>
          <div>
            <label htmlFor="m-name" className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="m-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m-desc" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="m-desc"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m-class" className="block text-sm font-medium mb-1">
              Classification
            </label>
            <select
              id="m-class"
              value={draft.classification}
              onChange={(e) =>
                setDraft({ ...draft, classification: e.target.value as Classification })
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
                <option key={c} value={c}>
                  {CLASSIFICATIONS[c].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="m-tier" className="block text-sm font-medium mb-1">
              Gateway tier
            </label>
            <select
              id="m-tier"
              value={draft.tier}
              onChange={(e) => setDraft({ ...draft, tier: Number(e.target.value) as 1 | 2 | 3 })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value={1}>Tier 1 — Metadata only</option>
              <option value={2}>Tier 2 — Gateway proxied</option>
              <option value={3}>Tier 3 — Gateway native</option>
            </select>
          </div>
          <div>
            <label htmlFor="m-tags" className="block text-sm font-medium mb-1">
              Tags (comma-separated)
            </label>
            <input
              id="m-tags"
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={!draft.name.trim()}
              className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-600">{api.description}</p>
      )}

      {canTransition && transitions && (
        <div className="rounded-xl border bg-brand-white p-4 space-y-2">
          <h3 className="font-semibold text-sm">Lifecycle actions</h3>
          {transitions.next.map((next) => (
            <button
              key={next}
              type="button"
              onClick={() => transition(next)}
              className="block w-full text-left rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Move to {LIFECYCLE_LABELS[next]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
