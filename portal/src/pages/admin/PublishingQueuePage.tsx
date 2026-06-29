import { usePortal } from '@/store/AppStore';
import { ClassificationBadge } from '@/components/shared/ClassificationBadge';

export function PublishingQueuePage() {
  const { state, dispatch } = usePortal();
  const testing = state.apis.filter((a) => a.lifecycle_status === 'in_testing');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Publishing Queue</h1>
      {testing.map((api) => (
        <div key={api.api_id} className="rounded-xl border bg-brand-white p-6 flex justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold">{api.name}</p>
            <ClassificationBadge classification={api.classification} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: 'published' } } })} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Approve publish</button>
            <button type="button" onClick={() => dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: 'in_development' } } })} className="rounded-lg border px-4 py-2 text-sm">Return to dev</button>
          </div>
        </div>
      ))}
      {testing.length === 0 && <p className="text-slate-500">No APIs awaiting publish approval</p>}
    </div>
  );
}
