import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { CatalogApiCard } from '@/components/catalog/api-card';
import { SDKPanel } from '@/components/sdk/SDKPanel';
import { useNotify } from '@/hooks/useNotify';
import { ROUTES } from '@/config/routes';
import {
  buildPlannerCatalog,
  normalizePlannerItems,
  suggestPlannerBundleFromDescription,
} from '@/lib/planner';
import { buildUserSubscriptionMap } from '@/lib/subscriptions';
import { getDomainName } from '@/data/domains';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Subscription } from '@/types';

export function ApplicationPlanner() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [description, setDescription] = useState(state.plannerDescription);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState<string>();
  const [bundle, setBundle] = useState<
    { id: string; label: string; score?: number; reason?: string }[]
  >([]);
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
    try {
      const res = await getAIResponse('AI_1_ApplicationPlanner', {
        description,
        availableApis: buildPlannerCatalog(state.apis),
      });
      setAiText(res?.text);

      let items = normalizePlannerItems(res, state.apis);
      if (!items.length && description.trim()) {
        items = suggestPlannerBundleFromDescription(description, state.apis);
        if (items.length && res?.text) {
          setAiText(
            `${res.text} (Bundle filled from catalog search because no valid API IDs were returned.)`,
          );
        }
      }

      setBundle(items);
      if (!items.length) {
        notify(
          'No matches found',
          'The planner could not map your description to catalog APIs. Try adding more detail.',
          'warning',
        );
      }
    } catch {
      notify('Planner failed', 'Could not analyze your description. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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
    if (!app) {
      notify(
        'No application found',
        'Create an application before requesting API access.',
        'warning',
      );
      return;
    }
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
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: {
        application_id: app.application_id,
        patch: { application_description: description },
      },
    });
    notify('Bundle requested', `${selected.length} subscription requests submitted`, 'success');
  };

  const previewApi = state.apis.find((a) => a.api_id === previewApiId);
  const app = state.applications.find((a) => a.owner_user_id === state.currentUser?.user_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-6 text-link" />
        <h1 className="text-2xl font-bold text-foreground">AI Application Planner</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Describe what you want to build. AI maps your description to relevant APIs from the catalog.
      </p>

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        placeholder="e.g. An HR leadership dashboard showing monthly salary statistics, headcount trends, and org structure for workforce planning..."
      />
      <Button
        type="button"
        onClick={analyze}
        disabled={!description.trim() || loading}
        loading={loading}
      >
        Find APIs for my application
      </Button>

      <AIThinkingOverlay loading={loading} text={!loading ? aiText : undefined} />

      {bundle.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-foreground">Proposed API Bundle</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {bundle.map((item) => {
              const api = state.apis.find((a) => a.api_id === item.id);
              if (!api) return null;
              return (
                <CatalogApiCard
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
              <Button type="button" onClick={requestBundle}>
                Request access to {selected.length} APIs
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPreviewApiId(selected[0])}
              >
                Preview SDK for first selected
              </Button>
            </div>
          )}
        </>
      )}

      {previewApi && app && (
        <Card>
          <CardHeader>
            <CardTitle>SDK Preview: {previewApi.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <SDKPanel
              api={previewApi}
              application={{ ...app, application_description: description }}
            />
          </CardContent>
        </Card>
      )}

      <Link
        to={ROUTES.consumer.subscriptions}
        className={buttonVariants({ variant: 'link', size: 'sm' })}
      >
        View subscription status →
      </Link>
    </div>
  );
}
