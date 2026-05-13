create extension if not exists pgcrypto;

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text,
  website text,
  tuition numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  program_name text not null,
  degree text,
  language text,
  deadline date,
  requirements text,
  scholarship text,
  tuition numeric(12, 2),
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professors (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  title text,
  email text,
  website text,
  research_keywords jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  professor_id uuid references public.professors(id) on delete set null,
  lab_name text not null,
  research_keywords jsonb not null default '[]'::jsonb,
  website text,
  recent_papers jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors jsonb not null default '[]'::jsonb,
  venue text,
  year integer,
  url text not null unique,
  source text,
  published_at date,
  keywords jsonb not null default '[]'::jsonb,
  abstract text,
  summary text,
  ai_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.radar_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null default 'arxiv',
  url text,
  query text,
  keywords jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.paper_candidates (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.radar_sources(id) on delete set null,
  source text,
  title text not null,
  authors jsonb not null default '[]'::jsonb,
  abstract text,
  url text not null unique,
  published_at timestamptz,
  matched_keywords jsonb not null default '[]'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  ignore_reason text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  deadline date,
  priority text not null default 'medium',
  status text not null default 'todo',
  task_type text,
  related_university_id uuid references public.universities(id) on delete set null,
  related_program_id uuid references public.programs(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_programs_university_id on public.programs(university_id);
create index if not exists idx_programs_deadline on public.programs(deadline);
create index if not exists idx_professors_university_id on public.professors(university_id);
create index if not exists idx_labs_university_id on public.labs(university_id);
create index if not exists idx_papers_year on public.papers(year);
create index if not exists idx_papers_venue on public.papers(venue);
create index if not exists idx_candidates_status on public.paper_candidates(status);
create index if not exists idx_candidates_published_at on public.paper_candidates(published_at desc);
create index if not exists idx_timeline_deadline on public.timeline_tasks(deadline);
create index if not exists idx_timeline_status on public.timeline_tasks(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_universities_updated_at on public.universities;
create trigger set_universities_updated_at before update on public.universities
for each row execute procedure public.set_updated_at();

drop trigger if exists set_programs_updated_at on public.programs;
create trigger set_programs_updated_at before update on public.programs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_professors_updated_at on public.professors;
create trigger set_professors_updated_at before update on public.professors
for each row execute procedure public.set_updated_at();

drop trigger if exists set_labs_updated_at on public.labs;
create trigger set_labs_updated_at before update on public.labs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_papers_updated_at on public.papers;
create trigger set_papers_updated_at before update on public.papers
for each row execute procedure public.set_updated_at();

drop trigger if exists set_radar_sources_updated_at on public.radar_sources;
create trigger set_radar_sources_updated_at before update on public.radar_sources
for each row execute procedure public.set_updated_at();

drop trigger if exists set_paper_candidates_updated_at on public.paper_candidates;
create trigger set_paper_candidates_updated_at before update on public.paper_candidates
for each row execute procedure public.set_updated_at();

drop trigger if exists set_timeline_tasks_updated_at on public.timeline_tasks;
create trigger set_timeline_tasks_updated_at before update on public.timeline_tasks
for each row execute procedure public.set_updated_at();
