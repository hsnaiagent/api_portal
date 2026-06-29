import { usePortal } from '@/store/AppStore';
import { ClassificationBadge } from '@/components/shared/ClassificationBadge';
import { LifecycleBadge } from '@/components/shared/LifecycleBadge';

export function AllApisPage() {
  const { state, dispatch } = usePortal();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All APIs</h1>
      <div className="overflow-x-auto rounded-xl border bg-brand-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {state.apis.map((api) => (
              <tr key={api.api_id} className="border-t">
                <td className="px-4 py-3 font-medium">{api.name}</td>
                <td className="px-4 py-3"><LifecycleBadge status={api.lifecycle_status} /></td>
                <td className="px-4 py-3"><ClassificationBadge classification={api.classification} /></td>
                <td className="px-4 py-3">
                  {api.lifecycle_status !== 'emergency_retired' && (
                    <button type="button" onClick={() => dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: 'emergency_retired' } } })} className="text-xs text-red-600 hover:underline">Emergency retire</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
