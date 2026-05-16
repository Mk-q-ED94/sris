-- AI extraction columns on intelligence_resources
--
-- `extracted_facts` holds the structured JSON returned by Claude Haiku 4.5
-- when fed the admission-notice PDF. Schema is in src/ai/extract-program.ts.
-- Status field tracks where each resource sits in the extraction pipeline so
-- we can resume / retry per row without re-charging the whole batch.

ALTER TABLE intelligence_resources ADD COLUMN extracted_facts TEXT;
ALTER TABLE intelligence_resources ADD COLUMN extraction_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE intelligence_resources ADD COLUMN extracted_at TEXT;
ALTER TABLE intelligence_resources ADD COLUMN extraction_model TEXT;
ALTER TABLE intelligence_resources ADD COLUMN extraction_error TEXT;
ALTER TABLE intelligence_resources ADD COLUMN extraction_input_tokens INTEGER;
ALTER TABLE intelligence_resources ADD COLUMN extraction_output_tokens INTEGER;
ALTER TABLE intelligence_resources ADD COLUMN extraction_cache_read_tokens INTEGER;

CREATE INDEX IF NOT EXISTS idx_resources_extraction_status ON intelligence_resources(extraction_status);
