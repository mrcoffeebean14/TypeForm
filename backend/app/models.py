"""SQLAlchemy ORM models.

Schema overview
---------------
creator 1─* form 1─* question 1─* question_option
form 1─* response 1─* answer *─1 question

A single default creator owns every form (auth is simplified per the assignment).
Question options live in their own table so choice/dropdown relationships are
first-class rather than buried in JSON. Type-specific config (rating scale,
number bounds, branching logic) that has no relational shape is kept as JSON.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from .database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class FormStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class QuestionType(str, enum.Enum):
    short_text = "short_text"
    long_text = "long_text"
    multiple_choice = "multiple_choice"
    dropdown = "dropdown"
    email = "email"
    number = "number"
    yes_no = "yes_no"
    rating = "rating"


class Creator(Base):
    __tablename__ = "creator"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    forms: Mapped[list["Form"]] = relationship(
        back_populates="creator", cascade="all, delete-orphan"
    )


class Form(Base):
    __tablename__ = "form"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    creator_id: Mapped[str] = mapped_column(
        ForeignKey("creator.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Untitled form")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[FormStatus] = mapped_column(
        Enum(FormStatus), nullable=False, default=FormStatus.draft
    )
    public_slug: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)

    # Presentation theme: {"primary": "#...", "background": "#...", "font": "...", "mode": "light"}
    theme: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # Form-level settings: welcome/thank-you screens, etc.
    settings: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    creator: Mapped["Creator"] = relationship(back_populates="forms")
    questions: Mapped[list["Question"]] = relationship(
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.position",
    )
    responses: Mapped[list["Response"]] = relationship(
        back_populates="form", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "question"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    form_id: Mapped[str] = mapped_column(
        ForeignKey("form.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False, default="")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Type-specific config: {rating_max, number_min, number_max, allow_multiple, placeholder}
    settings: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # Ordered branching rules evaluated after the question is answered.
    logic: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    form: Mapped["Form"] = relationship(back_populates="questions")
    options: Mapped[list["QuestionOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.position",
    )


class QuestionOption(Base):
    __tablename__ = "question_option"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    question_id: Mapped[str] = mapped_column(
        ForeignKey("question.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(500), nullable=False)
    value: Mapped[str] = mapped_column(String(500), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    question: Mapped["Question"] = relationship(back_populates="options")


class Response(Base):
    __tablename__ = "response"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    form_id: Mapped[str] = mapped_column(
        ForeignKey("form.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Partial-response tracking: False until the respondent finishes and submits.
    is_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    meta: Mapped[dict] = mapped_column("metadata", JSON, nullable=False, default=dict)

    form: Mapped["Form"] = relationship(back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        back_populates="response", cascade="all, delete-orphan"
    )


class Answer(Base):
    __tablename__ = "answer"
    __table_args__ = (UniqueConstraint("response_id", "question_id", name="uq_answer_response_question"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    response_id: Mapped[str] = mapped_column(
        ForeignKey("response.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[str] = mapped_column(
        ForeignKey("question.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Typed per question: string / number / list[str] / bool, stored as JSON.
    value: Mapped[object] = mapped_column(JSON, nullable=True)

    response: Mapped["Response"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship()
