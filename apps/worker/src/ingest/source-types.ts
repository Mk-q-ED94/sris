export interface SourceTypeConfig {
  default_resource_type: string;
  default_check_frequency: string;
  default_priority: string;
  default_confidence: string;
}

export const SOURCE_TYPE_CONFIGS: Record<string, SourceTypeConfig> = {
  official:       { default_resource_type: "official_page",      default_check_frequency: "weekly",  default_priority: "critical", default_confidence: "official" },
  webpage:        { default_resource_type: "program_page",       default_check_frequency: "weekly",  default_priority: "high",     default_confidence: "high" },
  program_page:   { default_resource_type: "program_page",      default_check_frequency: "weekly",  default_priority: "high",     default_confidence: "high" },
  admission:      { default_resource_type: "admission_notice",  default_check_frequency: "daily",   default_priority: "critical", default_confidence: "official" },
  professor_page: { default_resource_type: "professor_page",    default_check_frequency: "weekly",  default_priority: "high",     default_confidence: "high" },
  lab_page:       { default_resource_type: "lab_page",          default_check_frequency: "weekly",  default_priority: "high",     default_confidence: "high" },
  forum:          { default_resource_type: "experience_post",   default_check_frequency: "weekly",  default_priority: "normal",   default_confidence: "low" },
  video:          { default_resource_type: "video",             default_check_frequency: "monthly", default_priority: "low",      default_confidence: "medium" },
  arxiv:          { default_resource_type: "paper",             default_check_frequency: "daily",   default_priority: "normal",   default_confidence: "high" },
  scholar:        { default_resource_type: "paper",             default_check_frequency: "weekly",  default_priority: "normal",   default_confidence: "high" },
  conference:     { default_resource_type: "other",             default_check_frequency: "weekly",  default_priority: "normal",   default_confidence: "medium" },
  calendar:       { default_resource_type: "other",             default_check_frequency: "daily",   default_priority: "normal",   default_confidence: "medium" },
  other:          { default_resource_type: "other",             default_check_frequency: "weekly",  default_priority: "low",      default_confidence: "unverified" },
};

export function getSourceTypeConfig(sourceType: string): SourceTypeConfig {
  return SOURCE_TYPE_CONFIGS[sourceType] ?? SOURCE_TYPE_CONFIGS["other"]!;
}

export const SOURCE_TYPE_KEYS = Object.keys(SOURCE_TYPE_CONFIGS);
