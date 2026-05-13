from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UniversityBase(BaseModel):
    name: str
    location: str | None = None
    website: str | None = None
    tuition: Decimal | None = None
    notes: str | None = None


class UniversityCreate(UniversityBase):
    pass


class UniversityRead(UniversityBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class ProgramBase(BaseModel):
    university_id: str
    program_name: str
    degree: str | None = None
    language: str | None = None
    deadline: date | None = None
    requirements: str | None = None
    scholarship: str | None = None
    tuition: Decimal | None = None
    website: str | None = None
    notes: str | None = None


class ProgramCreate(ProgramBase):
    pass


class ProgramRead(ProgramBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class ProfessorBase(BaseModel):
    university_id: str
    name: str
    title: str | None = None
    email: str | None = None
    website: str | None = None
    research_keywords: list[str] = Field(default_factory=list)
    notes: str | None = None


class ProfessorCreate(ProfessorBase):
    pass


class ProfessorRead(ProfessorBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class LabBase(BaseModel):
    university_id: str
    professor_id: str | None = None
    lab_name: str
    research_keywords: list[str] = Field(default_factory=list)
    website: str | None = None
    recent_papers: list[str] = Field(default_factory=list)
    notes: str | None = None


class LabCreate(LabBase):
    pass


class LabRead(LabBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class PaperBase(BaseModel):
    title: str
    authors: list[str] = Field(default_factory=list)
    venue: str | None = None
    year: int | None = None
    url: str
    source: str | None = None
    published_at: date | None = None
    keywords: list[str] = Field(default_factory=list)
    abstract: str | None = None
    summary: str | None = None
    ai_status: str = "pending"


class PaperCreate(PaperBase):
    pass


class PaperRead(PaperBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class PaperCandidateRead(ORMModel):
    id: str
    source_id: str | None
    source: str | None
    title: str
    authors: list[str]
    abstract: str | None
    url: str
    published_at: datetime | None
    matched_keywords: list[str]
    raw_payload: dict[str, Any]
    status: str
    ignore_reason: str | None
    reviewed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class RadarSourceBase(BaseModel):
    name: str
    source_type: str = "arxiv"
    url: str | None = None
    query: str | None = None
    keywords: list[str] = Field(default_factory=list)
    enabled: bool = True


class RadarSourceCreate(RadarSourceBase):
    pass


class RadarSourceRead(RadarSourceBase, ORMModel):
    id: str
    last_run_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TimelineTaskBase(BaseModel):
    title: str
    deadline: date | None = None
    priority: str = "medium"
    status: str = "todo"
    task_type: str | None = None
    related_university_id: str | None = None
    related_program_id: str | None = None
    notes: str | None = None


class TimelineTaskCreate(TimelineTaskBase):
    pass


class TimelineTaskRead(TimelineTaskBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class DashboardSummary(BaseModel):
    counts: dict[str, int]
    recent_papers: list[PaperRead]
    pending_candidates: list[PaperCandidateRead]
    upcoming_tasks: list[TimelineTaskRead]
    recent_updates: list[dict[str, str]]


class IngestResult(BaseModel):
    sources_checked: int
    candidates_created: int
    candidates_skipped: int
