import type { D1Database } from "@cloudflare/workers-types";
import { countRows, listRows } from "../db/queries";
import { normalizeCandidate, normalizePaper, normalizeRow } from "../db/normalize";

interface CoverageItem {
  label_key: string;
  value: number;
  target: number;
  tone: "strong" | "medium" | "weak";
}

interface GapItem {
  label_key: string;
  priority: "high" | "medium" | "low";
  university_id?: string;
  university_name?: string;
}

export interface DashboardResult {
  counts: Record<string, number>;
  recent_papers: Record<string, unknown>[];
  pending_candidates: Record<string, unknown>[];
  upcoming_tasks: Record<string, unknown>[];
  recent_updates: { label: string; value: string }[];
  coverage: CoverageItem[];
  gaps: GapItem[];
}

export async function dashboard(db: D1Database): Promise<DashboardResult> {
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
  const upcomingTasksRows =
    (
      await db
        .prepare(
          "select * from timeline_tasks where deadline >= date('now') and deadline <= date('now', '+90 day') and status != 'done' order by deadline asc limit 10",
        )
        .all<Record<string, unknown>>()
    ).results || [];
  const upcomingTasks = upcomingTasksRows.map((row) => normalizeRow(row, []));

  const manualCaptures = await countRows(db, "paper_candidates", "source = ? and status = ?", ["manual", "pending"]);
  const coverage = buildCoverage(counts, manualCaptures);
  const gaps = await buildGaps(db, counts);

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
    coverage,
    gaps,
  };
}

function buildCoverage(counts: Record<string, number>, manualCaptures: number): CoverageItem[] {
  const uniCount = counts.universities || 1;
  const items: Array<Omit<CoverageItem, "tone">> = [
    { label_key: "universities", value: counts.universities ?? 0, target: 5 },
    { label_key: "programs", value: counts.programs ?? 0, target: Math.max(8, uniCount * 2) },
    { label_key: "professors_labs", value: (counts.professors ?? 0) + (counts.labs ?? 0), target: Math.max(12, uniCount * 3) },
    { label_key: "papers", value: (counts.papers ?? 0) + (counts.pending_candidates ?? 0), target: Math.max(24, uniCount * 6) },
    { label_key: "captures", value: manualCaptures, target: 5 },
    { label_key: "tasks", value: counts.timeline_tasks ?? 0, target: 10 },
  ];
  return items.map((item) => {
    const ratio = item.target > 0 ? item.value / item.target : 0;
    return { ...item, tone: ratio >= 0.85 ? "strong" as const : ratio >= 0.35 ? "medium" as const : "weak" as const };
  });
}

async function buildGaps(db: D1Database, counts: Record<string, number>): Promise<GapItem[]> {
  const gaps: GapItem[] = [];

  // Per-university gap detection
  const universities = await listRows(db, "universities", null, [], "name asc");
  for (const uni of universities) {
    const uniId = String(uni.id);
    const uniName = String(uni.name);
    const profCount = await countRows(db, "professors", "university_id = ?", [uniId]);
    const labCount = await countRows(db, "labs", "university_id = ?", [uniId]);
    const progCount = await countRows(db, "programs", "university_id = ?", [uniId]);

    if (progCount === 0) {
      gaps.push({ label_key: "no_programs_for", priority: "high", university_id: uniId, university_name: uniName });
    }
    if (profCount === 0 && labCount === 0) {
      gaps.push({ label_key: "no_professors_for", priority: "high", university_id: uniId, university_name: uniName });
    }
  }

  // Global gaps
  if ((counts.universities ?? 0) < 5) {
    gaps.push({ label_key: "few_universities", priority: "medium" });
  }
  if ((counts.papers ?? 0) === 0) {
    gaps.push({ label_key: "no_papers", priority: "medium" });
  }
  if ((counts.pending_candidates ?? 0) >= 8) {
    gaps.push({ label_key: "candidate_backlog", priority: "medium" });
  }
  if ((counts.timeline_tasks ?? 0) === 0) {
    gaps.push({ label_key: "no_tasks", priority: "low" });
  }
  if (!gaps.length) {
    gaps.push({ label_key: "none", priority: "low" });
  }

  return gaps.slice(0, 8);
}
