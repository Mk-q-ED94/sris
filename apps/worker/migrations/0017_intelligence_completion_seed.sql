-- Intelligence completion seed.
--
-- Verified on 2026-05-26 from official university admissions, tuition,
-- scholarship, and student-support pages. This migration fills the highest
-- impact structured gaps for SRIS as an information-difference library:
-- current/last-verified application windows, fees, scholarship routes,
-- qualitative experience sources, and Science Tokyo professor/lab mappings.

UPDATE universities
SET tuition = CASE id
    WHEN 'science-tokyo' THEN 635400
    ELSE 535800
  END,
  updated_at = datetime('now')
WHERE id IN ('utokyo', 'science-tokyo', 'osaka', 'tohoku', 'tsukuba');

UPDATE programs
SET tuition = CASE university_id
    WHEN 'science-tokyo' THEN 635400
    ELSE 535800
  END,
  updated_at = datetime('now')
WHERE university_id IN ('utokyo', 'science-tokyo', 'osaka', 'tohoku', 'tsukuba');

UPDATE programs
SET deadline = '2026-06-04',
  scholarship = 'IST-RA, SPRING GX, BOOST NAIS, Next-Generation Scholarship, MEXT/JASSO routes via UTokyo and IST financial-support pages.',
  requirements = 'AY2027 summer entrance: create web application, pay examination fee, upload all required documents, confirm My Page by 14:00 JST on 2026-06-04; department guides may add requirements; TOEFL score rules apply.',
  notes = 'Official AY2027 summer entrance page reviewed 2026-05-26. Current active application/upload deadline is 2026-06-04 14:00 JST.',
  match_reason = 'Primary UTokyo route for CS, information science, AI, ML, NLP, and systems labs. High information value because department-level requirements and lab fit vary strongly.',
  updated_at = datetime('now')
WHERE id = 'program-utokyo-ist';

UPDATE programs
SET deadline = NULL,
  scholarship = 'Not active: EPIIP special selection has been abolished from AY2026 admission onward.',
  requirements = 'Do not treat as an active application route. Keep only as negative evidence and historical context.',
  notes = 'Official EPIIP page reviewed 2026-05-26: special selection abolished from AY2026 admission. Monitor IST general admission instead.',
  match_reason = 'Negative/risk intelligence: this once-relevant English route is no longer available, so pursuing it would waste planning time.',
  updated_at = datetime('now')
WHERE id = 'program-utokyo-epiip';

UPDATE programs
SET scholarship = 'General UTokyo/MEXT/JASSO support routes; verify department-specific scholarship calls on the official Engineering admission page.',
  requirements = 'Use official Engineering international-admission page and linked guides; confirm supervisor/department requirements before applying.',
  notes = 'Official route retained for cross-disciplinary engineering/AI systems discovery; exact next window requires patrol of linked guide pages.',
  match_reason = 'Secondary UTokyo route for AI systems, robotics, architecture, control, and engineering-heavy research fit.',
  updated_at = datetime('now')
WHERE id = 'program-utokyo-soe-international';

UPDATE programs
SET scholarship = 'General UTokyo/MEXT/JASSO support routes; verify GSFS-specific calls on official GSFS pages.',
  requirements = 'Use GSFS Complexity Science and Engineering admission pages and linked guides; verify language and supervisor expectations.',
  notes = 'Useful interdisciplinary route, but the latest exact application window must be monitored from official GSFS pages.',
  match_reason = 'Secondary UTokyo route for complex systems, computational science, and interdisciplinary AI/CS work.',
  updated_at = datetime('now')
WHERE id = 'program-utokyo-gsfs-complex';

UPDATE programs
SET deadline = '2025-11-23',
  scholarship = 'Limited MEXT university-recommendation route for outstanding applicants; next call starts in September 2026 according to the official page.',
  requirements = 'Fall 2026 call required Science Tokyo supervisor consent and online application by 2025-11-23 23:59 JST; next call starts September 2026.',
  notes = 'Official IGP(A) page reviewed 2026-05-26. Fall 2026 call is closed; next call starts September 2026.',
  match_reason = 'High-value Science Tokyo route if MEXT-funded integrated master-doctoral study is desired; strong but competitive and cycle-sensitive.',
  updated_at = datetime('now')
WHERE id = 'program-isct-igp-a';

UPDATE programs
SET deadline = '2026-04-05',
  scholarship = 'JASSO pre-arrival reservation and ADB-JSP routes listed in the Fall 2026 guide; MEXT students are fee-exempt but IGP(C) itself is not the IGP(A) MEXT nomination route.',
  requirements = 'Fall 2026 call required supervisor consent by 2026-03-29 23:59 JST and online application by 2026-04-05 23:59 JST. Next call starts August 2026.',
  notes = 'Official IGP(C) page and Fall 2026 guide reviewed 2026-05-26. Fall 2026 call is closed; next call starts in August 2026.',
  match_reason = 'Main Science Tokyo English application route for CS/AI/systems labs when self-funded or non-MEXT scholarship options are acceptable.',
  updated_at = datetime('now')
WHERE id = 'program-isct-igp-c';

UPDATE programs
SET deadline = '2025-11-24',
  scholarship = 'Handled through Science Tokyo IGP/S3-linked routes; verify current scholarship availability with the Admissions Division before applying.',
  requirements = 'Official IPSSS/S3 page points to Admissions Division guidelines. Past guide deadline shown as late November; next cycle must be monitored.',
  notes = 'Official IPSSS page reviewed 2026-05-26. Keep as a Science Tokyo S3-adjacent route and patrol for the 2027 call.',
  match_reason = 'Useful Science Tokyo route if research fit spans AI, cyber-physical systems, IoT, resilience, and super smart society themes.',
  updated_at = datetime('now')
WHERE id = 'program-isct-ipsss';

UPDATE programs
SET deadline = NULL,
  scholarship = 'Use IGP(A), IGP(C), department, JASSO, ADB-JSP, and Science Tokyo scholarship pages depending on exact application route.',
  requirements = 'This is a department/major entry, not a standalone application window. Apply through Science Tokyo IGP or regular graduate admission pages.',
  notes = 'Existing starter row corrected on 2026-05-26: no standalone 2026-07-15 deadline was verified. Use IGP rows for application windows.',
  match_reason = 'Research discovery container for Science Tokyo CS and AI Graduate Major labs; decision should be driven by lab/professor fit and IGP route.',
  updated_at = datetime('now')
