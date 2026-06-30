import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { generateSearchIndex } from '@/lib/gemini';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { CLASSIFICATIONS } from '@/config/classification';
import { ROUTES } from '@/config/routes';
import type { API, Classification } from '@/types';

export function RegisterApiPage({ fixedDomainId, successRoute }: { fixedDomainId?: string; successRoute?: string } = {}) {
  const { state, dispatch } = usePortal();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spec, setSpec] = useState('');
  const [classification, setClassification] = useState<Classification>('internal');
  const [tier, setTier] = useState<1 | 2 | 3>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState<string>();
  const [checklist, setChecklist] = useState<{ item: string; passed: boolean }[]>([]);
  const [duplicates, setDuplicates] = useState<{ id: string; label: string; score?: number; reason?: string }[]>([]);
  const [confirmedDup, setConfirmedDup] = useState(false);

  const runAI = async (agent: Parameters<typeof getAIResponse>[0]) => {
    setLoading(true);
    const res = await getAIResponse(agent, {
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
    setLoading(false);
    return res;
  };

  const generateDescription = async () => {
    const res = await runAI('AI_6_DescriptionGenerator');
    setDescription(res?.text ?? description);
  };

  const onSpecUpload = async () => {
    setLoading(true);
    const q = await getAIResponse('AI_10_SpecQualityChecker', { spec });
    const t = await getAIResponse('AI_7_TagSuggester', { spec });
    const c = await getAIResponse('AI_8_ClassificationAdvisor', { spec });
    setChecklist(q?.checklist ?? []);
    setTags(t?.tags ?? []);
    if (c?.classification) setClassification(c.classification);
    setAiText(c?.text);
    setLoading(false);
    setStep(3);
  };

  const submit = async () => {
    const dup = await runAI('AI_9_DuplicationDetector');
    setDuplicates(dup?.items ?? []);
    if (!confirmedDup && (dup?.items?.length ?? 0) > 0) {
      setStep(4);
      return;
    }
    const api: API = {
      api_id: `api_new_${Date.now()}`,
      domain_id: fixedDomainId ?? state.currentUser!.provider_domains[0] ?? state.currentUser!.domain_id,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      classification,
      lifecycle_status: 'proposed',
      owner_user_id: state.currentUser!.user_id,
      gateway_tier: tier,
      tags,
      version: '1.0.0',
      endpoints: [{ method: 'GET', path: `/v1/${name.toLowerCase().replace(/\s+/g, '-')}`, summary: name, responseExample: { ok: true } }],
    };
    dispatch({ type: 'ADD_API', payload: api });

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

    navigate(successRoute ?? ROUTES.provider.myApis);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Register API</h1>
      <div className="flex gap-2 text-sm">{[1, 2, 3, 4].map((s) => <span key={s} className={`px-3 py-1 rounded-full ${step === s ? 'bg-brand-green text-brand-white' : 'bg-slate-100'}`}>Step {s}</span>)}</div>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="API name" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <button type="button" onClick={generateDescription} className="text-sm text-brand-blue flex items-center gap-1"><AIBadge label="AI-6" /> Generate from spec later</button>
          <button type="button" onClick={() => setStep(2)} disabled={!name} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <textarea value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="Paste OpenAPI spec (JSON/YAML)..." rows={8} className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
          <p className="text-xs text-slate-500">AI-7 Tag Suggester, AI-8 Classification Advisor, AI-10 Spec Quality run on continue</p>
          <button type="button" onClick={onSpecUpload} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Analyze & Continue</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border bg-brand-white p-6">
          <AIThinkingOverlay loading={loading} text={!loading ? aiText : undefined} />
          {checklist.length > 0 && (
            <ul className="text-sm space-y-1">{checklist.map((c, i) => <li key={i} className={c.passed ? 'text-brand-green' : 'text-red-600'}>{c.passed ? '✓' : '✗'} {c.item}</li>)}</ul>
          )}
          <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="rounded-full bg-brand-blue-light text-brand-blue-dark px-2 py-0.5 text-xs">{t}</span>)}</div>
          <label className="text-sm font-medium">Classification <AIBadge label="AI-8" /></label>
          <select value={classification} onChange={(e) => setClassification(e.target.value as Classification)} className="w-full rounded-lg border px-3 py-2 text-sm">
            {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => <option key={c} value={c}>{CLASSIFICATIONS[c].label}</option>)}
          </select>
          <p className="text-xs text-slate-500">{CLASSIFICATIONS[classification].handling}</p>
          <label className="text-sm font-medium">Gateway tier</label>
          <select value={tier} onChange={(e) => setTier(Number(e.target.value) as 1 | 2 | 3)} className="w-full rounded-lg border px-3 py-2 text-sm">
            <option value={1}>Tier 1 — Metadata only</option>
            <option value={2}>Tier 2 — Gateway proxied</option>
            <option value={3}>Tier 3 — Gateway native</option>
          </select>
          <button type="button" onClick={submit} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Submit proposal</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <h3 className="font-semibold flex items-center gap-2"><AIBadge label="AI-9" /> Similar APIs found</h3>
          {duplicates.map((d) => <p key={d.id} className="text-sm">{d.label} ({d.score}% — {d.reason})</p>)}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={confirmedDup} onChange={(e) => setConfirmedDup(e.target.checked)} /> I reviewed similar APIs and confirm a new API is needed</label>
          <button type="button" onClick={submit} disabled={!confirmedDup} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50">Confirm & Submit</button>
        </div>
      )}
    </div>
  );
}
