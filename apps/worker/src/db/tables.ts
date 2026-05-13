export interface TableConfig {
  path: string;
  table: string;
  order: string;
  jsonFields: readonly string[];
  createFields: readonly string[];
}

export const TABLES: Record<string, TableConfig> = {
  universities: {
    path: "/api/universities",
    table: "universities",
    order: "name asc",
    jsonFields: [],
    createFields: ["name", "location", "website", "tuition", "notes"],
  },
  programs: {
    path: "/api/programs",
    table: "programs",
    order: "deadline asc, program_name asc",
    jsonFields: [],
    createFields: [
      "university_id",
      "program_name",
      "degree",
      "language",
      "deadline",
      "requirements",
      "scholarship",
      "tuition",
      "website",
      "notes",
    ],
  },
  professors: {
    path: "/api/professors",
    table: "professors",
    order: "name asc",
    jsonFields: ["research_keywords"],
    createFields: [
      "university_id",
      "name",
      "title",
      "email",
      "website",
      "research_keywords",
      "notes",
    ],
  },
  labs: {
    path: "/api/labs",
    table: "labs",
    order: "lab_name asc",
    jsonFields: ["research_keywords", "recent_papers"],
    createFields: [
      "university_id",
      "professor_id",
      "lab_name",
      "research_keywords",
      "website",
      "recent_papers",
      "notes",
    ],
  },
  papers: {
    path: "/api/papers",
    table: "papers",
    order: "published_at desc, created_at desc",
    jsonFields: ["authors", "keywords"],
    createFields: [
      "title",
      "authors",
      "venue",
      "year",
      "url",
      "source",
      "published_at",
      "keywords",
      "abstract",
      "summary",
      "ai_status",
    ],
  },
  timeline: {
    path: "/api/timeline",
    table: "timeline_tasks",
    order: "deadline asc",
    jsonFields: [],
    createFields: [
      "title",
      "deadline",
      "priority",
      "status",
      "task_type",
      "related_university_id",
      "related_program_id",
      "notes",
    ],
  },
  sources: {
    path: "/api/radar-sources",
    table: "radar_sources",
    order: "name asc",
    jsonFields: ["keywords"],
    createFields: ["name", "source_type", "url", "query", "keywords", "enabled"],
  },
};
