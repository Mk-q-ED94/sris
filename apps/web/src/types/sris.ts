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
};

export type DashboardSummary = {
  counts: Counts;
  recent_papers: Paper[];
  pending_candidates: PaperCandidate[];
  upcoming_tasks: TimelineTask[];
  recent_updates: Array<{ label: string; value: string }>;
};
