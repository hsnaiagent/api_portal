import { useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { useNotify } from '@/hooks/useNotify';
import type { Domain } from '@/types';

const emptyDraft = { name: '', code: '', description: '' };

export function DomainsPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const apiCountByDomain = (domainId: string) =>
    state.apis.filter((a) => a.domain_id === domainId).length;

  const audit = (action: string, domainId: string, payload?: Record<string, unknown>) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action,
        entity_type: 'domain',
        entity_id: domainId,
        payload,
      },
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setShowForm(true);
  };

  const openEdit = (d: Domain) => {
    setEditingId(d.domain_id);
    setDraft({ name: d.name, code: d.code, description: d.description });
    setShowForm(true);
  };

  const save = () => {
    if (!draft.name.trim() || !draft.code.trim()) return;
    const code = draft.code.trim().toLowerCase().replace(/\s+/g, '_');
    if (editingId) {
      dispatch({
        type: 'UPDATE_DOMAIN',
        payload: {
          domain_id: editingId,
          patch: { name: draft.name.trim(), code, description: draft.description },
        },
      });
      audit('domain.updated', editingId);
      notify('Domain updated', `${draft.name} saved.`, 'success');
    } else {
      const domain_id = `dom_${code}`;
      if (state.domains.some((d) => d.domain_id === domain_id)) {
        notify('Duplicate domain', `A domain with code "${code}" already exists.`, 'error');
        return;
      }
      dispatch({
        type: 'ADD_DOMAIN',
        payload: { domain_id, name: draft.name.trim(), code, description: draft.description },
      });
      audit('domain.created', domain_id);
      notify('Domain created', `${draft.name} added to the registry.`, 'success');
    }
    setShowForm(false);
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const remove = (d: Domain) => {
    const count = apiCountByDomain(d.domain_id);
    if (count > 0) {
      notify(
        'Cannot delete domain',
        `${d.name} still has ${count} API${count === 1 ? '' : 's'} assigned.`,
        'warning',
      );
      return;
    }
    if (!window.confirm(`Delete domain "${d.name}"?`)) return;
    dispatch({ type: 'DELETE_DOMAIN', payload: d.domain_id });
    audit('domain.deleted', d.domain_id);
    notify('Domain deleted', `${d.name} removed from the registry.`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Domain Registry</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium hover:bg-brand-green-dark"
        >
          Add Domain
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Business domains group APIs for discovery, ownership, and visibility rules.
      </p>

      <div className="overflow-x-auto rounded-xl border bg-brand-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">APIs</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {state.domains.map((d) => (
              <tr key={d.domain_id} className="border-t">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.code}</td>
                <td className="px-4 py-3 text-slate-600">{d.description}</td>
                <td className="px-4 py-3">{apiCountByDomain(d.domain_id)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openEdit(d)}
                    className="text-brand-blue hover:text-brand-blue-dark hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(d)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {state.domains.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No domains registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-brand-white p-6 space-y-4"
          >
            <h2 className="font-bold">{editingId ? 'Edit Domain' : 'Add Domain'}</h2>
            <div>
              <label htmlFor="dom-name" className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="dom-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="dom-code" className="block text-sm font-medium mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                id="dom-code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="e.g. logistics"
                disabled={Boolean(editingId)}
                className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-slate-50"
              />
            </div>
            <div>
              <label htmlFor="dom-desc" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="dom-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!draft.name.trim() || !draft.code.trim()}
                className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
              >
                {editingId ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
