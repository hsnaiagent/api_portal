import { AI_CONFIG, type AIAgentId } from '@/config/ai';
import { AI_RESPONSES, hashInput } from '@/data/ai-responses';
import type { AIResponse } from '@/types';
import { delay } from '@/lib/utils';

export async function getAIResponse(agentId: AIAgentId, input: object = {}): Promise<AIResponse | null> {
  if (!AI_CONFIG.enabled || !AI_CONFIG.agents[agentId]) return null;
  await delay(AI_CONFIG.responseDelayMs);
  const key = hashInput(input);
  const map = AI_RESPONSES[agentId];
  return map[key] ?? map.default ?? null;
}
