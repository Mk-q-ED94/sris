from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from sris_api.models import Paper, PaperCandidate, RadarSource
from sris_api.schemas.common import IngestResult
from sris_api.services.arxiv import build_arxiv_url, fetch_arxiv_feed, keyword_matches, parse_arxiv_feed


async def ingest_arxiv_sources(session: AsyncSession) -> IngestResult:
    sources = (
        await session.scalars(
            select(RadarSource).where(RadarSource.enabled.is_(True), RadarSource.source_type == "arxiv")
        )
    ).all()

    created = 0
    skipped = 0
    for source in sources:
        url = source.url or build_arxiv_url(source.query or "machine learning")
        feed_xml = await fetch_arxiv_feed(url)
        papers = parse_arxiv_feed(feed_xml)

        for parsed in papers:
            existing_paper = await session.scalar(select(Paper.id).where(Paper.url == parsed.url))
            if existing_paper:
                skipped += 1
                continue

            matches = keyword_matches(parsed, source.keywords or [])
            if source.keywords and not matches:
                skipped += 1
                continue

            statement = (
                insert(PaperCandidate)
                .values(
                    source_id=source.id,
                    source=source.name,
                    title=parsed.title,
                    authors=parsed.authors,
                    abstract=parsed.abstract,
                    url=parsed.url,
                    published_at=parsed.published_at,
                    matched_keywords=matches,
                    raw_payload=parsed.raw_payload,
                    status="pending",
                )
                .on_conflict_do_nothing(index_elements=["url"])
            )
            result = await session.execute(statement)
            if result.rowcount:
                created += 1
            else:
                skipped += 1

        source.last_run_at = datetime.now(UTC)

    await session.commit()
    return IngestResult(sources_checked=len(sources), candidates_created=created, candidates_skipped=skipped)
