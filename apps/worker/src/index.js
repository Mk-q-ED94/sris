const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type,x-cron-secret",
};

const TABLES = {
  universities: {
    path: "/api/universities",
    table: "universities",
    order: "name asc",
    jsonFields: [],
    createFields: ["name", "location", "website", "tuition", "notes"],
  },
  programs: {
    path: "/api/programs",
    table: "programs",
    order: "deadline asc, program_name asc",
    jsonFields: [],
    createFields: [
      "university_id",
      "program_name",
      "degree",
      "language",
      "deadline",
      "requirements",
      "scholarship",
      "tuition",
      "website",
      "notes",
    ],
  },
  professors: {
    path: "/api/professors",
    table: "professors",
    order: "name asc",
    jsonFields: ["research_keywords"],
    createFields: ["university_id", "name", "title", "email", "website", "research_keywords", "notes"],
  },
  labs: {
    path: "/api/labs",
    table: "labs",
    order: "lab_name asc",
    jsonFields: ["research_keywords", "recent_papers"],
    createFields: [
      "university_id",
      "professor_id",
      "lab_name",
      "research_keywords",
      "website",
      "recent_papers",
      "notes",
    ],
  },
  papers: {
    path: "/api/papers",
    table: "papers",
    order: "published_at desc, created_at desc",
    jsonFields: ["authors", "keywords"],
    createFields: [
      "title",
      "authors",
      "venue",
      "year",
      "url",
      "source",
      "published_at",
      "keywords",
      "abstract",
      "summary",
      "ai_status",
    ],
  },
  timeline: {
    path: "/api/timeline",
    table: "timeline_tasks",
    order: "deadline asc",
    jsonFields: [],
    createFields: [
      "title",
      "deadline",
      "priority",
      "status",
      "task_type",
      "related_university_id",
      "related_program_id",
      "notes",
    ],
  },
  sources: {
    path: "/api/radar-sources",
    table: "radar_sources",
    order: "name asc",
    jsonFields: ["keywords"],
    createFields: ["name", "source_type", "url", "query", "keywords", "enabled"],
  },
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: JSON_HEADERS });
    }

    const url = new URL(request.url);
    try {
      if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
        return htmlResponse(APP_HTML);
      }

      if (url.pathname === "/api/health") {
        return json({ status: "ok", service: "sris-worker" });
      }

      if (url.pathname === "/api/admin/init" && request.method === "POST") {
        requireCron(request, env);
        const result = await initializeDatabase(env.DB);
        return json(result);
      }

      if (url.pathname === "/api/ingest/arxiv/run" && request.method === "POST") {
        requireCron(request, env);
        return json(await ingestArxiv(env.DB));
      }

      requireApiToken(request, env);

      if (url.pathname === "/api/dashboard" && request.method === "GET") {
        return json(await dashboard(env.DB));
      }

      if (url.pathname === "/api/review/papers" && request.method === "GET") {
        const rows = await listRows(env.DB, "paper_candidates", "status = ?", ["pending"], "published_at desc");
        return json(rows.map(normalizeCandidate));
      }

      const acceptMatch = url.pathname.match(/^\/api\/review\/papers\/([^/]+)\/accept$/);
      if (acceptMatch && request.method === "POST") {
        return json(await acceptCandidate(env.DB, acceptMatch[1]));
      }

      const ignoreMatch = url.pathname.match(/^\/api\/review\/papers\/([^/]+)\/ignore$/);
      if (ignoreMatch && request.method === "POST") {
        return json(await ignoreCandidate(env.DB, ignoreMatch[1]));
      }

      for (const config of Object.values(TABLES)) {
        if (url.pathname === config.path && request.method === "GET") {
          const rows = await listRows(env.DB, config.table, null, [], config.order);
          return json(rows.map((row) => normalizeRow(row, config.jsonFields)));
        }
        if (url.pathname === config.path && request.method === "POST") {
          const payload = await request.json();
          return json(await createRow(env.DB, config, payload), 201);
        }
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      const status = error.status || 500;
      return json({ error: error.message || "Internal error" }, status);
    }
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(ingestArxiv(env.DB));
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function htmlResponse(html) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requireApiToken(request, env) {
  const configured = env.API_TOKEN;
  if (!configured) return;
  const header = request.headers.get("authorization") || "";
  if (header !== `Bearer ${configured}`) {
    throw httpError(401, "Invalid API token");
  }
}

