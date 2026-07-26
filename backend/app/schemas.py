"""Pydantic v2 request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from .models import FormStatus, QuestionType


# --------------------------------------------------------------------------- #
# Question options
# --------------------------------------------------------------------------- #
class OptionIn(BaseModel):
    id: Optional[str] = None
    label: str
    value: Optional[str] = None


class OptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    label: str
    value: str
    position: int


# --------------------------------------------------------------------------- #
# Questions
# --------------------------------------------------------------------------- #
class QuestionBase(BaseModel):
    type: QuestionType
    title: str = ""
    description: Optional[str] = None
    required: bool = False
    settings: dict[str, Any] = Field(default_factory=dict)
    logic: list[dict[str, Any]] = Field(default_factory=list)


class QuestionCreate(QuestionBase):
    options: list[OptionIn] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    settings: Optional[dict[str, Any]] = None
    logic: Optional[list[dict[str, Any]]] = None
    options: Optional[list[OptionIn]] = None


class QuestionOut(QuestionBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    position: int
    options: list[OptionOut] = Field(default_factory=list)


# --------------------------------------------------------------------------- #
# Forms
# --------------------------------------------------------------------------- #
class FormCreate(BaseModel):
    title: str = "Untitled form"
    description: Optional[str] = None


class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme: Optional[dict[str, Any]] = None
    settings: Optional[dict[str, Any]] = None


class FormSummary(BaseModel):
    """Lightweight shape for the dashboard list."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    status: FormStatus
    public_slug: Optional[str] = None
    response_count: int = 0
    completed_count: int = 0
    question_count: int = 0
    created_at: datetime
    updated_at: datetime


class CreatorOut(BaseModel):
    """The signed-in account, for the dashboard header."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str


class FormOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    status: FormStatus
    public_slug: Optional[str] = None
    theme: dict[str, Any] = Field(default_factory=dict)
    settings: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
    questions: list[QuestionOut] = Field(default_factory=list)


class ReorderIn(BaseModel):
    question_ids: list[str]


# --------------------------------------------------------------------------- #
# Public respondent flow
# --------------------------------------------------------------------------- #
class PublicFormOut(BaseModel):
    """Form definition exposed to respondents (no internal fields)."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    theme: dict[str, Any] = Field(default_factory=dict)
    settings: dict[str, Any] = Field(default_factory=dict)
    questions: list[QuestionOut] = Field(default_factory=list)


class AnswerIn(BaseModel):
    question_id: str
    value: Any = None


class ResponseStartOut(BaseModel):
    response_id: str


class ResponsePatchIn(BaseModel):
    answers: list[AnswerIn] = Field(default_factory=list)


class ResponseCompleteIn(BaseModel):
    answers: list[AnswerIn] = Field(default_factory=list)


# --------------------------------------------------------------------------- #
# Results
# --------------------------------------------------------------------------- #
class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    question_id: str
    value: Any = None


class ResponseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    is_complete: bool
    started_at: datetime
    submitted_at: Optional[datetime] = None
    answers: list[AnswerOut] = Field(default_factory=list)


class QuestionStat(BaseModel):
    question_id: str
    title: str
    type: QuestionType
    answered: int
    # For choice/dropdown/yes_no: {option_value: count}. For rating/number: {"average": x}.
    breakdown: dict[str, Any] = Field(default_factory=dict)


class FormSummaryStats(BaseModel):
    form_id: str
    total_responses: int
    completed_responses: int
    completion_rate: float
    questions: list[QuestionStat] = Field(default_factory=list)


class MessageOut(BaseModel):
    detail: str
