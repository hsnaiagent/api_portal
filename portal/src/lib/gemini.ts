import { AI_CONFIG, type AIAgentId } from '@/config/ai';
import type { AIResponse, ApiSearchIndex, Classification } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY?.trim());
}

interface GeminiGenerateContentResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { message?: string };
}

async function callGemini(prompt: string, jsonMode = true): Promise<string | null> {
  if (!isGeminiConfigured()) return null;

  const model = AI_CONFIG.geminiModel;
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
    }),
  });

  if (!response.ok) {
    console.warn('[gemini] request failed', response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  if (data.error?.message) {
    console.warn('[gemini]', data.error.message);
    return null;
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim()) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generateSearchIndex(
  apiName: string,
  description: string,
  existingApiIds: string[] = [],
): Promise<ApiSearchIndex | null> {
  const prompt = `You are building a search index for an enterprise API catalog.

API name: "${apiName}"
Description: "${description}"

Generate search terms that users might type to find this API. Categorize them into:
1. fluctuations — typos, hyphenations, casing variants, and alternate spellings of the exact API name
2. synonyms — alternative vocabulary for the API's function (e.g. "compensation" for "salary")
3. business_terms — department-specific jargon, acronyms, and industry terms related to this API
4. related_api_ids — pick 0-3 API IDs from this list that are commonly used alongside this API: ${existingApiIds.join(', ') || 'none available'}

Return ONLY valid JSON with this exact shape:
{
  "fluctuations": ["string"],
  "synonyms": ["string"],
  "business_terms": ["string"],
  "related_api_ids": ["string"]
}`;

  const text = await callGemini(prompt);
  if (!text) return null;

  const parsed = parseJson<{
    fluctuations?: string[];
    synonyms?: string[];
    business_terms?: string[];
    related_api_ids?: string[];
  }>(text);

  if (!parsed) return null;

  return {
    fluctuations: parsed.fluctuations ?? [],
    synonyms: parsed.synonyms ?? [],
    business_terms: parsed.business_terms ?? [],
    related_api_ids: (parsed.related_api_ids ?? []).filter((id) => existingApiIds.includes(id)),
    generated_at: new Date().toISOString(),
    model: AI_CONFIG.geminiModel,
  };
}

const LIVE_AGENT_PROMPTS: Partial<Record<AIAgentId, (input: Record<string, unknown>) => string>> = {
  AI_1_ApplicationPlanner: (input) =>
    `You are an API catalog planner. Given this application description, recommend matching APIs from an enterprise catalog.
Application description: ${JSON.stringify(input.description ?? '')}
Return JSON: { "text": "brief explanation", "items": [{ "id": "api_id", "label": "API name", "score": 0-100, "reason": "why" }] }`,

  AI_3_PurposeHelper: (input) =>
    `Draft a subscription purpose statement for an API access request.
Context: ${JSON.stringify(input)}
Return JSON: { "text": "purpose paragraph for audit trail" }`,

  AI_5_ContextualSDK: (input) =>
    `Generate a personalized SDK code snippet for this API consumer context.
Context: ${JSON.stringify(input)}
Return JSON: { "code": "python or curl snippet with comments" }`,

  AI_9_DuplicationDetector: (input) =>
    `Check if this new API proposal duplicates existing catalog APIs.
Proposal: ${JSON.stringify({ name: input.name, description: input.description, spec: input.spec })}
Existing APIs: ${JSON.stringify(input.existingApis ?? [])}
Return JSON: { "text": "summary", "items": [{ "id": "api_id", "label": "name", "score": 0-100, "reason": "overlap reason" }] }`,

  AI_10_SpecQualityChecker: (input) =>
    `Review this OpenAPI spec for quality.
Spec: ${JSON.stringify(input.spec ?? '')}
Return JSON: { "checklist": [{ "item": "check name", "passed": true/false }] }`,

  AI_11_WorkflowSuggester: (input) =>
    `Suggest an approval workflow template for this API proposal.
Context: ${JSON.stringify(input)}
Return JSON: { "text": "recommendation with template name and rationale" }`,

  AI_12_AuditAnomalyAlerts: (input) =>
    `Analyze this audit log for anomalies.
Log entries: ${JSON.stringify(input.auditLogs ?? input)}
Return JSON: { "text": "anomaly alert summary or null if none" }`,

  AI_13_CatalogHealthSummary: (input) =>
    `Summarize catalog health for an admin dashboard.
Catalog stats: ${JSON.stringify(input)}
Return JSON: { "text": "health summary paragraph" }`,

  AI_14_PortalAssistant: (input) =>
    `You are the API Portal assistant. Answer the user's question about the portal, APIs, subscriptions, and workflows.
Question: ${JSON.stringify(input.query ?? input)}
Return JSON: { "text": "helpful answer", "links": [{ "label": "link text", "path": "/route" }] }`,
};

const PRECOMPUTE_AGENT_PROMPTS: Partial<
  Record<AIAgentId, (input: Record<string, unknown>) => string>
> = {
  AI_6_DescriptionGenerator: (input) =>
    `Write a concise API description for an enterprise API catalog entry.
Name: ${JSON.stringify(input.name ?? '')}
Spec excerpt: ${JSON.stringify((input.spec as string)?.slice(0, 2000) ?? input.description ?? '')}
Return JSON: { "text": "2-3 sentence description" }`,

  AI_7_TagSuggester: (input) =>
    `Suggest lowercase tags for this API based on its name, description, and OpenAPI spec.
Input: ${JSON.stringify({ name: input.name, description: input.description, spec: (input.spec as string)?.slice(0, 1500) })}
Return JSON: { "tags": ["tag1", "tag2"] }`,

  AI_8_ClassificationAdvisor: (input) =>
    `Recommend a data classification for this API. Options: public, internal, confidential, restricted.
Input: ${JSON.stringify({ name: input.name, description: input.description, spec: (input.spec as string)?.slice(0, 1500) })}
Return JSON: { "classification": "public|internal|confidential|restricted", "text": "rationale" }`,
};

export async function callLiveAgent(
  agentId: AIAgentId,
  input: Record<string, unknown>,
): Promise<AIResponse | null> {
  const promptFn = LIVE_AGENT_PROMPTS[agentId] ?? PRECOMPUTE_AGENT_PROMPTS[agentId];
  if (!promptFn) return null;

  const text = await callGemini(promptFn(input));
  if (!text) return null;

  const parsed = parseJson<AIResponse & { classification?: Classification }>(text);
  if (!parsed) return null;

  return {
    text: parsed.text,
    items: parsed.items,
    classification: parsed.classification,
    tags: parsed.tags,
    checklist: parsed.checklist,
    code: parsed.code,
    links: parsed.links,
  };
}
