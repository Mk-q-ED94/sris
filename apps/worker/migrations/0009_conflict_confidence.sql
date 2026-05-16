CREATE TABLE IF NOT EXISTS conflicts (
  id TEXT PRIMARY KEY,
  conflict_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  field_name TEXT,
  description TEXT,
  sources_involved TEXT NOT NULL DEFAULT '[]',
  resolved_value TEXT,
  resolution_notes TEXT,
  auto_detected INTEGER NOT NULL DEFAULT 1,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_type ON conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_conflicts_entity ON conflicts(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS source_reliability (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES radar_sources(id) ON DELETE CASCADE,
  total_checks INTEGER NOT NULL DEFAULT 0,
  successful_checks INTEGER NOT NULL DEFAULT 0,
  failed_checks INTEGER NOT NULL DEFAULT 0,
  changed_checks INTEGER NOT NULL DEFAULT 0,
  reliability_score REAL,
  last_computed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_source_reliability_source ON source_reliability(source_id);

ALTER TABLE intelligence_resources ADD COLUMN confidence_score REAL;
ALTER TABLE intelligence_resources ADD COLUMN confidence_last_verified TEXT;
ALTER TABLE radar_sources ADD COLUMN reliability_score REAL;
ALTER TABLE paper_candidates ADD COLUMN confidence_score REAL;
