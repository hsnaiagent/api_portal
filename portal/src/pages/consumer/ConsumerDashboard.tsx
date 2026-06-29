import { Link } from 'react-router-dom';
import { Sparkles, Search, FileKey } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { ApiCard } from '@/components/shared/ApiCard';
import { useVisibleApis } from '@/hooks/useVisibleApis';

export function ConsumerDashboard() {
  const { state } = usePortal();
  const visible = useVisibleApis(state.apis).slice(0, 4);
  const mySubs = state.subscriptions.filter((s) => s.requested_by_user_id === state.currentUser?.user_id);
  const active = mySubs.filter((s) => s.status === 'active').length;
  const pending = mySubs.filter((s) => s.status.includes('workflow') || s.status === 'provider_pending').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {state.currentUser?.display_name}</h1>
        <p className="text-slate-500 mt-1">Discover and consume enterprise APIs with AI assistance</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-brand-white p-4">
          <p className="text-sm text-slate-500">Active subscriptions</p>
          <p className="text-3xl font-bold text-brand-accent">{active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-brand-white p-4">
          <p className="text-sm text-slate-500">Pending approvals</p>
          <p className="text-3xl font-bold text-orange-500">{pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-brand-white p-4">
          <p className="text-sm text-slate-500">Applications</p>
          <p className="text-3xl font-bold text-slate-800">{state.applications.filter((a) => a.owner_user_id === state.currentUser?.user_id).length}</p>
        </div>
      </div>

      <Link
        to={ROUTES.consumer.planner}
        className="block rounded-xl border-2 border-dashed border-brand-blue/30 bg-brand-blue-light p-6 hover:border-brand-blue transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-brand-blue" />
          <div>
            <h2 className="font-semibold text-brand-dark-gray">AI Application Planner</h2>
            <p className="text-sm text-brand-blue-dark">Describe your application — get a ranked bundle of APIs matched to your needs</p>
          </div>
        </div>
      </Link>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Featured APIs</h2>
          <Link to={ROUTES.consumer.catalog} className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline flex items-center gap-1">
            <Search className="h-4 w-4" /> Browse catalog
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((api) => <ApiCard key={api.api_id} api={api} />)}
        </div>
      </div>

      <Link to={ROUTES.consumer.subscriptions} className="flex items-center gap-2 text-sm text-brand-blue hover:text-brand-blue-dark hover:underline">
        <FileKey className="h-4 w-4" /> View all subscriptions
      </Link>
    </div>
  );
}
