import type { D1Database } from "@cloudflare/workers-types";
import { countRows, listRows } from "../db/queries";
import { normalizeCandidate, normalizePaper, normalizeRow } from "../db/normalize";

export interface DashboardResult {
  counts: Record<string, number>;
  recent_papers: Record<string, unknown>[];
  pending_candidates: Record<string, unknown>[];
  upcoming_tasks: Record<string, unknown>[];
  recent_updates: { label: string; value: string }[];
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
