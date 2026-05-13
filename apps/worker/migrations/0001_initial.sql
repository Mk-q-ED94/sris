create table if not exists universities (
  id text primary key,
  name text not null unique,
  location text,
  website text,
  tuition real,
  notes text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists programs (
  id text primary key,
  university_id text not null references universities(id) on delete cascade,
  program_name text not null,
  degree text,
  language text,
  deadline text,
  requirements text,
  scholarship text,
  tuition real,
  website text,
  notes text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists professors (
  id text primary key,
  university_id text not null references universities(id) on delete cascade,
  name text not null,
  title text,
  email text,
  website text,
  research_keywords text not null default '[]',
  notes text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists labs (
  id text primary key,
  university_id text not null references universities(id) on delete cascade,
  professor_id text references professors(id) on delete set null,
  lab_name text not null,
  research_keywords text not null default '[]',
  website text,
  recent_papers text not null default '[]',
  notes text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists papers (
  id text primary key,
  title text not null,
  authors text not null default '[]',
  venue text,
  year integer,
  url text not null unique,
  source text,
  published_at text,
  keywords text not null default '[]',
  abstract text,
  summary text,
  ai_status text not null default 'pending',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists radar_sources (
  id text primary key,
  name text not null unique,
  source_type text not null default 'arxiv',
  url text,
  query text,
  keywords text not null default '[]',
  enabled integer not null default 1,
  last_run_at text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists paper_candidates (
  id text primary key,
  source_id text references radar_sources(id) on delete set null,
  source text,
  title text not null,
  authors text not null default '[]',
  abstract text,
  url text not null unique,
  published_at text,
  matched_keywords text not null default '[]',
  raw_payload text not null default '{}',
  status text not null default 'pending',
  ignore_reason text,
  reviewed_at text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists timeline_tasks (
  id text primary key,
  title text not null,
  deadline text,
  priority text not null default 'medium',
  status text not null default 'todo',
  task_type text,
  related_university_id text references universities(id) on delete set null,
  related_program_id text references programs(id) on delete set null,
  notes text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create index if not exists idx_programs_university_id on programs(university_id);
create index if not exists idx_programs_deadline on programs(deadline);
create index if not exists idx_professors_university_id on professors(university_id);
create index if not exists idx_labs_university_id on labs(university_id);
create index if not exists idx_papers_year on papers(year);
create index if not exists idx_candidates_status on paper_candidates(status);
create index if not exists idx_candidates_published_at on paper_candidates(published_at desc);
create index if not exists idx_timeline_deadline on timeline_tasks(deadline);
create index if not exists idx_timeline_status on timeline_tasks(status);
