import { useEffect, useState } from 'react';
import type { API, Application, SDKLanguage } from '@/types';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { CodeBlock } from './CodeBlock';

const languages: { id: SDKLanguage; label: string; prism: string }[] = [
  { id: 'curl', label: 'cURL', prism: 'bash' },
  { id: 'python', label: 'Python', prism: 'python' },
  { id: 'javascript', label: 'JavaScript', prism: 'javascript' },
  { id: 'typescript', label: 'TypeScript', prism: 'typescript' },
  { id: 'java', label: 'Java', prism: 'java' },
  { id: 'go', label: 'Go', prism: 'go' },
];

function genericSnippet(api: API, lang: SDKLanguage, clientId: string) {
  const ep = api.endpoints[0];
  const url = `https://api.internal${ep.path}`;
  switch (lang) {
    case 'curl':
      return `curl -X ${ep.method} "${url}" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json"`;
    case 'python':
      return `import requests\n\nresponse = requests.${ep.method.toLowerCase()}(\n    "${url}",\n    headers={"Authorization": "Bearer YOUR_TOKEN"},\n)\nresponse.raise_for_status()\nprint(response.json())`;
    case 'javascript':
    case 'typescript':
      return `const response = await fetch("${url}", {\n  method: "${ep.method}",\n  headers: { Authorization: "Bearer YOUR_TOKEN" },\n});\nconst data = await response.json();`;
    case 'java':
      return `HttpRequest request = HttpRequest.newBuilder()\n  .uri(URI.create("${url}"))\n  .header("Authorization", "Bearer YOUR_TOKEN")\n  .${ep.method === 'GET' ? 'GET' : 'method("' + ep.method + '", HttpRequest.BodyPublishers.noBody())'}()\n  .build();`;
    case 'go':
      return `req, _ := http.NewRequest("${ep.method}", "${url}", nil)\nreq.Header.Set("Authorization", "Bearer YOUR_TOKEN")\nresp, err := client.Do(req)`;
    default:
      return '';
  }
}

export function SDKPanel({
  api,
  application,
  credentialClientId,
}: {
  api: API;
  application?: Application;
  credentialClientId?: string;
}) {
  const [lang, setLang] = useState<SDKLanguage>('python');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (application?.application_description) {
        const res = await getAIResponse('AI_5_ContextualSDK', {
          description: application.application_description,
          api_id: api.api_id,
          language: lang,
        });
        if (!cancelled)
          setCode(res?.code ?? genericSnippet(api, lang, credentialClientId ?? 'YOUR_CLIENT_ID'));
      } else {
        setCode(genericSnippet(api, lang, credentialClientId ?? 'YOUR_CLIENT_ID'));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [api, application, lang, credentialClientId]);

  const prismLang = languages.find((l) => l.id === lang)?.prism ?? 'text';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">SDK & Code</h3>
          {application?.application_description && <AIBadge label="AI-5 Personalized" />}
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
      {application?.application_description && (
        <p className="text-xs text-slate-500">
          Using application context: &quot;{application.application_description.slice(0, 80)}
          ...&quot;
        </p>
      )}
      <AIThinkingOverlay loading={loading} />
      {!loading && code && (
        <CodeBlock
          code={code.replace(
            'YOUR_TOKEN',
            credentialClientId ? `${credentialClientId}_secret` : 'YOUR_TOKEN',
          )}
          language={prismLang}
        />
      )}
      <button
        type="button"
        onClick={() => {
          const blob = new Blob([code], { type: 'text/plain' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${api.slug}-${lang}.txt`;
          a.click();
        }}
        className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline"
      >
        Download snippet
      </button>
    </div>
  );
}
