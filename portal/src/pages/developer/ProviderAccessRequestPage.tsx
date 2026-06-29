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

  const [domainId, setDomainId] = useState('');

  const [justification, setJustification] = useState('');



  const myRequests = state.providerAccessRequests.filter((r) => r.user_id === user.user_id);

  const availableDomains = domains.filter(

    (d) => d.domain_id !== 'dom_ai' && !user.provider_domains.includes(d.domain_id),

  );

  const pendingForDomain = (id: string) =>

    myRequests.some((r) => r.domain_id === id && r.status === 'pending');



  const submit = () => {

    if (!domainId || !justification.trim() || pendingForDomain(domainId)) return;

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

    setDomainId('');

    setJustification('');

  };



  return (

    <div className="space-y-6 max-w-2xl">

      <div>

        <h1 className="text-2xl font-bold">Request Publisher Access</h1>

        <p className="text-sm text-slate-500 mt-1">

          Request permission to publish and manage APIs for a specific business domain.

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

          <select

            value={domainId}

            onChange={(e) => setDomainId(e.target.value)}

            className="w-full rounded-lg border px-3 py-2 text-sm"

          >

            <option value="">Select domain</option>

            {availableDomains.map((d) => (

              <option key={d.domain_id} value={d.domain_id} disabled={pendingForDomain(d.domain_id)}>

                {d.name}{pendingForDomain(d.domain_id) ? ' (pending)' : ''}

              </option>

            ))}

          </select>

        </div>

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

          disabled={!domainId || !justification.trim() || pendingForDomain(domainId)}

          className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium disabled:opacity-50"

        >

          Submit Request

        </button>

      </div>



      {myRequests.length > 0 && (

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

              {myRequests.map((r) => (

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


