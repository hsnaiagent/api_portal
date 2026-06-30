import { Link, useParams } from 'react-router-dom';

import { usePortal } from '@/store/AppStore';

import { useNotify } from '@/hooks/useNotify';

import { LIFECYCLE_TRANSITIONS, LIFECYCLE_LABELS } from '@/config/lifecycle';

import { LifecycleBadge } from '@/components/shared/LifecycleBadge';

import { NotFound } from '@/components/shared/NotFound';

import { ROUTES } from '@/config/routes';

import type { LifecycleStatus } from '@/types';



export function LLMApiManageDetailPage() {

  const { id } = useParams<{ id: string }>();

  const { state, dispatch } = usePortal();

  const notify = useNotify();

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



  const transition = (next: LifecycleStatus) => {

    if (!window.confirm(`Move "${api.name}" to ${LIFECYCLE_LABELS[next]}?`)) return;

    dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: next } } });

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

  };



  return (

    <div className="space-y-6 max-w-2xl">

      <Link to={ROUTES.llmAdmin.myApis} className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline">← Back to My LLM APIs</Link>

      <h1 className="text-2xl font-bold">{api.name}</h1>

      <LifecycleBadge status={api.lifecycle_status} />

      <p className="text-slate-600">{api.description}</p>

      {canTransition && transitions && (

        <div className="rounded-xl border bg-brand-white p-4 space-y-2">

          <h3 className="font-semibold text-sm">Lifecycle actions</h3>

          {transitions.next.map((next) => (

            <button

              key={next}

              type="button"

              onClick={() => transition(next)}

              className="block w-full text-left rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"

            >

              Move to {LIFECYCLE_LABELS[next]}

            </button>

          ))}

        </div>

      )}

    </div>

  );

}


