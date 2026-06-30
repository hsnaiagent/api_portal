import { useState } from 'react';

import { useParams, Link } from 'react-router-dom';

import * as Tabs from '@radix-ui/react-tabs';

import { usePortal } from '@/store/AppStore';

import { getUserById } from '@/data/users';

import { domains } from '@/data/domains';

import { ClassificationBadge } from '@/components/shared/ClassificationBadge';

import { LifecycleBadge } from '@/components/shared/LifecycleBadge';

import { SandboxPanel } from '@/components/sandbox/SandboxPanel';

import { SDKPanel } from '@/components/sdk/SDKPanel';

import { LLMSubscriptionForm, emptyLlmForm, isLlmFormComplete } from '@/components/shared/LLMSubscriptionForm';

import { getRecommendationsFromIndex } from '@/lib/search-index';

import { getAIResponse } from '@/mocks/AIAdapter';

import { triggerWorkflow } from '@/mocks/WorkflowAdapter';

import { provisionSubscription } from '@/mocks/GatewayAdapter';

import { useNotify } from '@/hooks/useNotify';

import { ROUTES } from '@/config/routes';

import { isLlmApi } from '@/lib/roles';

import type { LLMSubscriptionRequest, Subscription } from '@/types';

import { AIBadge } from '@/components/ai/AIBadge';

import { NotFound } from '@/components/shared/NotFound';