WHERE id = 'program-science-tokyo-cs';

UPDATE programs
SET deadline = '2026-05-22',
  scholarship = 'MEXT scholars are exempt from application/admission/tuition fees; Osaka IST guide also lists a tuition-waiver system for excellent privately funded international students.',
  requirements = 'Admission in October 2026 ITSCE: main application acceptance period 2026-05-18 to 2026-05-22; pre-application screening 2026-04-20 to 2026-04-24; supervisor confirmation required.',
  notes = 'Official Osaka IST Master/Doctor ITSCE October 2026 guides reviewed 2026-05-26. Current cycle closed on 2026-05-22; monitor March 2027 guide release.',
  match_reason = 'Strong Osaka route for information science, HPC, CV, networking, data engineering, and systems labs. Supervisor contact is central.',
  updated_at = datetime('now')
WHERE id = 'program-osaka-ist-itsce';

UPDATE programs
SET scholarship = 'MEXT-granted/special scholarship route according to official Engineering Science 21st Century program pages; verify annual call details.',
  requirements = 'Use official Engineering Science MEXT-granted program page and latest application guide; confirm division fit before applying.',
  notes = 'Maintained as a high-value Osaka scholarship route; exact current window requires patrol of program guide pages.',
  match_reason = 'Useful Osaka route for interdisciplinary systems, mathematical science, materials, and engineering-science research.',
  updated_at = datetime('now')
WHERE id = 'program-osaka-es21';

UPDATE programs
SET scholarship = 'General Osaka University scholarships, fee waivers, JASSO/MEXT routes; verify Graduate School of Engineering-specific calls.',
  requirements = 'Use official foreign admissions page and linked graduate-school guides; confirm language and supervisor expectations.',
  notes = 'Secondary Osaka route retained for engineering-heavy AI/robotics/systems fit; exact current deadline needs official page patrol.',
  match_reason = 'Secondary route for AI systems, robotics, control, and engineering research outside IST.',
  updated_at = datetime('now')
WHERE id = 'program-osaka-eng-global';

UPDATE programs
SET scholarship = 'General Tohoku fee waivers and scholarships; no program-specific MEXT route verified for the generic GSIS entrance page.',
  requirements = 'Official GSIS entrance exams are held around late August for fall examination and early February/March for spring examination; guidelines are released around early June and early November respectively.',
  notes = 'Official GSIS entrance page reviewed 2026-05-26. Exact Fall 2026 application dates were not yet represented on the English overview; patrol for guide release.',
  match_reason = 'Core Tohoku route for information sciences, AI, systems, networking, and lab-level discovery.',
  updated_at = datetime('now')
WHERE id = 'program-tohoku-gsis';

UPDATE programs
SET deadline = '2025-11-28',
  scholarship = 'NIFS is a MEXT-linked international graduate program route for Fall 2026; MEXT result notification around June 2026.',
  requirements = 'For Fall 2026, NIFS application period was 2025-11-17 to 2025-11-28; applicants must newly come to Japan from abroad by October 2026.',
  notes = 'Official NIFS page reviewed 2026-05-26. Fall 2026 application is closed; keep as scholarship-route evidence and monitor next call.',
  match_reason = 'High-value Tohoku MEXT route if the applicant targets future-society AI/data/HPC themes and is applying from abroad.',
  updated_at = datetime('now')
WHERE id = 'program-tohoku-nifs';

UPDATE programs
SET scholarship = 'AIQDS page states MEXT scholarship availability for excellent students; current detailed cycle must be verified from admissions office/source updates.',
  requirements = 'Use official AIQDS and GSIS pages; verify current year eligibility, quota, age, and MEXT schedule before treating as actionable.',
  notes = 'Official AIQDS page reviewed 2026-05-26. The page still describes MEXT support but current-cycle details require monitoring.',
  match_reason = 'High relevance for AI, data science, HPC, and quantum-computing adjacent research; scholarship route may be attractive but cycle-sensitive.',
  updated_at = datetime('now')
WHERE id = 'program-tohoku-aiqds';

UPDATE programs
SET scholarship = 'General Tohoku/MEXT/JASSO support; verify IMAC-G specific funding in the latest admission guide.',
  requirements = 'Use official IMAC admission page; confirm robotics/control fit and supervisor before applying.',
  notes = 'Secondary relevance route; retained for robotics/control/mechanical systems crossover.',
  match_reason = 'Secondary Tohoku route if research interests shift toward robotics, control, mechanical intelligence, or aerospace systems.',
  updated_at = datetime('now')
WHERE id = 'program-tohoku-imacg';

UPDATE programs
SET deadline = '2026-06-01',
  scholarship = 'General Tsukuba scholarships/fee support; this CS admission page is not itself a MEXT special program.',
  requirements = 'Master enrollment April 2027: recommendation web entry 2026-05-22 12:00 to 2026-06-01 15:00 JST; August process 2026-07-09 to 2026-07-22; January process 2026-11-30 to 2026-12-10.',
  notes = 'Official CS admission page reviewed 2026-05-26. Active near-term web entry closes 2026-06-01 15:00 JST.',
  match_reason = 'Core Tsukuba CS route for systems, HPC, AI, NLP, and data-oriented labs; multiple 2026 web-entry windows make it a strong planning target.',
  updated_at = datetime('now')
WHERE id = 'program-tsukuba-cse';

UPDATE programs
SET deadline = '2025-10-10',
  scholarship = 'AISIP offers a special scholarship equivalent to MEXT for international students in the AY2025-AY2027 approved program; no fall intake.',
  requirements = 'AY2026 page: supervisor consent required; electronic documents due in August/September 2025 and original documents by 2025-10-10; entrance is April only.',
  notes = 'Official AISIP page reviewed 2026-05-26. Spring 2026 application is closed; monitor successor/future AISIP cycle.',
  match_reason = 'High-value Tsukuba AI scholarship route if applying for spring intake and supervisor consent can be obtained early.',
  updated_at = datetime('now')
WHERE id = 'program-tsukuba-aisip';

