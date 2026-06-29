import { useState } from 'react';

import { usePortal } from '@/store/AppStore';

import { getUserById } from '@/data/users';

import { getApiById } from '@/data/apis';

import { LLMSubscriptionForm } from '@/components/shared/LLMSubscriptionForm';

import { useNotify } from '@/hooks/useNotify';

import { provisionSubscription } from '@/mocks/GatewayAdapter';

import type { Subscription } from '@/types';



export function LLMSubscriptionQueuePage() {

  const { state, dispatch } = usePortal();

  const notify = useNotify();

  const [expanded, setExpanded] = useState<string | null>(null);

  const [comment, setComment] = useState<Record<string, string>>({});



  const pending = state.llmSubscriptionRequests.filter((r) => r.status === 'pending');

  const reviewed = state.llmSubscriptionRequests.filter((r) => r.status !== 'pending');



  const approve = async (llmRequestId: string, subscriptionId: string) => {

    const sub = state.subscriptions.find((s) => s.subscription_id === subscriptionId);

    dispatch({

      type: 'UPDATE_LLM_REQUEST',

      payload: {

        llm_request_id: llmRequestId,

        patch: {

          status: 'approved',

          reviewer_id: state.currentUser!.user_id,

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

      await provisionSubscription(sub);

    }

    notify('LLM access approved', 'Subscription activated and credentials provisioned.', 'success');

  };



  const reject = (llmRequestId: string, subscriptionId: string) => {

    dispatch({

      type: 'UPDATE_LLM_REQUEST',

      payload: {

        llm_request_id: llmRequestId,

        patch: {

          status: 'rejected',

          reviewer_id: state.currentUser!.user_id,

          reviewer_comment: comment[llmRequestId] || 'Rejected',

          reviewed_at: new Date().toISOString(),

        },

      },

    });

    dispatch({

      type: 'UPDATE_SUBSCRIPTION',

      payload: { subscription_id: subscriptionId, patch: { status: 'revoked', provider_status: 'rejected' } },

    });

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



      <div className="rounded-xl border bg-brand-white overflow-hidden">

        <div className="px-4 py-3 border-b bg-slate-50">

          <h2 className="font-semibold text-sm">Pending ({pending.length})</h2>

        </div>

        {pending.length === 0 ? (

          <p className="p-6 text-sm text-slate-500">No pending LLM access requests.</p>

        ) : (

          <div className="divide-y">

            {pending.map((req) => {

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

                        {user?.display_name} · {api?.name} · {req.estimated_value}

                      </p>

                    </div>

                    <span className="text-xs text-brand-blue">{isOpen ? 'Hide details' : 'Show all 11 fields'}</span>

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

                    <button

                      type="button"

                      onClick={() => approve(req.llm_request_id, req.subscription_id)}

                      className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm"

                    >

                      Approve

                    </button>

                    <button

                      type="button"

                      onClick={() => reject(req.llm_request_id, req.subscription_id)}

                      className="rounded-lg border border-red-200 text-red-700 px-4 py-2 text-sm"

                    >

                      Reject

                    </button>

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

                <th className="px-4 py-2">Value</th>

              </tr>

            </thead>

            <tbody>

              {reviewed.map((r) => (

                <tr key={r.llm_request_id} className="border-t">

                  <td className="px-4 py-3">{r.use_case_name}</td>

                  <td className="px-4 py-3">{getUserById(r.requested_by_user_id)?.display_name}</td>

                  <td className="px-4 py-3 capitalize">{r.status}</td>

                  <td className="px-4 py-3">{r.estimated_value}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}


