"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BookOpen, CalendarDays, Database, Inbox, University } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { DashboardSummary } from "@/types/sris";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";

const countCards = [
  { key: "universities", label: "Universities", icon: University },
  { key: "programs", label: "Programs", icon: Database },
  { key: "professors", label: "Professors", icon: Database },
  { key: "labs", label: "Labs", icon: Database },
  { key: "papers", label: "Papers", icon: BookOpen },
  { key: "pending_candidates", label: "Review", icon: Inbox },
  { key: "timeline_tasks", label: "Tasks", icon: CalendarDays },
];

export function DashboardView() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardSummary>("/dashboard").then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Loading SRIS console...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {countCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
                  <div className="mt-1 text-2xl font-semibold">{data.counts[item.key] ?? 0}</div>
                </div>
                <Icon className="h-5 w-5 text-accent" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Papers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Venue</Th>
                  <Th>Keywords</Th>
                  <Th>Published</Th>
                </tr>
              </thead>
              <tbody>
                {data.recent_papers.map((paper) => (
                  <tr key={paper.id}>
                    <Td className="font-medium">{paper.title}</Td>
                    <Td>{paper.venue ?? "arXiv"}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {paper.keywords.map((keyword) => (
                          <Badge key={keyword} tone="muted">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </Td>
                    <Td>{formatDate(paper.published_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcoming_tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium">{task.title}</div>
                    <Badge tone={task.priority === "high" ? "warning" : "muted"}>{task.priority}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {task.task_type ?? "Task"} · {formatDate(task.deadline)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Queue Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {data.pending_candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-md border border-border p-4">
              <div className="flex items-center gap-2">
                <Badge>{candidate.source ?? "arXiv"}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(candidate.published_at)}</span>
              </div>
              <div className="mt-3 font-medium">{candidate.title}</div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{candidate.abstract}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
