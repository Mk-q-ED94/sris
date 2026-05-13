import type {
  DashboardSummary,
  Lab,
  Paper,
  PaperCandidate,
  Professor,
  Program,
  RadarSource,
  TimelineTask,
  University,
} from "@/types/sris";

const now = new Date().toISOString();

export const mockUniversities: University[] = [
  {
    id: "utokyo",
    name: "The University of Tokyo",
    location: "Tokyo",
    website: "https://www.u-tokyo.ac.jp/en/",
    notes: "AI / CS / Systems target university",
    created_at: now,
    updated_at: now,
  },
  {
    id: "science-tokyo",
    name: "Science Tokyo",
    location: "Tokyo / Yokohama",
    website: "https://www.isct.ac.jp/en",
    notes: "Former Tokyo Tech; strong systems and AI labs",
    created_at: now,
    updated_at: now,
  },
  {
    id: "osaka",
    name: "Osaka University",
    location: "Osaka",
    website: "https://www.osaka-u.ac.jp/en",
    notes: "Track IST and engineering programs",
    created_at: now,
    updated_at: now,
  },
];

export const mockPrograms: Program[] = [
  {
    id: "utokyo-ist",
    university_id: "utokyo",
    program_name: "Graduate School of Information Science and Technology",
    degree: "Master",
    language: "English / Japanese",
    deadline: "2026-08-20",
    requirements: "SOP, transcripts, English score, recommendation letters",
    created_at: now,
    updated_at: now,
  },
  {
    id: "science-tokyo-cs",
    university_id: "science-tokyo",
    program_name: "Computer Science International Graduate Program",
    degree: "Master",
    language: "English",
    deadline: "2026-07-15",
    requirements: "Research plan, English score, interview",
    created_at: now,
    updated_at: now,
  },
];

export const mockLabs: Lab[] = [
  {
    id: "lab-systems",
    university_id: "science-tokyo",
    lab_name: "AI Systems Lab",
    research_keywords: ["systems", "distributed training", "LLM inference"],
    recent_papers: ["Efficient inference scheduling for foundation models"],
    website: "https://example.com",
    created_at: now,
    updated_at: now,
  },
  {
    id: "lab-agents",
    university_id: "utokyo",
    lab_name: "Intelligent Agents Group",
    research_keywords: ["AI agents", "planning", "tool use"],
    recent_papers: ["Planning under uncertainty with tool-augmented agents"],
    website: "https://example.com",
    created_at: now,
    updated_at: now,
  },
];

export const mockProfessors: Professor[] = [
  {
    id: "prof-1",
    university_id: "science-tokyo",
    name: "Example Professor",
    title: "Professor",
    website: "https://example.com",
    research_keywords: ["AI systems", "distributed training"],
    notes: "Potential fit for AI infrastructure research.",
    created_at: now,
    updated_at: now,
  },
];

export const mockPapers: Paper[] = [
  {
    id: "paper-1",
    title: "Efficient Systems for Foundation Model Inference",
    authors: ["Ada Lovelace", "Grace Hopper"],
    venue: "arXiv",
    year: 2026,
    url: "https://arxiv.org/abs/2501.00001",
    source: "arXiv AI Systems",
    published_at: "2026-03-12",
    keywords: ["systems", "inference"],
    abstract: "A systems paper about low-latency inference for large models.",
    ai_status: "pending",
    created_at: now,
    updated_at: now,
  },
];

export const mockCandidates: PaperCandidate[] = [
  {
    id: "candidate-1",
    source: "arXiv LLM Inference",
    title: "Serving Large Language Models with Deadline-Aware Scheduling",
    authors: ["M. Sato", "Y. Tanaka"],
    abstract: "A new scheduler for latency-sensitive model serving workloads.",
    url: "https://arxiv.org/abs/2601.00001",
    published_at: "2026-05-10T02:00:00Z",
    matched_keywords: ["inference", "latency"],
    status: "pending",
    created_at: now,
    updated_at: now,
  },
];

export const mockTimeline: TimelineTask[] = [
  {
    id: "task-1",
    title: "TOEFL score planning checkpoint",
    deadline: "2026-06-12",
    priority: "high",
    status: "todo",
    task_type: "TOEFL",
    notes: "Confirm target score and test window.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "task-2",
    title: "SOP research direction draft",
    deadline: "2026-07-27",
    priority: "high",
    status: "doing",
    task_type: "SOP",
    notes: "Draft AI systems narrative and lab fit.",
    created_at: now,
    updated_at: now,
  },
];

export const mockSources: RadarSource[] = [
  {
    id: "source-1",
    name: "arXiv AI Systems",
    source_type: "arxiv",
    query: "machine learning systems",
    keywords: ["systems", "inference", "training", "distributed"],
    enabled: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "source-2",
    name: "arXiv AI Agents",
    source_type: "arxiv",
    query: "AI agents planning tool use",
    keywords: ["agent", "planning", "tool use"],
    enabled: true,
    created_at: now,
    updated_at: now,
  },
];

export const mockDashboard: DashboardSummary = {
  counts: {
    universities: mockUniversities.length,
    programs: mockPrograms.length,
    professors: mockProfessors.length,
    labs: mockLabs.length,
    papers: mockPapers.length,
    pending_candidates: mockCandidates.length,
    timeline_tasks: mockTimeline.length,
  },
  recent_papers: mockPapers,
  pending_candidates: mockCandidates,
  upcoming_tasks: mockTimeline,
  recent_updates: [
    { label: "Pending review", value: String(mockCandidates.length) },
    { label: "Tracked papers", value: String(mockPapers.length) },
    { label: "Upcoming tasks", value: String(mockTimeline.length) },
  ],
};
