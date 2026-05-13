from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sris_api.db.base import Base, TimestampMixin, UUIDMixin


class University(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "universities"

    name: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    location: Mapped[str | None] = mapped_column(String(180))
    website: Mapped[str | None] = mapped_column(String(500))
    tuition: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    notes: Mapped[str | None] = mapped_column(Text)

    programs: Mapped[list["Program"]] = relationship(back_populates="university")
    professors: Mapped[list["Professor"]] = relationship(back_populates="university")
    labs: Mapped[list["Lab"]] = relationship(back_populates="university")


class Program(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "programs"

    university_id: Mapped[str] = mapped_column(ForeignKey("universities.id", ondelete="CASCADE"))
    program_name: Mapped[str] = mapped_column(String(220), index=True)
    degree: Mapped[str | None] = mapped_column(String(80))
    language: Mapped[str | None] = mapped_column(String(80))
    deadline: Mapped[date | None] = mapped_column(Date)
    requirements: Mapped[str | None] = mapped_column(Text)
    scholarship: Mapped[str | None] = mapped_column(Text)
    tuition: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    website: Mapped[str | None] = mapped_column(String(500))
    notes: Mapped[str | None] = mapped_column(Text)

    university: Mapped[University] = relationship(back_populates="programs")


class Professor(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "professors"

    university_id: Mapped[str] = mapped_column(ForeignKey("universities.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(180), index=True)
    title: Mapped[str | None] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255))
    website: Mapped[str | None] = mapped_column(String(500))
    research_keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    notes: Mapped[str | None] = mapped_column(Text)

    university: Mapped[University] = relationship(back_populates="professors")
    labs: Mapped[list["Lab"]] = relationship(back_populates="professor")


class Lab(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "labs"

    university_id: Mapped[str] = mapped_column(ForeignKey("universities.id", ondelete="CASCADE"))
    professor_id: Mapped[str | None] = mapped_column(ForeignKey("professors.id", ondelete="SET NULL"))
    lab_name: Mapped[str] = mapped_column(String(220), index=True)
    research_keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    website: Mapped[str | None] = mapped_column(String(500))
    recent_papers: Mapped[list[str]] = mapped_column(JSONB, default=list)
    notes: Mapped[str | None] = mapped_column(Text)

    university: Mapped[University] = relationship(back_populates="labs")
    professor: Mapped[Professor | None] = relationship(back_populates="labs")


class Paper(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "papers"

    title: Mapped[str] = mapped_column(String(600), index=True)
    authors: Mapped[list[str]] = mapped_column(JSONB, default=list)
    venue: Mapped[str | None] = mapped_column(String(160), index=True)
    year: Mapped[int | None] = mapped_column(Integer, index=True)
    url: Mapped[str] = mapped_column(String(700), unique=True)
    source: Mapped[str | None] = mapped_column(String(120), index=True)
    published_at: Mapped[date | None] = mapped_column(Date)
    keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    abstract: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)
    ai_status: Mapped[str] = mapped_column(String(40), default="pending")


class RadarSource(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "radar_sources"

    name: Mapped[str] = mapped_column(String(180), unique=True)
    source_type: Mapped[str] = mapped_column(String(50), default="arxiv")
    url: Mapped[str | None] = mapped_column(String(700))
    query: Mapped[str | None] = mapped_column(String(700))
    keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class PaperCandidate(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "paper_candidates"
    __table_args__ = (UniqueConstraint("url", name="uq_paper_candidates_url"),)

    source_id: Mapped[str | None] = mapped_column(ForeignKey("radar_sources.id", ondelete="SET NULL"))
    source: Mapped[str | None] = mapped_column(String(120), index=True)
    title: Mapped[str] = mapped_column(String(600), index=True)
    authors: Mapped[list[str]] = mapped_column(JSONB, default=list)
    abstract: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str] = mapped_column(String(700))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    matched_keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    raw_payload: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    ignore_reason: Mapped[str | None] = mapped_column(Text)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class TimelineTask(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "timeline_tasks"

    title: Mapped[str] = mapped_column(String(240), index=True)
    deadline: Mapped[date | None] = mapped_column(Date, index=True)
    priority: Mapped[str] = mapped_column(String(40), default="medium", index=True)
    status: Mapped[str] = mapped_column(String(40), default="todo", index=True)
    task_type: Mapped[str | None] = mapped_column(String(80), index=True)
    related_university_id: Mapped[str | None] = mapped_column(
        ForeignKey("universities.id", ondelete="SET NULL")
    )
    related_program_id: Mapped[str | None] = mapped_column(ForeignKey("programs.id", ondelete="SET NULL"))
    notes: Mapped[str | None] = mapped_column(Text)
