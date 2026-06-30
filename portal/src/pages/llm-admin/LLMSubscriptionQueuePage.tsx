import { useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { getUserById } from '@/data/users';
import { getApiById } from '@/data/apis';
import { LLMSubscriptionForm } from '@/components/shared/LLMSubscriptionForm';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { provisionSubscription } from '@/mocks/GatewayAdapter';
import { calculateLlmAnnualSpending, formatLlmAnnualSpending } from '@/lib/roles';

export function LLMSubscriptionQueuePage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const audit = (action: string, llmRequestId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action,
        entity_type: 'llm_request',
        entity_id: llmRequestId,
      },
    });
  };

  const pending = state.llmSubscriptionRequests.filter((r) => r.status === 'pending');
  const reviewed = state.llmSubscriptionRequests.filter((r) => r.status !== 'pending');

  const matchesFilters = (req: typeof state.llmSubscriptionRequests[number], isPending: boolean) => {
    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'approved' && req.status !== 'approved') return false;
    if (statusFilter === 'rejected' && req.status !== 'rejected') return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const user = getUserById(req.requested_by_user_id);
      const api = getApiById(req.api_id);
      return (
        req.use_case_name.toLowerCase().includes(q)
        || user?.display_name.toLowerCase().includes(q)
        || api?.name.toLowerCase().includes(q)
      );
    }
    return true;
  };

  const filteredPending = useMemo(
    () => pending.filter((r) => matchesFilters(r, true)),
    [pending, query, statusFilter],
  );
  const filteredReviewed = useMemo(
    () => reviewed.filter((r) => matchesFilters(r, false)),
    [reviewed, query, statusFilter],
  );

  const hasActiveFilters = Boolean(query || statusFilter !== 'all');

  const approve = async (llmRequestId: string, subscriptionId: string) => {
    if (!state.currentUser) return;
    const sub = state.subscriptions.find((s) => s.subscription_id === subscriptionId);
    setProcessingId(llmRequestId);
    try {
      if (sub) await provisionSubscription(sub);
      dispatch({
        type: 'UPDATE_LLM_REQUEST',
        payload: {
          llm_request_id: llmRequestId,
          patch: {
            status: 'approved',
            reviewer_id: state.currentUser.user_id,
            reviewer_comment: comment[llmRequestId] || 'Approved',
            reviewed_at: new Date().toISOString(),
          },
        },
      });
      if (sub) {
        dispatch({
          type: 'UPDATE_SUBSCRIPTION',
          payload: {
            subscription_id: subscriptionId,
            patch: { status: 'active', provider_status: 'accepted', approved_at: new Date().toISOString() },
          },
        });
      }
      audit('llm_access.approved', llmRequestId);
      notify('LLM access approved', 'Subscription activated and credentials provisioned.', 'success');
    } catch {
      notify('Approval failed', 'Could not provision the subscription. Please try again.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const reject = (llmRequestId: string, subscriptionId: string) => {
    if (!state.currentUser) return;
    if (!window.confirm('Reject this LLM access request? The developer will be notified.')) return;
    dispatch({
      type: 'UPDATE_LLM_REQUEST',
      payload: {
        llm_request_id: llmRequestId,
        patch: {
          status: 'rejected',
          reviewer_id: state.currentUser.user_id,
          reviewer_comment: comment[llmRequestId] || 'Rejected',
          reviewed_at: new Date().toISOString(),
        },
      },
    });
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: { subscription_id: subscriptionId, patch: { status: 'revoked', provider_status: 'rejected' } },
    });
    audit('llm_access.rejected', llmRequestId);
    notify('LLM access rejected', 'Developer has been notified.', 'warning');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LLM Access Requests</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review ROI-justified LLM API access requests before approving subscriptions.
        </p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search use case, requester, or API..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setStatusFilter('all');
        }}
        resultLabel={`${filteredPending.length} pending · ${filteredReviewed.length} reviewed`}
      >
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          <option value="pending">Pending only</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </ListFilterBar>

      <div className="rounded-xl border bg-brand-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h2 className="font-semibold text-sm">Pending ({filteredPending.length})</h2>
        </div>
        {filteredPending.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No pending LLM access requests match your filters.</p>
        ) : (
          <div className="divide-y">
            {filteredPending.map((req) => {
              const user = getUserById(req.requested_by_user_id);
              const api = getApiById(req.api_id);
              const isOpen = expanded === req.llm_request_id;
              return (
                <div key={req.llm_request_id} className="p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : req.llm_request_id)}
                    className="w-full text-left flex flex-wrap justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold">{req.use_case_name}</p>
                      <p className="text-sm text-slate-500">
                        {user?.display_name} · {api?.name} ·{' '}
                        {formatLlmAnnualSpending(calculateLlmAnnualSpending(req).annualSpendingUsd)}
                      </p>
                    </div>
                    <span className="text-xs text-brand-blue">{isOpen ? 'Hide details' : 'Show details'}</span>
                  </button>
                  {isOpen && (
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <LLMSubscriptionForm value={req} onChange={() => {}} readOnly showRoi />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Reviewer comment (optional)"
                    value={comment[req.llm_request_id] ?? ''}
                    onChange={(e) => setComment({ ...comment, [req.llm_request_id]: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-brand-white"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => approve(req.llm_request_id, req.subscription_id)} disabled={processingId === req.llm_request_id} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50">{processingId === req.llm_request_id ? 'Provisioning…' : 'Approve'}</button>
                    <button type="button" onClick={() => reject(req.llm_request_id, req.subscription_id)} disabled={processingId === req.llm_request_id} className="rounded-lg border border-red-200 text-red-700 px-4 py-2 text-sm disabled:opacity-50">Reject</button>
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
                <th className="px-4 py-2">Use case</th>
                <th className="px-4 py-2">Requester</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Est. API spend</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviewed.map((r) => (
                <tr key={r.llm_request_id} className="border-t">
                  <td className="px-4 py-3">{r.use_case_name}</td>
                  <td className="px-4 py-3">{getUserById(r.requested_by_user_id)?.display_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'approved' ? 'bg-brand-green-light text-brand-green' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatLlmAnnualSpending(calculateLlmAnnualSpending(r).annualSpendingUsd)}
                  </td>
                </tr>
              ))}
              {filteredReviewed.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No reviewed requests match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
