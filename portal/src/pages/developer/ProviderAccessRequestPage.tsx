import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortal } from '@/store/AppStore';
import { domains } from '@/data/domains';
import { useNotify } from '@/hooks/useNotify';
import { ROUTES } from '@/config/routes';
import type { ProviderAccessRequest } from '@/types';

export function ProviderAccessRequestPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const user = state.currentUser!;
  const domainId = user.domain_id;
  const domainName = domains.find((d) => d.domain_id === domainId)?.name ?? domainId;
  const [justification, setJustification] = useState('');

  const myRequests = state.providerAccessRequests.filter(
    (r) => r.user_id === user.user_id && r.domain_id === domainId,
  );
  const visibleRequests = myRequests.filter((r) => r.status === 'pending' || r.status === 'rejected');
  const alreadyHasAccess = user.provider_domains.includes(domainId);
  const hasPending = visibleRequests.some((r) => r.status === 'pending');
  const isAiDomain = domainId === 'dom_ai';

  const submit = () => {
    if (!justification.trim() || alreadyHasAccess || hasPending || isAiDomain) return;
    const request: ProviderAccessRequest = {
      request_id: `par_${Date.now()}`,
      user_id: user.user_id,
      domain_id: domainId,
      justification: justification.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROVIDER_REQUEST', payload: request });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: user.user_id,
        actor_type: 'user',
        action: 'provider_access.requested',
        entity_type: 'provider_access_request',
        entity_id: request.request_id,
        payload: { domain_id: domainId },
      },
    });
    notify('Request submitted', 'Portal Admin will review your publisher access request.', 'success');
    setJustification('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Request Publisher Access</h1>
        <p className="text-sm text-slate-500 mt-1">
          Request permission to publish and manage APIs for your business domain.
        </p>
      </div>

      {user.provider_domains.length > 0 && (
        <div className="rounded-xl border border-brand-green/30 bg-brand-green-light/40 p-4">
          <p className="text-sm font-medium text-brand-green">Active publisher domains</p>
          <p className="text-sm text-slate-700 mt-1">
            {user.provider_domains.map((id) => domains.find((d) => d.domain_id === id)?.name ?? id).join(', ')}
          </p>
          <Link to={ROUTES.provider.dashboard} className="text-sm text-brand-blue hover:underline mt-2 inline-block">
            Go to Provider Dashboard →
          </Link>
        </div>
      )}

      <div className="rounded-xl border bg-brand-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business domain</label>
          <div className="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {domainName}
          </div>
          <p className="text-xs text-slate-500 mt-1">Assigned from your profile and cannot be changed.</p>
        </div>

        {isAiDomain ? (
          <p className="text-sm text-slate-600">
            AI Platform publisher access is managed separately through the LLM &amp; AI admin workflow.
          </p>
        ) : alreadyHasAccess ? (
          <p className="text-sm text-brand-green">
            You already have publisher access for {domainName}.
          </p>
        ) : hasPending ? (
          <p className="text-sm text-amber-700">
            A request for {domainName} is already pending review.
          </p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Justification</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Explain why you need publisher access for this domain..."
              />
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!justification.trim()}
              className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium disabled:opacity-50"
            >
              Submit Request
            </button>
          </>
        )}
      </div>

      {visibleRequests.length > 0 && (
        <div className="rounded-xl border bg-brand-white overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h2 className="font-semibold text-sm">Your requests</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-4 py-2">Domain</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((r) => (
                <tr key={r.request_id} className="border-t">
                  <td className="px-4 py-3">{domains.find((d) => d.domain_id === r.domain_id)?.name}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
