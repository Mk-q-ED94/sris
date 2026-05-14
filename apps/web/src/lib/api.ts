import type { DashboardSummary, QuickCaptureResponse, SearchResponse, TimelineTask } from "../types/sris";

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
