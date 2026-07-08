import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { generateSearchIndex } from '@/lib/gemini';
import { parseOpenApiSpecContent, describeSpec } from '@/lib/openapi';
import {
  extractRegistrationFields,
  patchSpecContent,
  slugifyName,
} from '@/lib/openapi-registration';
import type { PrecomputedSdkResult } from '@/lib/sdk-api';
import { SdkReviewStep } from '@/components/sdk/SdkReviewStep';
import { ReadinessChecklist } from '@/components/register/ReadinessChecklist';
import { AIBadge } from '@/components/ai/AIBadge';
import { useNotify } from '@/hooks/useNotify';
import { CLASSIFICATIONS } from '@/config/classification';
import { ROUTES } from '@/config/routes';
import { SAMPLE_OPENAPI_SPEC_JSON } from '@/data/sample-openapi-spec';
import type { API, ApiSdkArtifacts, Classification } from '@/types';

export function RegisterApiPage({
  fixedDomainId,
  successRoute,
  llmMode,
}: { fixedDomainId?: string; successRoute?: string; llmMode?: boolean } = {}) {
  const { state, dispatch } = usePortal();
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [spec, setSpec] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [basepath, setBasepath] = useState('');
  const [classification, setClassification] = useState<Classification>('internal');
  const [tier, setTier] = useState<1 | 2 | 3>(1);
  const [llmModel, setLlmModel] = useState('');
  const [llmRateLimit, setLlmRateLimit] = useState('');
  const [llmTokenBudget, setLlmTokenBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hardBlockersActive, setHardBlockersActive] = useState(true);
  const [duplicates, setDuplicates] = useState<
    { id: string; label: string; score?: number; reason?: string }[]
  >([]);
  const [confirmedDup, setConfirmedDup] = useState(false);
  const [sdkApproved, setSdkApproved] = useState(false);
  const [sdkArtifacts, setSdkArtifacts] = useState<PrecomputedSdkResult | null>(null);

  const specInfo = describeSpec(spec);
  const parsedSpec = spec.trim() ? parseOpenApiSpecContent(spec) : null;

  const patchedSpecContent = useMemo(() => {
    if (!parsedSpec?.content) return null;
    return patchSpecContent(parsedSpec.content, {
      name: name.trim(),
      description: description.trim(),
      version: version.trim() || '1.0.0',
      backendUrl: targetUrl.trim(),
    });
  }, [parsedSpec?.content, name, description, version, targetUrl]);

  const verificationComplete =
    name.trim() &&
    description.trim() &&
    version.trim() &&
    targetUrl.trim() &&
    basepath.trim();

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

  const onSpecContinue = () => {
    if (!spec.trim()) {
      notify('Spec required', 'Paste or upload an OpenAPI spec before continuing.', 'warning');
      return;
    }
    if (!specInfo.ok || !parsedSpec?.content) {
      notify('Invalid spec', specInfo.note ?? 'OpenAPI spec must be valid JSON.', 'warning');
      return;
    }

    const fields = extractRegistrationFields(parsedSpec.content);
    setName(fields.name);
    setDescription(fields.description);
    setVersion(fields.version);
    setTargetUrl(fields.backendUrl);
    setBasepath(fields.gatewayPathPrefix);
    setStep(2);
  };

  const onSpecFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setSpec(text);
    } catch {
      notify('Upload failed', 'Could not read the selected file.', 'error');
    } finally {
      e.target.value = '';
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
    if (!patchedSpecContent || !parsedSpec) {
      notify('Invalid spec', 'A valid OpenAPI spec is required to register an API.', 'error');
      return;
    }
    if (hardBlockersActive) {
      notify('Readiness checks failed', 'Resolve all required readiness checks before submitting.', 'error');
      setStep(2);
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

      const slug = slugifyName(name) || name.toLowerCase().replace(/\s+/g, '-');
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

      const reparsed = parseOpenApiSpecContent(JSON.stringify(patchedSpecContent));

      const api: API = {
        api_id: `api_new_${Date.now()}`,
        domain_id:
          fixedDomainId ?? state.currentUser.provider_domains[0] ?? state.currentUser.domain_id,
        name: name.trim(),
        slug,
        description: description.trim(),
        classification,
        lifecycle_status: 'proposed',
        owner_user_id: state.currentUser.user_id,
        gateway_tier: tier,
        tags: [],
        version: version.trim() || (parsedSpec.version ?? '1.0.0'),
        endpoints: reparsed?.endpoints ?? parsedSpec.endpoints,
        openapi_spec_content: patchedSpecContent,
        backend_url: targetUrl.trim(),
        gateway_path_prefix: basepath.trim(),
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
          payload: { name, classification, endpoints: api.endpoints.length },
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
        `${name} was submitted for admin review with ${api.endpoints.length} endpoint${api.endpoints.length === 1 ? '' : 's'}.`,
        'success',
      );
      navigate(successRoute ?? ROUTES.provider.myApis);
    } catch {
      notify('Submission failed', 'Could not submit the API proposal. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const backButtonClass =
    'rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Publish API</h1>
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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label htmlFor="api-spec" className="block text-sm font-medium">
              OpenAPI spec (JSON) <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setSpec(SAMPLE_OPENAPI_SPEC_JSON)}
              className="text-sm text-brand-blue hover:underline font-medium"
            >
              Try with a sample API
            </button>
          </div>
          <textarea
            id="api-spec"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            placeholder='Paste OpenAPI 3.0 spec as JSON — e.g. { "openapi": "3.0.3", "paths": { ... } }'
            rows={10}
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
          />
          {spec.trim() && (
            <p className={`text-xs ${specInfo.ok ? 'text-slate-500' : 'text-red-600'}`}>
              {specInfo.note}
            </p>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={onSpecFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Upload JSON file
            </button>
            <p className="text-xs text-slate-500">
              The OpenAPI specification is the source of truth for registration.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(successRoute ?? ROUTES.provider.myApis)}
              className={backButtonClass}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onSpecContinue}
              disabled={!spec.trim() || !specInfo.ok}
              className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <p className="text-sm text-slate-600">
            Review the values extracted from your OpenAPI spec. Edit any field if needed.
          </p>
          <div>
            <label htmlFor="api-name" className="block text-sm font-medium mb-1">
              API Name <span className="text-red-500">*</span>
            </label>
            <input
              id="api-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="API name"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              This is the visible name shown on the portal.
            </p>
          </div>
          <div>
            <label htmlFor="api-description" className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
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
          <div>
            <label htmlFor="api-version" className="block text-sm font-medium mb-1">
              Version <span className="text-red-500">*</span>
            </label>
            <input
              id="api-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="api-target-url" className="block text-sm font-medium mb-1">
              Target URL <span className="text-red-500">*</span>
            </label>
            <input
              id="api-target-url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://apis.example.com/service"
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">Upstream routing server URL from the spec.</p>
          </div>
          <div>
            <label htmlFor="api-basepath" className="block text-sm font-medium mb-1">
              Basepath <span className="text-red-500">*</span>
            </label>
            <input
              id="api-basepath"
              value={basepath}
              onChange={(e) => setBasepath(e.target.value)}
              placeholder="/v1/my-api"
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">Gateway path prefix for this API.</p>
          </div>

          <ReadinessChecklist
            targetUrl={targetUrl}
            basepath={basepath}
            specContent={parsedSpec?.content ?? null}
            onBlockersChange={setHardBlockersActive}
          />

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className={backButtonClass}>
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!verificationComplete || hardBlockersActive}
              className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <label htmlFor="api-class" className="text-sm font-medium">
            Classification <span className="text-red-500">*</span>
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
            Gateway tier <span className="text-red-500">*</span>
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
            <button type="button" onClick={() => setStep(2)} className={backButtonClass}>
              ← Back
            </button>
            <button
              type="button"
              onClick={() => {
                setSdkApproved(false);
                setSdkArtifacts(null);
                setStep(4);
              }}
              disabled={!patchedSpecContent}
              className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
            >
              Continue to SDK Review
            </button>
          </div>
        </div>
      )}

      {step === 4 && patchedSpecContent && (
        <SdkReviewStep
          openapiSpecContent={patchedSpecContent}
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
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(4)} className={backButtonClass}>
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting || !sdkApproved || hardBlockersActive}
                  className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit proposal'}
                </button>
              </div>
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
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(4)} className={backButtonClass}>
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!confirmedDup || submitting || hardBlockersActive}
                  className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