function requireCron(request, env) {
  const configured = env.CRON_SECRET || env.API_TOKEN;
  if (!configured) return;
  const header = request.headers.get("x-cron-secret") || "";
  if (header !== configured) {
    throw httpError(401, "Invalid cron secret");
  }
}

async function listRows(db, table, where, params, order) {
  const sql = `select * from ${table}${where ? ` where ${where}` : ""} order by ${order}`;
  const result = await db.prepare(sql).bind(...params).all();
  return result.results || [];
}

async function countRows(db, table, where = null, params = []) {
  const sql = `select count(*) as count from ${table}${where ? ` where ${where}` : ""}`;
  const row = await db.prepare(sql).bind(...params).first();
  return row?.count || 0;
}

async function createRow(db, config, payload) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const fields = ["id", ...config.createFields, "created_at", "updated_at"];
  const values = fields.map((field) => {
    if (field === "id") return id;
    if (field === "created_at" || field === "updated_at") return now;
    if (config.jsonFields.includes(field)) return JSON.stringify(payload[field] || []);
    if (field === "enabled") return payload[field] === false ? 0 : 1;
    return payload[field] ?? null;
  });
  const placeholders = fields.map(() => "?").join(", ");
  await db
    .prepare(`insert into ${config.table} (${fields.join(", ")}) values (${placeholders})`)
    .bind(...values)
    .run();
  const row = await db.prepare(`select * from ${config.table} where id = ?`).bind(id).first();
  return normalizeRow(row, config.jsonFields);
}

async function dashboard(db) {
  const counts = {
    universities: await countRows(db, "universities"),
    programs: await countRows(db, "programs"),
    professors: await countRows(db, "professors"),
    labs: await countRows(db, "labs"),
    papers: await countRows(db, "papers"),
    pending_candidates: await countRows(db, "paper_candidates", "status = ?", ["pending"]),
    timeline_tasks: await countRows(db, "timeline_tasks"),
  };

  const recentPapers = (await listRows(db, "papers", null, [], "created_at desc limit 8")).map(normalizePaper);
  const pendingCandidates = (
    await listRows(db, "paper_candidates", "status = ?", ["pending"], "published_at desc limit 8")
  ).map(normalizeCandidate);
  const upcomingTasks = (
    await db
      .prepare(
        "select * from timeline_tasks where deadline >= date('now') and deadline <= date('now', '+90 day') and status != 'done' order by deadline asc limit 10",
      )
      .all()
  ).results.map((row) => normalizeRow(row, []));

  return {
    counts,
    recent_papers: recentPapers,
    pending_candidates: pendingCandidates,
    upcoming_tasks: upcomingTasks,
    recent_updates: [
      { label: "Pending review", value: String(counts.pending_candidates) },
      { label: "Tracked papers", value: String(counts.papers) },
      { label: "Upcoming tasks", value: String(upcomingTasks.length) },
    ],
  };
}

async function acceptCandidate(db, id) {
  const candidate = await db.prepare("select * from paper_candidates where id = ?").bind(id).first();
  if (!candidate) throw httpError(404, "Candidate not found");
  if (candidate.status !== "pending") throw httpError(409, "Candidate already reviewed");
  const now = new Date().toISOString();
  const paperId = crypto.randomUUID();
  const publishedDate = candidate.published_at ? candidate.published_at.slice(0, 10) : null;
  const year = publishedDate ? Number(publishedDate.slice(0, 4)) : null;

  await db.batch([
    db
      .prepare(
        "insert into papers (id,title,authors,venue,year,url,source,published_at,keywords,abstract,ai_status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        paperId,
        candidate.title,
        candidate.authors,
        "arXiv",
        year,
        candidate.url,
        candidate.source,
        publishedDate,
        candidate.matched_keywords,
        candidate.abstract,
        "pending",
        now,
        now,
      ),
    db
      .prepare("update paper_candidates set status = 'accepted', reviewed_at = ?, updated_at = ? where id = ?")
      .bind(now, now, id),
  ]);
  return normalizePaper(await db.prepare("select * from papers where id = ?").bind(paperId).first());
}

