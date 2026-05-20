-- P0-A: Automation run tracking
CREATE TABLE IF NOT EXISTS automation_runs (
  id TEXT PRIMARY KEY,
  run_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  triggered_by TEXT NOT NULL DEFAULT 'cron',
  sources_checked INTEGER NOT NULL DEFAULT 0,
  candidates_created INTEGER NOT NULL DEFAULT 0,
  candidates_enriched INTEGER NOT NULL DEFAULT 0,
  resources_extracted INTEGER NOT NULL DEFAULT 0,
  conflicts_detected INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  llm_input_tokens INTEGER NOT NULL DEFAULT 0,
  llm_output_tokens INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_automation_runs_status ON automation_runs(status);
CREATE INDEX IF NOT EXISTS idx_automation_runs_started ON automation_runs(started_at DESC);

CREATE TABLE IF NOT EXISTS automation_run_items (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES automation_runs(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id TEXT,
  step TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TEXT,
  finished_at TEXT,
  error_message TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_automation_run_items_run ON automation_run_items(run_id);

-- P0-B: Candidate enrichment fields
ALTER TABLE paper_candidates ADD COLUMN enrichment_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE paper_candidates ADD COLUMN enriched_at TEXT;
ALTER TABLE paper_candidates ADD COLUMN enrichment_error TEXT;

-- P0-C: Source coverage expansion fields
ALTER TABLE radar_sources ADD COLUMN last_candidate_created_at TEXT;
ALTER TABLE radar_sources ADD COLUMN last_error TEXT;
ALTER TABLE radar_sources ADD COLUMN consecutive_failures INTEGER NOT NULL DEFAULT 0;
ALTER TABLE radar_sources ADD COLUMN last_run_id TEXT REFERENCES automation_runs(id) ON DELETE SET NULL;
ALTER TABLE radar_sources ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE radar_sources ADD COLUMN ai_enrichment_enabled INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_candidates_enrichment_status ON paper_candidates(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_radar_sources_priority ON radar_sources(priority);
