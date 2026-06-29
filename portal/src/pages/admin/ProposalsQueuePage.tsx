import { useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { ClassificationBadge } from '@/components/shared/ClassificationBadge';
import { AIBadge } from '@/components/ai/AIBadge';

export function ProposalsQueuePage() {
  const { state, dispatch } = usePortal();
  const proposed = state.apis.filter((a) => a.lifecycle_status === 'proposed');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [workflowTip, setWorkflowTip] = useState<string>();

  const accept = async (apiId: string) => {
    dispatch({ type: 'UPDATE_API', payload: { api_id: apiId, patch: { lifecycle_status: 'under_review' } } });
  };

  const reject = (apiId: string) => {
    dispatch({ type: 'UPDATE_API', payload: { api_id: apiId, patch: { lifecycle_status: 'rejected' } } });
  };

  const showWorkflow = async (apiId: string) => {
    setExpanded(apiId);
    const api = state.apis.find((a) => a.api_id === apiId);
    const res = await getAIResponse('AI_11_WorkflowSuggester', { classification: api?.classification });
    setWorkflowTip(res?.text);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Proposals Queue</h1>
      {proposed.map((api) => (
        <div key={api.api_id} className="rounded-xl border bg-brand-white p-6 space-y-3">
          <div className="flex justify-between flex-wrap gap-2">
            <div><p className="font-semibold">{api.name}</p><p className="text-sm text-slate-600">{api.description}</p></div>
            <ClassificationBadge classification={api.classification} />
          </div>
          <button type="button" onClick={() => showWorkflow(api.api_id)} className="text-xs text-brand-blue"><AIBadge label="AI-11" /> Workflow suggestion</button>
          {expanded === api.api_id && workflowTip && <p className="text-sm bg-brand-blue-light p-3 rounded-lg">{workflowTip}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => accept(api.api_id)} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Accept for review</button>
            <button type="button" onClick={() => reject(api.api_id)} className="rounded-lg border text-red-600 px-4 py-2 text-sm">Reject</button>
          </div>
        </div>
      ))}
      {proposed.length === 0 && <p className="text-slate-500">No proposals pending</p>}
    </div>
  );
}