async function ignoreCandidate(db, id) {
  const now = new Date().toISOString();
  const result = await db
    .prepare("update paper_candidates set status = 'ignored', reviewed_at = ?, updated_at = ? where id = ?")
    .bind(now, now, id)
    .run();
  if (!result.meta?.changes) throw httpError(404, "Candidate not found");
  return normalizeCandidate(await db.prepare("select * from paper_candidates where id = ?").bind(id).first());
}

async function ingestArxiv(db) {
  const sources = (await db.prepare("select * from radar_sources where enabled = 1 and source_type = 'arxiv'").all())
    .results || [];
  let created = 0;
  let skipped = 0;

  for (const source of sources) {
    const sourceKeywords = parseJson(source.keywords, []);
    const feedUrl = source.url || buildArxivUrl(source.query || "machine learning");
    const response = await fetch(feedUrl, { headers: { "user-agent": "SRIS/0.1" } });
    if (!response.ok) {
      skipped += 1;
      continue;
    }
    const papers = parseArxivFeed(await response.text());
    for (const paper of papers) {
      const existingPaper = await db.prepare("select id from papers where url = ?").bind(paper.url).first();
      if (existingPaper) {
        skipped += 1;
        continue;
      }
      const matches = keywordMatches(paper, sourceKeywords);
      if (sourceKeywords.length && !matches.length) {
        skipped += 1;
        continue;
      }
      try {
        await db
          .prepare(
            "insert into paper_candidates (id,source_id,source,title,authors,abstract,url,published_at,matched_keywords,raw_payload,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
          )
          .bind(
            crypto.randomUUID(),
            source.id,
            source.name,
            paper.title,
            JSON.stringify(paper.authors),
            paper.abstract,
            paper.url,
            paper.published_at,
            JSON.stringify(matches),
            JSON.stringify(paper.raw_payload),
            "pending",
            new Date().toISOString(),
            new Date().toISOString(),
          )
          .run();
        created += 1;
      } catch (_error) {
        skipped += 1;
      }
    }
    await db
      .prepare("update radar_sources set last_run_at = ?, updated_at = ? where id = ?")
      .bind(new Date().toISOString(), new Date().toISOString(), source.id)
      .run();
  }

  return { sources_checked: sources.length, candidates_created: created, candidates_skipped: skipped };
}

function normalizePaper(row) {
  return normalizeRow(row, ["authors", "keywords"]);
}

function normalizeCandidate(row) {
  return normalizeRow(row, ["authors", "matched_keywords", "raw_payload"]);
}

function normalizeRow(row, jsonFields) {
  const normalized = { ...row };
  for (const field of jsonFields) {
    normalized[field] = parseJson(normalized[field], field === "raw_payload" ? {} : []);
  }
  if ("enabled" in normalized) normalized.enabled = Boolean(normalized.enabled);
  return normalized;
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function buildArxivUrl(query) {
  return `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=25&sortBy=submittedDate&sortOrder=descending`;
}

function parseArxivFeed(xml) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1]);
  return entries
    .map((entry) => {
      const title = textBetween(entry, "title");
      const abstract = textBetween(entry, "summary");
      const publishedAt = textBetween(entry, "published");
      const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g)].map((match) =>
        cleanXml(match[1]),
      );
      const alternate = entry.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/);
      const id = textBetween(entry, "id");
      const url = alternate?.[1] || id;
      return {
        title,
        authors,
        abstract,
        url,
        published_at: publishedAt || null,
        raw_payload: { title, authors, abstract, url, published_at: publishedAt || null },
      };
    })
    .filter((paper) => paper.title && paper.url);
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return cleanXml(match?.[1] || "");
}