UPDATE programs
SET deadline = '2025-10-10',
  scholarship = 'MEXT university-recommendation scholarship route; entrance examination, admission fee, and tuition are covered for grantees.',
  requirements = '2026 AIRB guide: pre-screening by 2025-08-22, eligibility by 2025-08-29, electronic examination documents by 2025-09-26, original documents by 2025-10-10, Zoom exam 2025-10-20 to 2025-10-24.',
  notes = 'Official AIRB 2026 MEXT guide reviewed 2026-05-26. Spring 2026 cycle is closed; monitor next AIRB call.',
  match_reason = 'High-value Tsukuba MEXT route for AI, robotics, and social transformation themes; requires early document preparation.',
  updated_at = datetime('now')
WHERE id = 'program-tsukuba-airb';

UPDATE programs
SET scholarship = 'General Tsukuba scholarships and program-specific support; verify latest EMP guidance.',
  requirements = 'Use official EMP pages and faculty list; confirm admission route and supervisor expectations.',
  notes = 'EMP retained as qualitative and interdisciplinary research-fit route; exact application window requires monitoring.',
  match_reason = 'Good fit-discovery route for AI, robotics, HCI, NLP, and human-support systems.',
  updated_at = datetime('now')
WHERE id = 'program-tsukuba-emp';

