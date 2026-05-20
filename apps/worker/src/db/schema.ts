import type { D1Database } from "@cloudflare/workers-types";
import { SGU_PROGRAM_SEED_STATEMENTS } from "./sgu-seed";

export const SCHEMA_SQL: readonly string[] = [
  "create table if not exists universities (id text primary key, name text not null unique, location text, website text, tuition real, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists programs (id text primary key, university_id text not null references universities(id) on delete cascade, program_name text not null, degree text, language text, deadline text, requirements text, scholarship text, tuition real, website text, notes text, match_reason text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists professors (id text primary key, university_id text not null references universities(id) on delete cascade, name text not null, title text, email text, website text, research_keywords text not null default '[]', notes text, match_reason text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists labs (id text primary key, university_id text not null references universities(id) on delete cascade, professor_id text references professors(id) on delete set null, lab_name text not null, research_keywords text not null default '[]', website text, recent_papers text not null default '[]', notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists papers (id text primary key, title text not null, authors text not null default '[]', venue text, year integer, url text not null unique, source text, published_at text, keywords text not null default '[]', abstract text, summary text, ai_status text not null default 'pending', created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists radar_sources (id text primary key, name text not null unique, source_type text not null default 'arxiv', url text, query text, keywords text not null default '[]', enabled integer not null default 1, last_run_at text, university_id text references universities(id) on delete set null, confidence text, check_frequency text, patrol_status text not null default 'never_checked', last_http_status integer, last_title text, content_hash text, last_checked_at text, last_changed_at text, reliability_score real, last_candidate_created_at text, last_error text, consecutive_failures integer not null default 0, last_run_id text references automation_runs(id) on delete set null, priority text not null default 'normal', ai_enrichment_enabled integer not null default 1, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists paper_candidates (id text primary key, source_id text references radar_sources(id) on delete set null, source text, title text not null, authors text not null default '[]', abstract text, url text not null unique, published_at text, matched_keywords text not null default '[]', raw_payload text not null default '{}', status text not null default 'pending', ignore_reason text, reviewed_at text, resource_type text not null default 'paper', university_id text references universities(id) on delete set null, program_id text references programs(id) on delete set null, professor_id text references professors(id) on delete set null, relevance_note text, decision_impact text, confidence text, evidence_type text, domain_source text, content_text text, excerpt text, raw_snapshot text, snapshot_at text, confidence_score real, enrichment_status text not null default 'pending', enriched_at text, enrichment_error text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists timeline_tasks (id text primary key, title text not null, deadline text, priority text not null default 'medium', status text not null default 'todo', task_type text, related_university_id text references universities(id) on delete set null, related_program_id text references programs(id) on delete set null, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_candidates_status on paper_candidates(status)",
  "create index if not exists idx_candidates_resource_type on paper_candidates(resource_type)",
  "create index if not exists idx_candidates_university_id on paper_candidates(university_id)",
  "create index if not exists idx_candidates_status_type on paper_candidates(status, resource_type)",
  "create index if not exists idx_timeline_deadline on timeline_tasks(deadline)",
  "create index if not exists idx_radar_sources_university_id on radar_sources(university_id)",
  "create table if not exists intelligence_resources (id text primary key, candidate_id text references paper_candidates(id) on delete set null, title text not null, url text not null, resource_type text not null default 'other', source text, university_id text references universities(id) on delete set null, program_id text references programs(id) on delete set null, professor_id text references professors(id) on delete set null, lab_id text references labs(id) on delete set null, confidence text, decision_impact text, relevance_note text, domain_source text, content_text text, excerpt text, raw_snapshot text, snapshot_at text, confidence_score real, confidence_last_verified text, extracted_facts text, extraction_status text not null default 'pending', extracted_at text, extraction_model text, extraction_error text, extraction_input_tokens integer, extraction_output_tokens integer, extraction_cache_read_tokens integer, resource_status text not null default 'unverified', created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_resources_university_id on intelligence_resources(university_id)",
  "create index if not exists idx_resources_resource_type on intelligence_resources(resource_type)",
  "create index if not exists idx_resources_professor_id on intelligence_resources(professor_id)",
  "create index if not exists idx_resources_extraction_status on intelligence_resources(extraction_status)",
  "create index if not exists idx_resources_status on intelligence_resources(resource_status)",
  "create table if not exists gap_actions (id text primary key, gap_key text not null, university_id text references universities(id) on delete cascade, status text not null default 'open', resolved_by text references intelligence_resources(id) on delete set null, resolved_at text, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_gap_actions_university_id on gap_actions(university_id)",
  "create index if not exists idx_gap_actions_status on gap_actions(status)",
  "create index if not exists idx_gap_actions_gap_key on gap_actions(gap_key)",
  "create table if not exists conflicts (id text primary key, conflict_type text not null, status text not null default 'open', entity_type text not null, entity_id text, field_name text, description text, sources_involved text not null default '[]', resolved_value text, resolution_notes text, auto_detected integer not null default 1, detected_at text not null default (datetime('now')), resolved_at text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_conflicts_status on conflicts(status)",
  "create index if not exists idx_conflicts_type on conflicts(conflict_type)",
  "create index if not exists idx_conflicts_entity on conflicts(entity_type, entity_id)",
  "create table if not exists source_reliability (id text primary key, source_id text not null references radar_sources(id) on delete cascade, total_checks integer not null default 0, successful_checks integer not null default 0, failed_checks integer not null default 0, changed_checks integer not null default 0, reliability_score real, last_computed_at text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create unique index if not exists idx_source_reliability_source on source_reliability(source_id)",
  "create table if not exists user_profile (id text primary key default 'me', research_background text, target_fields text, updated_at text not null default (datetime('now')))",
  "create table if not exists automation_runs (id text primary key, run_type text not null, status text not null default 'running', started_at text not null default (datetime('now')), finished_at text, triggered_by text not null default 'cron', sources_checked integer not null default 0, candidates_created integer not null default 0, candidates_enriched integer not null default 0, resources_extracted integer not null default 0, conflicts_detected integer not null default 0, failed_count integer not null default 0, llm_input_tokens integer not null default 0, llm_output_tokens integer not null default 0, error_summary text, details_json text not null default '{}', created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_automation_runs_status on automation_runs(status)",
  "create index if not exists idx_automation_runs_started on automation_runs(started_at desc)",
  "create table if not exists automation_run_items (id text primary key, run_id text not null references automation_runs(id) on delete cascade, item_type text not null, item_id text, step text not null, status text not null default 'pending', started_at text, finished_at text, error_message text, details_json text not null default '{}', created_at text not null default (datetime('now')))",
  "create index if not exists idx_automation_run_items_run on automation_run_items(run_id)",
  "create index if not exists idx_candidates_enrichment_status on paper_candidates(enrichment_status)",
  "create index if not exists idx_radar_sources_priority on radar_sources(priority)",
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
  "insert or ignore into user_profile (id) values ('me')",
];

