-- Target program baseline and resource links.
-- These rows make the seeded official resources visible as structured programs
-- without pretending to have fully extracted every deadline/material field.

UPDATE programs
SET website = 'https://www.i.u-tokyo.ac.jp/edu/entra/entra_e.shtml',
    notes = COALESCE(notes, 'Official IST English Program entry seeded as a target program.')
WHERE id = 'program-utokyo-ist' AND website IS NULL;

UPDATE programs
SET website = 'https://educ.titech.ac.jp/cs/eng/admissions/',
    notes = COALESCE(notes, 'Science Tokyo CS admissions entry seeded as a target program.')
WHERE id = 'program-science-tokyo-cs' AND website IS NULL;

INSERT OR IGNORE INTO programs (id, university_id, program_name, degree, language, website, requirements, notes) VALUES
  ('program-utokyo-epiip', 'utokyo', 'English Program on Intelligent Information Processing', 'Master', 'English', 'https://www.i.u-tokyo.ac.jp/edu/entra/epiip_e.shtml', 'See official EPIIP application guide and eligibility attachments.', 'Official resource seed; extract details from linked resources.'),
  ('program-utokyo-soe-international', 'utokyo', 'Graduate School of Engineering International Admission', 'Master / Doctoral', 'English', 'https://www.t.u-tokyo.ac.jp/en/study-at-utokyo/soe/apply-abroad', 'See official Engineering guideline pages and PDFs.', 'Official resource seed; extract details from linked resources.'),
  ('program-utokyo-gsfs-complex', 'utokyo', 'Graduate School of Frontier Sciences Complexity Science and Engineering', 'Master / Doctoral', 'English / Japanese', 'https://www.k.u-tokyo.ac.jp/complex/html/examinee/examinee_e.html', 'See official GSFS program and admission pages.', 'Official resource seed; extract details from linked resources.'),
  ('program-isct-igp-c', 'science-tokyo', 'International Graduate Program C', 'Master / Doctoral', 'English', 'https://admissions.isct.ac.jp/en/013/graduate/programs/science-and-engineering/igp-c', 'See official Science Tokyo IGP-C page.', 'Official resource seed; extract details from linked resources.'),
  ('program-isct-igp-a', 'science-tokyo', 'International Graduate Program A', 'Master / Doctoral', 'English', 'https://admissions.isct.ac.jp/en/013/graduate/programs/igp/igp-a', 'See official Science Tokyo IGP-A page.', 'Official resource seed; extract details from linked resources.'),
  ('program-isct-ipsss', 'science-tokyo', 'International Program on Super Smart Society', 'Master / Doctoral', 'English', 'https://www.e.titech.ac.jp/igpa/', 'See official IPSSS program page.', 'Official resource seed; extract details from linked resources.'),
  ('program-osaka-ist-itsce', 'osaka', 'Information Technology Special Course in English', 'Master / Doctoral', 'English', 'https://www.ist.osaka-u.ac.jp/english/examinees/admission/', 'See official Osaka IST English admission pages.', 'Official resource seed; extract details from linked resources.'),
  ('program-osaka-es21', 'osaka', 'Engineering Science 21st Century Special Program', 'Master / Doctoral', 'English', 'https://www.es.osaka-u.ac.jp/en/admission-aid/mext-granted/index.html', 'See official Engineering Science admission pages.', 'Official resource seed; extract details from linked resources.'),
  ('program-osaka-eng-global', 'osaka', 'Graduate School of Engineering Global Science and Engineering Course', 'Master / Doctoral', 'English', 'https://www.eng.osaka-u.ac.jp/en/entrance/f_admissions/', 'See official Osaka Engineering foreign admissions page.', 'Official resource seed; extract details from linked resources.'),
  ('program-tohoku-gsis', 'tohoku', 'Graduate School of Information Sciences International Admission', 'Master / Doctoral', 'English / Japanese', 'https://www.is.tohoku.ac.jp/en/entrance/exam.html', 'See official GSIS entrance exam portal and guide PDFs.', 'Official resource seed; extract details from linked resources.'),
  ('program-tohoku-nifs', 'tohoku', 'New International Graduate Program for Future Society', 'Master', 'English', 'https://sgpis.is.tohoku.ac.jp/nifs/application.html', 'See official NIFS application guideline.', 'Official resource seed; extract details from linked resources.'),
  ('program-tohoku-aiqds', 'tohoku', 'AI, Quantum Computing and Data Science International Program', 'Master / Doctoral', 'English', 'https://www.is.tohoku.ac.jp/_eng/aiqds/', 'See official AIQDS page and application instructions.', 'Official resource seed; extract details from linked resources.'),
  ('program-tohoku-imacg', 'tohoku', 'International Mechanical and Aerospace Engineering Course', 'Master / Doctoral', 'English', 'https://www.imac.mech.tohoku.ac.jp/admission/', 'Secondary relevance for robotics/control; verify fit manually.', 'Official resource seed; extract details from linked resources.'),
  ('program-tsukuba-cse', 'tsukuba', 'Computer Science English Program', 'Master', 'English', 'https://www.cs.tsukuba.ac.jp/english/admission.html', 'See official CSE admission page and overseas-residents guidelines.', 'Official resource seed; extract details from linked resources.'),
  ('program-tsukuba-aisip', 'tsukuba', 'AI Social Implementation Program', 'Master', 'English', 'https://www.cs.tsukuba.ac.jp/aisip/', 'See official AISIP page and guidelines.', 'Official resource seed; extract details from linked resources.'),
  ('program-tsukuba-airb', 'tsukuba', 'Artificial Intelligence and Intelligent Robotics Program', 'Master', 'English', 'https://www.sie.tsukuba.ac.jp/eng/wp-content/uploads/AIRB-2026-Application-Guidelines.pdf', 'See official AIRB guideline PDF.', 'Official resource seed; extract details from linked resources.'),
  ('program-tsukuba-emp', 'tsukuba', 'Empowerment Informatics Program', 'Master / Doctoral', 'English / Japanese', 'https://www.emp.tsukuba.ac.jp/english', 'See official Empowerment Informatics page.', 'Official resource seed; extract details from linked resources.');

