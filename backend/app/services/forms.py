"""Form-level operations shared across routers: duplication and stats."""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Answer, Form, FormStatus, Question, QuestionOption, Response


def response_count(db: Session, form_id: str) -> int:
    return db.scalar(
        select(func.count(Response.id)).where(Response.form_id == form_id)
    ) or 0


def duplicate_form(db: Session, source: Form) -> Form:
    """Deep-copy a form with its questions and options as a fresh draft.

    Responses are intentionally not copied — a duplicate starts empty.
    """
    clone = Form(
        creator_id=source.creator_id,
        title=f"{source.title} (copy)",
        description=source.description,
        status=FormStatus.draft,
        public_slug=None,
        theme=dict(source.theme or {}),
        settings=dict(source.settings or {}),
    )
    db.add(clone)
    db.flush()  # assign clone.id

    for q in source.questions:
        new_q = Question(
            form_id=clone.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            position=q.position,
            settings=dict(q.settings or {}),
            logic=list(q.logic or []),
        )
        db.add(new_q)
        db.flush()
        for opt in q.options:
            db.add(
                QuestionOption(
                    question_id=new_q.id,
                    label=opt.label,
                    value=opt.value,
                    position=opt.position,
                )
            )
    db.flush()
    return clone