const TARGET_PROGRAM_SEED_SQL: readonly string[] = [
  "update programs set website = 'https://www.i.u-tokyo.ac.jp/edu/entra/entra_e.shtml', notes = coalesce(notes, 'Official IST English Program entry seeded as a target program.') where id = 'program-utokyo-ist' and website is null",
  "update programs set website = 'https://educ.titech.ac.jp/cs/eng/admissions/', notes = coalesce(notes, 'Science Tokyo CS admissions entry seeded as a target program.') where id = 'program-science-tokyo-cs' and website is null",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-utokyo-epiip','utokyo','English Program on Intelligent Information Processing','Master','English','https://www.i.u-tokyo.ac.jp/edu/entra/epiip_e.shtml','See official EPIIP application guide and eligibility attachments.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-utokyo-soe-international','utokyo','Graduate School of Engineering International Admission','Master / Doctoral','English','https://www.t.u-tokyo.ac.jp/en/study-at-utokyo/soe/apply-abroad','See official Engineering guideline pages and PDFs.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-utokyo-gsfs-complex','utokyo','Graduate School of Frontier Sciences Complexity Science and Engineering','Master / Doctoral','English / Japanese','https://www.k.u-tokyo.ac.jp/complex/html/examinee/examinee_e.html','See official GSFS program and admission pages.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-isct-igp-c','science-tokyo','International Graduate Program C','Master / Doctoral','English','https://admissions.isct.ac.jp/en/013/graduate/programs/science-and-engineering/igp-c','See official Science Tokyo IGP-C page.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-isct-igp-a','science-tokyo','International Graduate Program A','Master / Doctoral','English','https://admissions.isct.ac.jp/en/013/graduate/programs/igp/igp-a','See official Science Tokyo IGP-A page.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-isct-ipsss','science-tokyo','International Program on Super Smart Society','Master / Doctoral','English','https://www.e.titech.ac.jp/igpa/','See official IPSSS program page.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-osaka-ist-itsce','osaka','Information Technology Special Course in English','Master / Doctoral','English','https://www.ist.osaka-u.ac.jp/english/examinees/admission/','See official Osaka IST English admission pages.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-osaka-es21','osaka','Engineering Science 21st Century Special Program','Master / Doctoral','English','https://www.es.osaka-u.ac.jp/en/admission-aid/mext-granted/index.html','See official Engineering Science admission pages.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-osaka-eng-global','osaka','Graduate School of Engineering Global Science and Engineering Course','Master / Doctoral','English','https://www.eng.osaka-u.ac.jp/en/entrance/f_admissions/','See official Osaka Engineering foreign admissions page.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tohoku-gsis','tohoku','Graduate School of Information Sciences International Admission','Master / Doctoral','English / Japanese','https://www.is.tohoku.ac.jp/en/entrance/exam.html','See official GSIS entrance exam portal and guide PDFs.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tohoku-nifs','tohoku','New International Graduate Program for Future Society','Master','English','https://sgpis.is.tohoku.ac.jp/nifs/application.html','See official NIFS application guideline.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tohoku-aiqds','tohoku','AI, Quantum Computing and Data Science International Program','Master / Doctoral','English','https://www.is.tohoku.ac.jp/_eng/aiqds/','See official AIQDS page and application instructions.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tohoku-imacg','tohoku','International Mechanical and Aerospace Engineering Course','Master / Doctoral','English','https://www.imac.mech.tohoku.ac.jp/admission/','Secondary relevance for robotics/control; verify fit manually.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tsukuba-cse','tsukuba','Computer Science English Program','Master','English','https://www.cs.tsukuba.ac.jp/english/admission.html','See official CSE admission page and overseas-residents guidelines.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tsukuba-aisip','tsukuba','AI Social Implementation Program','Master','English','https://www.cs.tsukuba.ac.jp/aisip/','See official AISIP page and guidelines.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tsukuba-airb','tsukuba','Artificial Intelligence and Intelligent Robotics Program','Master','English','https://www.sie.tsukuba.ac.jp/eng/wp-content/uploads/AIRB-2026-Application-Guidelines.pdf','See official AIRB guideline PDF.','Official resource seed; extract details from linked resources.')",
  "insert or ignore into programs (id,university_id,program_name,degree,language,website,requirements,notes) values ('program-tsukuba-emp','tsukuba','Empowerment Informatics Program','Master / Doctoral','English / Japanese','https://www.emp.tsukuba.ac.jp/english','See official Empowerment Informatics page.','Official resource seed; extract details from linked resources.')",
];

