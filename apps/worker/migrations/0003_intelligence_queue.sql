-- P0: General Intelligence Queue — extend paper_candidates with resource type and linking columns
ALTER TABLE paper_candidates ADD COLUMN resource_type text not null default 'paper';
ALTER TABLE paper_candidates ADD COLUMN university_id text references universities(id) on delete set null;
ALTER TABLE paper_candidates ADD COLUMN program_id text references programs(id) on delete set null;
ALTER TABLE paper_candidates ADD COLUMN professor_id text references professors(id) on delete set null;
ALTER TABLE paper_candidates ADD COLUMN relevance_note text;
ALTER TABLE paper_candidates ADD COLUMN decision_impact text;
ALTER TABLE paper_candidates ADD COLUMN confidence text;
ALTER TABLE paper_candidates ADD COLUMN evidence_type text;
ALTER TABLE paper_candidates ADD COLUMN domain_source text;

CREATE INDEX IF NOT EXISTS idx_candidates_resource_type ON paper_candidates(resource_type);
CREATE INDEX IF NOT EXISTS idx_candidates_university_id ON paper_candidates(university_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status_type ON paper_candidates(status, resource_type);
