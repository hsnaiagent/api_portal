import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { generateSearchIndex } from '@/lib/gemini';
import { parseOpenApiSpecContent, describeSpec } from '@/lib/openapi';
import type { PrecomputedSdkResult } from '@/lib/sdk-api';
import { SdkReviewStep } from '@/components/sdk/SdkReviewStep';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { useNotify } from '@/hooks/useNotify';
import { CLASSIFICATIONS } from '@/config/classification';
import { ROUTES } from '@/config/routes';
import type { API, ApiSdkArtifacts, Classification } from '@/types';

export function RegisterApiPage({
  fixedDomainId,
  successRoute,
  llmMode,
}: { fixedDomainId?: string; successRoute?: string; llmMode?: boolean } = {}) {
  const { state, dispatch } = usePortal();
  const navigate = useNavigate();
  const notify = useNotify();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spec, setSpec] = useState('');
  const [classification, setClassification] = useState<Classification>('internal');
  const [tier, setTier] = useState<1 | 2 | 3>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [llmModel, setLlmModel] = useState('');
  const [llmRateLimit, setLlmRateLimit] = useState('');
  const [llmTokenBudget, setLlmTokenBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiText, setAiText] = useState<string>();
  const [checklist, setChecklist] = useState<{ item: string; passed: boolean }[]>([]);
  const [duplicates, setDuplicates] = useState<
    { id: string; label: string; score?: number; reason?: string }[]
  >([]);
  const [confirmedDup, setConfirmedDup] = useState(false);
  const [sdkApproved, setSdkApproved] = useState(false);
  const [sdkArtifacts, setSdkArtifacts] = useState<PrecomputedSdkResult | null>(null);

  const specInfo = describeSpec(spec);
  const parsedSpec = spec.trim() ? parseOpenApiSpecContent(spec) : null;

  const runAI = async (agent: Parameters<typeof getAIResponse>[0]) => {
    return getAIResponse(agent, {
      name,
      description,
      spec,
      existingApis: state.apis.map((item) => ({
        api_id: item.api_id,
        name: item.name,
        description: item.description,
        tags: item.tags,
      })),
    });
  };

  const generateDescription = async () => {
    setLoading(true);
    try {
      const res = await runAI('AI_6_DescriptionGenerator');
      setDescription(res?.text ?? description);
    } catch {
      notify(
        'AI unavailable',
        'Could not generate a description. Please write one manually.',
        'warning',
      );
    } finally {
      setLoading(false);
    }
  };

  const onSpecUpload = async () => {
    if (!spec.trim()) {
      notify('Spec required', 'Paste an OpenAPI spec before continuing.', 'warning');
      return;
    }
    if (!specInfo.ok) {
      notify('Invalid spec', specInfo.note ?? 'OpenAPI spec must be valid JSON.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const [q, t, c] = await Promise.all([
        getAIResponse('AI_10_SpecQualityChecker', { spec }),
        getAIResponse('AI_7_TagSuggester', { spec }),
        getAIResponse('AI_8_ClassificationAdvisor', { spec }),
      ]);
      setChecklist(q?.checklist ?? []);
      setTags(t?.tags ?? []);
      if (c?.classification) setClassification(c.classification);
      setAiText(c?.text);
      setStep(3);
    } catch {
      notify(
        'Analysis failed',
        'Could not analyze the spec. You can continue and set fields manually.',
        'warning',
      );
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleSdkApproved = (artifacts: PrecomputedSdkResult) => {
    setSdkArtifacts(artifacts);
    setSdkApproved(true);
    notify('SDK approved', 'Code snippets approved. Proceed to submit your proposal.', 'success');
    setStep(5);
  };

  const submit = async () => {
    if (!state.currentUser) return;
    if (!parsedSpec?.content) {
      notify('Invalid spec', 'A valid OpenAPI spec is required to register an API.', 'error');
      return;
    }
    if (!sdkApproved || !sdkArtifacts) {
      notify('SDK review required', 'Approve the pre-generated SDK snippets before submitting.', 'warning');
      setStep(4);
      return;
    }

    setSubmitting(true);
    try {
      const dup = await runAI('AI_9_DuplicationDetector');
      setDuplicates(dup?.items ?? []);
      if (!confirmedDup && (dup?.items?.length ?? 0) > 0) {
        setStep(5);
        return;
      }

      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const now = new Date().toISOString();
      const sdkArtifactsRecord: ApiSdkArtifacts = {
        curl: sdkArtifacts.curl,
        python: sdkArtifacts.python,
        nodejs: sdkArtifacts.nodejs,
        generated_at: now,
        model: sdkArtifacts.model,
        approved_at: now,
        approved_by_user_id: state.currentUser.user_id,
      };

      const api: API = {
        api_id: `api_new_${Date.now()}`,
        domain_id:
          fixedDomainId ?? state.currentUser.provider_domains[0] ?? state.currentUser.domain_id,
        name,
        slug,
        description,
        classification,
        lifecycle_status: 'proposed',
        owner_user_id: state.currentUser.user_id,
        gateway_tier: tier,
        tags,
        version: parsedSpec.version ?? '1.0.0',
        endpoints: parsedSpec.endpoints,
        openapi_spec_content: parsedSpec.content,
        sdk_artifacts: sdkArtifactsRecord,
        ...(llmMode
          ? {
              llm_config: {
                model: llmModel.trim() || undefined,
                rate_limit_per_min: llmRateLimit ? Number(llmRateLimit) : undefined,
                monthly_token_budget: llmTokenBudget ? Number(llmTokenBudget) : undefined,
              },
            }
          : {}),
      };

      dispatch({ type: 'ADD_API', payload: api });
      dispatch({
        type: 'ADD_AUDIT',
        payload: {
          audit_id: `aud_${Date.now()}`,
          timestamp: now,
          actor_user_id: state.currentUser.user_id,
          actor_type: 'user',
          action: 'api.registered',
          entity_type: 'api',
          entity_id: api.api_id,
          payload: { name, classification, endpoints: parsedSpec.endpoints.length },
        },
      });
      dispatch({
        type: 'ADD_AUDIT',
        payload: {
          audit_id: `aud_${Date.now() + 1}`,
          timestamp: now,
          actor_user_id: state.currentUser.user_id,
          actor_type: 'user',
          action: 'api.sdk.approved',
          entity_type: 'api',
          entity_id: api.api_id,
          payload: { model: sdkArtifacts.model, languages: ['curl', 'python', 'nodejs'] },
        },
      });

      void (async () => {
        const existingApiIds = [...state.apis.map((item) => item.api_id), api.api_id];
        const searchIndex = await generateSearchIndex(name, description, existingApiIds);
        if (searchIndex) {
          dispatch({
            type: 'UPDATE_API',
            payload: { api_id: api.api_id, patch: { search_index: searchIndex } },
          });
        }
      })();

      notify(
        'API proposed',
        `${name} was submitted for admin review with ${parsedSpec.endpoints.length} endpoint${parsedSpec.endpoints.length === 1 ? '' : 's'}.`,
        'success',
      );
      navigate(successRoute ?? ROUTES.provider.myApis);
    } catch {
      notify('Submission failed', 'Could not submit the API proposal. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = loading || submitting;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Register API</h1>
      <div className="flex gap-2 text-sm flex-wrap">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`px-3 py-1 rounded-full ${step === s ? 'bg-brand-green text-brand-white' : 'bg-slate-100'}`}
          >
            Step {s}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <div>
            <label htmlFor="api-name" className="block text-sm font-medium mb-1">
              API name <span className="text-red-500">*</span>
            </label>
            <input
              id="api-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="API name"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="api-description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="api-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={generateDescription}
            disabled={busy}
            className="text-sm text-brand-blue flex items-center gap-1 disabled:opacity-50"
          >
            <AIBadge label="AI-6" /> {loading ? 'Generating…' : 'Generate description with AI'}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <label htmlFor="api-spec" className="block text-sm font-medium">
            OpenAPI spec (JSON)
          </label>
          <textarea
            id="api-spec"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            placeholder='Paste OpenAPI 3.0 spec as JSON — e.g. { "openapi": "3.0.3", "paths": { ... } }'
            rows={8}
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
          />
          {spec.trim() && (
            <p className={`text-xs ${specInfo.ok ? 'text-slate-500' : 'text-red-600'}`}>
              {specInfo.note}
            </p>
          )}
          <p className="text-xs text-slate-500">
            The OpenAPI schema is the sole source of truth for SDK generation. AI-7, AI-8, AI-10
            run on continue.
          </p>
          <AIThinkingOverlay loading={loading} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={busy}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onSpecUpload}
              disabled={busy || !spec.trim() || !specInfo.ok}
              className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
            >
              {loading ? 'Analyzing…' : 'Analyze & Continue'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <AIThinkingOverlay loading={loading} text={!loading ? aiText : undefined} />
          {checklist.length > 0 && (
            <ul className="text-sm space-y-1">
              {checklist.map((c, i) => (
                <li key={i} className={c.passed ? 'text-brand-green' : 'text-red-600'}>
                  {c.passed ? '✓' : '✗'} {c.item}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-blue-light text-brand-blue-dark px-2 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
          <label htmlFor="api-class" className="text-sm font-medium">
            Classification <AIBadge label="AI-8" />
          </label>
          <select
            id="api-class"
            value={classification}
            onChange={(e) => setClassification(e.target.value as Classification)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
              <option key={c} value={c}>
                {CLASSIFICATIONS[c].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">{CLASSIFICATIONS[classification].handling}</p>
          <label htmlFor="api-tier" className="text-sm font-medium">
            Gateway tier
          </label>
          <select
            id="api-tier"
            value={tier}
            onChange={(e) => setTier(Number(e.target.value) as 1 | 2 | 3)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value={1}>Tier 1 — Metadata only</option>
            <option value={2}>Tier 2 — Gateway proxied</option>
            <option value={3}>Tier 3 — Gateway native</option>
          </select>
          {llmMode && (
            <div className="rounded-lg border border-brand-blue/30 bg-brand-blue-light/40 p-4 space-y-3">
              <p className="text-sm font-medium text-brand-blue-dark">LLM configuration</p>
              <div>
                <label htmlFor="llm-model" className="block text-sm font-medium mb-1">
                  Model
                </label>
                <input
                  id="llm-model"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  placeholder="e.g. gpt-4o, claude-3.5, internal-rag-v2"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="llm-rate" className="block text-sm font-medium mb-1">
                  Rate limit (requests/min)
                </label>
                <input
                  id="llm-rate"
                  type="number"
                  min={0}
                  value={llmRateLimit}
                  onChange={(e) => setLlmRateLimit(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="llm-budget" className="block text-sm font-medium mb-1">
                  Monthly token budget
                </label>
                <input
                  id="llm-budget"
                  type="number"
                  min={0}
                  value={llmTokenBudget}
                  onChange={(e) => setLlmTokenBudget(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={busy}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                setSdkApproved(false);
                setSdkArtifacts(null);
                setStep(4);
              }}
              disabled={busy || !parsedSpec?.content}
              className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
            >
              Continue to SDK Review
            </button>
          </div>
        </div>
      )}

      {step === 4 && parsedSpec?.content && (
        <SdkReviewStep
          openapiSpecContent={parsedSpec.content}
          apiName={name}
          approved={sdkApproved}
          onApproved={handleSdkApproved}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          {duplicates.length === 0 ? (
            <>
              <p className="text-sm text-slate-600">
                SDK snippets approved. Submit your API proposal for admin review.
              </p>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !sdkApproved}
                className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit proposal'}
              </button>
            </>
          ) : (
            <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AIBadge label="AI-9" /> Similar APIs found
              </h3>
              {duplicates.map((d) => (
                <p key={d.id} className="text-sm">
                  {d.label} ({d.score}% — {d.reason})
                </p>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmedDup}
                  onChange={(e) => setConfirmedDup(e.target.checked)}
                />{' '}
                I reviewed similar APIs and confirm a new API is needed
              </label>
              <button
                type="button"
                onClick={submit}
                disabled={!confirmedDup || submitting}
                className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Confirm & Submit'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
