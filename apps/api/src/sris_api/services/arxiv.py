from dataclasses import dataclass
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from urllib.parse import quote_plus
from xml.etree import ElementTree as ET

import httpx


ARXIV_API_URL = "https://export.arxiv.org/api/query"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}


@dataclass(frozen=True)
class ParsedPaper:
    title: str
    authors: list[str]
    abstract: str
    url: str
    published_at: datetime | None
    raw_payload: dict[str, str | list[str] | None]


def build_arxiv_url(query: str, max_results: int = 25) -> str:
    search_query = quote_plus(query)
    return (
        f"{ARXIV_API_URL}?search_query=all:{search_query}"
        f"&start=0&max_results={max_results}&sortBy=submittedDate&sortOrder=descending"
    )


def normalize_text(value: str | None) -> str:
    return " ".join((value or "").split())


def parse_arxiv_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = parsedate_to_datetime(value)
        except (TypeError, ValueError):
            return None
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def parse_arxiv_feed(feed_xml: str) -> list[ParsedPaper]:
    root = ET.fromstring(feed_xml)
    papers: list[ParsedPaper] = []
    for entry in root.findall("atom:entry", ATOM_NS):
        title = normalize_text(entry.findtext("atom:title", namespaces=ATOM_NS))
        abstract = normalize_text(entry.findtext("atom:summary", namespaces=ATOM_NS))
        published_at = parse_arxiv_datetime(entry.findtext("atom:published", namespaces=ATOM_NS))
        authors = [
            normalize_text(author.findtext("atom:name", namespaces=ATOM_NS))
            for author in entry.findall("atom:author", ATOM_NS)
        ]
        authors = [author for author in authors if author]

        url = ""
        for link in entry.findall("atom:link", ATOM_NS):
            if link.attrib.get("rel") == "alternate":
                url = link.attrib.get("href", "")
                break
        if not url:
            url = normalize_text(entry.findtext("atom:id", namespaces=ATOM_NS))

        if title and url:
            papers.append(
                ParsedPaper(
                    title=title,
                    authors=authors,
                    abstract=abstract,
                    url=url,
                    published_at=published_at,
                    raw_payload={
                        "title": title,
                        "authors": authors,
                        "abstract": abstract,
                        "url": url,
                        "published_at": published_at.isoformat() if published_at else None,
                    },
                )
            )
    return papers


def keyword_matches(paper: ParsedPaper, keywords: list[str]) -> list[str]:
    haystack = f"{paper.title} {paper.abstract}".lower()
    return [keyword for keyword in keywords if keyword.lower() in haystack]


async def fetch_arxiv_feed(url: str) -> str:
    async with httpx.AsyncClient(timeout=20.0, headers={"User-Agent": "SRIS/0.1"}) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text
