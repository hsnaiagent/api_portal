import { useCallback, useEffect, useState } from 'react';
import type { PrecomputedSdkLanguage } from '@/types';
import { precomputeSdkArtifacts, type PrecomputedSdkResult } from '@/lib/sdk-api';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { CodeBlock } from './CodeBlock';

const PRECOMPUTED_TABS: { id: PrecomputedSdkLanguage; label: string; prism: string }[] = [
  { id: 'curl', label: 'cURL', prism: 'bash' },
  { id: 'python', label: 'Python', prism: 'python' },
  { id: 'nodejs', label: 'Node.js', prism: 'javascript' },
];

export function SdkReviewStep({
  openapiSpecContent,
  apiName,
  approved,
  onApproved,
  onBack,
}: {
  openapiSpecContent: Record<string, unknown>;
  apiName: string;
  approved: boolean;
  onApproved: (artifacts: PrecomputedSdkResult) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<PrecomputedSdkLanguage>('python');
  const [loading, setLoading] = useState(false);
  const [artifacts, setArtifacts] = useState<PrecomputedSdkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPrecompute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await precomputeSdkArtifacts(openapiSpecContent, apiName);
      setArtifacts(result);
    } catch {
      setError('SDK pre-generation failed. Try again or check your OpenAPI spec.');
    } finally {
      setLoading(false);
    }
  }, [openapiSpecContent, apiName]);

  useEffect(() => {
    void runPrecompute();
  }, [runPrecompute]);

  const handleApprove = () => {
    if (!artifacts) return;
    onApproved(artifacts);
  };

  const code = artifacts?.[tab] ?? '';
  const prismLang = PRECOMPUTED_TABS.find((t) => t.id === tab)?.prism ?? 'text';

  return (
    <div className="space-y-4 rounded-xl border bg-brand-white p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          SDK Review <AIBadge label="AI-16" />
        </h3>
        {artifacts?.source && (
          <span className="text-xs text-slate-500">
            Generated via {artifacts.source === 'gemini' ? artifacts.model : 'fallback template'}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600">
        Review the pre-generated cURL, Python, and Node.js snippets derived strictly from your
        OpenAPI schema. Approve before submitting your API proposal.
      </p>

      <div className="flex flex-wrap gap-1">
        {PRECOMPUTED_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1 text-xs font-medium ${tab === t.id ? 'bg-brand-green text-brand-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AIThinkingOverlay loading={loading} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && code && <CodeBlock code={code} language={prismLang} />}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void runPrecompute()}
          disabled={loading}
          className="rounded-lg border border-brand-blue px-4 py-2 text-sm text-brand-blue disabled:opacity-50"
        >
          Regenerate
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading || !artifacts || approved}
          className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
        >
          {approved ? 'Approved' : 'Approve & Continue'}
        </button>
      </div>
    </div>
  );
}
