-- Resource status marker for intelligence_resources
-- unverified (default): not yet confirmed accurate
-- verified: manually confirmed accurate
-- stale: content may be outdated, should re-check
-- core_evidence: key decision-making evidence, treat as authoritative
ALTER TABLE intelligence_resources ADD COLUMN resource_status TEXT NOT NULL DEFAULT 'unverified';

CREATE INDEX IF NOT EXISTS idx_resources_status ON intelligence_resources(resource_status);
