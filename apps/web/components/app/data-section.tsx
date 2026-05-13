"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { apiCreate, apiGet } from "@/lib/api";
import { formatDate, splitCsv } from "@/lib/utils";
import type { Lab, Paper, Professor, Program, RadarSource, TimelineTask, University } from "@/types/sris";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";

type EntityKey = "universities" | "labs" | "professors" | "programs" | "papers" | "timeline" | "sources";
type Entity = University | Lab | Professor | Program | Paper | TimelineTask | RadarSource;
type FieldDef = {
  name: string;
  label: string;
  required?: boolean;
  kind?: "textarea";
  type?: string;
};

const endpointByEntity = {
  universities: "/universities",
  labs: "/labs",
  professors: "/professors",
  programs: "/programs",
  papers: "/papers",
  timeline: "/timeline",
  sources: "/radar-sources",
} as const;

function getSearchText(item: Entity) {
  return JSON.stringify(item).toLowerCase();
}

function Chips({ values }: { values?: string[] }) {
  if (!values?.length) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <Badge key={value} tone="muted">
          {value}
        </Badge>
      ))}
    </div>
  );
}

export function DataSection({ entity }: { entity: EntityKey }) {
  const [items, setItems] = useState<Entity[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const path = endpointByEntity[entity];
    apiGet<Entity[]>(path)
      .then((data) => setItems(data as Entity[]))
      .catch((err) => setError(err.message));
  }, [entity]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const needle = query.toLowerCase();
    return items.filter((item) => getSearchText(item).includes(needle));
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="按学校、方向、关键词、年份或状态筛选" className="pl-9" />
        </div>
        {entity !== "papers" && (
          <Button variant="secondary" onClick={() => setOpen((value) => !value)}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        )}
      </div>

      {open && <CreatePanel entity={entity} onCreated={(item) => setItems((current) => [item, ...current])} />}

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {entity === "universities" && <UniversitiesTable items={filtered as University[]} />}
          {entity === "programs" && <ProgramsTable items={filtered as Program[]} />}
          {entity === "professors" && <ProfessorsTable items={filtered as Professor[]} />}
          {entity === "labs" && <LabsTable items={filtered as Lab[]} />}
          {entity === "papers" && <PapersTable items={filtered as Paper[]} />}
          {entity === "timeline" && <TimelineTable items={filtered as TimelineTask[]} />}
          {entity === "sources" && <SourcesTable items={filtered as RadarSource[]} />}
        </CardContent>
      </Card>
    </div>
  );
}

