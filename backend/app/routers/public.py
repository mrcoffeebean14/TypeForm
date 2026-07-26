"""Public respondent flow — no authentication required.

Lifecycle: start (create partial response) -> patch (save answers as the
respondent advances) -> complete (validate everything and mark submitted).
"""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Answer, Form, FormStatus, Question, Response
from ..schemas import (
    MessageOut,
    PublicFormOut,
    ResponseCompleteIn,
    ResponsePatchIn,
    ResponseStartOut,
)
from ..services.logic import reachable_question_ids
from ..services.validation import ValidationError, validate_answer

router = APIRouter(prefix="/api/public", tags=["public"])


def _get_published_form(slug: str, db: Session) -> Form:
    form = db.scalar(
        select(Form).where(Form.public_slug == slug, Form.status == FormStatus.published)
    )
    if not form:
        raise HTTPException(status_code=404, detail="Form not found or not published.")
    return form


def _get_open_response(response_id: str, db: Session) -> Response:
    resp = db.get(Response, response_id)
    if not resp:
        raise HTTPException(status_code=404, detail="Response not found.")
    if resp.is_complete:
        raise HTTPException(status_code=409, detail="Response already submitted.")
    return resp


def _upsert_answers(db: Session, resp: Response, incoming: list, questions: dict) -> None:
    """Insert or update answers atomically; skips answers for unknown questions.

    Uses a single INSERT .. ON CONFLICT DO UPDATE rather than read-then-write.
    A read-modify-write here races: two requests for the same response (the
    last question's partial save and the final submit overlap) can both observe
    "no answer yet" and both INSERT, violating uq_answer_response_question and
    failing the request with a 500.
    """
    rows = [
        {
            "id": uuid4().hex,
            "response_id": resp.id,
            "question_id": item.question_id,
            "value": item.value,
        }
        for item in incoming
        if item.question_id in questions
    ]
    if not rows:
        return

    stmt = sqlite_insert(Answer).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=[Answer.response_id, Answer.question_id],
        set_={"value": stmt.excluded.value},
    )
    db.execute(stmt)
    # The ORM collection is now stale; drop it so callers reload DB truth.
    db.expire(resp, ["answers"])


@router.get("/forms/{slug}", response_model=PublicFormOut)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    return _get_published_form(slug, db)


@router.post("/forms/{slug}/responses/start", response_model=ResponseStartOut, status_code=201)
def start_response(slug: str, db: Session = Depends(get_db)):
    form = _get_published_form(slug, db)
    resp = Response(form_id=form.id, is_complete=False)
    db.add(resp)
    db.commit()
    db.refresh(resp)
    return ResponseStartOut(response_id=resp.id)


@router.patch("/responses/{response_id}", response_model=MessageOut)
def patch_response(response_id: str, payload: ResponsePatchIn, db: Session = Depends(get_db)):
    """Persist partial answers as the respondent moves through the form.

    Partial saves are lenient (no required checks) so progress is never lost;
    full validation happens at completion.
    """
    resp = _get_open_response(response_id, db)
    questions = {q.id: q for q in resp.form.questions}
    _upsert_answers(db, resp, payload.answers, questions)
    db.commit()
    return MessageOut(detail="Saved.")


@router.post("/responses/{response_id}/complete", response_model=MessageOut)
def complete_response(response_id: str, payload: ResponseCompleteIn, db: Session = Depends(get_db)):
    resp = _get_open_response(response_id, db)
    questions = {q.id: q for q in resp.form.questions}
    _upsert_answers(db, resp, payload.answers, questions)
    db.flush()

    # Server-side validation across all answers for the form's questions.
    # Only questions on the respondent's actual branch path are considered:
    # a `required` question the branching logic jumped over must not block the
    # submission. Answers that *were* provided are still format-validated.
    answers_by_q = {a.question_id: a for a in resp.answers}
    answer_values = {qid: a.value for qid, a in answers_by_q.items()}
    reachable = reachable_question_ids(resp.form.questions, answer_values)
    for question in resp.form.questions:
        answer = answers_by_q.get(question.id)
        value = answer.value if answer else None
        if question.id not in reachable and value is None:
            continue  # skipped by branching — nothing to validate
        try:
            normalized = validate_answer(question, value)
        except ValidationError as exc:
            raise HTTPException(
                status_code=422,
                detail={"question_id": exc.question_id, "message": exc.message},
            )
        if answer:
            answer.value = normalized

    resp.is_complete = True
    resp.submitted_at = datetime.now(timezone.utc)
    db.commit()
    return MessageOut(detail="Response submitted.")
