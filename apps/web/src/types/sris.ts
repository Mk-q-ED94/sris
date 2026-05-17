export type Counts = Record<
  "universities" | "programs" | "professors" | "labs" | "papers" | "pending_candidates" | "timeline_tasks",
  number
>;

export type ResourceType =
  | "official_page"
  | "program_page"
  | "professor_page"
  | "lab_page"
  | "admission_notice"
  | "paper"
  | "experience_post"
  | "video"
  | "other";

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  venue?: string | null;
  year?: number | null;
  url: string;
  source?: string | null;
  published_at?: string | null;
  keywords: string[];
  abstract?: string | null;
  ai_status?: string | null;
};

export type IntelligenceCandidate = {
  id: string;
  source?: string | null;
  resource_type: ResourceType;
  title: string;
  authors: string[];
  abstract?: string | null;
  url: string;
  published_at?: string | null;
  matched_keywords: string[];
  status: string;
  university_id?: string | null;
  program_id?: string | null;
  professor_id?: string | null;
  relevance_note?: string | null;
  decision_impact?: string | null;
  confidence?: string | null;
  evidence_type?: string | null;
  domain_source?: string | null;
  ignore_reason?: string | null;
  content_text?: string | null;
  excerpt?: string | null;
  raw_snapshot?: string | null;
  snapshot_at?: string | null;
};

export type PaperCandidate = IntelligenceCandidate;

