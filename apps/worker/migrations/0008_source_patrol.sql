ALTER TABLE radar_sources ADD COLUMN patrol_status TEXT NOT NULL DEFAULT 'never_checked';
ALTER TABLE radar_sources ADD COLUMN last_http_status INTEGER;
ALTER TABLE radar_sources ADD COLUMN last_title TEXT;
ALTER TABLE radar_sources ADD COLUMN content_hash TEXT;
ALTER TABLE radar_sources ADD COLUMN last_checked_at TEXT;
ALTER TABLE radar_sources ADD COLUMN last_changed_at TEXT;
