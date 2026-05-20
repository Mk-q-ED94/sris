// Generated from apps/worker/migrations/0010_sgu_program_seed.sql.
// Keep the migration as the source-of-truth for deployed D1 upgrades; this
// module lets /api/admin/init seed fresh local/new databases with the same
// official SGU resource baseline.

const SGU_PROGRAM_SEED_SQL = String.raw`-- SGU AI / CS / Systems / Information programs seed
--
-- Source: research agents over 2026-05 (UTokyo / Science Tokyo / Osaka / Tohoku / Tsukuba)
-- All university domains return HTTP 403 to the sandbox, so PDF binaries were
-- not downloaded — only the official URLs are seeded. The Worker's
-- routes/fetch.ts background fetch will populate \`content_text\` / \`raw_snapshot\`
-- / \`snapshot_at\` when the production environment reaches the pages.
--
-- Convention:
--   id format: \`sgu-<uni>-<slug>-<kind>\` (stable so re-running the migration is
--   a no-op via INSERT OR IGNORE).
--   resource_type: 'program_page' for HTML hubs, 'admission_notice' for the
--                  application-guideline PDFs.
--   confidence:   'high' (all .ac.jp official sources)
--   confidence_score: 0.92  (high but not 1.0 — pending in-app verification)
--   decision_impact: one of
--     - 'program_overview'      (entry portal, what the program is)
--     - 'application_window'    (deadlines + cycle)
--     - 'admission_requirements'(transcripts, TOEFL, supervisor consent…)
--     - 'department_context'    (host dept / school background)

------------------------------------------------------------
-- The University of Tokyo
------------------------------------------------------------

-- IST · English Program (regular Master's, all 6 departments)
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-utokyo-ist-en-page', 'UTokyo IST — English Program (Master''s entrance)', 'https://www.i.u-tokyo.ac.jp/edu/entra/entra_e.shtml', 'program_page', 'sgu_research', 'utokyo', 'high', 'program_overview', 'IST Master''s English track across CS / Math Informatics / Info Physics / Mechano / Creative Informatics — degree identical to Japanese track.', 'i.u-tokyo.ac.jp', 0.92),
  ('sgu-utokyo-ist-en-master-pdf', 'UTokyo IST — Master''s Admission Guide 2026', 'https://www.i.u-tokyo.ac.jp/edu/entra/2026_admission-g_m_e.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'admission_requirements', 'Master''s admission guide; web application due 14:00 JST Thu June 4 2026 for AY2027 summer cycle.', 'i.u-tokyo.ac.jp', 0.92),
  ('sgu-utokyo-ist-en-toefl-pdf', 'UTokyo IST — Guidelines for Submission of TOEFL Scores 2026', 'https://www.i.u-tokyo.ac.jp/edu/entra/2026_guidelines-toefl-scores_e.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'admission_requirements', 'TOEFL iBT submission rules for IST applicants.', 'i.u-tokyo.ac.jp', 0.92),
  ('sgu-utokyo-ist-creative-pdf', 'UTokyo IST — Creative Informatics 2026 Admission Guide', 'https://www.i.u-tokyo.ac.jp/edu/course/ci/2025/2026admin-guide-en.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'admission_requirements', 'Department-specific admission PDF for Creative Informatics.', 'i.u-tokyo.ac.jp', 0.9);

-- EPIIP — English Program on Intelligent Information Processing
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-utokyo-epiip-page', 'UTokyo IST — EPIIP entrance', 'https://www.i.u-tokyo.ac.jp/edu/entra/epiip_e.shtml', 'program_page', 'sgu_research', 'utokyo', 'high', 'program_overview', 'Cross-departmental English special admission (AI / DS / cybersecurity / robotics / CS). MEXT-eligible.', 'i.u-tokyo.ac.jp', 0.94),
  ('sgu-utokyo-epiip-program-page', 'UTokyo IST — EPIIP program info', 'https://www.i.u-tokyo.ac.jp/edu/epiip/index_e.shtml', 'program_page', 'sgu_research', 'utokyo', 'high', 'program_overview', 'EPIIP curriculum + faculty list.', 'i.u-tokyo.ac.jp', 0.92),
  ('sgu-utokyo-epiip-guide-pdf', 'UTokyo IST — EPIIP Application Guide', 'https://www.i.u-tokyo.ac.jp/edu/entra/epiip/epiip23_Guide_e.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'admission_requirements', 'EPIIP application guide PDF; document + interview, no on-site exam.', 'i.u-tokyo.ac.jp', 0.85),
  ('sgu-utokyo-epiip-attachment-pdf', 'UTokyo IST — EPIIP 2025 eligibility attachment', 'https://www.i.u-tokyo.ac.jp/edu/entra/epiip2025/epiip2025_attachment1_e.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'admission_requirements', 'Eligibility / document requirements appendix.', 'i.u-tokyo.ac.jp', 0.9);

-- Graduate School of Engineering — International Admission
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-utokyo-soe-guideline-page', 'UTokyo Engineering — Apply / Guideline', 'https://www.t.u-tokyo.ac.jp/en/study-at-utokyo/soe/apply/guideline', 'program_page', 'sgu_research', 'utokyo', 'high', 'program_overview', 'Graduate School of Engineering English programs portal. Schedule A: May 22 – June 4 2026 (Master).', 't.u-tokyo.ac.jp', 0.94),
  ('sgu-utokyo-soe-abroad-page', 'UTokyo Engineering — Apply from Abroad', 'https://www.t.u-tokyo.ac.jp/en/study-at-utokyo/soe/apply-abroad', 'program_page', 'sgu_research', 'utokyo', 'high', 'admission_requirements', 'International admission program details (G30-family).', 't.u-tokyo.ac.jp', 0.92),
  ('sgu-utokyo-soe-tm-guide-pdf', 'UTokyo Engineering — 2027 Guide to Entrance Examination (Master)', 'https://www.t.u-tokyo.ac.jp/hubfs/admission/2026/0403/tm_guide_e.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'application_window', 'Engineering Master entrance exam guide for 2027 entry.', 't.u-tokyo.ac.jp', 0.9),
  ('sgu-utokyo-soe-2026-guide-pdf', 'UTokyo Engineering — 2026 Master / Doctoral Guide', 'https://www.t.u-tokyo.ac.jp/hubfs/admission/2025/1027/36_J_2026_b_en.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'application_window', '2026 entry guide.', 't.u-tokyo.ac.jp', 0.88);

-- Frontier Sciences — Complexity Science & Engineering
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-utokyo-gsfs-complex-page', 'UTokyo GSFS — Complexity Sci & Eng', 'https://www.k.u-tokyo.ac.jp/complex/html/examinee/examinee_e.html', 'program_page', 'sgu_research', 'utokyo', 'medium', 'program_overview', 'Dept. of Complexity Science and Engineering English-track admission; TOEFL/TOEIC required (Schedule A).', 'k.u-tokyo.ac.jp', 0.78),
  ('sgu-utokyo-gsfs-additional-pdf', 'UTokyo GSFS — Additional Documents for 2026 Master''s applicants', 'https://www.k.u-tokyo.ac.jp/en/assets/files/11INTER_AM_e.pdf', 'admission_notice', 'sgu_research', 'utokyo', 'high', 'admission_requirements', 'Required additional documents for international Master''s applicants.', 'k.u-tokyo.ac.jp', 0.88);

------------------------------------------------------------
-- Institute of Science Tokyo (formerly Tokyo Tech)
------------------------------------------------------------

-- IGP(C) — privately funded
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-isct-igpc-page', 'Science Tokyo — IGP(C) Sci & Eng', 'https://admissions.isct.ac.jp/en/013/graduate/programs/science-and-engineering/igp-c', 'program_page', 'sgu_research', 'science-tokyo', 'high', 'program_overview', 'University-wide English Master/Doctoral; School of Computing (CS + Math & Computing) participates. Supervisor consent required; English test no longer required since Spring 2025.', 'admissions.isct.ac.jp', 0.95),
  ('sgu-isct-igpc-spring-pdf', 'Science Tokyo — IGP(C) 2026 Spring Guide', 'https://www.titech.ac.jp/english/admissions/pdf/application-guide-igp-c--2026-spring-20250814.pdf', 'admission_notice', 'sgu_research', 'science-tokyo', 'high', 'application_window', 'Spring 2026 cycle application guide (now closed). Next call: ~Aug 2026.', 'titech.ac.jp', 0.92),
  ('sgu-isct-igpc-fall-pdf', 'Science Tokyo — IGP(C) 2025 Fall Guide', 'https://www.titech.ac.jp/english/admissions/pdf/application-guide-igp-c--2025-fall-20250206.pdf', 'admission_notice', 'sgu_research', 'science-tokyo', 'high', 'application_window', 'Fall 2025 cycle application guide.', 'titech.ac.jp', 0.9);

-- IGP(A) — MEXT track
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-isct-igpa-page', 'Science Tokyo — IGP(A) Theme-Focused', 'https://admissions.isct.ac.jp/en/013/graduate/programs/igp/igp-a', 'program_page', 'sgu_research', 'science-tokyo', 'high', 'program_overview', 'MEXT scholarship nominator route. Master+Doctoral integrated for MEXT.', 'admissions.isct.ac.jp', 0.94),
  ('sgu-isct-ipsss-page', 'Science Tokyo — IPSSS (Super-Smart Society)', 'https://www.e.titech.ac.jp/igpa/', 'program_page', 'sgu_research', 'science-tokyo', 'high', 'program_overview', 'IGP(A) curricular program — Engineering / Info & Comms Eng / Systems & Control. Consent deadline: 2025-11-23 for Fall 2026.', 'e.titech.ac.jp', 0.9);

-- School of Computing context
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-isct-cs-admissions-page', 'Science Tokyo — Dept. of CS admissions', 'https://educ.titech.ac.jp/cs/eng/admissions/', 'program_page', 'sgu_research', 'science-tokyo', 'high', 'department_context', 'CS host department for IGP(C)/(A). Offers CS and AI graduate majors.', 'educ.titech.ac.jp', 0.92),
  ('sgu-isct-ai-major-page', 'Science Tokyo — AI Graduate Major', 'https://educ.titech.ac.jp/cs/eng/education/ai_graduate/', 'program_page', 'sgu_research', 'science-tokyo', 'high', 'department_context', 'AI Graduate Major curriculum (mathematical science, computation theory, modeling).', 'educ.titech.ac.jp', 0.92),
  ('sgu-isct-mcs-page', 'Science Tokyo — Dept. of Math & Computing Sci', 'https://educ.titech.ac.jp/is/eng/', 'program_page', 'sgu_research', 'science-tokyo', 'high', 'department_context', 'Math & Computing Science host department.', 'educ.titech.ac.jp', 0.9);

------------------------------------------------------------
-- Osaka University
------------------------------------------------------------

-- ITSCE — IST English Course
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-osaka-ist-en-page', 'Osaka IST — English Examinees Admission', 'https://www.ist.osaka-u.ac.jp/english/examinees/admission/', 'program_page', 'sgu_research', 'osaka', 'high', 'program_overview', 'ITSCE — only IST master''s course fully in English. Spans CS / Info Networking / Multimedia / Bioinformatics / Info & Physical Sci / Pure & Applied Math.', 'ist.osaka-u.ac.jp', 0.94),
  ('sgu-osaka-ist-guidelines-page', 'Osaka IST — 2026 Guidelines', 'https://www.ist.osaka-u.ac.jp/english/examinees/admission/guidelines2026.php', 'program_page', 'sgu_research', 'osaka', 'high', 'application_window', '2026 entry admission window. Admission procedure period Feb 25-27 2026; AAD letter deadline Oct 3 2025.', 'ist.osaka-u.ac.jp', 0.92),
  ('sgu-osaka-ist-15a-pdf', 'Osaka IST — 2026 Application Form (15_a_EN2026.pdf)', 'https://www.ist.osaka-u.ac.jp/files/examinees/admission/2026/15_a_EN2026.pdf', 'admission_notice', 'sgu_research', 'osaka', 'high', 'admission_requirements', 'Application form set 15a.', 'ist.osaka-u.ac.jp', 0.9),
  ('sgu-osaka-ist-16a-pdf', 'Osaka IST — 2026 Application Form (16_a_EN2026.pdf)', 'https://www.ist.osaka-u.ac.jp/files/examinees/admission/2026/16_a_EN2026.pdf', 'admission_notice', 'sgu_research', 'osaka', 'high', 'admission_requirements', 'Application form set 16a.', 'ist.osaka-u.ac.jp', 0.9);

-- Engineering Science 21st Century (basic engineering grad school)
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-osaka-es21-mext-page', 'Osaka Eng Sci — MEXT-granted', 'https://www.es.osaka-u.ac.jp/en/admission-aid/mext-granted/index.html', 'program_page', 'sgu_research', 'osaka', 'high', 'program_overview', '21st-Century special program — MEXT scholarship track; English-only; Systems Sci / Materials / Math-Phys divisions.', 'es.osaka-u.ac.jp', 0.92),
  ('sgu-osaka-es21-grad-page', 'Osaka Eng Sci — Graduate Admissions', 'https://www.es.osaka-u.ac.jp/en/admission-aid/graduate-admissions/index.html', 'program_page', 'sgu_research', 'osaka', 'high', 'admission_requirements', 'TOEFL iBT ≥79 / IELTS ≥6.0; 2000-word study plan.', 'es.osaka-u.ac.jp', 0.9),
  ('sgu-osaka-es21-outline-pdf', 'Osaka Eng Sci — Program Outline & Features PDF', 'https://www.es.osaka-u.ac.jp/en/admission-aid/graduate-admissions/images/Outline_and_Features_of_Special_Program_of_Engineering_Science_21st_Century.pdf', 'admission_notice', 'sgu_research', 'osaka', 'high', 'program_overview', 'Outline of 21st Century special program.', 'es.osaka-u.ac.jp', 0.85),
  ('sgu-osaka-es21-robotics-pdf', 'Osaka Eng Sci — Robotics 2025 PDF', 'https://www.es.osaka-u.ac.jp/en/admission-aid/mext-granted/images/Robotics_2025.pdf', 'admission_notice', 'sgu_research', 'osaka', 'high', 'admission_requirements', 'Robotics track admission details.', 'es.osaka-u.ac.jp', 0.85);

-- Engineering — Electrical / Electronic / Infocomms
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-osaka-eng-fadmissions-page', 'Osaka Eng — Foreign Admissions', 'https://www.eng.osaka-u.ac.jp/en/entrance/f_admissions/', 'program_page', 'sgu_research', 'osaka', 'high', 'program_overview', 'Global Science & Engineering Course (Electrical / Electronic / Infocommunications). Two intakes (April + October).', 'eng.osaka-u.ac.jp', 0.92);

------------------------------------------------------------
-- Tohoku University
------------------------------------------------------------

-- GSIS Master's — Computer and Mathematical Sciences
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tohoku-gsis-exam-page', 'Tohoku GSIS — Entrance Exam Portal', 'https://www.is.tohoku.ac.jp/en/entrance/exam.html', 'program_page', 'sgu_research', 'tohoku', 'high', 'program_overview', 'GSIS Master''s entrance exam hub. Dept. of Computer & Math Sci / Applied Info Sci / System Info Sci. Spring + Fall cycles.', 'is.tohoku.ac.jp', 0.94),
  ('sgu-tohoku-gsis-april2026-pdf', 'Tohoku GSIS — April 2026 entry guide', 'https://www.is.tohoku.ac.jp/media/files/entrance/summary/first202604_0606_1_1_en.pdf', 'admission_notice', 'sgu_research', 'tohoku', 'high', 'application_window', 'April 2026 entrance exam summary (spring cycle).', 'is.tohoku.ac.jp', 0.92),
  ('sgu-tohoku-gsis-oct2026-pdf', 'Tohoku GSIS — October 2026 entry guide', 'https://www.is.tohoku.ac.jp/media/files/entrance/summary/latter202604_20251128_3_1_en.pdf', 'admission_notice', 'sgu_research', 'tohoku', 'high', 'application_window', 'October 2026 entrance exam summary (fall cycle).', 'is.tohoku.ac.jp', 0.92);

-- NIFS — GSIS new international fellow scheme
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tohoku-nifs-page', 'Tohoku GSIS — NIFS application', 'https://sgpis.is.tohoku.ac.jp/nifs/application.html', 'program_page', 'sgu_research', 'tohoku', 'high', 'program_overview', 'GSIS English Master program (NIFS).', 'sgpis.is.tohoku.ac.jp', 0.9),
  ('sgu-tohoku-nifs-guide-pdf', 'Tohoku GSIS — NIFS 2026 Application Guideline', 'https://sgpis.is.tohoku.ac.jp/nifs/NIFS2026_Application_Guideline_251114.pdf', 'admission_notice', 'sgu_research', 'tohoku', 'high', 'admission_requirements', 'NIFS 2026 application guideline (dated 2025-11-14).', 'sgpis.is.tohoku.ac.jp', 0.9);

-- AIQDS — GSIS AI / Quantum / Data Science English program
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tohoku-aiqds-page', 'Tohoku GSIS — AIQDS', 'https://www.is.tohoku.ac.jp/_eng/aiqds/', 'program_page', 'sgu_research', 'tohoku', 'high', 'program_overview', 'AI / Quantum / Data Science English program at GSIS.', 'is.tohoku.ac.jp', 0.92),
  ('sgu-tohoku-aiqds-application-page', 'Tohoku GSIS — AIQDS application', 'https://www.is.tohoku.ac.jp/_eng/aiqds/application.html', 'program_page', 'sgu_research', 'tohoku', 'high', 'admission_requirements', 'AIQDS application instructions.', 'is.tohoku.ac.jp', 0.9);

-- IMAC-G — Mechanical & Aerospace (English FGL)
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tohoku-imacg-page', 'Tohoku Eng — IMAC-G admissions', 'https://www.imac.mech.tohoku.ac.jp/admission/', 'program_page', 'sgu_research', 'tohoku', 'medium', 'program_overview', 'International Mechanical & Aerospace Eng Course (English). Robotics/control labs — secondary CS relevance.', 'imac.mech.tohoku.ac.jp', 0.78);

-- IGPAS — Science school (limited CS relevance)
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tohoku-igpas-page', 'Tohoku Science — IGPAS', 'https://www.sci.tohoku.ac.jp/english/igpas/', 'program_page', 'sgu_research', 'tohoku', 'medium', 'program_overview', 'Graduate School of Science English program — math / physics / earth-sci / chem. No CS dept — relevant only for computational research within those depts.', 'sci.tohoku.ac.jp', 0.75);

------------------------------------------------------------
-- University of Tsukuba
------------------------------------------------------------

-- CSE — Computer Science English Program
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tsukuba-cse-page', 'Tsukuba CS — English Program', 'https://www.cs.tsukuba.ac.jp/english/', 'program_page', 'sgu_research', 'tsukuba', 'high', 'program_overview', 'Master''s in CS — CSE English track. Within Degree Programs in Systems & Info Engineering.', 'cs.tsukuba.ac.jp', 0.94),
  ('sgu-tsukuba-cse-admission-page', 'Tsukuba CS — Admission', 'https://www.cs.tsukuba.ac.jp/english/admission.html', 'program_page', 'sgu_research', 'tsukuba', 'high', 'admission_requirements', 'CSE admission instructions; Overseas Residents special selection application Dec 1-12 2025 for April 2026 intake.', 'cs.tsukuba.ac.jp', 0.92),
  ('sgu-tsukuba-cse-overseas-pdf', 'Tsukuba CS — 2026 Master Overseas Residents Guidelines', 'https://www.sie.tsukuba.ac.jp/eng/wp-content/uploads/2026-Application-Guidelines-Masters-Special-Selection-for-Overseas-Residents.pdf', 'admission_notice', 'sgu_research', 'tsukuba', 'high', 'application_window', 'Special selection for overseas residents — 2026 cycle.', 'sie.tsukuba.ac.jp', 0.92);

-- AISIP — AI Social Implementation
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tsukuba-aisip-page', 'Tsukuba CS — AISIP', 'https://www.cs.tsukuba.ac.jp/aisip/', 'program_page', 'sgu_research', 'tsukuba', 'high', 'program_overview', 'International Program for Promoting AI Social Implementation. MEXT scholarship track; successor to HCAIP.', 'cs.tsukuba.ac.jp', 0.94),
  ('sgu-tsukuba-aisip-pdf', 'Tsukuba CS — AISIP 2026 Guidelines', 'https://www.sie.tsukuba.ac.jp/eng/wp-content/uploads/AISIP2026-Application-Guidelines.pdf', 'admission_notice', 'sgu_research', 'tsukuba', 'high', 'application_window', 'Eligibility 2025-08-29, exam Oct 20-24 2025 — for April 2026 intake.', 'sie.tsukuba.ac.jp', 0.92);

-- AIRB — AI & Intelligent Robotics
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tsukuba-airb-pdf', 'Tsukuba CS — AIRB 2026 Guidelines', 'https://www.sie.tsukuba.ac.jp/eng/wp-content/uploads/AIRB-2026-Application-Guidelines.pdf', 'admission_notice', 'sgu_research', 'tsukuba', 'high', 'application_window', 'AI & Intelligent Robotics — MEXT-funded English track. Requires CEFR B2 or English-medium curriculum.', 'sie.tsukuba.ac.jp', 0.9);

-- Empowerment Informatics
INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, confidence, decision_impact, relevance_note, domain_source, confidence_score)
VALUES
  ('sgu-tsukuba-emp-page', 'Tsukuba — Empowerment Informatics', 'https://www.emp.tsukuba.ac.jp/english', 'program_page', 'sgu_research', 'tsukuba', 'high', 'program_overview', 'HCI / informatics / robotics integrated 5-year M+D program; applicant may choose JA or EN for specialized subjects/interview.', 'emp.tsukuba.ac.jp', 0.9);

------------------------------------------------------------
-- Radar sources for ongoing patrol (the canonical program-hub pages)
-- patrol_status=never_checked so the first patrol run will index them.
------------------------------------------------------------

INSERT OR IGNORE INTO radar_sources (id, name, source_type, url, query, keywords, enabled, university_id, confidence, check_frequency, patrol_status)
VALUES
  ('src-sgu-utokyo-ist-en', 'UTokyo IST English Program', 'program_page', 'https://www.i.u-tokyo.ac.jp/edu/entra/entra_e.shtml', NULL, '["english","master","ist"]', 1, 'utokyo', 'high', 'weekly', 'never_checked'),
  ('src-sgu-utokyo-epiip', 'UTokyo EPIIP', 'program_page', 'https://www.i.u-tokyo.ac.jp/edu/entra/epiip_e.shtml', NULL, '["epiip","ai","mext"]', 1, 'utokyo', 'high', 'weekly', 'never_checked'),
  ('src-sgu-utokyo-soe', 'UTokyo Engineering International', 'program_page', 'https://www.t.u-tokyo.ac.jp/en/study-at-utokyo/soe/apply-abroad', NULL, '["engineering","international","master"]', 1, 'utokyo', 'high', 'weekly', 'never_checked'),
  ('src-sgu-utokyo-gsfs-complex', 'UTokyo GSFS Complexity Sci', 'program_page', 'https://www.k.u-tokyo.ac.jp/complex/html/examinee/examinee_e.html', NULL, '["frontier","complexity"]', 1, 'utokyo', 'medium', 'monthly', 'never_checked'),

  ('src-sgu-isct-igpc', 'Science Tokyo IGP(C)', 'program_page', 'https://admissions.isct.ac.jp/en/013/graduate/programs/science-and-engineering/igp-c', NULL, '["igp","privately-funded","english"]', 1, 'science-tokyo', 'high', 'weekly', 'never_checked'),
  ('src-sgu-isct-igpa', 'Science Tokyo IGP(A)', 'program_page', 'https://admissions.isct.ac.jp/en/013/graduate/programs/igp/igp-a', NULL, '["igp","mext","english"]', 1, 'science-tokyo', 'high', 'weekly', 'never_checked'),
  ('src-sgu-isct-ipsss', 'Science Tokyo IPSSS', 'program_page', 'https://www.e.titech.ac.jp/igpa/', NULL, '["ipsss","super-smart","english"]', 1, 'science-tokyo', 'high', 'weekly', 'never_checked'),
  ('src-sgu-isct-cs', 'Science Tokyo CS Dept', 'program_page', 'https://educ.titech.ac.jp/cs/eng/admissions/', NULL, '["cs","computing","admission"]', 1, 'science-tokyo', 'high', 'monthly', 'never_checked'),

  ('src-sgu-osaka-ist-en', 'Osaka IST English Admission', 'program_page', 'https://www.ist.osaka-u.ac.jp/english/examinees/admission/', NULL, '["itsce","english","ist"]', 1, 'osaka', 'high', 'weekly', 'never_checked'),
  ('src-sgu-osaka-es21-mext', 'Osaka EngSci 21st Century', 'program_page', 'https://www.es.osaka-u.ac.jp/en/admission-aid/mext-granted/index.html', NULL, '["engineering-science","mext","english"]', 1, 'osaka', 'high', 'weekly', 'never_checked'),
  ('src-sgu-osaka-eng-foreign', 'Osaka Eng Foreign Admissions', 'program_page', 'https://www.eng.osaka-u.ac.jp/en/entrance/f_admissions/', NULL, '["engineering","global","english"]', 1, 'osaka', 'high', 'monthly', 'never_checked'),

  ('src-sgu-tohoku-gsis-exam', 'Tohoku GSIS Exam', 'program_page', 'https://www.is.tohoku.ac.jp/en/entrance/exam.html', NULL, '["gsis","information-sciences","english"]', 1, 'tohoku', 'high', 'weekly', 'never_checked'),
  ('src-sgu-tohoku-nifs', 'Tohoku GSIS NIFS', 'program_page', 'https://sgpis.is.tohoku.ac.jp/nifs/application.html', NULL, '["nifs","english","gsis"]', 1, 'tohoku', 'high', 'weekly', 'never_checked'),
  ('src-sgu-tohoku-aiqds', 'Tohoku GSIS AIQDS', 'program_page', 'https://www.is.tohoku.ac.jp/_eng/aiqds/', NULL, '["aiqds","ai","quantum","data-science"]', 1, 'tohoku', 'high', 'weekly', 'never_checked'),

  ('src-sgu-tsukuba-cse', 'Tsukuba CS English', 'program_page', 'https://www.cs.tsukuba.ac.jp/english/admission.html', NULL, '["cse","cs","overseas"]', 1, 'tsukuba', 'high', 'weekly', 'never_checked'),
  ('src-sgu-tsukuba-aisip', 'Tsukuba AISIP', 'program_page', 'https://www.cs.tsukuba.ac.jp/aisip/', NULL, '["aisip","ai","mext"]', 1, 'tsukuba', 'high', 'weekly', 'never_checked'),
  ('src-sgu-tsukuba-emp', 'Tsukuba Empowerment Informatics', 'program_page', 'https://www.emp.tsukuba.ac.jp/english', NULL, '["empowerment","hci","integrated"]', 1, 'tsukuba', 'high', 'monthly', 'never_checked');`;

export const SGU_PROGRAM_SEED_STATEMENTS: readonly string[] = SGU_PROGRAM_SEED_SQL
  .split(/;\s*(?=\n|$)/)
  .map((statement) => statement.trim())
  .filter((statement) => {
    if (!statement) return false;
    return statement
      .split(/\r?\n/)
      .some((line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith("--");
      });
  });
