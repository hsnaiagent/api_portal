import { AI_CONFIG, type AIAgentId } from '@/config/ai';
import { AI_RESPONSES, hashInput } from '@/data/ai-responses';
import { callLiveAgent, isGeminiConfigured } from '@/lib/gemini';
import type { AIResponse } from '@/types';
import { delay } from '@/lib/utils';

const LIVE_AGENTS = new Set<AIAgentId>([
  'AI_1_ApplicationPlanner',
  'AI_3_PurposeHelper',
  'AI_5_ContextualSDK',
  'AI_9_DuplicationDetector',
  'AI_10_SpecQualityChecker',
  'AI_11_WorkflowSuggester',
  'AI_12_AuditAnomalyAlerts',
  'AI_13_CatalogHealthSummary',
  'AI_14_PortalAssistant',
]);

const PRECOMPUTE_AT_REGISTRATION = new Set<AIAgentId>([
  'AI_6_DescriptionGenerator',
  'AI_7_TagSuggester',
  'AI_8_ClassificationAdvisor',
]);

/** Agents replaced by stored search_index — handled at call sites, not via LLM. */
const RULE_BASED_AGENTS = new Set<AIAgentId>([
  'AI_2_SemanticSearch',
  'AI_4_Recommendations',
  'AI_15_NaturalLanguageSearch',
]);

export async function getAIResponse(agentId: AIAgentId, input: object = {}): Promise<AIResponse | null> {
  if (!AI_CONFIG.enabled || !AI_CONFIG.agents[agentId]) return null;

  if (RULE_BASED_AGENTS.has(agentId)) {
    return null;
  }

  if (isGeminiConfigured() && (LIVE_AGENTS.has(agentId) || PRECOMPUTE_AT_REGISTRATION.has(agentId))) {
    const live = await callLiveAgent(agentId, input as Record<string, unknown>);
    if (live) return live;
  }

  await delay(AI_CONFIG.responseDelayMs);
  const key = hashInput(input);
  const map = AI_RESPONSES[agentId];
  return map[key] ?? map.default ?? null;
}