function UniversitiesTable({ items }: { items: University[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Location</Th>
          <Th>Website</Th>
          <Th>Notes</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td className="font-medium">{item.name}</Td>
            <Td>{item.location ?? "-"}</Td>
            <Td>{item.website ? <a className="text-accent" href={item.website}>{item.website}</a> : "-"}</Td>
            <Td className="max-w-md text-muted-foreground">{item.notes ?? "-"}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function ProgramsTable({ items }: { items: Program[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Program</Th>
          <Th>Degree</Th>
          <Th>Language</Th>
          <Th>Deadline</Th>
          <Th>Requirements</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td className="font-medium">{item.program_name}</Td>
            <Td>{item.degree ?? "-"}</Td>
            <Td>{item.language ?? "-"}</Td>
            <Td>{formatDate(item.deadline)}</Td>
            <Td className="max-w-lg text-muted-foreground">{item.requirements ?? "-"}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function LabsTable({ items }: { items: Lab[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Lab</Th>
          <Th>Keywords</Th>
          <Th>Recent Papers</Th>
          <Th>Website</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td className="font-medium">{item.lab_name}</Td>
            <Td><Chips values={item.research_keywords} /></Td>
            <Td className="max-w-lg text-muted-foreground">{item.recent_papers.join("; ") || "-"}</Td>
            <Td>{item.website ? <a className="text-accent" href={item.website}>{item.website}</a> : "-"}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function ProfessorsTable({ items }: { items: Professor[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Title</Th>
          <Th>Keywords</Th>
          <Th>Website</Th>
          <Th>Notes</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td className="font-medium">{item.name}</Td>
            <Td>{item.title ?? "-"}</Td>
            <Td><Chips values={item.research_keywords} /></Td>
            <Td>{item.website ? <a className="text-accent" href={item.website}>{item.website}</a> : "-"}</Td>
            <Td className="max-w-md text-muted-foreground">{item.notes ?? "-"}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function PapersTable({ items }: { items: Paper[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Title</Th>
          <Th>Authors</Th>
          <Th>Venue</Th>
          <Th>Year</Th>
          <Th>Keywords</Th>
          <Th>AI</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td className="max-w-xl font-medium"><a className="text-accent" href={item.url}>{item.title}</a></Td>
            <Td className="max-w-sm text-muted-foreground">{item.authors.join(", ")}</Td>
            <Td>{item.venue ?? item.source ?? "-"}</Td>
            <Td>{item.year ?? "-"}</Td>
            <Td><Chips values={item.keywords} /></Td>
            <Td><Badge tone="muted">{item.ai_status}</Badge></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function TimelineTable({ items }: { items: TimelineTask[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Task</Th>
          <Th>Type</Th>
          <Th>Deadline</Th>
          <Th>Priority</Th>
          <Th>Status</Th>
          <Th>Notes</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td className="font-medium">{item.title}</Td>
            <Td>{item.task_type ?? "-"}</Td>
            <Td>{formatDate(item.deadline)}</Td>
            <Td><Badge tone={item.priority === "high" ? "warning" : "muted"}>{item.priority}</Badge></Td>
            <Td><Badge tone={item.status === "done" ? "success" : "default"}>{item.status}</Badge></Td>
            <Td className="max-w-md text-muted-foreground">{item.notes ?? "-"}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function SourcesTable({ items }: { items: RadarSource[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Type</Th>
          <Th>Query</Th>
          <Th>Keywords</Th>
          <Th>Enabled</Th>
          <Th>Last Run</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td className="font-medium">{item.name}</Td>
            <Td>{item.source_type}</Td>
            <Td className="max-w-sm">{item.query ?? item.url ?? "-"}</Td>
            <Td><Chips values={item.keywords} /></Td>
            <Td><Badge tone={item.enabled ? "success" : "muted"}>{item.enabled ? "enabled" : "off"}</Badge></Td>
            <Td>{formatDate(item.last_run_at)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function CreatePanel({ entity, onCreated }: { entity: EntityKey; onCreated: (item: Entity) => void }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(entity, form);
      const created = await apiCreate<Entity>(endpointByEntity[entity], payload);
      onCreated(created);
      setForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New {entity}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          {fieldsFor(entity).map((field) => (
            <label key={field.name} className={field.kind === "textarea" ? "md:col-span-2" : ""}>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">{field.label}</span>
              {field.kind === "textarea" ? (
                <Textarea value={form[field.name] ?? ""} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />
              ) : (
                <Input type={field.type ?? "text"} value={form[field.name] ?? ""} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} required={field.required} />
              )}
            </label>
          ))}
          {error && <div className="md:col-span-2 text-sm text-red-700">{error}</div>}
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function fieldsFor(entity: EntityKey): FieldDef[] {
  if (entity === "universities") {
    return [
      { name: "name", label: "Name", required: true },
      { name: "location", label: "Location" },
      { name: "website", label: "Website" },
      { name: "notes", label: "Notes", kind: "textarea" },
    ];
  }
  if (entity === "programs") {
    return [
      { name: "university_id", label: "University ID", required: true },
      { name: "program_name", label: "Program Name", required: true },
      { name: "degree", label: "Degree" },
      { name: "language", label: "Language" },
      { name: "deadline", label: "Deadline", type: "date" },
      { name: "requirements", label: "Requirements", kind: "textarea" },
    ];
  }
  if (entity === "labs") {
    return [
      { name: "university_id", label: "University ID", required: true },
      { name: "lab_name", label: "Lab Name", required: true },
      { name: "research_keywords", label: "Keywords, comma-separated" },
      { name: "website", label: "Website" },
      { name: "notes", label: "Notes", kind: "textarea" },
    ];
  }
  if (entity === "professors") {
    return [
      { name: "university_id", label: "University ID", required: true },
      { name: "name", label: "Name", required: true },
      { name: "title", label: "Title" },
      { name: "research_keywords", label: "Keywords, comma-separated" },
      { name: "website", label: "Website" },
      { name: "notes", label: "Notes", kind: "textarea" },
    ];
  }
  if (entity === "timeline") {
    return [
      { name: "title", label: "Title", required: true },
      { name: "deadline", label: "Deadline", type: "date" },
      { name: "priority", label: "Priority" },
      { name: "status", label: "Status" },
      { name: "task_type", label: "Type" },
      { name: "notes", label: "Notes", kind: "textarea" },
    ];
  }
  return [
    { name: "name", label: "Name", required: true },
    { name: "query", label: "arXiv Query" },
    { name: "keywords", label: "Keywords, comma-separated" },
  ];
}

function buildPayload(entity: EntityKey, form: Record<string, string>) {
  if (entity === "labs") {
    return { ...form, research_keywords: splitCsv(form.research_keywords ?? ""), recent_papers: [] };
  }
  if (entity === "professors") {
    return { ...form, research_keywords: splitCsv(form.research_keywords ?? "") };
  }
  if (entity === "sources") {
    return {
      name: form.name,
      source_type: "arxiv",
      query: form.query,
      keywords: splitCsv(form.keywords ?? ""),
      enabled: true,
    };
  }
  if (entity === "timeline") {
    return { ...form, priority: form.priority || "medium", status: form.status || "todo" };
  }
  return form;
}
