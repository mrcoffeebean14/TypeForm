"""Question CRUD and reordering within a form."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_form_or_404
from ..models import Question, QuestionOption
from ..schemas import MessageOut, QuestionCreate, QuestionOut, QuestionUpdate, ReorderIn

router = APIRouter(prefix="/api", tags=["questions"])


def _sync_options(db: Session, question: Question, options: list) -> None:
    """Replace a question's options with the provided list, preserving order."""
    for opt in list(question.options):
        db.delete(opt)
    question.options = []
    db.flush()
    for i, opt in enumerate(options):
        value = opt.value if opt.value else opt.label
        db.add(QuestionOption(question_id=question.id, label=opt.label, value=value, position=i))
    db.flush()


def _get_question_or_404(question_id: str, db: Session) -> Question:
    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found.")
    return q


@router.post("/forms/{form_id}/questions", response_model=QuestionOut, status_code=201)
def add_question(form_id: str, payload: QuestionCreate, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    # coalesce guarantees a non-null int (-1 when the form is empty), so add
    # directly — do NOT use `next_pos or -1`, which would treat a real max of 0
    # as falsy and collide the new question onto position 0.
    next_pos = db.scalar(
        select(func.coalesce(func.max(Question.position), -1)).where(Question.form_id == form.id)
    )
    question = Question(
        form_id=form.id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        required=payload.required,
        settings=payload.settings,
        logic=payload.logic,
        position=next_pos + 1,
    )
    db.add(question)
    db.flush()
    if payload.options:
        _sync_options(db, question, payload.options)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/questions/{question_id}", response_model=QuestionOut)
def update_question(question_id: str, payload: QuestionUpdate, db: Session = Depends(get_db)):
    question = _get_question_or_404(question_id, db)
    data = payload.model_dump(exclude_unset=True)
    for field in ("type", "title", "description", "required", "settings", "logic"):
        if field in data and data[field] is not None:
            setattr(question, field, data[field])
    if "options" in data and data["options"] is not None:
        _sync_options(db, question, payload.options)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/questions/{question_id}", response_model=MessageOut)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    question = _get_question_or_404(question_id, db)
    form_id = question.form_id
    db.delete(question)
    db.flush()
    # Compact positions so ordering stays contiguous.
    remaining = db.scalars(
        select(Question).where(Question.form_id == form_id).order_by(Question.position)
    ).all()
    for i, q in enumerate(remaining):
        q.position = i
    db.commit()
    return MessageOut(detail="Question deleted.")


@router.put("/forms/{form_id}/questions/reorder", response_model=list[QuestionOut])
def reorder_questions(form_id: str, payload: ReorderIn, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    by_id = {q.id: q for q in form.questions}
    if set(payload.question_ids) != set(by_id.keys()):
        raise HTTPException(status_code=400, detail="Question id set does not match the form.")
    for i, qid in enumerate(payload.question_ids):
        by_id[qid].position = i
    db.commit()
    db.refresh(form)
    return sorted(form.questions, key=lambda q: q.position)
