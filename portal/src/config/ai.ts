export type AIAgentId =
  | 'AI_1_ApplicationPlanner'
  | 'AI_2_SemanticSearch'
  | 'AI_3_PurposeHelper'
  | 'AI_4_Recommendations'
  | 'AI_5_ContextualSDK'
  | 'AI_6_DescriptionGenerator'
  | 'AI_7_TagSuggester'
  | 'AI_8_ClassificationAdvisor'
  | 'AI_9_DuplicationDetector'
  | 'AI_10_SpecQualityChecker'
  | 'AI_11_WorkflowSuggester'
  | 'AI_12_AuditAnomalyAlerts'
  | 'AI_13_CatalogHealthSummary'
  | 'AI_14_PortalAssistant'
  | 'AI_15_NaturalLanguageSearch';

export const AI_CONFIG = {
  enabled: true,
  responseDelayMs: 1200,
  typewriterSpeedMs: 18,
  agents: {
    AI_1_ApplicationPlanner: true,
    AI_2_SemanticSearch: true,
    AI_3_PurposeHelper: true,
    AI_4_Recommendations: true,
    AI_5_ContextualSDK: true,
    AI_6_DescriptionGenerator: true,
    AI_7_TagSuggester: true,
    AI_8_ClassificationAdvisor: true,
    AI_9_DuplicationDetector: true,
    AI_10_SpecQualityChecker: true,
    AI_11_WorkflowSuggester: true,
    AI_12_AuditAnomalyAlerts: true,
    AI_13_CatalogHealthSummary: true,
    AI_14_PortalAssistant: true,
    AI_15_NaturalLanguageSearch: true,
  } satisfies Record<AIAgentId, boolean>,
} as const;
