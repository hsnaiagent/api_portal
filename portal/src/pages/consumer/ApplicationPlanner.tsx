import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { ApiCard } from '@/components/shared/ApiCard';
import { SDKPanel } from '@/components/sdk/SDKPanel';
import { useNotify } from '@/hooks/useNotify';
import { ROUTES } from '@/config/routes';
import { buildUserSubscriptionMap } from '@/lib/subscriptions';
import { getDomainName } from '@/data/domains';
import type { Subscription } from '@/types';

export function ApplicationPlanner() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [description, setDescription] = useState(state.plannerDescription);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState<string>();
  const [bundle, setBundle] = useState<{ id: string; label: string; score?: number; reason?: string }[]>([]);
  const [selected, setSelected] = useState<string[]>(state.plannerSelectedApiIds);
  const [previewApiId, setPreviewApiId] = useState<string | null>(null);

  const subMap = useMemo(
    () => buildUserSubscriptionMap(state.subscriptions, state.currentUser?.user_id),
    [state.subscriptions, state.currentUser?.user_id],
  );

  const analyze = async () => {
    setLoading(true);
    setAiText(undefined);
    setBundle([]);
    dispatch({ type: 'SET_PLANNER', payload: { description } });
    const res = await getAIResponse('AI_1_ApplicationPlanner', { description });
    setAiText(res?.text);
    setBundle(res?.items ?? []);
    setLoading(false);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      dispatch({ type: 'SET_PLANNER_SELECTION', payload: next });
      return next;
    });
  };

  const requestBundle = () => {
    const app = state.applications.find((a) => a.owner_user_id === state.currentUser?.user_id);
    if (!app) return;
    selected.forEach((apiId) => {
      const api = state.apis.find((a) => a.api_id === apiId)!;
      const sub: Subscription = {
        subscription_id: `sub_plan_${apiId}_${Date.now()}`,
        api_id: apiId,
        application_id: app.application_id,
        requested_by_user_id: state.currentUser!.user_id,
        purpose: description,
        min_api_version: api.version,
        status: api.classification === 'public' ? 'active' : 'workflow_in_progress',
        provider_status: 'pending',
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: sub });
    });
    dispatch({ type: 'UPDATE_APPLICATION', payload: { application_id: app.application_id, patch: { application_description: description } } });
    notify('Bundle requested', `${selected.length} subscription requests submitted`, 'success');
  };

  const previewApi = state.apis.find((a) => a.api_id === previewApiId);
  const app = state.applications.find((a) => a.owner_user_id === state.currentUser?.user_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-brand-blue" />
        <h1 className="text-2xl font-bold">AI Application Planner</h1>
      </div>
      <p className="text-slate-600">Describe what you want to build. AI maps your description to relevant APIs from the catalog.</p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        placeholder="e.g. An HR leadership dashboard showing monthly salary statistics, headcount trends, and org structure for workforce planning..."
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
      />
      <button type="button" onClick={analyze} disabled={!description.trim() || loading} className="rounded-lg bg-brand-blue px-6 py-2.5 text-brand-white font-medium hover:bg-brand-blue-dark disabled:opacity-50">
        Find APIs for my application
      </button>

      <AIThinkingOverlay loading={loading} text={!loading ? aiText : undefined} />

      {bundle.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Proposed API Bundle</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {bundle.map((item) => {
              const api = state.apis.find((a) => a.api_id === item.id);
              if (!api) return null;
              return (
                <ApiCard
                  key={item.id}
                  api={api}
                  subscription={subMap.get(api.api_id) ?? null}
                  domainName={getDomainName(api.domain_id)}
                  score={item.score}
                  reason={item.reason}
                  selectable
                  selected={selected.includes(item.id)}
                  onSelect={toggle}
                />
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={requestBundle} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white font-medium">
                Request access to {selected.length} APIs
              </button>
              <button type="button" onClick={() => setPreviewApiId(selected[0])} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
                Preview SDK for first selected
              </button>
            </div>
          )}
        </>
      )}

      {previewApi && (
        <div className="rounded-xl border border-slate-200 bg-brand-white p-6">
          <h3 className="font-semibold mb-4">SDK Preview: {previewApi.name}</h3>
          <SDKPanel api={previewApi} application={{ ...app!, application_description: description }} />
        </div>
      )}

      <Link to={ROUTES.consumer.subscriptions} className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline">View subscription status →</Link>
    </div>
  );
}
