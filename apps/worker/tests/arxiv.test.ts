import { describe, expect, it } from "vitest";
import { buildArxivUrl, parseArxivFeed } from "../src/ingest/arxiv";
import { keywordMatches } from "../src/ingest/shared";

const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2501.00001v1</id>
    <title>Efficient LLM Inference at Scale</title>
    <summary>We propose a new scheduler for distributed inference.</summary>
    <published>2025-01-01T00:00:00Z</published>
    <author><name>Alice Researcher</name></author>
    <author><name>Bob Engineer</name></author>
    <link href="http://arxiv.org/pdf/2501.00001v1" rel="related" />
    <link href="http://arxiv.org/abs/2501.00001v1" rel="alternate" />
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2501.00002v1</id>
    <title>Another Paper</title>
    <summary>About something else entirely.</summary>
    <published>2025-01-02T00:00:00Z</published>
    <author><name>Carol Author</name></author>
    <link href="http://arxiv.org/abs/2501.00002v1" rel="alternate" />
  </entry>
</feed>`;

describe("buildArxivUrl", () => {
  it("encodes the query string", () => {
    const url = buildArxivUrl("machine learning systems");
    expect(url).toContain("search_query=all:machine%20learning%20systems");
    expect(url).toContain("sortBy=submittedDate");
  });
});

describe("parseArxivFeed", () => {
  it("extracts entries with title, authors, url and timestamp", () => {
    const papers = parseArxivFeed(SAMPLE_FEED);
    expect(papers).toHaveLength(2);
    expect(papers[0]).toMatchObject({
      title: "Efficient LLM Inference at Scale",
      authors: ["Alice Researcher", "Bob Engineer"],
      url: "http://arxiv.org/abs/2501.00001v1",
      published_at: "2025-01-01T00:00:00Z",
    });
    expect(papers[0]?.raw_payload).toMatchObject({ url: "http://arxiv.org/abs/2501.00001v1" });
  });

  it("returns empty array when no entries present", () => {
    expect(parseArxivFeed("<feed></feed>")).toEqual([]);
  });

  it("drops entries missing title or url", () => {
    const xml = "<feed><entry><title></title></entry></feed>";
    expect(parseArxivFeed(xml)).toEqual([]);
  });
});

describe("keywordMatches", () => {
  it("returns matched keywords case-insensitively", () => {
    const paper = { title: "Distributed Training", abstract: "GPU clusters and inference" };
    expect(keywordMatches(paper, ["GPU", "distributed", "absent"])).toEqual(["GPU", "distributed"]);
  });

  it("returns empty array when no keywords match", () => {
    expect(keywordMatches({ title: "x", abstract: "y" }, ["nope"])).toEqual([]);
  });
});
