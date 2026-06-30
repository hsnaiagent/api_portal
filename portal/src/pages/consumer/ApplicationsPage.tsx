import { useMemo, useState } from 'react';
import { AppWindow, Pencil, Trash2 } from 'lucide-react';
import { usePortal } from '@/store/AppStore';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import type { Application } from '@/types';

type Environment = Application['environment'];

const emptyDraft = {
  name: '',
  desc: '',
  appDesc: '',
  environment: 'sandbox' as Environment,
};

export function ApplicationsPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const apps = state.applications.filter(
    (a) => a.owner_user_id === state.currentUser?.user_id && a.status !== 'deleted',
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [query, setQuery] = useState('');
  const [envFilter, setEnvFilter] = useState('');

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      if (envFilter && app.environment !== envFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          app.name.toLowerCase().includes(q) ||
          (app.description?.toLowerCase().includes(q) ?? false) ||
          (app.application_description?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [apps, query, envFilter]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setShowForm(true);
  };

  const openEdit = (app: Application) => {
    setEditingId(app.application_id);
    setDraft({
      name: app.name,
      desc: app.description ?? '',
      appDesc: app.application_description ?? '',
      environment: app.environment,
    });
    setShowForm(true);
  };

  const save = () => {
    if (!draft.name.trim() || !state.currentUser) return;
    if (editingId) {
      dispatch({
        type: 'UPDATE_APPLICATION',
        payload: {
          application_id: editingId,
          patch: {
            name: draft.name.trim(),
            description: draft.desc,
            application_description: draft.appDesc,
            environment: draft.environment,
          },
        },
      });
      notify('Application updated', `${draft.name} has been saved.`, 'success');
    } else {
      const app: Application = {
        application_id: `app_${Date.now()}`,
        team_id: state.currentUser.team_ids[0] ?? '',
        name: draft.name.trim(),
        description: draft.desc,
        application_description: draft.appDesc,
        owner_user_id: state.currentUser.user_id,
        environment: draft.environment,
        status: 'active',
      };
      dispatch({ type: 'ADD_APPLICATION', payload: app });
      notify('Application created', `${app.name} is ready to use for subscriptions.`, 'success');
    }
    setShowForm(false);
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const remove = (app: Application) => {
    if (!window.confirm(`Delete application "${app.name}"? This cannot be undone.`)) return;
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: { application_id: app.application_id, patch: { status: 'deleted' } },
    });
    notify('Application deleted', `${app.name} has been removed.`, 'info');
  };

  const hasActiveFilters = Boolean(query || envFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium hover:bg-brand-green-dark"
        >
          Register Application
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Applications are machine consumers of APIs. The application description powers AI
        personalization across SDK, sandbox, and Application Planner.
      </p>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search applications..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setEnvFilter('');
        }}
        resultLabel={`${filtered.length} of ${apps.length} applications`}
      >
        <select
          value={envFilter}
          onChange={(e) => setEnvFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All environments</option>
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </select>
      </ListFilterBar>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center space-y-3">
          <AppWindow className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="font-medium text-slate-700">No applications yet</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Register your first application to start requesting API subscriptions.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-block rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium hover:bg-brand-green-dark"
          >
            Register Application
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500">No applications match your filters.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((app) => (
            <div
              key={app.application_id}
              className="rounded-xl border border-slate-200 bg-brand-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{app.name}</h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-brand-blue"
                    aria-label={`Edit ${app.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-600"
                    aria-label={`Delete ${app.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-1">{app.description}</p>
              {app.application_description && (
                <p className="text-xs text-brand-blue mt-2 italic line-clamp-2">
                  {app.application_description}
                </p>
              )}
              <span className="inline-block mt-2 text-xs rounded-full bg-slate-100 px-2 py-0.5 capitalize">
                {app.environment}
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-xl bg-brand-white p-6 space-y-4"
          >
            <h2 className="font-bold">{editingId ? 'Edit Application' : 'Register Application'}</h2>
            <div>
              <label htmlFor="app-name" className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="app-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Application name"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="app-desc" className="block text-sm font-medium mb-1">
                Short description
              </label>
              <input
                id="app-desc"
                value={draft.desc}
                onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                placeholder="Short description"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="app-ai-desc" className="block text-sm font-medium mb-1">
                Application description (for AI)
              </label>
              <textarea
                id="app-ai-desc"
                value={draft.appDesc}
                onChange={(e) => setDraft({ ...draft, appDesc: e.target.value })}
                placeholder="What it does, what data it needs..."
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="app-env" className="block text-sm font-medium mb-1">
                Environment
              </label>
              <select
                id="app-env"
                value={draft.environment}
                onChange={(e) => setDraft({ ...draft, environment: e.target.value as Environment })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
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
                disabled={!draft.name.trim()}
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
