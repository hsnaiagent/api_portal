import { Link } from 'react-router-dom';

import { ROUTES } from '@/config/routes';

import { usePortal } from '@/store/AppStore';

import { getManagedApis } from '@/lib/roles';



export function ProviderDashboard() {

  const { state } = usePortal();

  const myApis = getManagedApis(state.apis, state.currentUser, state.activeRole);

  const pending = state.subscriptions.filter(

    (s) => myApis.some((a) => a.api_id === s.api_id) && s.provider_status === 'pending' && s.status !== 'workflow_rejected',

  );



  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Provider Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-4">

        <div className="rounded-xl border bg-brand-white p-4"><p className="text-sm text-slate-500">My APIs</p><p className="text-3xl font-bold">{myApis.length}</p></div>

        <div className="rounded-xl border bg-brand-white p-4"><p className="text-sm text-slate-500">Published</p><p className="text-3xl font-bold text-brand-accent">{myApis.filter((a) => a.lifecycle_status === 'published').length}</p></div>

        <div className="rounded-xl border bg-brand-white p-4"><p className="text-sm text-slate-500">Pending consumer approvals</p><p className="text-3xl font-bold text-orange-500">{pending.length}</p></div>

      </div>

      <div className="flex gap-3">

        <Link to={ROUTES.provider.register} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium">Register New API</Link>

        <Link to={ROUTES.provider.requests} className="rounded-lg border px-4 py-2 text-sm">Consumer Requests ({pending.length})</Link>

      </div>

    </div>

  );

}


