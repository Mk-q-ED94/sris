import type { DashboardSummary, Lab, PaperCandidate, Professor, Program, QuickCaptureResponse, SearchResponse, TimelineTask, University } from "../types/sris";

const TOKEN_KEY = "sris_token";

export function getStoredToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { error?: string };
      message = body.error || message;
    } catch {
      // Keep the HTTP status text.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function fetchDashboard(token: string): Promise<DashboardSummary> {
  return request<DashboardSummary>("/api/dashboard", token).catch((error: unknown) => {
    if (import.meta.env.DEV) {
      return mockDashboard;
    }
    throw error;
  });
}

export function fetchTimeline(token: string): Promise<TimelineTask[]> {
  return request<TimelineTask[]>("/api/timeline", token).catch((error: unknown) => {
    if (import.meta.env.DEV) {
      return mockTimeline;
    }
    throw error;
  });
}

export function searchGlobal(token: string, query: string): Promise<SearchResponse> {
  const url = `/api/search?q=${encodeURIComponent(query)}`;
  return request<SearchResponse>(url, token).catch((error: unknown) => {
    if (import.meta.env.DEV) {
      return mockSearch(query);
    }
    throw error;
  });
}

export function quickCapture(token: string, payload: { url: string; title?: string; selection?: string; notes?: string }): Promise<QuickCaptureResponse> {
  return request<QuickCaptureResponse>("/api/quick-capture", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchUniversities(token: string): Promise<University[]> {
  return request<University[]>("/api/universities", token).catch((error: unknown) => {
    if (import.meta.env.DEV) return mockUniversities;
    throw error;
  });
}

export function fetchProfessors(token: string): Promise<Professor[]> {
  return request<Professor[]>("/api/professors", token).catch((error: unknown) => {
    if (import.meta.env.DEV) return mockProfessors;
    throw error;
  });
}

export function fetchLabs(token: string): Promise<Lab[]> {
  return request<Lab[]>("/api/labs", token).catch((error: unknown) => {
    if (import.meta.env.DEV) return mockLabs;
    throw error;
  });
}

export function fetchPrograms(token: string): Promise<Program[]> {
  return request<Program[]>("/api/programs", token).catch((error: unknown) => {
    if (import.meta.env.DEV) return mockPrograms;
    throw error;
  });
}

export type UniversityDetail = {
  university: University;
  programs: Program[];
  professors: Professor[];
  labs: Lab[];
  paper_count: number;
  task_count: number;
};

export function fetchUniversityDetail(token: string, id: string): Promise<UniversityDetail> {
  return request<UniversityDetail>(`/api/universities/${id}`, token).catch((error: unknown) => {
    if (import.meta.env.DEV) return mockUniversityDetail(id);
    throw error;
  });
}

export function fetchReviewCandidates(token: string): Promise<PaperCandidate[]> {
  return request<PaperCandidate[]>("/api/review/papers", token).catch((error: unknown) => {
    if (import.meta.env.DEV) return mockCandidates;
    throw error;
  });
}

export function acceptCandidate(token: string, id: string): Promise<void> {
  return request(`/api/review/papers/${id}/accept`, token, { method: "POST" }).then(() => {});
}

export function ignoreCandidate(token: string, id: string): Promise<void> {
  return request(`/api/review/papers/${id}/ignore`, token, { method: "POST" }).then(() => {});
}

export function createTask(token: string, payload: Record<string, unknown>): Promise<TimelineTask> {
  return request<TimelineTask>("/api/timeline", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(token: string, id: string): Promise<void> {
  return request(`/api/timeline/${id}`, token, { method: "DELETE" }).then(() => {});
}

export function buildIcalUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/timeline.ics?token=${encodeURIComponent(token)}`;
}

const mockDashboard: DashboardSummary = {
  counts: {
    universities: 8,
    programs: 14,
    professors: 42,
    labs: 19,
    papers: 128,
    pending_candidates: 7,
    timeline_tasks: 12,
  },
  recent_papers: [
    {
      id: "paper-1",
      title: "Retrieval-Augmented Scientific Discovery with Agentic Review Loops",
      authors: ["M. Chen", "A. Patel", "Y. Sato"],
      venue: "arXiv",
      year: 2026,
      url: "https://arxiv.org/abs/2605.00001",
      source: "arXiv CS.AI",
      published_at: "2026-05-12T08:30:00Z",
      keywords: ["RAG", "agents", "scientific discovery"],
      ai_status: "placeholder",
    },
    {
      id: "paper-2",
      title: "Efficient Systems for Long-Context Research Assistants",
      authors: ["L. Huang", "S. Kumar"],
      venue: "OSDI",
      year: 2026,
      url: "https://example.com/papers/long-context-systems",
      source: "manual",
      published_at: "2026-05-10T11:00:00Z",
      keywords: ["systems", "long context", "inference"],
      ai_status: "placeholder",
    },
  ],
  pending_candidates: [
    {
      id: "candidate-1",
      source: "arXiv CS.CL",
      title: "Program-Level Matching Signals for International CS Applications",
      authors: ["R. Tanaka", "Q. Li"],
      abstract: "Candidate record awaiting manual review.",
      url: "https://arxiv.org/abs/2605.00002",
      published_at: "2026-05-13T02:15:00Z",
      matched_keywords: ["admissions", "matching", "CS"],
      status: "pending",
    },
    {
      id: "candidate-2",
      source: "arXiv CS.LG",
      title: "Benchmarks for Lab-Scale Research Planning Agents",
      authors: ["N. Suzuki", "E. Wong"],
      abstract: "Candidate record awaiting manual review.",
      url: "https://arxiv.org/abs/2605.00003",
      published_at: "2026-05-11T14:45:00Z",
      matched_keywords: ["planning", "research agents"],
      status: "pending",
    },
  ],
  upcoming_tasks: [
    {
      id: "task-1",
      title: "Finalize SGU target university shortlist",
      deadline: "2026-05-20",
      priority: "high",
      status: "open",
      task_type: "school_research",
    },
    {
      id: "task-2",
      title: "Draft SOP research interest paragraph",
      deadline: "2026-06-05",
      priority: "medium",
      status: "open",
      task_type: "sop",
    },
    {
      id: "task-3",
      title: "Ask recommender for timeline confirmation",
      deadline: "2026-06-18",
      priority: "medium",
      status: "open",
      task_type: "recommendation",
    },
  ],
  recent_updates: [
    { label: "Latest ingest", value: "arXiv CS.AI completed" },
    { label: "Review queue", value: "7 candidates waiting" },
    { label: "Timezone", value: "Asia/Shanghai" },
  ],
  coverage: [
    { label_key: "universities", value: 8, target: 5, tone: "strong" as const },
    { label_key: "programs", value: 14, target: 16, tone: "medium" as const },
    { label_key: "professors_labs", value: 61, target: 24, tone: "strong" as const },
    { label_key: "papers", value: 135, target: 48, tone: "strong" as const },
    { label_key: "captures", value: 3, target: 5, tone: "medium" as const },
    { label_key: "tasks", value: 12, target: 10, tone: "strong" as const },
  ],
  gaps: [
    { label_key: "no_programs_for", priority: "high" as const, university_id: "tohoku", university_name: "Tohoku University" },
    { label_key: "no_professors_for", priority: "high" as const, university_id: "tsukuba", university_name: "University of Tsukuba" },
    { label_key: "none", priority: "low" as const },
  ],
};

const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy.toISOString().slice(0, 10);
};

const mockTimeline: TimelineTask[] = [
  { id: "task-1", title: "TOEFL window planning checkpoint", deadline: addDays(today, 18), priority: "high", status: "todo", task_type: "TOEFL", created_at: addDays(today, -7), updated_at: addDays(today, -2) },
  { id: "task-2", title: "Draft SOP research direction", deadline: addDays(today, 38), priority: "high", status: "doing", task_type: "SOP", created_at: addDays(today, -12), updated_at: addDays(today, -1) },
  { id: "task-3", title: "Ask recommender · Prof. X", deadline: addDays(today, 52), priority: "medium", status: "todo", task_type: "Recommendation", created_at: addDays(today, -3), updated_at: addDays(today, -3) },
  { id: "task-4", title: "UTokyo IST 报名材料整理", deadline: addDays(today, 78), priority: "medium", status: "todo", task_type: "Application", created_at: addDays(today, -5), updated_at: addDays(today, -5) },
  { id: "task-5", title: "Science Tokyo CS-IGP submission", deadline: addDays(today, 96), priority: "high", status: "todo", task_type: "Application", created_at: addDays(today, -1), updated_at: addDays(today, -1) },
  { id: "task-6", title: "JLPT N1 mock test", deadline: addDays(today, -4), priority: "low", status: "done", task_type: "JLPT", created_at: addDays(today, -28), updated_at: addDays(today, -4) },
];

function mockSearch(query: string): SearchResponse {
  const q = query.toLowerCase();
  const hits = [
    { type: "university" as const, id: "utokyo", title: "The University of Tokyo", subtitle: "Tokyo", hint: "AI, CS, Systems, Information Science and Technology" },
    { type: "professor" as const, id: "prof-1", title: "Prof. Yamamoto", subtitle: "Information Science", hint: "[\"distributed training\",\"LLM inference\"]" },
    { type: "lab" as const, id: "lab-ai-systems", title: "AI Systems Lab", subtitle: "https://example.com", hint: "[\"systems\",\"distributed training\"]" },
    { type: "candidate" as const, id: "candidate-1", title: "Program-Level Matching Signals", subtitle: "arXiv CS.CL", hint: "Candidate awaiting manual review." },
  ].filter((h) => !q || h.title.toLowerCase().includes(q) || (h.subtitle ?? "").toLowerCase().includes(q));
  return { query, hits };
}

const mockUniversities: University[] = [
  { id: "utokyo", name: "The University of Tokyo", location: "Tokyo", website: "https://www.u-tokyo.ac.jp/en/", notes: "Target: AI, CS, Systems, IST" },
  { id: "science-tokyo", name: "Science Tokyo", location: "Tokyo / Yokohama", website: "https://www.isct.ac.jp/en", notes: "CS and systems labs" },
  { id: "osaka", name: "Osaka University", location: "Osaka", website: "https://www.osaka-u.ac.jp/en", notes: "IST and engineering programs" },
  { id: "tohoku", name: "Tohoku University", location: "Sendai", website: "https://www.tohoku.ac.jp/en/", notes: "AI, robotics, information sciences" },
  { id: "tsukuba", name: "University of Tsukuba", location: "Tsukuba", website: "https://www.tsukuba.ac.jp/en/", notes: "CS, intelligent interaction, systems" },
];

const mockProfessors: Professor[] = [
  { id: "prof-utokyo-1", university_id: "utokyo", name: "Prof. Sato", title: "Professor", email: "sato@i.u-tokyo.ac.jp", website: "https://example.com/sato", research_keywords: ["machine learning", "optimization", "deep learning"], notes: "Focus on large-scale optimization" },
  { id: "prof-science-tokyo-1", university_id: "science-tokyo", name: "Prof. Tanaka", title: "Associate Professor", website: "https://example.com/tanaka", research_keywords: ["distributed systems", "ML systems", "inference"], notes: "AI Systems Lab director" },
  { id: "prof-osaka-1", university_id: "osaka", name: "Prof. Suzuki", title: "Professor", email: "suzuki@ist.osaka-u.ac.jp", research_keywords: ["NLP", "dialogue systems", "LLM"], notes: "Active in LLM research" },
];

const mockLabs: Lab[] = [
  { id: "lab-utokyo-1", university_id: "utokyo", professor_id: "prof-utokyo-1", lab_name: "Optimization & Learning Lab", research_keywords: ["optimization", "deep learning", "generalization"], website: "https://example.com/lab-utokyo", recent_papers: ["On the generalization gap in large-batch training"], notes: "Strong publication record at NeurIPS/ICML" },
  { id: "lab-science-tokyo-1", university_id: "science-tokyo", professor_id: "prof-science-tokyo-1", lab_name: "AI Systems Lab", research_keywords: ["systems", "distributed training", "LLM inference"], website: "https://example.com/lab-science-tokyo", recent_papers: ["Efficient inference scheduling for foundation models"], notes: "Seed lab for structure validation" },
  { id: "lab-osaka-1", university_id: "osaka", professor_id: "prof-osaka-1", lab_name: "NLP & Dialogue Lab", research_keywords: ["NLP", "dialogue", "LLM alignment"], recent_papers: ["Multi-turn dialogue evaluation with LLM judges"], notes: "Accepting international students" },
];

const mockPrograms: Program[] = [
  { id: "program-utokyo-ist", university_id: "utokyo", program_name: "Graduate School of Information Science and Technology", degree: "Master", language: "English / Japanese", deadline: "2026-08-20", requirements: "SOP, transcripts, English score, recommendation letters", scholarship: "MEXT scholarship available", website: "https://www.i.u-tokyo.ac.jp/eng/" },
  { id: "program-science-tokyo-cs", university_id: "science-tokyo", program_name: "Computer Science International Graduate Program", degree: "Master", language: "English", deadline: "2026-07-15", requirements: "Research plan, English score, interview", website: "https://example.com/cs-igp" },
  { id: "program-osaka-ist", university_id: "osaka", program_name: "Information Science and Technology Program", degree: "Master", language: "English", deadline: "2026-09-01", requirements: "SOP, English score, recommendation letters", scholarship: "JASSO scholarship", tuition: 535800, website: "https://example.com/osaka-ist" },
];

const mockCandidates: PaperCandidate[] = [
  { id: "cand-1", source: "arXiv CS.AI", title: "Retrieval-Augmented Scientific Discovery with Agentic Review Loops", authors: ["M. Chen", "A. Patel"], abstract: "We propose a framework for scientific discovery that combines retrieval-augmented generation with agentic review cycles.", url: "https://arxiv.org/abs/2605.00001", published_at: "2026-05-12T08:30:00Z", matched_keywords: ["RAG", "agents", "scientific discovery"], status: "pending" },
  { id: "cand-2", source: "arXiv CS.LG", title: "Efficient Long-Context Inference via Sparse Attention Patterns", authors: ["Y. Kim", "S. Lee"], abstract: "This paper introduces a sparse attention mechanism that reduces memory usage by 60% during long-context inference.", url: "https://arxiv.org/abs/2605.00002", published_at: "2026-05-11T14:45:00Z", matched_keywords: ["inference", "long context", "efficiency"], status: "pending" },
  { id: "cand-3", source: "manual", title: "MLSys 2026 Conference Call for Papers", authors: [], abstract: "MLSys 2026 is now accepting papers on systems for machine learning.", url: "https://mlsys.org/2026", published_at: "2026-05-10T00:00:00Z", matched_keywords: ["conference", "ML systems"], status: "pending" },
];

function mockUniversityDetail(id: string): UniversityDetail {
  const uni = mockUniversities.find((u) => u.id === id) ?? mockUniversities[0]!;
  return {
    university: uni,
    programs: mockPrograms.filter((p) => p.university_id === uni.id),
    professors: mockProfessors.filter((p) => p.university_id === uni.id),
    labs: mockLabs.filter((l) => l.university_id === uni.id),
    paper_count: 12,
    task_count: 3,
  };
}
