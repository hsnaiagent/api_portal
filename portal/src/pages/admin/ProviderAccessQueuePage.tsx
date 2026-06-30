import { useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { getUserById } from '@/data/users';
import { domains } from '@/data/domains';
import { useNotify } from '@/hooks/useNotify';
import { ListFilterBar } from '@/components/shared/ListFilterBar';

export function ProviderAccessQueuePage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [comment, setComment] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  const pending = state.providerAccessRequests.filter((r) => r.status === 'pending');
  const reviewed = state.providerAccessRequests.filter((r) => r.status !== 'pending');

  const matchesFilters = (userId: string, domainId: string) => {
    if (domainFilter && domainId !== domainFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const user = getUserById(userId);
      const domain = domains.find((d) => d.domain_id === domainId);
      return (
        user?.display_name.toLowerCase().includes(q)
        || user?.email.toLowerCase().includes(q)
        || domain?.name.toLowerCase().includes(q)
      );
    }
    return true;
  };

  const filteredPending = useMemo(
    () => pending.filter((r) => matchesFilters(r.user_id, r.domain_id)),
    [pending, query, domainFilter],
  );
  const filteredReviewed = useMemo(
    () => reviewed.filter((r) => matchesFilters(r.user_id, r.domain_id)),
    [reviewed, query, domainFilter],
  );

  const hasActiveFilters = Boolean(query || domainFilter);

  const approve = (requestId: string, userId: string, domainId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'UPDATE_PROVIDER_REQUEST',
      payload: {
        request_id: requestId,
        patch: {
          status: 'approved',
          reviewer_id: state.currentUser.user_id,
          reviewer_comment: comment[requestId] || 'Approved',
          reviewed_at: new Date().toISOString(),
        },
      },
    });
    dispatch({ type: 'GRANT_PROVIDER_DOMAIN', payload: { user_id: userId, domain_id: domainId } });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action: 'provider_access.approved',
        entity_type: 'provider_access_request',
        entity_id: requestId,
        payload: { user_id: userId, domain_id: domainId },
      },
    });
    notify('Access granted', 'Developer publisher capability updated.', 'success');
  };

  const reject = (requestId: string, userId: string, domainId: string) => {
    if (!state.currentUser) return;
    if (!window.confirm('Reject this publisher access request? The developer will be notified.')) return;
    dispatch({
      type: 'UPDATE_PROVIDER_REQUEST',
      payload: {
        request_id: requestId,
        patch: {
          status: 'rejected',
          reviewer_id: state.currentUser.user_id,
          reviewer_comment: comment[requestId] || 'Rejected',
          reviewed_at: new Date().toISOString(),
        },
      },
    });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action: 'provider_access.rejected',
        entity_type: 'provider_access_request',
        entity_id: requestId,
        payload: { user_id: userId, domain_id: domainId },
      },
    });
    notify('Request rejected', 'Developer has been notified.', 'warning');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Access Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Review developer requests for domain-scoped publisher capability.</p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by developer or domain..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setDomainFilter('');
        }}
        resultLabel={`${filteredPending.length} pending · ${filteredReviewed.length} reviewed`}
      >
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All domains</option>
          {domains.filter((d) => d.domain_id !== 'dom_ai').map((d) => (
            <option key={d.domain_id} value={d.domain_id}>{d.name}</option>
          ))}
        </select>
      </ListFilterBar>

      <div className="rounded-xl border bg-brand-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 flex justify-between">
          <h2 className="font-semibold text-sm">Pending ({filteredPending.length})</h2>
        </div>
        {filteredPending.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No pending requests match your filters.</p>
        ) : (
          <div className="divide-y">
            {filteredPending.map((r) => {
              const user = getUserById(r.user_id);
              const domain = domains.find((d) => d.domain_id === r.domain_id);
              return (
                <div key={r.request_id} className="p-4 space-y-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold">{user?.display_name}</p>
                      <p className="text-sm text-slate-500">{user?.email} · {domain?.name}</p>
                    </div>
                    <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{r.justification}</p>
                  <input
                    type="text"
                    placeholder="Reviewer comment (optional)"
                    value={comment[r.request_id] ?? ''}
                    onChange={(e) => setComment({ ...comment, [r.request_id]: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => approve(r.request_id, r.user_id, r.domain_id)} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Approve</button>
                    <button type="button" onClick={() => reject(r.request_id, r.user_id, r.domain_id)} className="rounded-lg border border-red-200 text-red-700 px-4 py-2 text-sm">Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div className="rounded-xl border bg-brand-white overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h2 className="font-semibold text-sm">Review history</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Developer</th>
                <th className="px-4 py-2">Domain</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviewed.map((r) => (
                <tr key={r.request_id} className="border-t">
                  <td className="px-4 py-3">{getUserById(r.user_id)?.display_name}</td>
                  <td className="px-4 py-3">{domains.find((d) => d.domain_id === r.domain_id)?.name}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3 text-slate-500">{r.reviewer_comment}</td>
                </tr>
              ))}
              {filteredReviewed.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No reviewed requests match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border bg-brand-white p-4">
        <h3 className="font-semibold text-sm mb-2">Current developer publisher domains</h3>
        <ul className="text-sm space-y-1">
          {state.users.filter((u) => u.portal_roles.includes('developer')).map((u) => (
            <li key={u.user_id}>
              <strong>{u.display_name}:</strong>{' '}
              {u.provider_domains.length
                ? u.provider_domains.map((id) => state.domains.find((d) => d.domain_id === id)?.name ?? id).join(', ')
                : 'None'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
