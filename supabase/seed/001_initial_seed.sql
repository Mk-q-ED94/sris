insert into public.universities (name, location, website, notes)
values
  ('The University of Tokyo', 'Tokyo', 'https://www.u-tokyo.ac.jp/en/', 'Target: AI, CS, Systems, Information Science and Technology'),
  ('Science Tokyo', 'Tokyo / Yokohama', 'https://www.isct.ac.jp/en', 'Former Tokyo Tech / TMDU integration; track CS and systems labs'),
  ('Osaka University', 'Osaka', 'https://www.osaka-u.ac.jp/en', 'Track IST and engineering programs'),
  ('Tohoku University', 'Sendai', 'https://www.tohoku.ac.jp/en/', 'Track AI, robotics, information sciences'),
  ('University of Tsukuba', 'Tsukuba', 'https://www.tsukuba.ac.jp/en/', 'Track CS, intelligent interaction, systems programs')
on conflict (name) do nothing;

insert into public.radar_sources (name, source_type, query, keywords)
values
  ('arXiv AI Systems', 'arxiv', 'machine learning systems', '["systems", "inference", "training", "distributed", "GPU"]'::jsonb),
  ('arXiv LLM Inference', 'arxiv', 'large language model inference', '["inference", "serving", "latency", "throughput", "LLM"]'::jsonb),
  ('arXiv AI Agents', 'arxiv', 'AI agents planning tool use', '["agent", "planning", "tool use", "reasoning"]'::jsonb),
  ('arXiv Networks for ML', 'arxiv', 'network systems machine learning', '["network", "distributed", "systems", "optimization"]'::jsonb)
on conflict (name) do nothing;

insert into public.timeline_tasks (title, deadline, priority, status, task_type, notes)
values
  ('TOEFL score planning checkpoint', current_date + interval '30 days', 'high', 'todo', 'TOEFL', 'Confirm target test window and score gap.'),
  ('JLPT study milestone', current_date + interval '60 days', 'medium', 'todo', 'JLPT', 'Review whether JLPT helps specific programs.'),
  ('SOP research direction draft', current_date + interval '75 days', 'high', 'todo', 'SOP', 'Draft AI systems research narrative and lab fit.'),
  ('Recommendation letter candidate list', current_date + interval '90 days', 'medium', 'todo', 'Recommendation', 'Identify recommenders and evidence package.')
on conflict do nothing;
