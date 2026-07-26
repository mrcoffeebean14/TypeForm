"""Form-level operations shared across routers: duplication and stats."""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Answer, Form, FormStatus, Question, QuestionOption, Response


def response_count(db: Session, form_id: str) -> int:
    return db.scalar(
        select(func.count(Response.id)).where(Response.form_id == form_id)
    ) or 0


def completed_count(db: Session, form_id: str) -> int:
    """Responses the respondent actually finished, matching the results router."""
    # ponytail: a second per-form count query, so the dashboard list is now 2N
    # queries. Fine for a personal workspace; fold both into one GROUP BY if it
    # ever lists hundreds of forms.
    return db.scalar(
        select(func.count(Response.id)).where(
            Response.form_id == form_id, Response.is_complete.is_(True)
        )
    ) or 0


def _remap_logic(logic: list, id_map: dict[str, str]) -> list:
    """Rewrite each rule's ``goto`` from a source question id to the clone's id.

    "end" and any target not in the map are left untouched.
    """
    remapped = []
    for rule in logic or []:
        new_rule = dict(rule)
        goto = new_rule.get("goto")
        if goto and goto != "end":
            new_rule["goto"] = id_map.get(goto, goto)
        remapped.append(new_rule)
    return remapped


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

    # Two passes: create every question first to build the old→new id map, then
    # rewrite branching targets so logic jumps point at the clone's questions
    # instead of the source's (which don't exist in the copy).
    id_map: dict[str, str] = {}
    cloned: list[tuple[Question, Question]] = []
    for q in source.questions:
        new_q = Question(
            form_id=clone.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            position=q.position,
            settings=dict(q.settings or {}),
            logic=[],  # filled in after the id map is complete
        )
        db.add(new_q)
        db.flush()
        id_map[q.id] = new_q.id
        cloned.append((q, new_q))
        for opt in q.options:
            db.add(
                QuestionOption(
                    question_id=new_q.id,
                    label=opt.label,
                    value=opt.value,
                    position=opt.position,
                )
            )

    for src_q, new_q in cloned:
        new_q.logic = _remap_logic(src_q.logic, id_map)

    db.flush()
    return clone
