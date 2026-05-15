import type { D1Database } from "@cloudflare/workers-types";

export const SCHEMA_SQL: readonly string[] = [
  "create table if not exists universities (id text primary key, name text not null unique, location text, website text, tuition real, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists programs (id text primary key, university_id text not null references universities(id) on delete cascade, program_name text not null, degree text, language text, deadline text, requirements text, scholarship text, tuition real, website text, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists professors (id text primary key, university_id text not null references universities(id) on delete cascade, name text not null, title text, email text, website text, research_keywords text not null default '[]', notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists labs (id text primary key, university_id text not null references universities(id) on delete cascade, professor_id text references professors(id) on delete set null, lab_name text not null, research_keywords text not null default '[]', website text, recent_papers text not null default '[]', notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists papers (id text primary key, title text not null, authors text not null default '[]', venue text, year integer, url text not null unique, source text, published_at text, keywords text not null default '[]', abstract text, summary text, ai_status text not null default 'pending', created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists radar_sources (id text primary key, name text not null unique, source_type text not null default 'arxiv', url text, query text, keywords text not null default '[]', enabled integer not null default 1, last_run_at text, university_id text references universities(id) on delete set null, confidence text, check_frequency text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists paper_candidates (id text primary key, source_id text references radar_sources(id) on delete set null, source text, title text not null, authors text not null default '[]', abstract text, url text not null unique, published_at text, matched_keywords text not null default '[]', raw_payload text not null default '{}', status text not null default 'pending', ignore_reason text, reviewed_at text, resource_type text not null default 'paper', university_id text references universities(id) on delete set null, program_id text references programs(id) on delete set null, professor_id text references professors(id) on delete set null, relevance_note text, decision_impact text, confidence text, evidence_type text, domain_source text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists timeline_tasks (id text primary key, title text not null, deadline text, priority text not null default 'medium', status text not null default 'todo', task_type text, related_university_id text references universities(id) on delete set null, related_program_id text references programs(id) on delete set null, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_candidates_status on paper_candidates(status)",
  "create index if not exists idx_candidates_resource_type on paper_candidates(resource_type)",
  "create index if not exists idx_candidates_university_id on paper_candidates(university_id)",
  "create index if not exists idx_candidates_status_type on paper_candidates(status, resource_type)",
  "create index if not exists idx_timeline_deadline on timeline_tasks(deadline)",
  "create index if not exists idx_radar_sources_university_id on radar_sources(university_id)",
  "create table if not exists intelligence_resources (id text primary key, candidate_id text references paper_candidates(id) on delete set null, title text not null, url text not null, resource_type text not null default 'other', source text, university_id text references universities(id) on delete set null, program_id text references programs(id) on delete set null, professor_id text references professors(id) on delete set null, lab_id text references labs(id) on delete set null, confidence text, decision_impact text, relevance_note text, domain_source text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_resources_university_id on intelligence_resources(university_id)",
  "create index if not exists idx_resources_resource_type on intelligence_resources(resource_type)",
  "create index if not exists idx_resources_professor_id on intelligence_resources(professor_id)",
];

export const SEED_SQL: readonly string[] = [
  "insert or ignore into universities (id,name,location,website,notes) values ('utokyo','The University of Tokyo','Tokyo','https://www.u-tokyo.ac.jp/en/','Target: AI, CS, Systems, Information Science and Technology')",
  "insert or ignore into universities (id,name,location,website,notes) values ('science-tokyo','Science Tokyo','Tokyo / Yokohama','https://www.isct.ac.jp/en','Former Tokyo Tech / TMDU integration; track CS and systems labs')",
  "insert or ignore into universities (id,name,location,website,notes) values ('osaka','Osaka University','Osaka','https://www.osaka-u.ac.jp/en','Track IST and engineering programs')",
  "insert or ignore into universities (id,name,location,website,notes) values ('tohoku','Tohoku University','Sendai','https://www.tohoku.ac.jp/en/','Track AI, robotics, information sciences')",
  "insert or ignore into universities (id,name,location,website,notes) values ('tsukuba','University of Tsukuba','Tsukuba','https://www.tsukuba.ac.jp/en/','Track CS, intelligent interaction, systems programs')",
  "insert or ignore into professors (id,university_id,name,title,website,research_keywords,notes) values ('prof-science-tokyo-ai-systems','science-tokyo','Example Professor','Professor','https://example.com','[\"AI systems\",\"distributed training\"]','Replace with real professor profile after manual review.')",
  "insert or ignore into labs (id,university_id,professor_id,lab_name,research_keywords,website,recent_papers,notes) values ('lab-ai-systems','science-tokyo','prof-science-tokyo-ai-systems','AI Systems Lab','[\"systems\",\"distributed training\",\"LLM inference\"]','https://example.com','[\"Efficient inference scheduling for foundation models\"]','Seed lab for structure validation.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,deadline,requirements) values ('program-utokyo-ist','utokyo','Graduate School of Information Science and Technology','Master','English / Japanese','2026-08-20','SOP, transcripts, English score, recommendation letters')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,deadline,requirements) values ('program-science-tokyo-cs','science-tokyo','Computer Science International Graduate Program','Master','English','2026-07-15','Research plan, English score, interview')",
  "insert or ignore into radar_sources (id,name,source_type,query,keywords,enabled) values ('source-ai-systems','arXiv AI Systems','arxiv','machine learning systems','[\"systems\",\"inference\",\"training\",\"distributed\",\"GPU\"]',1)",
  "insert or ignore into radar_sources (id,name,source_type,query,keywords,enabled) values ('source-llm-inference','arXiv LLM Inference','arxiv','large language model inference','[\"inference\",\"serving\",\"latency\",\"throughput\",\"LLM\"]',1)",
  "insert or ignore into radar_sources (id,name,source_type,query,keywords,enabled) values ('source-ai-agents','arXiv AI Agents','arxiv','AI agents planning tool use','[\"agent\",\"planning\",\"tool use\",\"reasoning\"]',1)",
  "insert or ignore into timeline_tasks (id,title,deadline,priority,status,task_type,notes) values ('task-toefl','TOEFL score planning checkpoint',date('now','+30 day'),'high','todo','TOEFL','Confirm target test window and score gap.')",
  "insert or ignore into timeline_tasks (id,title,deadline,priority,status,task_type,notes) values ('task-sop','SOP research direction draft',date('now','+75 day'),'high','todo','SOP','Draft AI systems research narrative and lab fit.')",
];

export async function initializeDatabase(db: D1Database): Promise<{ ok: true; statements: number }> {
  const statements = [...SCHEMA_SQL, ...SEED_SQL];
  for (const sql of statements) {
    await db.prepare(sql).run();
  }
  return { ok: true, statements: statements.length };
}