export type TimelineTask = {
  id: string;
  title: string;
  deadline?: string | null;
  priority: string;
  status: string;
  task_type?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CoverageItem = {
  label_key: string;
  value: number;
  target: number;
  tone: "strong" | "medium" | "weak";
};

export type GapItem = {
  label_key: string;
  priority: "high" | "medium" | "low";
  university_id?: string;
  university_name?: string;
  action_id?: string | null;
  action_status?: "open" | "in_progress" | "resolved" | "ignored" | null;
  resolved_by?: string | null;
};

export type TodayBriefing = {
  new_captures: number;
  high_priority_gaps: number;
  stale_sources: number;
  pending_review: number;
};

export type UniversityStat = {
  id: string;
  resource_count: number;
  gap_count: number;
  latest_update: string | null;
};

export type DashboardSummary = {
  counts: Counts;
  recent_papers: Paper[];
  pending_candidates: IntelligenceCandidate[];
  upcoming_tasks: TimelineTask[];
  recent_updates: Array<{ label: string; value: string }>;
  coverage: CoverageItem[];
  gaps: GapItem[];
  resource_type_counts: Record<string, number>;
  stale_sources: Array<{ id: string; name: string; source_type: string; university_id?: string | null; last_run_at?: string | null; patrol_status?: string | null; last_checked_at?: string | null }>;
  today_briefing: TodayBriefing;
  university_stats: UniversityStat[];
  conflict_counts: { open: number; resolved: number; stale_unverified: number };
  recent_conflicts: Conflict[];
};

export type SearchHit = {
  type: "university" | "program" | "professor" | "lab" | "paper" | "candidate" | "task" | "resource";
  id: string;
  title: string;
  subtitle: string | null;
  hint: string | null;
};

export type SearchResponse = {
  query: string;
  hits: SearchHit[];
};

export type University = {
  id: string;
  name: string;
  location?: string | null;
  website?: string | null;
  tuition?: number | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Professor = {
  id: string;
  university_id: string;
  name: string;
  title?: string | null;
  email?: string | null;
  website?: string | null;
  research_keywords: string[];
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Lab = {
  id: string;
  university_id: string;
  professor_id?: string | null;
  lab_name: string;
  research_keywords: string[];
  website?: string | null;
  recent_papers: string[];
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Program = {
  id: string;
  university_id: string;
  program_name: string;
  degree?: string | null;
  language?: string | null;
  deadline?: string | null;
  requirements?: string | null;
  scholarship?: string | null;
  tuition?: number | null;
  website?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type IntelligenceResource = {
  id: string;
  candidate_id?: string | null;
  title: string;
  url: string;
  resource_type: ResourceType;
  source?: string | null;
  university_id?: string | null;
  program_id?: string | null;
  professor_id?: string | null;
  lab_id?: string | null;
  confidence?: string | null;
  decision_impact?: string | null;
  relevance_note?: string | null;
  domain_source?: string | null;
  content_text?: string | null;
  excerpt?: string | null;
  raw_snapshot?: string | null;
  snapshot_at?: string | null;
  resource_status?: "unverified" | "verified" | "stale" | "core_evidence" | null;
  confidence_score?: number | null;
  confidence_last_verified?: string | null;
  // AI extraction fields (populated by /api/resources/:id/extract)
  extracted_facts?: ExtractedProgramFields | ExtractedProfessorFields | ExtractedProgramPageFields | ExtractedLabFields | null;
  extraction_status?: "pending" | "running" | "succeeded" | "failed" | null;
  extracted_at?: string | null;
  extraction_model?: string | null;
  extraction_error?: string | null;
  extraction_input_tokens?: number | null;
  extraction_output_tokens?: number | null;
  extraction_cache_read_tokens?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ExtractedProgramFields = {
  program_name: string;
  graduate_school: string | null;
  department: string | null;
  degree: string | null;
  language: string | null;
  intake_months: string[];
  cycles: Array<{
    cycle_name: string;
    application_open: string | null;
    application_close: string | null;
    consent_letter_deadline: string | null;
    exam_period: string | null;
    result_announcement: string | null;
    enrollment_date: string | null;
  }>;
  english_test: {
    type: string | null;
    minimum_score: number | null;
    notes: string | null;
  };
  japanese_test: {
    required: boolean;
    type: string | null;
    minimum_level: string | null;
  };
  documents_required: string[];
  supervisor_consent_required: boolean;
  exam_fee_jpy: number | null;
  tuition_per_year_jpy: number | null;
  quota: number | null;
  mext_eligible: boolean;
  scholarships: string[];
  notes: string;
  extraction_confidence: number;
  unresolved_questions: string[];
};

export type ExtractedProfessorFields = {
  full_name: string;
  title: string | null;
  affiliation: string | null;
  department: string | null;
  email: string | null;
  research_interests: string[];
  bio_snippet: string | null;
  recent_publications: Array<{ title: string; year: number | null; venue: string | null }>;
  lab_name: string | null;
  open_positions: boolean;
  contact_notes: string | null;
  extraction_confidence: number;
  unresolved_questions: string[];
};

export type ExtractedProgramPageFields = {
  program_name: string;
  degree: string | null;
  language: string | null;
  application_periods: Array<{ label: string; open: string | null; close: string | null }>;
  requirements: string[];
  quota: number | null;
  tuition_per_year_jpy: number | null;
  application_fee_jpy: number | null;
  mext_eligible: boolean;
  scholarships: string[];
  supervisor_consent_required: boolean;
  contact_email: string | null;
  notes: string;
  extraction_confidence: number;
  unresolved_questions: string[];
};

export type ExtractedLabFields = {
  lab_name: string;
  pi_name: string | null;
  university: string | null;
  department: string | null;
  research_themes: string[];
  tools_methods: string[];
  recent_publications: Array<{ title: string; year: number | null; venue: string | null }>;
  open_positions: boolean;
  contact_email: string | null;
  notes: string;
  extraction_confidence: number;
  unresolved_questions: string[];
};

export type ExtractionResult = {
  id: string;
  status: "succeeded" | "skipped" | "failed";
  reason?: string;
  model?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
};

export type ExtractAllResult = {
  processed: number;
  succeeded: number;
  failed: number;
  usage_total: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
  };
  results: ExtractionResult[];
};

export type UniversityGap = {
  label_key: string;
  priority: "high" | "medium" | "low";
  action_id?: string | null;
  action_status?: "open" | "in_progress" | "resolved" | "ignored" | null;
  resolved_by?: string | null;
};

export type QuickCaptureResponse = { id: string; status: string };

export type ResourceDetailResult = {
  resource: IntelligenceResource;
  linked_university: { id: string; name: string } | null;
  linked_professor: { id: string; name: string } | null;
  linked_program: { id: string; program_name: string } | null;
  linked_lab: { id: string; lab_name: string } | null;
};

export type GapAction = {
  id: string;
  gap_key: string;
  university_id?: string | null;
  status: "open" | "in_progress" | "resolved" | "ignored";
  resolved_by?: string | null;
  resolved_at?: string | null;
  notes?: string | null;
};

export type Conflict = {
  id: string;
  conflict_type: string;
  status: string;
  entity_type: string;
  entity_id?: string | null;
  field_name?: string | null;
  description?: string | null;
  sources_involved: Array<{ table: string; id: string; value?: string }>;
  resolved_value?: string | null;
  resolution_notes?: string | null;
  auto_detected?: boolean;
  detected_at?: string | null;
  resolved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SourceReliability = {
  id: string;
  source_id: string;
  total_checks: number;
  successful_checks: number;
  failed_checks: number;
  changed_checks: number;
  reliability_score?: number | null;
  last_computed_at?: string | null;
};

export type ConfidenceSummary = {
  open_conflicts: number;
  resolved_conflicts: number;
  stale_unverified: number;
  avg_confidence: number | null;
  low_confidence_count: number;
};