export function ApiDetailPage() {

  const { id } = useParams<{ id: string }>();

  const { state, dispatch } = usePortal();

  const notify = useNotify();

  const api = state.apis.find((a) => a.api_id === id);

  const [showSubModal, setShowSubModal] = useState(false);

  const [appId, setAppId] = useState('');

  const [purpose, setPurpose] = useState('');

  const [llmForm, setLlmForm] = useState(emptyLlmForm);

  const [aiPurposeLoading, setAiPurposeLoading] = useState(false);

  const [recommendations, setRecommendations] = useState<{ id: string; label: string; reason?: string }[]>([]);



  if (!api)
    return (
      <NotFound
        title="API not found"
        message="This API does not exist or is no longer available in the catalog."
        to={ROUTES.consumer.catalog}
        actionLabel="Back to catalog"
      />
    );



  const owner = getUserById(api.owner_user_id);

  const domain = domains.find((d) => d.domain_id === api.domain_id);

  const myApps = state.applications.filter((a) => a.owner_user_id === state.currentUser?.user_id);

  const sub = state.subscriptions.find(

    (s) => s.api_id === api.api_id && s.requested_by_user_id === state.currentUser?.user_id && s.status !== 'revoked',

  );

  const cred = sub?.status === 'active' ? state.credentials.find((c) => c.subscription_id === sub.subscription_id) : undefined;

  const app = myApps.find((a) => a.application_id === (appId || myApps[0]?.application_id)) ?? myApps[0];

  const isLlm = isLlmApi(api);

  const existingLlmRequest = state.llmSubscriptionRequests.find(

    (r) => r.api_id === api.api_id && r.requested_by_user_id === state.currentUser?.user_id,

  );

  const hasActiveSub = sub?.status === 'active';

  const hasPendingLlm = existingLlmRequest?.status === 'pending';



  const loadRecommendations = () => {

    setRecommendations(getRecommendationsFromIndex(api, state.apis));

  };



  const draftPurpose = async () => {

    setAiPurposeLoading(true);

    const selectedApp = state.applications.find((a) => a.application_id === appId);

    const res = await getAIResponse('AI_3_PurposeHelper', { description: selectedApp?.application_description });

    setPurpose(res?.text ?? '');

    setAiPurposeLoading(false);

  };



  const requestStandardAccess = async () => {

    const newSub: Subscription = {

      subscription_id: `sub_${Date.now()}`,

      api_id: api.api_id,

      application_id: appId,

      requested_by_user_id: state.currentUser!.user_id,

      purpose,

      min_api_version: api.version,

      status: api.classification === 'public' ? 'active' : 'workflow_in_progress',

      provider_status: api.classification === 'public' ? 'accepted' : 'pending',

      created_at: new Date().toISOString(),

    };

    dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSub });

    if (api.classification !== 'public') {

      await triggerWorkflow(newSub);

      notify('Workflow started', `Approval workflow triggered for ${api.name}`, 'info');

    } else {

      await provisionSubscription(newSub);

      notify('Access granted', `Self-service subscription active for ${api.name}`, 'success');

    }

    setShowSubModal(false);

  };



  const requestLlmAccess = async () => {

    const subscriptionId = `sub_${Date.now()}`;

    const newSub: Subscription = {

      subscription_id: subscriptionId,

      api_id: api.api_id,

      application_id: appId,

      requested_by_user_id: state.currentUser!.user_id,

      purpose: llmForm.task_description,

      min_api_version: api.version,

      status: 'provider_pending',

      provider_status: 'pending',

      created_at: new Date().toISOString(),

    };

    const llmRequest: LLMSubscriptionRequest = {

      llm_request_id: `llm_req_${Date.now()}`,

      subscription_id: subscriptionId,

      api_id: api.api_id,

      requested_by_user_id: state.currentUser!.user_id,

      application_id: appId,

      ...llmForm,

      status: 'pending',

      created_at: new Date().toISOString(),

    };

    dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSub });

    dispatch({ type: 'ADD_LLM_REQUEST', payload: llmRequest });

    dispatch({

      type: 'ADD_AUDIT',

      payload: {

        audit_id: `aud_${Date.now()}`,

        timestamp: new Date().toISOString(),

        actor_user_id: state.currentUser!.user_id,

        actor_type: 'user',

        action: 'llm_access.requested',

        entity_type: 'llm_request',

        entity_id: llmRequest.llm_request_id,

        payload: { api_id: api.api_id, use_case_name: llmForm.use_case_name },

      },

    });

    notify('LLM access requested', 'LLM Admin will review your ROI justification.', 'info');

    setShowSubModal(false);

    setLlmForm(emptyLlmForm);

  };



  const openRequestModal = () => {

    setShowSubModal(true);

    setAppId(myApps[0]?.application_id ?? '');

    if (isLlm && state.currentUser) {

      setLlmForm({

        ...emptyLlmForm,

        contact: state.currentUser.email,

        admin_area: 'Human Resources',

      });

    }

  };



  return (

    <div className="space-y-6">

      <Link to={ROUTES.consumer.catalog} className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline">← Back to catalog</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold">{api.name}</h1>

          <p className="text-slate-500">{domain?.name} · v{api.version} · Tier {api.gateway_tier}</p>

        </div>

        <div className="flex gap-2 flex-wrap">

          <ClassificationBadge classification={api.classification} showHandling />

          <LifecycleBadge status={api.lifecycle_status} />

        </div>

      </div>

      <p className="text-slate-600">{api.description}</p>

      <p className="text-sm text-slate-500">Owner: {owner?.display_name}</p>



      {isLlm && (

        <div className="rounded-lg border border-brand-blue/30 bg-brand-blue-light/40 px-4 py-3 text-sm text-brand-blue-dark">

          LLM API access requires an ROI justification form reviewed by the LLM & AI Admin.

        </div>

      )}



      {!hasActiveSub && !hasPendingLlm && api.lifecycle_status === 'published' && (

        <button type="button" onClick={openRequestModal} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white font-medium hover:bg-brand-green-dark">

          Request Access

        </button>

      )}

      {hasActiveSub && (

        <span className="inline-block rounded-full bg-brand-green-light text-brand-green px-3 py-1 text-sm font-medium">Active subscription</span>

      )}

      {hasPendingLlm && (

        <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-medium">LLM access pending review</span>

      )}



      <Tabs.Root defaultValue="overview">

        <Tabs.List className="flex gap-1 border-b border-slate-200">

          {['overview', 'docs', 'sandbox', 'sdk'].map((tab) => (

            <Tabs.Trigger key={tab} value={tab} className="px-4 py-2 text-sm font-medium capitalize data-[state=active]:border-b-2 data-[state=active]:border-brand-green data-[state=active]:text-brand-green">

              {tab === 'sdk' ? 'SDK & Code' : tab}

            </Tabs.Trigger>

          ))}

        </Tabs.List>

        <Tabs.Content value="overview" className="pt-6">

          <div className="grid lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-4">

              <h3 className="font-semibold">Tags</h3>

              <div className="flex flex-wrap gap-2">{api.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{t}</span>)}</div>

            </div>

            <div className="rounded-xl border border-slate-200 bg-brand-white p-4">

              <div className="flex items-center justify-between mb-3">

                <h3 className="font-semibold text-sm">You might also need</h3>

                <button type="button" onClick={loadRecommendations} className="text-xs text-brand-blue"><AIBadge label="AI-4" /></button>

              </div>

              {recommendations.map((r) => (

                <Link key={r.id} to={ROUTES.consumer.apiDetail(r.id)} className="block text-sm text-brand-blue hover:text-brand-blue-dark hover:underline py-1">{r.label}</Link>

              ))}

            </div>

          </div>

        </Tabs.Content>

        <Tabs.Content value="docs" className="pt-6 space-y-4">

          {api.endpoints.map((ep, i) => (

            <div key={i} className="rounded-xl border border-slate-200 bg-brand-white p-4">

              <p className="font-mono text-sm"><span className="font-bold text-brand-green">{ep.method}</span> {ep.path}</p>

              <p className="text-sm text-slate-600 mt-1">{ep.summary}</p>

            </div>

          ))}

        </Tabs.Content>

        <Tabs.Content value="sandbox" className="pt-6">

          <SandboxPanel api={api} application={app} hasActiveSubscription={hasActiveSub} />

        </Tabs.Content>

        <Tabs.Content value="sdk" className="pt-6">

          <SDKPanel api={api} application={app} credentialClientId={cred?.client_id} />

        </Tabs.Content>

      </Tabs.Root>



      {showSubModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl max-h-[min(90vh,48rem)] flex flex-col rounded-xl bg-brand-white shadow-xl">

            <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-100 space-y-4">

              <h2 className="text-lg font-bold">{isLlm ? 'Request LLM API Access' : 'Request Subscription'}</h2>

              <div>

                <label className="block text-sm font-medium mb-1">Application</label>

                <select value={appId} onChange={(e) => setAppId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">

                  {myApps.map((a) => <option key={a.application_id} value={a.application_id}>{a.name}</option>)}

                </select>

              </div>

            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">

              {isLlm ? (

                <LLMSubscriptionForm value={llmForm} onChange={setLlmForm} />

              ) : (

                <div>

                  <div className="flex justify-between mb-1">

                    <label className="text-sm font-medium">Purpose (required)</label>

                    <button type="button" onClick={draftPurpose} disabled={aiPurposeLoading} className="text-xs text-brand-blue">AI-3 Help me write this</button>

                  </div>

                  <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />

                </div>

              )}

            </div>

            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 flex gap-2 justify-end">

              <button type="button" onClick={() => setShowSubModal(false)} className="px-4 py-2 text-sm">Cancel</button>

              <button

                type="button"

                onClick={isLlm ? requestLlmAccess : requestStandardAccess}

                disabled={isLlm ? !isLlmFormComplete(llmForm) || !appId : !purpose || !appId}

                className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"

              >

                Submit

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


