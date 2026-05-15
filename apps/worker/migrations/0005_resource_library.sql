-- P1: Resource Library — accepted intelligence candidates as persistent evidence
CREATE TABLE IF NOT EXISTS intelligence_resources (
  id text primary key,
  candidate_id text references paper_candidates(id) on delete set null,
  title text not null,
  url text not null,
  resource_type text not null default 'other',
  source text,
  university_id text references universities(id) on delete set null,
  program_id text references programs(id) on delete set null,
  professor_id text references professors(id) on delete set null,
  lab_id text references labs(id) on delete set null,
  confidence text,
  decision_impact text,
  relevance_note text,
  domain_source text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resources_university_id ON intelligence_resources(university_id);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON intelligence_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_professor_id ON intelligence_resources(professor_id);