const RESOURCE_LINK_SEED_SQL: readonly string[] = [
  "update intelligence_resources set program_id = 'program-utokyo-ist' where id like 'sgu-utokyo-ist-%'",
  "update intelligence_resources set program_id = 'program-utokyo-epiip' where id like 'sgu-utokyo-epiip-%'",
  "update intelligence_resources set program_id = 'program-utokyo-soe-international' where id like 'sgu-utokyo-soe-%'",
  "update intelligence_resources set program_id = 'program-utokyo-gsfs-complex' where id like 'sgu-utokyo-gsfs-%'",
  "update intelligence_resources set program_id = 'program-isct-igp-c' where id like 'sgu-isct-igpc-%'",
  "update intelligence_resources set program_id = 'program-isct-igp-a' where id like 'sgu-isct-igpa-%'",
  "update intelligence_resources set program_id = 'program-isct-ipsss' where id like 'sgu-isct-ipsss-%'",
  "update intelligence_resources set program_id = 'program-science-tokyo-cs' where id like 'sgu-isct-cs-%'",
  "update intelligence_resources set program_id = 'program-osaka-ist-itsce' where id like 'sgu-osaka-ist-%'",
  "update intelligence_resources set program_id = 'program-osaka-es21' where id like 'sgu-osaka-es21-%'",
  "update intelligence_resources set program_id = 'program-osaka-eng-global' where id like 'sgu-osaka-eng-%'",
  "update intelligence_resources set program_id = 'program-tohoku-gsis' where id like 'sgu-tohoku-gsis-%'",
  "update intelligence_resources set program_id = 'program-tohoku-nifs' where id like 'sgu-tohoku-nifs-%'",
  "update intelligence_resources set program_id = 'program-tohoku-aiqds' where id like 'sgu-tohoku-aiqds-%'",
  "update intelligence_resources set program_id = 'program-tohoku-imacg' where id like 'sgu-tohoku-imacg-%'",
  "update intelligence_resources set program_id = 'program-tsukuba-cse' where id like 'sgu-tsukuba-cse-%'",
  "update intelligence_resources set program_id = 'program-tsukuba-aisip' where id like 'sgu-tsukuba-aisip-%'",
  "update intelligence_resources set program_id = 'program-tsukuba-airb' where id like 'sgu-tsukuba-airb-%'",
  "update intelligence_resources set program_id = 'program-tsukuba-emp' where id like 'sgu-tsukuba-emp-%'",
  "update radar_sources set source_type = 'program_page' where id like 'src-sgu-%' and source_type = 'webpage'",
];

