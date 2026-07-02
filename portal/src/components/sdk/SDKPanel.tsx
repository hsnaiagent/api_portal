import { useEffect, useState } from 'react';
import type { API, PrecomputedSdkLanguage, SDKLanguage } from '@/types';
import {
  generateSdkForLanguage,
  isPrecomputedLanguage,
} from '@/lib/sdk-api';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { CodeBlock } from './CodeBlock';

const languages: { id: SDKLanguage; label: string; prism: string; precomputed: boolean }[] = [
  { id: 'curl', label: 'cURL', prism: 'bash', precomputed: true },
  { id: 'python', label: 'Python', prism: 'python', precomputed: true },
  { id: 'nodejs', label: 'Node.js', prism: 'javascript', precomputed: true },
  { id: 'javascript', label: 'JavaScript', prism: 'javascript', precomputed: false },
  { id: 'typescript', label: 'TypeScript', prism: 'typescript', precomputed: false },
  { id: 'java', label: 'Java', prism: 'java', precomputed: false },
  { id: 'go', label: 'Go', prism: 'go', precomputed: false },
];

function getPrecomputedCode(api: API, lang: PrecomputedSdkLanguage): string | null {
  return api.sdk_artifacts?.[lang] ?? null;
}

export function SDKPanel({
  api,
  credentialClientId,
}: {
  api: API;
  application?: { application_description?: string };
  credentialClientId?: string;
}) {
  const [lang, setLang] = useState<SDKLanguage>('python');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [source, setSource] = useState<'precomputed' | 'ondemand' | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (isPrecomputedLanguage(lang)) {
      const stored = getPrecomputedCode(api, lang);
      if (stored) {
        setCode(stored);
        setSource('precomputed');
        setLoading(false);
        return () => {
          cancelled = true;
        };
      }
    }

    if (!api.openapi_spec_content) {
      setCode('# OpenAPI spec not available for this API.');
      setSource(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    void generateSdkForLanguage(api.openapi_spec_content, lang, api.name).then((result) => {
      if (cancelled) return;
      setCode(result.code);
      setSource('ondemand');
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [api, lang]);

  const prismLang = languages.find((l) => l.id === lang)?.prism ?? 'text';
  const langMeta = languages.find((l) => l.id === lang);
  const displayCode = code.replace(
    'YOUR_TOKEN',
    credentialClientId ? `${credentialClientId}_secret` : 'YOUR_TOKEN',
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">SDK & Code</h3>
          {source === 'precomputed' && (
            <span className="rounded-full bg-brand-green/10 text-brand-green px-2 py-0.5 text-xs font-medium">
              Pre-computed
            </span>
          )}
          {source === 'ondemand' && (
            <span className="rounded-full bg-brand-blue-light text-brand-blue-dark px-2 py-0.5 text-xs font-medium flex items-center gap-1">
              <AIBadge label="AI-5" /> Generated on demand
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {languages.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium ${lang === l.id ? 'bg-brand-green text-brand-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      {langMeta && !langMeta.precomputed && (
        <p className="text-xs text-slate-500">
          {langMeta.label} is generated on demand from the stored OpenAPI schema.
        </p>
      )}
      <AIThinkingOverlay loading={loading} />
      {!loading && displayCode && <CodeBlock code={displayCode} language={prismLang} />}
      {!loading && displayCode && (
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([displayCode], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${api.slug}-${lang}.txt`;
            a.click();
          }}
          className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline"
        >
          Download snippet
        </button>
      )}
    </div>
  );
}
