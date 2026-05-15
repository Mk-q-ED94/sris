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
  stale_sources: Array<{ id: string; name: string; source_type: string; university_id?: string | null; last_run_at?: string | null }>;
  today_briefing: TodayBriefing;
  university_stats: UniversityStat[];
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
  created_at?: string | null;
};

export type UniversityGap = {
  label_key: string;
  priority: "high" | "medium" | "low";
};

export type QuickCaptureResponse = { id: string; status: string };
