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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stepper } from '@/components/ui/stepper';
import { Textarea } from '@/components/ui/textarea';
import { useNotify } from '@/hooks/useNotify';
import { CLASSIFICATIONS } from '@/config/classification';
import { ROUTES } from '@/config/routes';
import { SAMPLE_OPENAPI_SPEC_JSON } from '@/data/sample-openapi-spec';
import type { API, ApiSdkArtifacts, Classification } from '@/types';

const WIZARD_STEPS = [
  { id: 1, label: 'OpenAPI spec' },
  { id: 2, label: 'API details' },
  { id: 3, label: 'Classification' },
  { id: 4, label: 'SDK review' },
  { id: 5, label: 'Submit' },
] as const;

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
  const specContent = parsedSpec?.content ?? null;

  const patchedSpecContent = useMemo(() => {
    if (!specContent) return null;
    return patchSpecContent(specContent, {
      name: name.trim(),
      description: description.trim(),
      version: version.trim() || '1.0.0',
      backendUrl: targetUrl.trim(),
    });
  }, [specContent, name, description, version, targetUrl]);

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

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Publish API</h1>
      <Stepper steps={[...WIZARD_STEPS]} currentStep={step} />

      {step === 1 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="api-spec" className="block text-sm font-medium text-foreground">
                OpenAPI spec (JSON) <span className="text-destructive">*</span>
              </label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setSpec(SAMPLE_OPENAPI_SPEC_JSON)}
              >
                Try with a sample API
              </Button>
            </div>
            <Textarea
              id="api-spec"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder='Paste OpenAPI 3.0 spec as JSON — e.g. { "openapi": "3.0.3", "paths": { ... } }'
              rows={10}
              className="font-mono"
            />
            {spec.trim() && (
              <p className={`text-xs ${specInfo.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload JSON file
              </Button>
              <p className="text-xs text-muted-foreground">
                The OpenAPI specification is the source of truth for registration.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(successRoute ?? ROUTES.provider.myApis)}
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={onSpecContinue}
                disabled={!spec.trim() || !specInfo.ok}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Review the values extracted from your OpenAPI spec. Edit any field if needed.
            </p>
            <div>
              <label htmlFor="api-name" className="mb-1 block text-sm font-medium text-foreground">
                API Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="api-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="API name"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This is the visible name shown on the portal.
              </p>
            </div>
            <div>
              <label
                htmlFor="api-description"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="api-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={4}
              />
            </div>
            <div>
              <label
                htmlFor="api-version"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Version <span className="text-destructive">*</span>
              </label>
              <Input
                id="api-version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
              />
            </div>
            <div>
              <label
                htmlFor="api-target-url"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Target URL <span className="text-destructive">*</span>
              </label>
              <Input
                id="api-target-url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://apis.example.com/service"
                className="font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Upstream routing server URL from the spec.
              </p>
            </div>
            <div>
              <label
                htmlFor="api-basepath"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Basepath <span className="text-destructive">*</span>
              </label>
              <Input
                id="api-basepath"
                value={basepath}
                onChange={(e) => setBasepath(e.target.value)}
                placeholder="/v1/my-api"
                className="font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">Gateway path prefix for this API.</p>
            </div>

            <ReadinessChecklist
              targetUrl={targetUrl}
              basepath={basepath}
              specContent={parsedSpec?.content ?? null}
              onBlockersChange={setHardBlockersActive}
            />

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!verificationComplete || hardBlockersActive}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <label htmlFor="api-class" className="text-sm font-medium text-foreground">
              Classification <span className="text-destructive">*</span>
            </label>
            <Select
              value={classification}
              onValueChange={(v) => v && setClassification(v as Classification)}
            >
              <SelectTrigger id="api-class" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CLASSIFICATIONS[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{CLASSIFICATIONS[classification].handling}</p>
            <label htmlFor="api-tier" className="text-sm font-medium text-foreground">
              Gateway tier <span className="text-destructive">*</span>
            </label>
            <Select
              value={String(tier)}
              onValueChange={(v) => v && setTier(Number(v) as 1 | 2 | 3)}
            >
              <SelectTrigger id="api-tier" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Tier 1 — Metadata only</SelectItem>
                <SelectItem value="2">Tier 2 — Gateway proxied</SelectItem>
                <SelectItem value="3">Tier 3 — Gateway native</SelectItem>
              </SelectContent>
            </Select>
            {llmMode && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground">LLM configuration</p>
                <div>
                  <label htmlFor="llm-model" className="mb-1 block text-sm font-medium text-foreground">
                    Model
                  </label>
                  <Input
                    id="llm-model"
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    placeholder="e.g. gpt-4o, claude-3.5, internal-rag-v2"
                  />
                </div>
                <div>
                  <label htmlFor="llm-rate" className="mb-1 block text-sm font-medium text-foreground">
                    Rate limit (requests/min)
                  </label>
                  <Input
                    id="llm-rate"
                    type="number"
                    min={0}
                    value={llmRateLimit}
                    onChange={(e) => setLlmRateLimit(e.target.value)}
                    placeholder="e.g. 60"
                  />
                </div>
                <div>
                  <label htmlFor="llm-budget" className="mb-1 block text-sm font-medium text-foreground">
                    Monthly token budget
                  </label>
                  <Input
                    id="llm-budget"
                    type="number"
                    min={0}
                    value={llmTokenBudget}
                    onChange={(e) => setLlmTokenBudget(e.target.value)}
                    placeholder="e.g. 5000000"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setSdkApproved(false);
                  setSdkArtifacts(null);
                  setStep(4);
                }}
                disabled={!patchedSpecContent}
              >
                Continue to SDK Review
              </Button>
            </div>
          </CardContent>
        </Card>
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
        <Card>
          <CardContent className="space-y-4 pt-6">
            {duplicates.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  SDK snippets approved. Submit your API proposal for admin review.
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(4)}>
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={submitting || !sdkApproved || hardBlockersActive}
                    loading={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Submit proposal'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4 rounded-lg border border-status-warning/30 bg-status-warning/10 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <AIBadge label="AI-9" /> Similar APIs found
                </h3>
                {duplicates.map((d) => (
                  <p key={d.id} className="text-sm text-foreground">
                    {d.label} ({d.score}% — {d.reason})
                  </p>
                ))}
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={confirmedDup}
                    onChange={(e) => setConfirmedDup(e.target.checked)}
                    className="rounded border-input"
                  />
                  I reviewed similar APIs and confirm a new API is needed
                </label>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(4)}>
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={!confirmedDup || submitting || hardBlockersActive}
                    loading={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Confirm & Submit'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
