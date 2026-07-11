import { useEffect, useState } from 'react';

import type { API, PrecomputedSdkLanguage, SDKLanguage } from '@/types';
import {
  generateSdkForLanguage,
  isPrecomputedLanguage,
} from '@/lib/sdk-api';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">SDK & Code</h3>
          {source === 'precomputed' && <Badge variant="active">Pre-computed</Badge>}
          {source === 'ondemand' && (
            <Badge variant="info" className="gap-1">
              <AIBadge label="AI-5" /> Generated on demand
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={lang} onValueChange={(v) => v && setLang(v as SDKLanguage)}>
        <TabsList className="h-auto flex-wrap gap-1 border-none bg-transparent p-0">
          {languages.map((l) => (
            <TabsTrigger
              key={l.id}
              value={l.id}
              className="rounded-lg px-3 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {l.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {langMeta && !langMeta.precomputed && (
        <p className="text-xs text-muted-foreground">
          {langMeta.label} is generated on demand from the stored OpenAPI schema.
        </p>
      )}
      <AIThinkingOverlay loading={loading} />
      {!loading && displayCode && <CodeBlock code={displayCode} language={prismLang} />}
      {!loading && displayCode && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => {
            const blob = new Blob([displayCode], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${api.slug}-${lang}.txt`;
            a.click();
          }}
        >
          Download snippet
        </Button>
      )}
    </div>
  );
}