const COMPATIBILITY_SQL: readonly string[] = [
  "alter table paper_candidates add column resource_type text not null default 'paper'",
  "alter table paper_candidates add column university_id text references universities(id) on delete set null",
  "alter table paper_candidates add column program_id text references programs(id) on delete set null",
  "alter table paper_candidates add column professor_id text references professors(id) on delete set null",
  "alter table paper_candidates add column relevance_note text",
  "alter table paper_candidates add column decision_impact text",
  "alter table paper_candidates add column confidence text",
  "alter table paper_candidates add column evidence_type text",
  "alter table paper_candidates add column domain_source text",
  "alter table paper_candidates add column content_text text",
  "alter table paper_candidates add column excerpt text",
  "alter table paper_candidates add column raw_snapshot text",
  "alter table paper_candidates add column snapshot_at text",
  "alter table paper_candidates add column confidence_score real",
  "alter table paper_candidates add column enrichment_status text not null default 'pending'",
  "alter table paper_candidates add column enriched_at text",
  "alter table paper_candidates add column enrichment_error text",
  "alter table radar_sources add column university_id text references universities(id) on delete set null",
  "alter table radar_sources add column confidence text",
  "alter table radar_sources add column check_frequency text",
  "alter table radar_sources add column patrol_status text not null default 'never_checked'",
  "alter table radar_sources add column last_http_status integer",
  "alter table radar_sources add column last_title text",
  "alter table radar_sources add column content_hash text",
  "alter table radar_sources add column last_checked_at text",
  "alter table radar_sources add column last_changed_at text",
  "alter table radar_sources add column reliability_score real",
  "alter table radar_sources add column last_candidate_created_at text",
  "alter table radar_sources add column last_error text",
  "alter table radar_sources add column consecutive_failures integer not null default 0",
  "alter table radar_sources add column last_run_id text references automation_runs(id) on delete set null",
  "alter table radar_sources add column priority text not null default 'normal'",
  "alter table radar_sources add column ai_enrichment_enabled integer not null default 1",
  "alter table intelligence_resources add column content_text text",
  "alter table intelligence_resources add column excerpt text",
  "alter table intelligence_resources add column raw_snapshot text",
  "alter table intelligence_resources add column snapshot_at text",
  "alter table intelligence_resources add column confidence_score real",
  "alter table intelligence_resources add column confidence_last_verified text",
  "alter table intelligence_resources add column extracted_facts text",
  "alter table intelligence_resources add column extraction_status text not null default 'pending'",
  "alter table intelligence_resources add column extracted_at text",
  "alter table intelligence_resources add column extraction_model text",
  "alter table intelligence_resources add column extraction_error text",
  "alter table intelligence_resources add column extraction_input_tokens integer",
  "alter table intelligence_resources add column extraction_output_tokens integer",
  "alter table intelligence_resources add column extraction_cache_read_tokens integer",
  "alter table intelligence_resources add column resource_status text not null default 'unverified'",
  "alter table professors add column match_reason text",
  "alter table programs add column match_reason text",
  "create table if not exists user_profile (id text primary key default 'me', research_background text, target_fields text, updated_at text not null default (datetime('now')))",
  "insert or ignore into user_profile (id) values ('me')",
  "create index if not exists idx_candidates_resource_type on paper_candidates(resource_type)",
  "create index if not exists idx_candidates_university_id on paper_candidates(university_id)",
  "create index if not exists idx_candidates_status_type on paper_candidates(status, resource_type)",
  "create index if not exists idx_radar_sources_university_id on radar_sources(university_id)",
  "create index if not exists idx_resources_extraction_status on intelligence_resources(extraction_status)",
  "create index if not exists idx_resources_status on intelligence_resources(resource_status)",
  "create index if not exists idx_candidates_enrichment_status on paper_candidates(enrichment_status)",
  "create index if not exists idx_radar_sources_priority on radar_sources(priority)",
];

function isRecoverableInitError(sql: string, error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (message.includes("duplicate column name")) return true;
  return sql.toLowerCase().startsWith("create index") && message.includes("no such column");
}

async function runInitStatement(db: D1Database, sql: string): Promise<boolean> {
  try {
    await db.prepare(sql).run();
    return true;
  } catch (error) {
    if (isRecoverableInitError(sql, error)) return false;
    throw error;
  }
}

export async function initializeDatabase(db: D1Database): Promise<{ ok: true; statements: number }> {
  const statements = [
    ...SCHEMA_SQL,
    ...COMPATIBILITY_SQL,
    ...SEED_SQL,
    ...TARGET_PROGRAM_SEED_SQL,
    ...SGU_PROGRAM_SEED_STATEMENTS,
    ...RESOURCE_LINK_SEED_SQL,
  ];
  let executed = 0;
  for (const sql of statements) {
    if (await runInitStatement(db, sql)) executed++;
  }
  return { ok: true, statements: executed };
}
