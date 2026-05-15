-- P1: Source Hub — extend radar_sources with university linking and metadata
ALTER TABLE radar_sources ADD COLUMN university_id text references universities(id) on delete set null;
ALTER TABLE radar_sources ADD COLUMN confidence text;
ALTER TABLE radar_sources ADD COLUMN check_frequency text;

CREATE INDEX IF NOT EXISTS idx_radar_sources_university_id ON radar_sources(university_id);
