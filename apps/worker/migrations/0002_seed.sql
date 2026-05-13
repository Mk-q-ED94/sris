insert or ignore into universities (id, name, location, website, notes) values
  ('utokyo', 'The University of Tokyo', 'Tokyo', 'https://www.u-tokyo.ac.jp/en/', 'Target: AI, CS, Systems, Information Science and Technology'),
  ('science-tokyo', 'Science Tokyo', 'Tokyo / Yokohama', 'https://www.isct.ac.jp/en', 'Former Tokyo Tech / TMDU integration; track CS and systems labs'),
  ('osaka', 'Osaka University', 'Osaka', 'https://www.osaka-u.ac.jp/en', 'Track IST and engineering programs'),
  ('tohoku', 'Tohoku University', 'Sendai', 'https://www.tohoku.ac.jp/en/', 'Track AI, robotics, information sciences'),
  ('tsukuba', 'University of Tsukuba', 'Tsukuba', 'https://www.tsukuba.ac.jp/en/', 'Track CS, intelligent interaction, systems programs');

insert or ignore into professors (id, university_id, name, title, website, research_keywords, notes) values
  ('prof-science-tokyo-ai-systems', 'science-tokyo', 'Example Professor', 'Professor', 'https://example.com', '["AI systems","distributed training"]', 'Replace with real professor profile after manual review.');

insert or ignore into labs (id, university_id, professor_id, lab_name, research_keywords, website, recent_papers, notes) values
  ('lab-ai-systems', 'science-tokyo', 'prof-science-tokyo-ai-systems', 'AI Systems Lab', '["systems","distributed training","LLM inference"]', 'https://example.com', '["Efficient inference scheduling for foundation models"]', 'Seed lab for structure validation.');

insert or ignore into programs (id, university_id, program_name, degree, language, deadline, requirements) values
  ('program-utokyo-ist', 'utokyo', 'Graduate School of Information Science and Technology', 'Master', 'English / Japanese', '2026-08-20', 'SOP, transcripts, English score, recommendation letters'),
  ('program-science-tokyo-cs', 'science-tokyo', 'Computer Science International Graduate Program', 'Master', 'English', '2026-07-15', 'Research plan, English score, interview');

insert or ignore into radar_sources (id, name, source_type, query, keywords, enabled) values
  ('source-ai-systems', 'arXiv AI Systems', 'arxiv', 'machine learning systems', '["systems","inference","training","distributed","GPU"]', 1),
  ('source-llm-inference', 'arXiv LLM Inference', 'arxiv', 'large language model inference', '["inference","serving","latency","throughput","LLM"]', 1),
  ('source-ai-agents', 'arXiv AI Agents', 'arxiv', 'AI agents planning tool use', '["agent","planning","tool use","reasoning"]', 1),
  ('source-networks-ml', 'arXiv Networks for ML', 'arxiv', 'network systems machine learning', '["network","distributed","systems","optimization"]', 1);

insert or ignore into timeline_tasks (id, title, deadline, priority, status, task_type, notes) values
  ('task-toefl', 'TOEFL score planning checkpoint', date('now', '+30 day'), 'high', 'todo', 'TOEFL', 'Confirm target test window and score gap.'),
  ('task-jlpt', 'JLPT study milestone', date('now', '+60 day'), 'medium', 'todo', 'JLPT', 'Review whether JLPT helps specific programs.'),
  ('task-sop', 'SOP research direction draft', date('now', '+75 day'), 'high', 'todo', 'SOP', 'Draft AI systems research narrative and lab fit.'),
  ('task-recommendation', 'Recommendation letter candidate list', date('now', '+90 day'), 'medium', 'todo', 'Recommendation', 'Identify recommenders and evidence package.');
