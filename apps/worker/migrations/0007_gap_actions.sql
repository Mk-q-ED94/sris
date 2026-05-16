-- P1: Gap Action Loop — track user actions on information gaps
CREATE TABLE IF NOT EXISTS gap_actions (
  id TEXT PRIMARY KEY,
  gap_key TEXT NOT NULL,
  university_id TEXT REFERENCES universities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_by TEXT REFERENCES intelligence_resources(id) ON DELETE SET NULL,
  resolved_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_gap_actions_university_id ON gap_actions(university_id);
CREATE INDEX IF NOT EXISTS idx_gap_actions_status ON gap_actions(status);
CREATE INDEX IF NOT EXISTS idx_gap_actions_gap_key ON gap_actions(gap_key);
