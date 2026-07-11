import { useState } from 'react';

import { useParams, Link } from 'react-router-dom';

import { usePortal } from '@/store/AppStore';

import { getUserById } from '@/data/users';

import { domains } from '@/data/domains';

import { ClassificationBadge } from '@/components/shared/ClassificationBadge';

import { LifecycleBadge } from '@/components/shared/LifecycleBadge';

import { SandboxPanel } from '@/components/sandbox/SandboxPanel';

import { SDKPanel } from '@/components/sdk/SDKPanel';

import {
  LLMSubscriptionForm,
  emptyLlmForm,
  isLlmFormComplete,
} from '@/components/shared/LLMSubscriptionForm';

import { getRecommendationsFromIndex } from '@/lib/search-index';

import { getAIResponse } from '@/mocks/AIAdapter';

import { triggerWorkflow } from '@/mocks/WorkflowAdapter';

import { provisionSubscription } from '@/mocks/GatewayAdapter';

import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const [submitting, setSubmitting] = useState(false);

  const [recommendations, setRecommendations] = useState<
    { id: string; label: string; reason?: string }[]
  >([]);

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
    (s) =>
      s.api_id === api.api_id &&
      s.requested_by_user_id === state.currentUser?.user_id &&
      s.status !== 'revoked',
  );

  const cred =
    sub?.status === 'active'
      ? state.credentials.find((c) => c.subscription_id === sub.subscription_id)
      : undefined;

  const app =
    myApps.find((a) => a.application_id === (appId || myApps[0]?.application_id)) ?? myApps[0];

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

    const res = await getAIResponse('AI_3_PurposeHelper', {
      description: selectedApp?.application_description,
    });

    setPurpose(res?.text ?? '');

    setAiPurposeLoading(false);
  };

  const requestStandardAccess = async () => {
    if (!state.currentUser || !appId) return;

    const newSub: Subscription = {
      subscription_id: `sub_${Date.now()}`,

      api_id: api.api_id,

      application_id: appId,

      requested_by_user_id: state.currentUser.user_id,

      purpose,

      min_api_version: api.version,

      status: api.classification === 'public' ? 'active' : 'workflow_in_progress',

      provider_status: api.classification === 'public' ? 'accepted' : 'pending',

      created_at: new Date().toISOString(),
    };

    setSubmitting(true);

    try {
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSub });

      if (api.classification !== 'public') {
        await triggerWorkflow(newSub);

        notify('Workflow started', `Approval workflow triggered for ${api.name}`, 'info');
      } else {
        await provisionSubscription(newSub);

        notify('Access granted', `Self-service subscription active for ${api.name}`, 'success');
      }

      setShowSubModal(false);
    } catch {
      notify(
        'Request failed',
        'Could not complete the subscription request. Please try again.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const requestLlmAccess = async () => {
    if (!state.currentUser || !appId) return;

    const subscriptionId = `sub_${Date.now()}`;

    const newSub: Subscription = {
      subscription_id: subscriptionId,

      api_id: api.api_id,

      application_id: appId,

      requested_by_user_id: state.currentUser.user_id,

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

      requested_by_user_id: state.currentUser.user_id,

      application_id: appId,

      ...llmForm,

      status: 'pending',

      created_at: new Date().toISOString(),
    };

    setSubmitting(true);

    try {
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSub });

      dispatch({ type: 'ADD_LLM_REQUEST', payload: llmRequest });

      dispatch({
        type: 'ADD_AUDIT',

        payload: {
          audit_id: `aud_${Date.now()}`,

          timestamp: new Date().toISOString(),

          actor_user_id: state.currentUser.user_id,

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
    } catch {
      notify(
        'Request failed',
        'Could not submit the LLM access request. Please try again.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
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
      <Link
        to={ROUTES.consumer.catalog}
        className={buttonVariants({ variant: 'link', size: 'sm' })}
      >
        ← Back to catalog
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{api.name}</h1>

          <p className="text-sm text-muted-foreground">
            {domain?.name} · v{api.version} · Tier {api.gateway_tier}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ClassificationBadge classification={api.classification} showHandling />

          <LifecycleBadge status={api.lifecycle_status} />
        </div>
      </div>

      <p className="text-muted-foreground">{api.description}</p>

      <p className="text-sm text-muted-foreground">Owner: {owner?.display_name}</p>

      {isLlm && (
        <div className="rounded-lg border border-link/30 bg-link-subtle/40 px-4 py-3 text-sm text-link-hover">
          LLM API access requires an ROI justification form reviewed by the LLM & AI Admin.
        </div>
      )}

      {api.llm_config &&
        (api.llm_config.model ||
          api.llm_config.rate_limit_per_min ||
          api.llm_config.monthly_token_budget) && (
          <div className="flex flex-wrap gap-2">
            {api.llm_config.model && (
              <Badge variant="neutral">Model: {api.llm_config.model}</Badge>
            )}

            {api.llm_config.rate_limit_per_min != null && (
              <Badge variant="neutral">{api.llm_config.rate_limit_per_min} req/min</Badge>
            )}

            {api.llm_config.monthly_token_budget != null && (
              <Badge variant="neutral">
                {api.llm_config.monthly_token_budget.toLocaleString()} tokens/mo
              </Badge>
            )}
          </div>
        )}

      {!hasActiveSub && !hasPendingLlm && api.lifecycle_status === 'published' && (
        <Button onClick={openRequestModal}>Request Access</Button>
      )}

      {hasActiveSub && (
        <Badge variant="active">Active subscription</Badge>
      )}

      {hasPendingLlm && (
        <Badge variant="pending">LLM access pending review</Badge>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          {['overview', 'docs', 'sandbox', 'sdk'].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab === 'sdk' ? 'SDK & Code' : tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h3 className="font-semibold text-foreground">Tags</h3>

              <div className="flex flex-wrap gap-2">
                {api.tags.map((t) => (
                  <Badge key={t} variant="neutral">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm">You might also need</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={loadRecommendations}
                  className="h-auto px-2 py-1"
                >
                  <AIBadge label="AI-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-1">
                {recommendations.map((r) => (
                  <Link
                    key={r.id}
                    to={ROUTES.consumer.apiDetail(r.id)}
                    className={buttonVariants({ variant: 'link', size: 'sm' })}
                  >
                    {r.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Version {api.version} · {api.endpoints.length} endpoint
            {api.endpoints.length === 1 ? '' : 's'}
          </p>

          {api.endpoints.map((ep, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 p-4">
                <p className="font-mono text-sm">
                  <span className="font-bold text-brand">{ep.method}</span> {ep.path}
                </p>

                <p className="text-sm text-muted-foreground">{ep.summary}</p>

                {ep.parameters && ep.parameters.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-1 font-medium text-foreground">Parameters</p>

                    <ul className="space-y-0.5">
                      {ep.parameters.map((p) => (
                        <li key={`${p.in}-${p.name}`} className="font-mono">
                          {p.name}{' '}
                          <span className="text-muted-foreground">
                            ({p.in}, {p.type}
                            {p.required ? ', required' : ''})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ep.responseExample && (
                  <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-foreground">
                    {JSON.stringify(ep.responseExample, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sandbox">
          <SandboxPanel api={api} application={app} hasActiveSubscription={hasActiveSub} />
        </TabsContent>

        <TabsContent value="sdk">
          <SDKPanel api={api} application={app} credentialClientId={cred?.client_id} />
        </TabsContent>
      </Tabs>

      <Dialog open={showSubModal} onOpenChange={setShowSubModal}>
        <DialogContent className="flex max-h-[min(90vh,48rem)] max-w-2xl flex-col gap-0 p-0">
          <DialogHeader>
            <DialogTitle>
              {isLlm ? 'Request LLM API Access' : 'Request Subscription'}
            </DialogTitle>
          </DialogHeader>

          {myApps.length > 0 && (
            <div className="border-b border-border px-6 pb-4">
              <label htmlFor="sub-app" className="mb-1 block text-sm font-medium">
                Application
              </label>
              <Select value={appId} onValueChange={(v) => v && setAppId(v)}>
                <SelectTrigger id="sub-app" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {myApps.map((a) => (
                    <SelectItem key={a.application_id} value={a.application_id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {myApps.length === 0 ? (
            <DialogBody className="space-y-3 text-center">
              <p className="font-medium text-foreground">You need an application first</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Subscriptions are tied to a consumer application. Create one, then come back to
                request access.
              </p>
              <Link to={ROUTES.consumer.applications}>
                <Button>Create an application</Button>
              </Link>
            </DialogBody>
          ) : (
            <DialogBody className="max-h-[min(60vh,32rem)] overflow-y-auto">
              {isLlm ? (
                <LLMSubscriptionForm value={llmForm} onChange={setLlmForm} />
              ) : (
                <div>
                  <div className="mb-1 flex justify-between">
                    <label htmlFor="sub-purpose" className="text-sm font-medium">
                      Purpose (required)
                    </label>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={draftPurpose}
                      disabled={aiPurposeLoading}
                      className="h-auto px-0"
                    >
                      {aiPurposeLoading ? 'Drafting…' : 'AI-3 Help me write this'}
                    </Button>
                  </div>
                  <Textarea
                    id="sub-purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </DialogBody>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowSubModal(false)}>
              {myApps.length === 0 ? 'Close' : 'Cancel'}
            </Button>
            {myApps.length > 0 && (
              <Button
                onClick={isLlm ? requestLlmAccess : requestStandardAccess}
                disabled={
                  submitting ||
                  (isLlm ? !isLlmFormComplete(llmForm) || !appId : !purpose || !appId)
                }
                loading={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
