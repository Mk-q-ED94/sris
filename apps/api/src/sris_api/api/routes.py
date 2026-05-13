from datetime import UTC, date, datetime, timedelta
from typing import Any, TypeVar

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import Select, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from sris_api.core.auth import CurrentUser, get_current_user, verify_cron_secret
from sris_api.db.session import get_session
from sris_api.models import Lab, Paper, PaperCandidate, Professor, Program, RadarSource, TimelineTask, University
from sris_api.schemas.common import (
    DashboardSummary,
    IngestResult,
    LabCreate,
    LabRead,
    PaperCreate,
    PaperRead,
    PaperCandidateRead,
    ProfessorCreate,
    ProfessorRead,
    ProgramCreate,
    ProgramRead,
    RadarSourceCreate,
    RadarSourceRead,
    TimelineTaskCreate,
    TimelineTaskRead,
    UniversityCreate,
    UniversityRead,
)
from sris_api.services.ingest import ingest_arxiv_sources

router = APIRouter()
ModelT = TypeVar("ModelT")


def _like(value: str) -> str:
    return f"%{value.strip()}%"


async def _get_or_404(session: AsyncSession, model: type[ModelT], item_id: str) -> ModelT:
    item = await session.get(model, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


async def _list(session: AsyncSession, statement: Select[tuple[ModelT]]) -> list[ModelT]:
    return list((await session.scalars(statement)).all())


async def _create(session: AsyncSession, model: type[ModelT], payload: Any) -> ModelT:
    item = model(**payload.model_dump())
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


async def _patch(session: AsyncSession, model: type[ModelT], item_id: str, payload: Any) -> ModelT:
    item = await _get_or_404(session, model, item_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    await session.commit()
    await session.refresh(item)
    return item


async def _delete(session: AsyncSession, model: type[ModelT], item_id: str) -> Response:
    item = await _get_or_404(session, model, item_id)
    await session.delete(item)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "sris-api"}


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard(
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> DashboardSummary:
    today = date.today()
    horizon = today + timedelta(days=90)
    counts = {
        "universities": await session.scalar(select(func.count()).select_from(University)) or 0,
        "programs": await session.scalar(select(func.count()).select_from(Program)) or 0,
        "professors": await session.scalar(select(func.count()).select_from(Professor)) or 0,
        "labs": await session.scalar(select(func.count()).select_from(Lab)) or 0,
        "papers": await session.scalar(select(func.count()).select_from(Paper)) or 0,
        "pending_candidates": await session.scalar(
            select(func.count()).select_from(PaperCandidate).where(PaperCandidate.status == "pending")
        )
        or 0,
        "timeline_tasks": await session.scalar(select(func.count()).select_from(TimelineTask)) or 0,
    }

    recent_papers = await _list(session, select(Paper).order_by(desc(Paper.created_at)).limit(8))
    pending_candidates = await _list(
        session,
        select(PaperCandidate)
        .where(PaperCandidate.status == "pending")
        .order_by(desc(PaperCandidate.published_at), desc(PaperCandidate.created_at))
        .limit(8),
    )
    upcoming_tasks = await _list(
        session,
        select(TimelineTask)
        .where(TimelineTask.deadline >= today, TimelineTask.deadline <= horizon, TimelineTask.status != "done")
        .order_by(TimelineTask.deadline.asc(), TimelineTask.priority.asc())
        .limit(10),
    )
    recent_updates = [
        {"label": "Pending review", "value": str(counts["pending_candidates"])},
        {"label": "Tracked papers", "value": str(counts["papers"])},
        {"label": "Upcoming tasks", "value": str(len(upcoming_tasks))},
    ]
    return DashboardSummary(
        counts=counts,
        recent_papers=recent_papers,
        pending_candidates=pending_candidates,
        upcoming_tasks=upcoming_tasks,
        recent_updates=recent_updates,
    )


@router.get("/universities", response_model=list[UniversityRead])
async def list_universities(
    q: str | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[University]:
    statement = select(University).order_by(University.name)
    if q:
        statement = statement.where(University.name.ilike(_like(q)))
    return await _list(session, statement)


@router.post("/universities", response_model=UniversityRead, status_code=status.HTTP_201_CREATED)
async def create_university(
    payload: UniversityCreate,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> University:
    return await _create(session, University, payload)


@router.patch("/universities/{item_id}", response_model=UniversityRead)
async def update_university(
    item_id: str,
    payload: UniversityCreate,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> University:
    return await _patch(session, University, item_id, payload)


@router.delete("/universities/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_university(
    item_id: str,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> Response:
    return await _delete(session, University, item_id)


@router.get("/programs", response_model=list[ProgramRead])
async def list_programs(
    university_id: str | None = None,
    deadline_before: date | None = None,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[Program]:
    statement = select(Program).order_by(Program.deadline.asc().nulls_last(), Program.program_name)
    if university_id:
        statement = statement.where(Program.university_id == university_id)
    if deadline_before:
        statement = statement.where(Program.deadline <= deadline_before)
    return await _list(session, statement)


@router.post("/programs", response_model=ProgramRead, status_code=status.HTTP_201_CREATED)
async def create_program(payload: ProgramCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Program:
    return await _create(session, Program, payload)


@router.patch("/programs/{item_id}", response_model=ProgramRead)
async def update_program(item_id: str, payload: ProgramCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Program:
    return await _patch(session, Program, item_id, payload)


@router.delete("/programs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(item_id: str, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Response:
    return await _delete(session, Program, item_id)


@router.get("/professors", response_model=list[ProfessorRead])
async def list_professors(
    university_id: str | None = None,
    keyword: str | None = None,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[Professor]:
    statement = select(Professor).order_by(Professor.name)
    if university_id:
        statement = statement.where(Professor.university_id == university_id)
    if keyword:
        statement = statement.where(Professor.research_keywords.contains([keyword]))
    return await _list(session, statement)


@router.post("/professors", response_model=ProfessorRead, status_code=status.HTTP_201_CREATED)
async def create_professor(payload: ProfessorCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Professor:
    return await _create(session, Professor, payload)


@router.patch("/professors/{item_id}", response_model=ProfessorRead)
async def update_professor(item_id: str, payload: ProfessorCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Professor:
    return await _patch(session, Professor, item_id, payload)


@router.delete("/professors/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_professor(item_id: str, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Response:
    return await _delete(session, Professor, item_id)


@router.get("/labs", response_model=list[LabRead])
async def list_labs(
    university_id: str | None = None,
    keyword: str | None = None,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[Lab]:
    statement = select(Lab).order_by(Lab.lab_name)
    if university_id:
        statement = statement.where(Lab.university_id == university_id)
    if keyword:
        statement = statement.where(Lab.research_keywords.contains([keyword]))
    return await _list(session, statement)


@router.post("/labs", response_model=LabRead, status_code=status.HTTP_201_CREATED)
async def create_lab(payload: LabCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Lab:
    return await _create(session, Lab, payload)


@router.patch("/labs/{item_id}", response_model=LabRead)
async def update_lab(item_id: str, payload: LabCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Lab:
    return await _patch(session, Lab, item_id, payload)


@router.delete("/labs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lab(item_id: str, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Response:
    return await _delete(session, Lab, item_id)


@router.get("/papers", response_model=list[PaperRead])
async def list_papers(
    year: int | None = None,
    venue: str | None = None,
    keyword: str | None = None,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[Paper]:
    statement = select(Paper).order_by(desc(Paper.published_at).nulls_last(), desc(Paper.created_at))
    if year:
        statement = statement.where(Paper.year == year)
    if venue:
        statement = statement.where(Paper.venue.ilike(_like(venue)))
    if keyword:
        statement = statement.where(Paper.keywords.contains([keyword]))
    return await _list(session, statement)


@router.post("/papers", response_model=PaperRead, status_code=status.HTTP_201_CREATED)
async def create_paper(payload: PaperCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Paper:
    return await _create(session, Paper, payload)


@router.patch("/papers/{item_id}", response_model=PaperRead)
async def update_paper(item_id: str, payload: PaperCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Paper:
    return await _patch(session, Paper, item_id, payload)


@router.delete("/papers/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paper(item_id: str, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Response:
    return await _delete(session, Paper, item_id)


@router.get("/timeline", response_model=list[TimelineTaskRead])
async def list_timeline_tasks(
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = None,
    before: date | None = None,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[TimelineTask]:
    statement = select(TimelineTask).order_by(TimelineTask.deadline.asc().nulls_last(), TimelineTask.priority)
    if status_filter:
        statement = statement.where(TimelineTask.status == status_filter)
    if priority:
        statement = statement.where(TimelineTask.priority == priority)
    if before:
        statement = statement.where(TimelineTask.deadline <= before)
    return await _list(session, statement)


@router.post("/timeline", response_model=TimelineTaskRead, status_code=status.HTTP_201_CREATED)
async def create_timeline_task(payload: TimelineTaskCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> TimelineTask:
    return await _create(session, TimelineTask, payload)


@router.patch("/timeline/{item_id}", response_model=TimelineTaskRead)
async def update_timeline_task(item_id: str, payload: TimelineTaskCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> TimelineTask:
    return await _patch(session, TimelineTask, item_id, payload)


@router.delete("/timeline/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_timeline_task(item_id: str, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Response:
    return await _delete(session, TimelineTask, item_id)


@router.get("/radar-sources", response_model=list[RadarSourceRead])
async def list_radar_sources(
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[RadarSource]:
    return await _list(session, select(RadarSource).order_by(RadarSource.name))


@router.post("/radar-sources", response_model=RadarSourceRead, status_code=status.HTTP_201_CREATED)
async def create_radar_source(payload: RadarSourceCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> RadarSource:
    return await _create(session, RadarSource, payload)


@router.patch("/radar-sources/{item_id}", response_model=RadarSourceRead)
async def update_radar_source(item_id: str, payload: RadarSourceCreate, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> RadarSource:
    return await _patch(session, RadarSource, item_id, payload)


@router.delete("/radar-sources/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_radar_source(item_id: str, session: AsyncSession = Depends(get_session), _: CurrentUser = Depends(get_current_user)) -> Response:
    return await _delete(session, RadarSource, item_id)


@router.get("/review/papers", response_model=list[PaperCandidateRead])
async def list_paper_candidates(
    status_filter: str = Query(default="pending", alias="status"),
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> list[PaperCandidate]:
    return await _list(
        session,
        select(PaperCandidate)
        .where(PaperCandidate.status == status_filter)
        .order_by(desc(PaperCandidate.published_at).nulls_last(), desc(PaperCandidate.created_at)),
    )


@router.post("/review/papers/{item_id}/accept", response_model=PaperRead)
async def accept_paper_candidate(
    item_id: str,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> Paper:
    candidate = await _get_or_404(session, PaperCandidate, item_id)
    if candidate.status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Candidate already reviewed")

    year = candidate.published_at.year if candidate.published_at else None
    paper = Paper(
        title=candidate.title,
        authors=candidate.authors,
        venue="arXiv",
        year=year,
        url=candidate.url,
        source=candidate.source,
        published_at=candidate.published_at.date() if candidate.published_at else None,
        keywords=candidate.matched_keywords,
        abstract=candidate.abstract,
        ai_status="pending",
    )
    candidate.status = "accepted"
    candidate.reviewed_at = datetime.now(UTC)
    session.add(paper)
    await session.commit()
    await session.refresh(paper)
    return paper


@router.post("/review/papers/{item_id}/ignore", response_model=PaperCandidateRead)
async def ignore_paper_candidate(
    item_id: str,
    reason: str | None = None,
    session: AsyncSession = Depends(get_session),
    _: CurrentUser = Depends(get_current_user),
) -> PaperCandidate:
    candidate = await _get_or_404(session, PaperCandidate, item_id)
    if candidate.status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Candidate already reviewed")
    candidate.status = "ignored"
    candidate.ignore_reason = reason
    candidate.reviewed_at = datetime.now(UTC)
    await session.commit()
    await session.refresh(candidate)
    return candidate


@router.post(
    "/ingest/arxiv/run",
    response_model=IngestResult,
    dependencies=[Depends(verify_cron_secret)],
)
async def run_arxiv_ingest(session: AsyncSession = Depends(get_session)) -> IngestResult:
    return await ingest_arxiv_sources(session)