UPDATE intelligence_resources SET program_id = 'program-utokyo-ist' WHERE id LIKE 'sgu-utokyo-ist-%';
UPDATE intelligence_resources SET program_id = 'program-utokyo-epiip' WHERE id LIKE 'sgu-utokyo-epiip-%';
UPDATE intelligence_resources SET program_id = 'program-utokyo-soe-international' WHERE id LIKE 'sgu-utokyo-soe-%';
UPDATE intelligence_resources SET program_id = 'program-utokyo-gsfs-complex' WHERE id LIKE 'sgu-utokyo-gsfs-%';
UPDATE intelligence_resources SET program_id = 'program-isct-igp-c' WHERE id LIKE 'sgu-isct-igpc-%';
UPDATE intelligence_resources SET program_id = 'program-isct-igp-a' WHERE id LIKE 'sgu-isct-igpa-%';
UPDATE intelligence_resources SET program_id = 'program-isct-ipsss' WHERE id LIKE 'sgu-isct-ipsss-%';
UPDATE intelligence_resources SET program_id = 'program-science-tokyo-cs' WHERE id LIKE 'sgu-isct-cs-%';
UPDATE intelligence_resources SET program_id = 'program-osaka-ist-itsce' WHERE id LIKE 'sgu-osaka-ist-%';
UPDATE intelligence_resources SET program_id = 'program-osaka-es21' WHERE id LIKE 'sgu-osaka-es21-%';
UPDATE intelligence_resources SET program_id = 'program-osaka-eng-global' WHERE id LIKE 'sgu-osaka-eng-%';
UPDATE intelligence_resources SET program_id = 'program-tohoku-gsis' WHERE id LIKE 'sgu-tohoku-gsis-%';
UPDATE intelligence_resources SET program_id = 'program-tohoku-nifs' WHERE id LIKE 'sgu-tohoku-nifs-%';
UPDATE intelligence_resources SET program_id = 'program-tohoku-aiqds' WHERE id LIKE 'sgu-tohoku-aiqds-%';
UPDATE intelligence_resources SET program_id = 'program-tohoku-imacg' WHERE id LIKE 'sgu-tohoku-imacg-%';
UPDATE intelligence_resources SET program_id = 'program-tsukuba-cse' WHERE id LIKE 'sgu-tsukuba-cse-%';
UPDATE intelligence_resources SET program_id = 'program-tsukuba-aisip' WHERE id LIKE 'sgu-tsukuba-aisip-%';
UPDATE intelligence_resources SET program_id = 'program-tsukuba-airb' WHERE id LIKE 'sgu-tsukuba-airb-%';
UPDATE intelligence_resources SET program_id = 'program-tsukuba-emp' WHERE id LIKE 'sgu-tsukuba-emp-%';

UPDATE radar_sources SET source_type = 'program_page' WHERE id LIKE 'src-sgu-%' AND source_type = 'webpage';
