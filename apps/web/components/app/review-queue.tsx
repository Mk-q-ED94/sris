"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, RefreshCcw, X } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { PaperCandidate } from "@/types/sris";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReviewQueue() {
  const [items, setItems] = useState<PaperCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setError(null);
    apiGet<PaperCandidate[]>("/review/papers").then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function accept(id: string) {
    setBusyId(id);
    try {
      await apiPost(`/review/papers/${id}/accept`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accept failed");
    } finally {
      setBusyId(null);
    }
  }

  async function ignore(id: string) {
    setBusyId(id);
    try {
      await apiPost(`/review/papers/${id}/ignore`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ignore failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{items.length} pending candidates</div>
        <Button variant="secondary" onClick={load}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4">
        {items.map((candidate) => (
          <Card key={candidate.id}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge>{candidate.source ?? "arXiv"}</Badge>
                  <Badge tone="muted">{formatDate(candidate.published_at)}</Badge>
                  {candidate.matched_keywords.map((keyword) => (
                    <Badge key={keyword} tone="warning">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-base font-semibold">{candidate.title}</h2>
                <div className="mt-1 text-sm text-muted-foreground">{candidate.authors.join(", ")}</div>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">{candidate.abstract}</p>
                <a href={candidate.url} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent">
                  Open source
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Button onClick={() => accept(candidate.id)} disabled={busyId === candidate.id}>
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button variant="secondary" onClick={() => ignore(candidate.id)} disabled={busyId === candidate.id}>
                  <X className="h-4 w-4" />
                  Ignore
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Review Queue is empty. Run arXiv ingest or adjust radar sources.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
