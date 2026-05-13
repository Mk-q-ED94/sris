import type { DashboardSummary } from "../types/sris";

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

async function request<T>(path: string, token: string): Promise<T> {
  const response = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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
