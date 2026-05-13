export type Timestamped = {
  id: string;
  created_at?: string;
  updated_at?: string;
};

export type University = Timestamped & {
  name: string;
  location?: string | null;
  website?: string | null;
  tuition?: number | null;
  notes?: string | null;
};

export type Program = Timestamped & {
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
};

export type Lab = Timestamped & {
  university_id: string;
  professor_id?: string | null;
  lab_name: string;
  research_keywords: string[];
  website?: string | null;
  recent_papers: string[];
  notes?: string | null;
};

export type Professor = Timestamped & {
  university_id: string;
  name: string;
  title?: string | null;
  email?: string | null;
  website?: string | null;
  research_keywords: string[];
  notes?: string | null;
};

export type Paper = Timestamped & {
  title: string;
  authors: string[];
  venue?: string | null;
  year?: number | null;
  url: string;
  source?: string | null;
  published_at?: string | null;
  keywords: string[];
  abstract?: string | null;
  summary?: string | null;
  ai_status: string;
};

export type PaperCandidate = Timestamped & {
  source_id?: string | null;
  source?: string | null;
  title: string;
  authors: string[];
  abstract?: string | null;
  url: string;
  published_at?: string | null;
  matched_keywords: string[];
  status: string;
  ignore_reason?: string | null;
  reviewed_at?: string | null;
};

export type TimelineTask = Timestamped & {
  title: string;
  deadline?: string | null;
  priority: "low" | "medium" | "high" | string;
  status: "todo" | "doing" | "done" | string;
  task_type?: string | null;
  notes?: string | null;
};

export type RadarSource = Timestamped & {
  name: string;
  source_type: string;
  url?: string | null;
  query?: string | null;
  keywords: string[];
  enabled: boolean;
  last_run_at?: string | null;
};

export type DashboardSummary = {
  counts: Record<string, number>;
  recent_papers: Paper[];
  pending_candidates: PaperCandidate[];
  upcoming_tasks: TimelineTask[];
  recent_updates: Array<{ label: string; value: string }>;
};
