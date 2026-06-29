import { useState } from 'react';
import { usePortal } from '@/store/AppStore';
import type { Application } from '@/types';

export function ApplicationsPage() {
  const { state, dispatch } = usePortal();
  const apps = state.applications.filter((a) => a.owner_user_id === state.currentUser?.user_id);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [appDesc, setAppDesc] = useState('');

  const create = () => {
    const app: Application = {
      application_id: `app_${Date.now()}`,
      team_id: state.currentUser!.team_ids[0],
      name,
      description: desc,
      application_description: appDesc,
      owner_user_id: state.currentUser!.user_id,
      environment: 'sandbox',
      status: 'active',
    };
    dispatch({ type: 'ADD_APPLICATION', payload: app });
    setShowForm(false);
    setName('');
    setDesc('');
    setAppDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <button type="button" onClick={() => setShowForm(true)} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium">Register Application</button>
      </div>
      <p className="text-sm text-slate-500">Applications are machine consumers of APIs. The application description powers AI personalization across SDK, sandbox, and Application Planner.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {apps.map((app) => (
          <div key={app.application_id} className="rounded-xl border border-slate-200 bg-brand-white p-4">
            <h3 className="font-semibold">{app.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{app.description}</p>
            {app.application_description && (
              <p className="text-xs text-brand-blue mt-2 italic line-clamp-2">{app.application_description}</p>
            )}
            <span className="inline-block mt-2 text-xs rounded-full bg-slate-100 px-2 py-0.5">{app.environment}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-brand-white p-6 space-y-4">
            <h2 className="font-bold">Register Application</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Application name" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <textarea value={appDesc} onChange={(e) => setAppDesc(e.target.value)} placeholder="Application description for AI (what it does, what data it needs)..." rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" onClick={create} disabled={!name} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
