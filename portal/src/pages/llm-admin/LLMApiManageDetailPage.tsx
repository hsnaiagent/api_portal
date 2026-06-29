import { useState } from 'react';

import { useParams } from 'react-router-dom';

import { usePortal } from '@/store/AppStore';

import { LIFECYCLE_TRANSITIONS, LIFECYCLE_LABELS } from '@/config/lifecycle';

import { LifecycleBadge } from '@/components/shared/LifecycleBadge';

import type { LifecycleStatus } from '@/types';



export function LLMApiManageDetailPage() {

  const { id } = useParams<{ id: string }>();

  const { state, dispatch } = usePortal();

  const api = state.apis.find((a) => a.api_id === id && a.domain_id === 'dom_ai');

  const role = state.activeRole;



  if (!api) return <p>LLM API not found</p>;



  const transitions = LIFECYCLE_TRANSITIONS[api.lifecycle_status];

  const canTransition = transitions?.allowedRoles.includes(role ?? 'developer');



  const transition = (next: LifecycleStatus) => {

    dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: next } } });

  };



  return (

    <div className="space-y-6 max-w-2xl">

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


