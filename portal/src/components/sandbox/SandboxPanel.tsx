import { useState } from 'react';
import type { API, Application } from '@/types';
import { CLASSIFICATIONS } from '@/config/classification';
import { Play } from 'lucide-react';
import { CodeBlock } from '@/components/sdk/CodeBlock';

export function SandboxPanel({
  api,
  application,
  hasActiveSubscription,
}: {
  api: API;
  application?: Application;
  hasActiveSubscription: boolean;
}) {
  const [mode, setMode] = useState<'demo' | 'credentials'>(
    hasActiveSubscription ? 'credentials' : 'demo',
  );
  const [endpointIdx, setEndpointIdx] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const restricted = api.classification === 'restricted';
  const confidential = api.classification === 'confidential';
  const ep = api.endpoints[endpointIdx];

  const contextualBody = application?.application_description
    ? JSON.stringify(
        { context: 'leadership_dashboard', month: '2026-06', note: 'From application description' },
        null,
        2,
      )
    : JSON.stringify({ limit: 10 }, null, 2);

  const run = () => {
    setLoading(true);
    setTimeout(() => {
      let example = ep.responseExample ?? { ok: true };
      if (confidential && mode === 'demo') {
        example = {
          items: [{ id: '***', department: 'HR', salary_band: 'REDACTED' }],
          masked: true,
        };
      }
      setResponse(JSON.stringify(example, null, 2));
      setLoading(false);
    }, 800);
  };

  if (restricted && !hasActiveSubscription) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-medium">Pre-subscription sandbox unavailable</p>
        <p className="text-sm text-red-600 mt-2">
          Restricted APIs require an invitation before any interaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('demo')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'demo' ? 'bg-brand-green text-brand-white' : 'bg-slate-100'}`}
        >
          Try with demo data
        </button>
        {hasActiveSubscription && (
          <button
            type="button"
            onClick={() => setMode('credentials')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'credentials' ? 'bg-brand-green text-brand-white' : 'bg-slate-100'}`}
          >
            Test with my credentials
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500">{CLASSIFICATIONS[api.classification].handling}</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-brand-white p-4">
          <label className="text-sm font-medium">Endpoint</label>
          <select
            value={endpointIdx}
            onChange={(e) => setEndpointIdx(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {api.endpoints.map((e, i) => (
              <option key={i} value={i}>
                {e.method} {e.path}
              </option>
            ))}
          </select>
          <div>
            <label className="text-sm font-medium">Request body (JSON)</label>
            <textarea
              defaultValue={contextualBody}
              rows={6}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-brand-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            <Play className="h-4 w-4" /> {loading ? 'Sending...' : 'Send Request'}
          </button>
          <p className="text-xs text-slate-400">
            Auth: {mode === 'demo' ? 'Demo credentials (platform-managed)' : 'OAuth2 bearer token'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-brand-white p-4">
          <p className="text-sm font-medium mb-2">Response</p>
          {response ? (
            <CodeBlock code={response} language="json" />
          ) : (
            <p className="text-sm text-slate-400">Run a request to see the response</p>
          )}
        </div>
      </div>
    </div>
  );
}
