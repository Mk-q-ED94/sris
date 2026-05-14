import type { D1Database } from "@cloudflare/workers-types";
import { listRows } from "../db/queries";

interface TimelineRow {
  id: string;
  title: string;
  deadline: string | null;
  priority: string;
  status: string;
  task_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fold(line: string): string {
  // RFC5545 — lines should be wrapped to 75 octets, continuation lines start with space.
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const size = i === 0 ? 75 : 74;
    chunks.push(line.slice(i, i + size));
    i += size;
  }
  return chunks.join("\r\n ");
}

function dateOnly(iso: string): string {
  // Convert "YYYY-MM-DD" or full ISO to YYYYMMDD
  const d = iso.length >= 10 ? iso.slice(0, 10) : iso;
  return d.replace(/-/g, "");
}

function isoStamp(iso: string): string {
  // Convert any ISO to YYYYMMDDTHHMMSSZ
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "20260101T000000Z";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function buildTimelineIcs(db: D1Database, origin: string): Promise<string> {
  const tasks = (await listRows(db, "timeline_tasks", null, [], "deadline asc")) as unknown as TimelineRow[];

  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//SRIS//Timeline//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push("X-WR-CALNAME:SRIS Timeline");
  lines.push("X-WR-TIMEZONE:Asia/Shanghai");

  const now = isoStamp(new Date().toISOString());

  for (const task of tasks) {
    if (!task.deadline) continue;
    const deadlineDay = dateOnly(task.deadline);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${task.id}@sris`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;VALUE=DATE:${deadlineDay}`);
    // All-day event: DTEND should be the next day per RFC 5545
    const next = new Date(`${task.deadline.slice(0, 10)}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    lines.push(`DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`);
    const priorityTag = task.priority === "high" ? "【高】" : task.priority === "low" ? "【低】" : "";
    lines.push(fold(`SUMMARY:${escapeICS(priorityTag + task.title)}`));
    const descParts: string[] = [];
    if (task.task_type) descParts.push(`Type: ${task.task_type}`);
    if (task.status) descParts.push(`Status: ${task.status}`);
    if (task.notes) descParts.push(task.notes);
    descParts.push(`SRIS · ${origin}`);
    lines.push(fold(`DESCRIPTION:${escapeICS(descParts.join("\\n"))}`));
    if (task.priority === "high") lines.push("PRIORITY:1");
    lines.push(task.status === "done" ? "STATUS:COMPLETED" : "STATUS:CONFIRMED");
    lines.push("TRANSP:TRANSPARENT");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
