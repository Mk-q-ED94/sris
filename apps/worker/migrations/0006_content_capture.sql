-- P1: Content Capture — save text snapshots and excerpts
ALTER TABLE paper_candidates ADD COLUMN content_text text;
ALTER TABLE paper_candidates ADD COLUMN excerpt text;
ALTER TABLE paper_candidates ADD COLUMN raw_snapshot text;
ALTER TABLE paper_candidates ADD COLUMN snapshot_at text;

ALTER TABLE intelligence_resources ADD COLUMN content_text text;
ALTER TABLE intelligence_resources ADD COLUMN excerpt text;
ALTER TABLE intelligence_resources ADD COLUMN raw_snapshot text;
ALTER TABLE intelligence_resources ADD COLUMN snapshot_at text;