INSERT OR IGNORE INTO professors (id, university_id, name, title, website, research_keywords, notes, match_reason) VALUES
  ('prof-isct-jian-cao', 'science-tokyo', 'Jian Cao', 'Faculty member', 'https://cao-lab.org/', '["trustworthy data science","artificial intelligence","machine learning"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'High-value trustworthy AI and data science target.'),
  ('prof-isct-yuki-arase', 'science-tokyo', 'Yuki Arase', 'Faculty member', 'https://arase-cl-lab.c.titech.ac.jp/', '["natural language processing","language understanding","language generation"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'NLP target for human-level language understanding and generation.'),
  ('prof-isct-naoaki-okazaki', 'science-tokyo', 'Naoaki Okazaki', 'Faculty member', 'http://www.nlp.c.titech.ac.jp/index.en.html', '["natural language processing","artificial intelligence","text mining"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'High-value NLP and text AI target.'),
  ('prof-isct-asako-kanezaki', 'science-tokyo', 'Asako Kanezaki', 'Faculty member', 'https://kanezaki.github.io/', '["intelligent robotics","computer vision","machine learning"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'Robotics, computer vision, and embodied AI target.'),
  ('prof-isct-kenji-kise', 'science-tokyo', 'Kenji Kise', 'Faculty member', 'http://www.arch.cs.titech.ac.jp/index-e.html', '["computer architecture","high performance computing","hardware accelerators"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'Systems and architecture target for HPC and accelerators.'),
  ('prof-isct-xavier-defago', 'science-tokyo', 'Xavier Defago', 'Faculty member', 'http://www.coord.c.titech.ac.jp', '["distributed systems","dependable computing","middleware"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'Distributed systems and dependability target.'),
  ('prof-isct-rio-yokota', 'science-tokyo', 'Rio Yokota', 'Faculty member', 'http://www.rio.gsic.titech.ac.jp', '["high performance computing","parallel computing","scientific computing"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'HPC and large-scale parallel-computing target.'),
  ('prof-isct-hideki-koike', 'science-tokyo', 'Hideki Koike', 'Faculty member', 'https://www.vogue.cs.titech.ac.jp/', '["human-computer interaction","computer vision","visualization"]', 'Seeded from Science Tokyo CS official research-lab directory on 2026-05-26.', 'HCI, computer vision, and visualization target.');

UPDATE labs
SET professor_id = 'prof-isct-jian-cao',
  lab_name = 'Cao Lab',
  website = 'https://cao-lab.org/',
  notes = 'Science Tokyo official CS lab directory: trustworthy data science and AI.',
  updated_at = datetime('now')
WHERE id = 'lab-isct-cao-trustworthy-ai';

UPDATE labs
SET professor_id = 'prof-isct-yuki-arase',
  lab_name = 'Arase Laboratory',
  website = 'https://arase-cl-lab.c.titech.ac.jp/',
  notes = 'Science Tokyo official CS lab directory: human-level language understanding and generation.',
  updated_at = datetime('now')
WHERE id = 'lab-isct-arase-nlp';

UPDATE labs
SET professor_id = 'prof-isct-naoaki-okazaki',
  lab_name = 'Okazaki Naoaki Laboratory',
  website = 'http://www.nlp.c.titech.ac.jp/index.en.html',
  notes = 'Science Tokyo official CS lab directory: AI applications focused on text analysis, understanding, and generation.',
  updated_at = datetime('now')
WHERE id = 'lab-isct-okazaki-nlp';

UPDATE labs
SET professor_id = 'prof-isct-asako-kanezaki',
  lab_name = 'Kanezaki Asako Laboratory',
  website = 'https://kanezaki.github.io/',
  notes = 'Science Tokyo official CS lab directory: data-driven intelligent robotics.',
  updated_at = datetime('now')
WHERE id = 'lab-isct-kanezaki-robotics';

UPDATE labs
SET professor_id = 'prof-isct-kenji-kise',
  lab_name = 'Kise Kenji Laboratory',
  website = 'http://www.arch.cs.titech.ac.jp/index-e.html',
  notes = 'Science Tokyo official CS lab directory: high-performance computer architectures including many-core processors and hardware accelerators.',
  updated_at = datetime('now')
WHERE id = 'lab-isct-kise-architecture';

UPDATE labs
SET professor_id = 'prof-isct-xavier-defago',
  lab_name = 'Defago Xavier Laboratory',
  website = 'http://www.coord.c.titech.ac.jp',
  notes = 'Science Tokyo official CS lab directory: dependable distributed systems, distributed algorithms, and middleware.',
  updated_at = datetime('now')
WHERE id = 'lab-isct-defago-distributed';

INSERT OR IGNORE INTO labs (id, university_id, professor_id, lab_name, research_keywords, website, recent_papers, notes) VALUES
  ('lab-isct-yokota-hpc', 'science-tokyo', 'prof-isct-rio-yokota', 'Yokota Rio Laboratory', '["high performance computing","large-scale parallel computing","scientific computing"]', 'http://www.rio.gsic.titech.ac.jp', '[]', 'Science Tokyo official CS lab directory: fast algorithms for next generation computers.'),
  ('lab-isct-koike-hci', 'science-tokyo', 'prof-isct-hideki-koike', 'Koike Hideki Laboratory', '["human-computer interaction","computer vision","computer graphics","visualization"]', 'https://www.vogue.cs.titech.ac.jp/', '[]', 'Science Tokyo official CS lab directory: next-generation HCI using computer vision and graphics.');

INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, program_id, professor_id, lab_id, confidence, decision_impact, relevance_note, domain_source, confidence_score, confidence_last_verified, extracted_facts, extraction_status, extracted_at, extraction_model, resource_status)
VALUES
  ('info-utokyo-ist-ay2027-application', 'UTokyo IST AY2027 summer entrance application procedures', 'https://www.i.u-tokyo.ac.jp/edu/entra/entra_e.shtml', 'admission_notice', 'official_info_completion_2026_05_26', 'utokyo', 'program-utokyo-ist', NULL, NULL, 'high', 'application_deadline', 'Official AY2027 summer entrance web application and upload deadline.', 'i.u-tokyo.ac.jp', 0.94, '2026-05-26', '{"program_name":"Graduate School of Information Science and Technology AY2027 Summer Entrance Examinations","degree":"Master / Doctoral","language":"English / Japanese","application_periods":[{"label":"Web application and upload deadline","open":"2026-05-29","close":"2026-06-04"}],"requirements":["Prepare admission guide materials","Create web application","Pay examination fee","Upload required documents","Confirm My Page by 14:00 JST","Follow AY2027 TOEFL submission guidelines"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":30000,"mext_eligible":true,"scholarships":["IST-RA","SPRING GX","BOOST NAIS","Next-Generation Scholarship","MEXT fee exemption for Japanese Government Scholarship students"],"supervisor_consent_required":false,"contact_email":"johoriko.t(at)gs.mail.u-tokyo.ac.jp","notes":"Official page states AY2027 summer entrance application system period from 2026-05-29 to 14:00 on 2026-06-04 JST.","extraction_confidence":0.94,"unresolved_questions":["Department-specific guides may add materials or interview rules."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-utokyo-epiip-abolished', 'UTokyo EPIIP special selection abolished from AY2026 admission', 'https://www.i.u-tokyo.ac.jp/edu/entra/epiip_e.shtml', 'admission_notice', 'official_info_completion_2026_05_26', 'utokyo', 'program-utokyo-epiip', NULL, NULL, 'high', 'route_removed', 'Official negative evidence: EPIIP is no longer an active special-selection route.', 'i.u-tokyo.ac.jp', 0.95, '2026-05-26', '{"program_name":"English Program on Intelligent Information Processing","degree":"Master","language":"English","application_periods":[],"requirements":["Do not apply through this route; it has been abolished from AY2026 admission."],"quota":0,"tuition_per_year_jpy":535800,"application_fee_jpy":null,"mext_eligible":false,"scholarships":[],"supervisor_consent_required":false,"contact_email":null,"notes":"Official page states the EPIIP special selection was abolished from AY2026 admission.","extraction_confidence":0.95,"unresolved_questions":[]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-isct-igpc-fall2026-guide', 'Science Tokyo IGP(C) Fall 2026 application guide', 'https://admissions.isct.ac.jp/en/013/graduate/programs/science-and-engineering/igp-c', 'admission_notice', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-isct-igp-c', NULL, NULL, 'high', 'application_deadline', 'Official IGP(C) Fall 2026 page and application guide; next call starts August 2026.', 'admissions.isct.ac.jp', 0.94, '2026-05-26', '{"program_name":"International Graduate Program C","degree":"Master / Doctoral","language":"English","application_periods":[{"label":"Fall 2026 application","open":"2026-01-14","close":"2026-04-05"},{"label":"Next spring-enrollment call","open":"2026-08-15","close":null}],"requirements":["Contact intended academic supervisor before applying","Submit supervisor consent by 2026-03-29 23:59 JST","Complete online application by 2026-04-05 23:59 JST","Application fee JPY 30000 unless exempt"],"quota":null,"tuition_per_year_jpy":635400,"application_fee_jpy":30000,"mext_eligible":false,"scholarships":["JASSO pre-arrival reservation","ADB-JSP"],"supervisor_consent_required":true,"contact_email":"inquiries.int.grad.se@adm.isct.ac.jp","notes":"Fall 2026 application is closed. Official page states the next call starts in August 2026.","extraction_confidence":0.94,"unresolved_questions":["Exact next-call deadline has not yet been posted."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-isct-igpa-fall2026-schedule', 'Science Tokyo IGP(A) Fall 2026 schedule', 'https://admissions.isct.ac.jp/en/013/graduate/programs/igp/igp-a', 'admission_notice', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-isct-igp-a', NULL, NULL, 'high', 'mext_scholarship_route', 'Official IGP(A) page with MEXT nomination route and next-call notice.', 'admissions.isct.ac.jp', 0.92, '2026-05-26', '{"program_name":"International Graduate Program A","degree":"Master / Integrated Doctoral Education Program","language":"English","application_periods":[{"label":"Fall 2026 application","open":"2025-09-10","close":"2025-11-23"},{"label":"Next call","open":"2026-09-01","close":null}],"requirements":["Supervisor consent mail or letter required before application deadline","Online application by 2025-11-23 23:59 JST for Fall 2026"],"quota":null,"tuition_per_year_jpy":635400,"application_fee_jpy":null,"mext_eligible":true,"scholarships":["MEXT university recommendation through Science Tokyo"],"supervisor_consent_required":true,"contact_email":null,"notes":"Fall 2026 call is closed. Official page states the next call starts in September 2026.","extraction_confidence":0.92,"unresolved_questions":["Exact Fall 2027 application period has not yet been posted."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-osaka-itsce-master-oct2026-guide', 'Osaka IST ITSCE Master October 2026 application guide', 'https://www.ist.osaka-u.ac.jp/files/examinees/admission/2026/17_a_EN2026.pdf', 'admission_notice', 'official_info_completion_2026_05_26', 'osaka', 'program-osaka-ist-itsce', NULL, NULL, 'high', 'application_deadline', 'Official Osaka IST October 2026 master guide for ITSCE.', 'ist.osaka-u.ac.jp', 0.94, '2026-05-26', '{"program_name":"Information Technology Special Course in English","degree":"Master","language":"English","application_periods":[{"label":"Pre-application screening","open":"2026-04-20","close":"2026-04-24"},{"label":"Main application","open":"2026-05-18","close":"2026-05-22"}],"requirements":["Contact expected academic supervisor or department chair for confirmation","Application documents must arrive within acceptance period","Interview held during 2026-06-01 to 2026-06-19"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":30000,"mext_eligible":true,"scholarships":["MEXT fee exemption","Tuition Waiver System for Excellent Privately Funded International Students"],"supervisor_consent_required":true,"contact_email":null,"notes":"October 2026 master application closed on 2026-05-22; result announcement 2026-07-03.","extraction_confidence":0.94,"unresolved_questions":["Next cycle dates require March 2027 guide patrol."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-osaka-itsce-doctor-oct2026-guide', 'Osaka IST ITSCE Doctor October 2026 application guide', 'https://www.ist.osaka-u.ac.jp/files/examinees/admission/2026/37_a_EN2026.pdf', 'admission_notice', 'official_info_completion_2026_05_26', 'osaka', 'program-osaka-ist-itsce', NULL, NULL, 'high', 'application_deadline', 'Official Osaka IST October 2026 doctoral guide for ITSCE.', 'ist.osaka-u.ac.jp', 0.94, '2026-05-26', '{"program_name":"Information Technology Special Course in English","degree":"Doctoral","language":"English","application_periods":[{"label":"Pre-application screening","open":"2026-04-20","close":"2026-04-24"},{"label":"Main application","open":"2026-05-18","close":"2026-05-22"}],"requirements":["Contact expected academic supervisor or department chair for confirmation","Application documents must arrive within acceptance period","Interview held during 2026-06-01 to 2026-06-19"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":30000,"mext_eligible":true,"scholarships":["MEXT fee exemption","Tuition Waiver System for Excellent Privately Funded International Students"],"supervisor_consent_required":true,"contact_email":null,"notes":"October 2026 doctoral application closed on 2026-05-22; result announcement 2026-07-03.","extraction_confidence":0.94,"unresolved_questions":["Next cycle dates require March 2027 guide patrol."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-tohoku-gsis-exam-schedule', 'Tohoku GSIS entrance examination overview and schedule pattern', 'https://www.is.tohoku.ac.jp/en/entrance/exam.html', 'admission_notice', 'official_info_completion_2026_05_26', 'tohoku', 'program-tohoku-gsis', NULL, NULL, 'high', 'schedule_monitoring', 'Official GSIS entrance overview; exact Fall 2026 guide requires patrol.', 'is.tohoku.ac.jp', 0.88, '2026-05-26', '{"program_name":"Graduate School of Information Sciences Entrance Examination","degree":"Master / Doctoral","language":"English / Japanese","application_periods":[{"label":"Fall examination guideline release","open":"2026-06-01","close":null},{"label":"Fall examination period","open":"2026-08-20","close":"2026-08-31"},{"label":"Spring examination guideline release","open":"2026-11-01","close":null}],"requirements":["Refer to admission guidelines when released","Fall and spring exams are separate","English score submission may apply"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":30000,"mext_eligible":false,"scholarships":["General Tohoku fee waivers and scholarships"],"supervisor_consent_required":false,"contact_email":null,"notes":"Official page gives release and exam timing patterns rather than exact current application dates.","extraction_confidence":0.88,"unresolved_questions":["Exact Fall 2026 application acceptance period must be extracted from the latest guide PDF once posted."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-tohoku-nifs-fall2026', 'Tohoku NIFS Fall 2026 application schedule', 'https://sgpis.is.tohoku.ac.jp/nifs/application.html', 'admission_notice', 'official_info_completion_2026_05_26', 'tohoku', 'program-tohoku-nifs', NULL, NULL, 'high', 'mext_scholarship_route', 'Official NIFS schedule and MEXT-linked route.', 'sgpis.is.tohoku.ac.jp', 0.92, '2026-05-26', '{"program_name":"New International Graduate Program for Future Society","degree":"Master","language":"English","application_periods":[{"label":"Fall 2026 application","open":"2025-11-17","close":"2025-11-28"}],"requirements":["Applicant newly comes to Japan from abroad by October 2026","Application through official NIFS forms","Zoom interview after fee/payment instructions if requested"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":30000,"mext_eligible":true,"scholarships":["MEXT-linked NIFS route"],"supervisor_consent_required":false,"contact_email":null,"notes":"Fall 2026 application is closed; MEXT pass/fail notification around June 2026.","extraction_confidence":0.92,"unresolved_questions":["Next call timing must be monitored."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-tsukuba-cs-ay2026-admission', 'University of Tsukuba CS AY2026 entrance examination schedule', 'https://www.cs.tsukuba.ac.jp/english/admission.html', 'admission_notice', 'official_info_completion_2026_05_26', 'tsukuba', 'program-tsukuba-cse', NULL, NULL, 'high', 'application_deadline', 'Official CS admission page with AY2026 web entry windows.', 'cs.tsukuba.ac.jp', 0.94, '2026-05-26', '{"program_name":"Program in Computer Science","degree":"Master / Doctoral","language":"English / Japanese","application_periods":[{"label":"Master recommendation web entry","open":"2026-05-22","close":"2026-06-01"},{"label":"Master August process web entry","open":"2026-07-09","close":"2026-07-22"},{"label":"Master January process web entry","open":"2026-11-30","close":"2026-12-10"},{"label":"Doctor July web entry","open":"2026-05-22","close":"2026-06-01"}],"requirements":["Obtain official documents and application form","Apply through web entry in the relevant selection process","Oral exam may be online for doctoral course"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":30000,"mext_eligible":false,"scholarships":["General Tsukuba scholarships and fee support"],"supervisor_consent_required":false,"contact_email":null,"notes":"Active near-term recommendation/doctoral web entry closes 2026-06-01 15:00 JST.","extraction_confidence":0.94,"unresolved_questions":["Confirm whether the applicant is eligible for recommendation process before treating 2026-06-01 as actionable."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-tsukuba-aisip-ay2026', 'Tsukuba AISIP AY2026 application and scholarship page', 'https://www.cs.tsukuba.ac.jp/aisip/', 'admission_notice', 'official_info_completion_2026_05_26', 'tsukuba', 'program-tsukuba-aisip', NULL, NULL, 'high', 'mext_scholarship_route', 'Official AISIP page with MEXT-equivalent special scholarship and no fall intake note.', 'cs.tsukuba.ac.jp', 0.91, '2026-05-26', '{"program_name":"International Program for Promoting AI Social Implementation","degree":"Master","language":"English","application_periods":[{"label":"Supervisor/pre-application files","open":null,"close":"2025-08-22"},{"label":"Entrance application files","open":null,"close":"2025-09-26"},{"label":"Original document submission","open":null,"close":"2025-10-10"}],"requirements":["Contact prospective supervisor and obtain consent","Submit electronic and original documents by the stated deadlines","Spring intake only"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":null,"mext_eligible":true,"scholarships":["AISIP special scholarship equivalent to MEXT"],"supervisor_consent_required":true,"contact_email":"aisip (AT) cs.tsukuba.ac.jp","notes":"AY2026 spring cycle is closed; official page says no fall intake.","extraction_confidence":0.91,"unresolved_questions":["Monitor successor cycle for AY2027 scholarship approval."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified'),
  ('info-tsukuba-airb-2026-guide', 'Tsukuba AIRB 2026 MEXT scholarship application guide', 'https://www.sie.tsukuba.ac.jp/eng/wp-content/uploads/AIRB-2026-Application-Guidelines.pdf', 'admission_notice', 'official_info_completion_2026_05_26', 'tsukuba', 'program-tsukuba-airb', NULL, NULL, 'high', 'mext_scholarship_route', 'Official AIRB 2026 MEXT scholarship guide.', 'sie.tsukuba.ac.jp', 0.93, '2026-05-26', '{"program_name":"Graduate Program for Transforming Society Through Artificial Intelligence and Intelligent Robotics","degree":"Master / Doctoral","language":"English","application_periods":[{"label":"Pre-screening","open":null,"close":"2025-08-22"},{"label":"Eligibility screening","open":null,"close":"2025-08-29"},{"label":"Electronic examination documents","open":null,"close":"2025-09-26"},{"label":"Original examination documents","open":null,"close":"2025-10-10"}],"requirements":["Pass prescreening","Submit electronic and original documents","Attend Zoom oral exam 2025-10-20 to 2025-10-24","Meet MEXT GPA/nationality/age conditions"],"quota":null,"tuition_per_year_jpy":535800,"application_fee_jpy":0,"mext_eligible":true,"scholarships":["MEXT university recommendation","Monthly allowance","Travel support","Entrance examination fee, admission fee, and tuition paid by UT"],"supervisor_consent_required":false,"contact_email":"sysinfo-gakuseishien@un.tsukuba.ac.jp","notes":"2026 AIRB cycle is closed; scholarship result expected early March 2026 for April 2026 enrollment.","extraction_confidence":0.93,"unresolved_questions":["Monitor next AIRB call for future application."]}', 'succeeded', '2026-05-26T00:00:00+08:00', 'manual-official-source-review', 'verified');

INSERT OR IGNORE INTO intelligence_resources (id, title, url, resource_type, source, university_id, program_id, professor_id, lab_id, confidence, decision_impact, relevance_note, domain_source, confidence_score, confidence_last_verified, resource_status)
VALUES
  ('info-utokyo-tuition-fees', 'UTokyo admission fee and tuition', 'https://www.u-tokyo.ac.jp/en/prospective-students/tuition_fees.html', 'official_page', 'official_info_completion_2026_05_26', 'utokyo', NULL, NULL, NULL, 'high', 'budget_planning', 'Official fee table: graduate annual tuition ¥535,800 and admission fee ¥282,000; MEXT students do not pay tuition and certain fees.', 'u-tokyo.ac.jp', 0.94, '2026-05-26', 'verified'),
  ('info-tohoku-fees-expenses', 'Tohoku fees and expenses', 'https://www.tohoku.ac.jp/en/admissions/tuition_fees.html', 'official_page', 'official_info_completion_2026_05_26', 'tohoku', NULL, NULL, NULL, 'high', 'budget_planning', 'Official fee page: graduate tuition ¥535,800 per year and admission fee ¥282,000; fee waivers may be available by screening.', 'tohoku.ac.jp', 0.94, '2026-05-26', 'verified'),
  ('experience-utokyo-international-students', 'UTokyo international student portal', 'https://www.u-tokyo.ac.jp/adm/inbound/en/index.html', 'experience_index', 'official_info_completion_2026_05_26', 'utokyo', NULL, NULL, NULL, 'medium', 'experience_signal', 'Official international-student portal for campus-life, procedures, and practical student-support signals.', 'u-tokyo.ac.jp', 0.8, '2026-05-26', 'verified'),
  ('experience-utokyo-ist-voices', 'UTokyo Voices filtered for IST', 'https://www.u-tokyo.ac.jp/focus/en/tags/index.php?tag=UTokyo+Voices&scrollTop=100&busho=Graduate+School+of+Information+Science+and+Technology', 'experience_index', 'official_info_completion_2026_05_26', 'utokyo', 'program-utokyo-ist', NULL, NULL, 'medium', 'experience_signal', 'Official UTokyo qualitative profile index filtered to Graduate School of Information Science and Technology.', 'u-tokyo.ac.jp', 0.78, '2026-05-26', 'verified'),
  ('experience-osaka-inbound-guidebook', 'Osaka University inbound student guidebook', 'https://www.osaka-u.ac.jp/en/international/inbound/guidebook', 'experience_index', 'official_info_completion_2026_05_26', 'osaka', NULL, NULL, NULL, 'medium', 'experience_signal', 'Official Osaka inbound guidebook source for practical international-student experience signals.', 'osaka-u.ac.jp', 0.78, '2026-05-26', 'verified'),
  ('experience-osaka-inbound-support', 'Osaka University inbound support', 'https://www.osaka-u.ac.jp/en/international/inbound/support', 'experience_index', 'official_info_completion_2026_05_26', 'osaka', NULL, NULL, NULL, 'medium', 'experience_signal', 'Official inbound support page for international-student life and support signals.', 'osaka-u.ac.jp', 0.76, '2026-05-26', 'verified'),
  ('experience-tohoku-international-guidebook', 'Tohoku international student guidebook', 'https://www.insc.tohoku.ac.jp/english/guidebook/', 'experience_index', 'official_info_completion_2026_05_26', 'tohoku', NULL, NULL, NULL, 'medium', 'experience_signal', 'Official Tohoku international-student guidebook source for practical student-life signals.', 'insc.tohoku.ac.jp', 0.78, '2026-05-26', 'verified'),
  ('research-isct-cao-lab-page', 'Science Tokyo Cao Lab', 'https://cao-lab.org/', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-jian-cao', 'lab-isct-cao-trustworthy-ai', 'high', 'professor_discovery', 'Trustworthy data science and AI lab selected from official Science Tokyo CS lab directory.', 'cao-lab.org', 0.9, '2026-05-26', 'verified'),
  ('research-isct-arase-lab-page', 'Science Tokyo Arase Laboratory', 'https://arase-cl-lab.c.titech.ac.jp/', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-yuki-arase', 'lab-isct-arase-nlp', 'high', 'professor_discovery', 'NLP lab selected from official Science Tokyo CS lab directory.', 'arase-cl-lab.c.titech.ac.jp', 0.9, '2026-05-26', 'verified'),
  ('research-isct-okazaki-lab-page', 'Science Tokyo Okazaki Naoaki Laboratory', 'http://www.nlp.c.titech.ac.jp/index.en.html', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-naoaki-okazaki', 'lab-isct-okazaki-nlp', 'high', 'professor_discovery', 'NLP and text AI lab selected from official Science Tokyo CS lab directory.', 'nlp.c.titech.ac.jp', 0.9, '2026-05-26', 'verified'),
  ('research-isct-kanezaki-lab-page', 'Science Tokyo Kanezaki Asako Laboratory', 'https://kanezaki.github.io/', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-asako-kanezaki', 'lab-isct-kanezaki-robotics', 'high', 'professor_discovery', 'Data-driven intelligent robotics lab selected from official Science Tokyo CS lab directory.', 'kanezaki.github.io', 0.9, '2026-05-26', 'verified'),
  ('research-isct-kise-lab-page', 'Science Tokyo Kise Kenji Laboratory', 'http://www.arch.cs.titech.ac.jp/index-e.html', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-kenji-kise', 'lab-isct-kise-architecture', 'high', 'professor_discovery', 'Computer architecture and HPC lab selected from official Science Tokyo CS lab directory.', 'arch.cs.titech.ac.jp', 0.9, '2026-05-26', 'verified'),
  ('research-isct-defago-lab-page', 'Science Tokyo Defago Xavier Laboratory', 'http://www.coord.c.titech.ac.jp', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-xavier-defago', 'lab-isct-defago-distributed', 'high', 'professor_discovery', 'Dependable distributed systems lab selected from official Science Tokyo CS lab directory.', 'coord.c.titech.ac.jp', 0.9, '2026-05-26', 'verified'),
  ('research-isct-yokota-lab-page', 'Science Tokyo Yokota Rio Laboratory', 'http://www.rio.gsic.titech.ac.jp', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-rio-yokota', 'lab-isct-yokota-hpc', 'high', 'professor_discovery', 'HPC and large-scale parallel-computing lab selected from official Science Tokyo CS lab directory.', 'rio.gsic.titech.ac.jp', 0.9, '2026-05-26', 'verified'),
  ('research-isct-koike-lab-page', 'Science Tokyo Koike Hideki Laboratory', 'https://www.vogue.cs.titech.ac.jp/', 'lab_page', 'official_info_completion_2026_05_26', 'science-tokyo', 'program-science-tokyo-cs', 'prof-isct-hideki-koike', 'lab-isct-koike-hci', 'high', 'professor_discovery', 'HCI, computer vision, and visualization lab selected from official Science Tokyo CS lab directory.', 'vogue.cs.titech.ac.jp', 0.88, '2026-05-26', 'verified');

INSERT OR IGNORE INTO radar_sources (id, name, source_type, url, query, keywords, enabled, university_id, confidence, check_frequency, patrol_status, priority, ai_enrichment_enabled)
VALUES
  ('src-info-utokyo-ist-ay2027-application', 'UTokyo IST AY2027 entrance application', 'admission_notice', 'https://www.i.u-tokyo.ac.jp/edu/entra/entra_e.shtml', NULL, '["utokyo","ist","admission","deadline","toefl"]', 1, 'utokyo', 'high', 'weekly', 'never_checked', 'high', 1),
  ('src-info-utokyo-epiip-abolished', 'UTokyo EPIIP abolished notice', 'admission_notice', 'https://www.i.u-tokyo.ac.jp/edu/entra/epiip_e.shtml', NULL, '["utokyo","epiip","abolished","negative-signal"]', 1, 'utokyo', 'high', 'monthly', 'never_checked', 'normal', 1),
  ('src-info-isct-igpc-fall2026', 'Science Tokyo IGP(C) application page', 'admission_notice', 'https://admissions.isct.ac.jp/en/013/graduate/programs/science-and-engineering/igp-c', NULL, '["science-tokyo","igp-c","deadline","jasso","adb-jsp"]', 1, 'science-tokyo', 'high', 'weekly', 'never_checked', 'high', 1),
  ('src-info-isct-igpa', 'Science Tokyo IGP(A) application page', 'admission_notice', 'https://admissions.isct.ac.jp/en/013/graduate/programs/igp/igp-a', NULL, '["science-tokyo","igp-a","mext","scholarship","deadline"]', 1, 'science-tokyo', 'high', 'weekly', 'never_checked', 'high', 1),
  ('src-info-isct-ipsss', 'Science Tokyo IPSSS program page', 'admission_notice', 'https://www.e.titech.ac.jp/igpa/', NULL, '["science-tokyo","ipsss","s3","deadline","super-smart-society"]', 1, 'science-tokyo', 'high', 'monthly', 'never_checked', 'normal', 1),
  ('src-info-osaka-itsce-guides', 'Osaka IST application guides', 'admission_notice', 'https://www.ist.osaka-u.ac.jp/english/examinees/admission/guidelines2026.php', NULL, '["osaka","ist","itsce","deadline","supervisor"]', 1, 'osaka', 'high', 'weekly', 'never_checked', 'high', 1),
  ('src-info-tohoku-gsis-exam', 'Tohoku GSIS entrance exam page', 'admission_notice', 'https://www.is.tohoku.ac.jp/en/entrance/exam.html', NULL, '["tohoku","gsis","admission","fall-exam","spring-exam"]', 1, 'tohoku', 'high', 'weekly', 'never_checked', 'high', 1),
  ('src-info-tohoku-nifs', 'Tohoku NIFS application page', 'admission_notice', 'https://sgpis.is.tohoku.ac.jp/nifs/application.html', NULL, '["tohoku","nifs","mext","fall-2026"]', 1, 'tohoku', 'high', 'monthly', 'never_checked', 'normal', 1),
  ('src-info-tohoku-aiqds', 'Tohoku AIQDS application page', 'admission_notice', 'https://www.is.tohoku.ac.jp/_eng/aiqds/', NULL, '["tohoku","aiqds","mext","ai","hpc","quantum"]', 1, 'tohoku', 'medium', 'monthly', 'never_checked', 'normal', 1),
  ('src-info-tsukuba-cs-admission', 'Tsukuba CS admission page', 'admission_notice', 'https://www.cs.tsukuba.ac.jp/english/admission.html', NULL, '["tsukuba","computer-science","web-entry","deadline"]', 1, 'tsukuba', 'high', 'weekly', 'never_checked', 'high', 1),
  ('src-info-tsukuba-aisip', 'Tsukuba AISIP page', 'admission_notice', 'https://www.cs.tsukuba.ac.jp/aisip/', NULL, '["tsukuba","aisip","mext","ai-social-implementation"]', 1, 'tsukuba', 'high', 'monthly', 'never_checked', 'normal', 1),
  ('src-info-tsukuba-airb-guide', 'Tsukuba AIRB MEXT guide', 'admission_notice', 'https://www.sie.tsukuba.ac.jp/eng/wp-content/uploads/AIRB-2026-Application-Guidelines.pdf', NULL, '["tsukuba","airb","mext","robotics","ai"]', 1, 'tsukuba', 'high', 'monthly', 'never_checked', 'normal', 1),
  ('src-experience-utokyo-inbound', 'UTokyo international student portal', 'experience_index', 'https://www.u-tokyo.ac.jp/adm/inbound/en/index.html', NULL, '["utokyo","international-students","student-life"]', 1, 'utokyo', 'medium', 'monthly', 'never_checked', 'low', 1),
  ('src-experience-utokyo-ist-voices', 'UTokyo IST voices', 'experience_index', 'https://www.u-tokyo.ac.jp/focus/en/tags/index.php?tag=UTokyo+Voices&scrollTop=100&busho=Graduate+School+of+Information+Science+and+Technology', NULL, '["utokyo","ist","voices","qualitative-signal"]', 1, 'utokyo', 'medium', 'monthly', 'never_checked', 'low', 1),
  ('src-experience-osaka-guidebook', 'Osaka inbound guidebook', 'experience_index', 'https://www.osaka-u.ac.jp/en/international/inbound/guidebook', NULL, '["osaka","international-students","guidebook"]', 1, 'osaka', 'medium', 'monthly', 'never_checked', 'low', 1),
  ('src-experience-osaka-support', 'Osaka inbound support', 'experience_index', 'https://www.osaka-u.ac.jp/en/international/inbound/support', NULL, '["osaka","student-support","international-students"]', 1, 'osaka', 'medium', 'monthly', 'never_checked', 'low', 1),
  ('src-experience-tohoku-guidebook', 'Tohoku international student guidebook', 'experience_index', 'https://www.insc.tohoku.ac.jp/english/guidebook/', NULL, '["tohoku","international-students","guidebook"]', 1, 'tohoku', 'medium', 'monthly', 'never_checked', 'low', 1);

INSERT OR IGNORE INTO timeline_tasks (id, title, deadline, priority, status, task_type, related_university_id, related_program_id, notes)
VALUES
  ('task-utokyo-ist-20260604-application', 'UTokyo IST AY2027 application confirm/upload deadline', '2026-06-04', 'high', 'todo', 'application_deadline', 'utokyo', 'program-utokyo-ist', 'Confirm My Page and upload all required documents by 14:00 JST.'),
  ('task-tsukuba-cs-20260601-web-entry', 'Tsukuba CS recommendation/doctoral web entry closes', '2026-06-01', 'high', 'todo', 'application_deadline', 'tsukuba', 'program-tsukuba-cse', 'Official CS page shows web entry closes 2026-06-01 15:00 JST. Confirm eligibility before acting.'),
  ('task-tohoku-gsis-20260605-guide-patrol', 'Check Tohoku GSIS Fall 2026 admission guide release', '2026-06-05', 'medium', 'todo', 'source_patrol', 'tohoku', 'program-tohoku-gsis', 'Official overview says fall guidelines are released around early June.'),
  ('task-isct-igpc-20260815-next-call', 'Watch Science Tokyo IGP(C) next call opening', '2026-08-15', 'medium', 'todo', 'source_patrol', 'science-tokyo', 'program-isct-igp-c', 'Official page says next call starts in August 2026. Extract exact deadline once posted.'),
  ('task-isct-igpa-20260901-next-call', 'Watch Science Tokyo IGP(A) next call opening', '2026-09-01', 'medium', 'todo', 'source_patrol', 'science-tokyo', 'program-isct-igp-a', 'Official page says next call starts in September 2026. Extract exact deadline once posted.'),
  ('task-osaka-ist-20270301-guide-patrol', 'Watch Osaka IST 2027 ITSCE guide release', '2027-03-01', 'medium', 'todo', 'source_patrol', 'osaka', 'program-osaka-ist-itsce', '2026 guide was last updated in March; monitor the 2027 guide release.');

UPDATE gap_actions
SET status = 'resolved',
  notes = 'Resolved by 0017 official experience-index source imports.',
  updated_at = datetime('now')
WHERE gap_key IN ('missing_experience_sources_utokyo', 'missing_experience_sources_osaka', 'missing_experience_sources_tohoku');

INSERT OR IGNORE INTO gap_actions (id, gap_key, university_id, status, notes)
VALUES
  ('gap-extract-official-program-pages', 'extract_official_program_pages', NULL, 'in_progress', '0017 manually extracted the highest-impact official program pages; remaining official pages should be processed by LLM extraction when LLM_API_KEY is configured.'),
  ('gap-next-cycle-deadlines-not-posted', 'next_cycle_deadlines_not_posted', NULL, 'open', 'Science Tokyo next IGP(A/C), Tohoku GSIS exact Fall 2026 dates, and future Osaka/Tsukuba scholarship-route calls require patrol because exact next-cycle dates are not yet posted.');
