import { useCallback, useEffect, useState } from 'react';

import type { PrecomputedSdkLanguage } from '@/types';
import { precomputeSdkArtifacts, type PrecomputedSdkResult } from '@/lib/sdk-api';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            SDK Review <AIBadge label="AI-16" />
          </CardTitle>
          {artifacts?.source && (
            <span className="text-xs text-muted-foreground">
              Generated via {artifacts.source === 'gemini' ? artifacts.model : 'fallback template'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Review the pre-generated cURL, Python, and Node.js snippets derived strictly from your
          OpenAPI schema. Approve before submitting your API proposal.
        </p>

        <Tabs
          value={tab}
          onValueChange={(v) => v && setTab(v as PrecomputedSdkLanguage)}
        >
          <TabsList className="h-auto flex-wrap gap-1 border-none bg-transparent p-0">
            {PRECOMPUTED_TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="rounded-lg px-3 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <AIThinkingOverlay loading={loading} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && code && <CodeBlock code={code} language={prismLang} />}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onBack} disabled={loading}>
            Back
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void runPrecompute()}
            disabled={loading}
          >
            Regenerate
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={loading || !artifacts || approved}
          >
            {approved ? 'Approved' : 'Approve & Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
