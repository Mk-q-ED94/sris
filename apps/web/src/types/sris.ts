export type Counts = Record<
  "universities" | "programs" | "professors" | "labs" | "papers" | "pending_candidates" | "timeline_tasks",
  number
>;

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

export type PaperCandidate = {
  id: string;
  source?: string | null;
  title: string;
  authors: string[];
  abstract?: string | null;
  url: string;
  published_at?: string | null;
  matched_keywords: string[];
  status: string;
};

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

export type DashboardSummary = {
  counts: Counts;
  recent_papers: Paper[];
  pending_candidates: PaperCandidate[];
  upcoming_tasks: TimelineTask[];
  recent_updates: Array<{ label: string; value: string }>;
  coverage: CoverageItem[];
  gaps: GapItem[];
};

export type SearchHit = {
  type: "university" | "program" | "professor" | "lab" | "paper" | "candidate" | "task";
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

export type QuickCaptureResponse = { id: string; status: string };