function cleanXml(value) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordMatches(paper, keywords) {
  const haystack = `${paper.title} ${paper.abstract}`.toLowerCase();
  return keywords.filter((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

async function initializeDatabase(db) {
  const statements = [...SCHEMA_SQL, ...SEED_SQL];
  for (const sql of statements) {
    await db.prepare(sql).run();
  }
  return { ok: true, statements: statements.length };
}

const SCHEMA_SQL = [
  "create table if not exists universities (id text primary key, name text not null unique, location text, website text, tuition real, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists programs (id text primary key, university_id text not null references universities(id) on delete cascade, program_name text not null, degree text, language text, deadline text, requirements text, scholarship text, tuition real, website text, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists professors (id text primary key, university_id text not null references universities(id) on delete cascade, name text not null, title text, email text, website text, research_keywords text not null default '[]', notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists labs (id text primary key, university_id text not null references universities(id) on delete cascade, professor_id text references professors(id) on delete set null, lab_name text not null, research_keywords text not null default '[]', website text, recent_papers text not null default '[]', notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists papers (id text primary key, title text not null, authors text not null default '[]', venue text, year integer, url text not null unique, source text, published_at text, keywords text not null default '[]', abstract text, summary text, ai_status text not null default 'pending', created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists radar_sources (id text primary key, name text not null unique, source_type text not null default 'arxiv', url text, query text, keywords text not null default '[]', enabled integer not null default 1, last_run_at text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists paper_candidates (id text primary key, source_id text references radar_sources(id) on delete set null, source text, title text not null, authors text not null default '[]', abstract text, url text not null unique, published_at text, matched_keywords text not null default '[]', raw_payload text not null default '{}', status text not null default 'pending', ignore_reason text, reviewed_at text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create table if not exists timeline_tasks (id text primary key, title text not null, deadline text, priority text not null default 'medium', status text not null default 'todo', task_type text, related_university_id text references universities(id) on delete set null, related_program_id text references programs(id) on delete set null, notes text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')))",
  "create index if not exists idx_candidates_status on paper_candidates(status)",
  "create index if not exists idx_timeline_deadline on timeline_tasks(deadline)",
];

const SEED_SQL = [
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

const APP_HTML = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SRIS</title>
  <style>
    :root { --bg:#f7f9fb; --surface:#fff; --text:#172033; --muted:#617085; --border:#dbe3ea; --accent:#16798c; --warn:#b7791f; --ok:#2f855a; }
    * { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--text); font-family:Arial, Helvetica, sans-serif; letter-spacing:0; }
    .shell { display:grid; grid-template-columns:260px 1fr; min-height:100vh; }
    aside { background:var(--surface); border-right:1px solid var(--border); padding:18px 14px; position:sticky; top:0; height:100vh; }
    .brand { padding:4px 8px 18px; border-bottom:1px solid var(--border); margin-bottom:14px; }
    .brand strong { display:block; font-size:22px; } .brand span, .muted { color:var(--muted); font-size:12px; }
    nav button { width:100%; display:flex; align-items:center; gap:10px; border:0; background:transparent; color:var(--muted); padding:10px 12px; border-radius:6px; font-weight:600; cursor:pointer; text-align:left; }
    nav button.active, nav button:hover { background:#edf3f5; color:var(--text); }
    main { min-width:0; } header { height:64px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; background:rgba(247,249,251,.92); position:sticky; top:0; backdrop-filter:blur(10px); }
    .content { max-width:1360px; padding:24px; margin:0 auto; }
    h1 { font-size:26px; margin:0; } h2 { font-size:16px; margin:0; } p { line-height:1.55; }
    .page-head { display:flex; justify-content:space-between; gap:16px; align-items:end; margin-bottom:22px; }
    .grid { display:grid; gap:14px; } .metrics { grid-template-columns:repeat(7,minmax(120px,1fr)); }
    .card { background:var(--surface); border:1px solid var(--border); border-radius:8px; box-shadow:0 1px 2px rgba(15,23,42,.05); }
    .card-head { padding:16px 18px; border-bottom:1px solid var(--border); font-weight:700; }
    .card-body { padding:18px; } .metric { padding:16px; } .metric .num { font-size:26px; font-weight:700; margin-top:6px; }
    table { width:100%; border-collapse:collapse; font-size:14px; } th { background:#eef3f6; color:var(--muted); text-transform:uppercase; font-size:11px; letter-spacing:.04em; text-align:left; padding:12px 14px; border-bottom:1px solid var(--border); }
    td { padding:13px 14px; border-bottom:1px solid var(--border); vertical-align:top; }
    input, textarea, select { width:100%; border:1px solid var(--border); border-radius:6px; padding:10px 11px; font:inherit; background:white; }
    textarea { min-height:86px; resize:vertical; } label span { display:block; margin-bottom:5px; color:var(--muted); font-size:12px; font-weight:700; }
    .toolbar { display:flex; gap:10px; margin-bottom:14px; } .toolbar input { flex:1; }
    button.primary, button.secondary, a.button { height:39px; border-radius:6px; padding:0 14px; font-weight:700; cursor:pointer; border:1px solid var(--accent); background:var(--accent); color:white; display:inline-flex; align-items:center; gap:8px; text-decoration:none; }
    button.secondary { background:white; color:var(--text); border-color:var(--border); }
    .badge { display:inline-flex; align-items:center; height:24px; padding:0 8px; border-radius:4px; border:1px solid #c7d7dd; color:var(--accent); background:#e9f5f7; font-size:12px; font-weight:700; margin:2px; }
    .badge.warn { color:#975a16; background:#fff7e6; border-color:#f5d18b; } .badge.ok { color:var(--ok); background:#eefaf3; border-color:#b7e4c7; } .badge.gray { color:var(--muted); background:#f2f5f7; border-color:var(--border); }
    .form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; } .span2 { grid-column:span 2; }
    .review { display:grid; grid-template-columns:1fr auto; gap:18px; padding:18px; } .hidden { display:none; } .error { border:1px solid #fed7d7; background:#fff5f5; color:#c53030; padding:12px; border-radius:6px; margin-bottom:14px; }
    @media (max-width: 980px) { .shell { grid-template-columns:1fr; } aside { position:relative; height:auto; } .metrics { grid-template-columns:repeat(2,1fr); } .form-grid, .review { grid-template-columns:1fr; } .span2 { grid-column:span 1; } }
  </style>
</head>
<body>
  <div class="shell">
    <aside>
      <div class="brand"><strong>SRIS</strong><span>Research Intelligence</span></div>
      <nav id="nav"></nav>
      <p class="muted" style="position:absolute;bottom:18px;left:22px">Cloudflare Worker + D1<br/>Asia/Shanghai deadlines</p>
    </aside>
    <main>
      <header><strong>SGU / AI 修士申请情报控制台</strong><span class="muted" id="authState"></span></header>
      <div class="content" id="app"></div>
    </main>
  </div>
  <script>
    const pages = [
      ['dashboard','Dashboard'], ['universities','Universities'], ['professors','Professors'], ['labs','Labs'],
      ['programs','Programs'], ['papers','Paper Radar'], ['review','Review Queue'], ['timeline','Timeline'], ['sources','Settings / Sources']
    ];
    const titles = {
      dashboard:['Dashboard','近期论文、待确认情报、申请任务和核心数据库规模总览。'],
      universities:['Universities','目标院校数据库。'], professors:['Professors','教授、方向关键词和联系资料。'],
      labs:['Labs','实验室、研究方向和近期论文。'], programs:['Programs','英文修士项目、申请要求和 deadline。'],
      papers:['Paper Radar','已确认入库的论文列表。'], review:['Review Queue','自动采集结果人工确认后进入正式论文库。'],
      timeline:['Timeline','TOEFL、JLPT、SOP、推荐信、申请 DDL。'], sources:['Settings / Sources','arXiv RSS 查询源、关键词和自动化配置。']
    };
    let route = location.hash.slice(1) || 'dashboard';
    let token = localStorage.getItem('sris_token') || '';
    const app = document.getElementById('app');
    const nav = document.getElementById('nav');
    const authState = document.getElementById('authState');
    nav.innerHTML = pages.map(([key,label]) => '<button data-route="'+key+'">'+label+'</button>').join('');
    nav.onclick = e => { const key = e.target.dataset.route; if (key) { route = key; location.hash = key; render(); } };
    window.onhashchange = () => { route = location.hash.slice(1) || 'dashboard'; render(); };

    function headers() { return token ? { authorization: 'Bearer ' + token, 'content-type': 'application/json' } : { 'content-type':'application/json' }; }
    async function api(path, options={}) {
      const res = await fetch('/api' + path, { ...options, headers:{...headers(), ...(options.headers||{})} });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      return res.json();
    }
    function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function date(v) { return v ? new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai'}).format(new Date(v)) : '未设置'; }
    function chips(values, tone='gray') { return (values||[]).map(v => '<span class="badge '+tone+'">'+esc(v)+'</span>').join('') || '<span class="muted">-</span>'; }
    function pageHead() { const [t,d] = titles[route]; return '<div class="page-head"><div><h1>'+t+'</h1><p class="muted">'+d+'</p></div></div>'; }
    function setAuth() { authState.innerHTML = token ? 'API token active' : 'API token required'; }
    function requireTokenView() {
      return '<div class="card" style="max-width:560px"><div class="card-head">SRIS 访问令牌</div><div class="card-body"><p class="muted">输入部署时设置的 API_TOKEN。令牌只保存在此浏览器 localStorage。</p><div class="toolbar"><input id="tokenInput" type="password" placeholder="API_TOKEN" /><button class="primary" onclick="saveToken()">Enter</button></div></div></div>';
    }
    window.saveToken = () => { token = document.getElementById('tokenInput').value; localStorage.setItem('sris_token', token); render(); };

    async function render() {
      setAuth();
      [...nav.querySelectorAll('button')].forEach(btn => btn.classList.toggle('active', btn.dataset.route === route));
      if (!token) { app.innerHTML = requireTokenView(); return; }
      try {
        if (route === 'dashboard') return renderDashboard();
        if (route === 'review') return renderReview();
        return renderTable(route);
      } catch (err) { app.innerHTML = '<div class="error">'+esc(err.message)+'</div>'; }
    }
    async function renderDashboard() {
      app.innerHTML = pageHead() + '<p class="muted">Loading...</p>';
      const data = await api('/dashboard');
      const keys = [['universities','Universities'],['programs','Programs'],['professors','Professors'],['labs','Labs'],['papers','Papers'],['pending_candidates','Review'],['timeline_tasks','Tasks']];
      app.innerHTML = pageHead() + '<div class="grid metrics">' + keys.map(([k,l]) => '<div class="card metric"><span class="muted">'+l+'</span><div class="num">'+(data.counts[k]||0)+'</div></div>').join('') + '</div>' +
        '<div class="grid" style="grid-template-columns:1.2fr .8fr;margin-top:18px"><div class="card"><div class="card-head">Recent Papers</div>'+paperTable(data.recent_papers)+'</div><div class="card"><div class="card-head">Upcoming Timeline</div><div class="card-body">'+data.upcoming_tasks.map(t=>'<p><strong>'+esc(t.title)+'</strong><br/><span class="muted">'+date(t.deadline)+' · '+esc(t.priority)+'</span></p>').join('')+'</div></div></div>';
    }
    function endpoint(key) { return ({universities:'/universities',professors:'/professors',labs:'/labs',programs:'/programs',papers:'/papers',timeline:'/timeline',sources:'/radar-sources'})[key]; }
    async function renderTable(key) {
      app.innerHTML = pageHead() + '<p class="muted">Loading...</p>';
      const rows = await api(endpoint(key));
      app.innerHTML = pageHead() + '<div class="toolbar"><input id="q" placeholder="结构化筛选 / keyword filter" oninput="filterRows()"><button class="secondary" onclick="toggleForm()">New</button></div><div id="form" class="hidden">'+formFor(key)+'</div><div class="card" id="rows">'+tableFor(key, rows)+'</div>';
      window.currentRows = rows; window.currentKey = key;
    }
    window.filterRows = () => { const q = document.getElementById('q').value.toLowerCase(); document.getElementById('rows').innerHTML = tableFor(window.currentKey, window.currentRows.filter(r => JSON.stringify(r).toLowerCase().includes(q))); };
    window.toggleForm = () => document.getElementById('form').classList.toggle('hidden');
    window.createItem = async (key) => {
      const data = Object.fromEntries([...document.querySelectorAll('#form [name]')].map(i => [i.name, i.value]));
      for (const field of ['research_keywords','recent_papers','authors','keywords']) if (data[field]) data[field] = data[field].split(',').map(s=>s.trim()).filter(Boolean);
      await api(endpoint(key), { method:'POST', body:JSON.stringify(data) }); renderTable(key);
    };
    function formFor(key) {
      const fields = {
        universities:['name','location','website','notes'], professors:['university_id','name','title','website','research_keywords','notes'], labs:['university_id','professor_id','lab_name','research_keywords','website','recent_papers','notes'],
        programs:['university_id','program_name','degree','language','deadline','requirements'], timeline:['title','deadline','priority','status','task_type','notes'], sources:['name','query','keywords']
      }[key] || [];
      return '<div class="card" style="margin-bottom:14px"><div class="card-body form-grid">'+fields.map(f=>'<label><span>'+f+'</span><input name="'+f+'"></label>').join('')+'<button class="primary" onclick="createItem(\\''+key+'\\')">Save</button></div></div>';
    }
    function tableFor(key, rows) {
      if (key === 'papers') return paperTable(rows);
      const cols = Object.keys(rows[0] || {empty:''}).filter(c => !['created_at','updated_at'].includes(c)).slice(0,8);
      return '<table><thead><tr>'+cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+cols.map(c=>'<td>'+cell(r[c])+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
    }
    function paperTable(rows) { return '<table><thead><tr><th>Title</th><th>Authors</th><th>Venue</th><th>Year</th><th>Keywords</th></tr></thead><tbody>'+rows.map(p=>'<tr><td><a href="'+esc(p.url)+'">'+esc(p.title)+'</a></td><td>'+esc((p.authors||[]).join(', '))+'</td><td>'+esc(p.venue||p.source||'-')+'</td><td>'+esc(p.year||'-')+'</td><td>'+chips(p.keywords)+'</td></tr>').join('')+'</tbody></table>'; }
    function cell(v) { if (Array.isArray(v)) return chips(v); if (typeof v === 'boolean') return v ? '<span class="badge ok">enabled</span>' : '<span class="badge gray">off</span>'; return esc(v ?? '-'); }
    async function renderReview() {
      app.innerHTML = pageHead() + '<p class="muted">Loading...</p>';
      const rows = await api('/review/papers');
      app.innerHTML = pageHead() + '<div class="grid">'+rows.map(c=>'<div class="card review"><div><div>'+chips([c.source||'arXiv'])+chips(c.matched_keywords,'warn')+'</div><h2>'+esc(c.title)+'</h2><p class="muted">'+esc((c.authors||[]).join(', '))+'</p><p>'+esc(c.abstract||'')+'</p><a href="'+esc(c.url)+'">Open source</a></div><div><button class="primary" onclick="accept(\\''+c.id+'\\')">Accept</button> <button class="secondary" onclick="ignore(\\''+c.id+'\\')">Ignore</button></div></div>').join('')+'</div>';
    }
    window.accept = async id => { await api('/review/papers/'+id+'/accept', { method:'POST' }); renderReview(); };
    window.ignore = async id => { await api('/review/papers/'+id+'/ignore', { method:'POST' }); renderReview(); };
    render();
  </script>
</body>
</html>`;
