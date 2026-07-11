import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { usePortal } from '@/store/AppStore';
import { useNotify } from '@/hooks/useNotify';
import { LIFECYCLE_TRANSITIONS, LIFECYCLE_LABELS } from '@/config/lifecycle';
import { LifecycleBadge } from '@/components/shared/LifecycleBadge';
import { NotFound } from '@/components/shared/NotFound';
import { ROUTES } from '@/config/routes';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { LifecycleStatus } from '@/types';

export function LLMApiManageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [pendingTransition, setPendingTransition] = useState<LifecycleStatus | null>(null);

  const api = state.apis.find((a) => a.api_id === id && a.domain_id === 'dom_ai');
  const role = state.activeRole;

  if (!api)
    return (
      <NotFound
        title="LLM API not found"
        message="This LLM API does not exist or is not part of the AI Platform domain."
        to={ROUTES.llmAdmin.myApis}
        actionLabel="Back to My LLM APIs"
      />
    );

  const transitions = LIFECYCLE_TRANSITIONS[api.lifecycle_status];
  const canTransition = transitions?.allowedRoles.includes(role ?? 'developer');

  const confirmTransition = () => {
    if (!pendingTransition) return;
    const next = pendingTransition;
    dispatch({
      type: 'UPDATE_API',
      payload: { api_id: api.api_id, patch: { lifecycle_status: next } },
    });

    if (state.currentUser) {
      dispatch({
        type: 'ADD_AUDIT',
        payload: {
          audit_id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor_user_id: state.currentUser.user_id,
          actor_type: 'user',
          action: 'api.lifecycle.changed',
          entity_type: 'api',
          entity_id: api.api_id,
          payload: { from: api.lifecycle_status, to: next },
        },
      });
    }

    notify('Lifecycle updated', `${api.name} moved to ${LIFECYCLE_LABELS[next]}.`, 'success');
    setPendingTransition(null);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to={ROUTES.llmAdmin.myApis}
        className={buttonVariants({ variant: 'link', size: 'sm' })}
      >
        ← Back to My LLM APIs
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{api.name}</h1>
        <div className="mt-2">
          <LifecycleBadge status={api.lifecycle_status} />
        </div>
      </div>

      <p className="text-muted-foreground">{api.description}</p>

      {canTransition && transitions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lifecycle actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transitions.next.map((next) => (
              <Button
                key={next}
                type="button"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setPendingTransition(next)}
              >
                Move to {LIFECYCLE_LABELS[next]}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={pendingTransition !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTransition(null);
        }}
        title={`Move "${api.name}" to ${pendingTransition ? LIFECYCLE_LABELS[pendingTransition] : ''}?`}
        description="This lifecycle transition will be recorded in the audit log."
        confirmLabel="Confirm transition"
        onConfirm={confirmTransition}
      />
    </div>
  );
}
