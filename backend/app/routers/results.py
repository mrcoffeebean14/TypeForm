"""Results: response listing, individual view, summary stats, and CSV export."""
from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_form_or_404
from ..models import Answer, QuestionType, Response
from ..schemas import (
    AnswerOut,
    FormSummaryStats,
    QuestionStat,
    ResponseOut,
)

router = APIRouter(prefix="/api/forms", tags=["results"])


def _completed_responses(db: Session, form_id: str) -> list[Response]:
    return db.scalars(
        select(Response)
        .where(Response.form_id == form_id, Response.is_complete.is_(True))
        .order_by(Response.submitted_at.desc())
    ).all()


def _format_value(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value)


@router.get("/{form_id}/responses", response_model=list[ResponseOut])
def list_responses(form_id: str, db: Session = Depends(get_db)):
    get_form_or_404(form_id, db)
    responses = _completed_responses(db, form_id)
    return [
        ResponseOut(
            id=r.id,
            is_complete=r.is_complete,
            started_at=r.started_at,
            submitted_at=r.submitted_at,
            answers=[AnswerOut(question_id=a.question_id, value=a.value) for a in r.answers],
        )
        for r in responses
    ]


@router.get("/{form_id}/responses/export.csv")
def export_csv(form_id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    responses = _completed_responses(db, form_id)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    header = ["Response ID", "Submitted At"] + [q.title or f"Question {i+1}" for i, q in enumerate(form.questions)]
    writer.writerow(header)

    for r in responses:
        answers = {a.question_id: a.value for a in r.answers}
        row = [r.id, r.submitted_at.isoformat() if r.submitted_at else ""]
        for q in form.questions:
            row.append(_format_value(answers.get(q.id)))
        writer.writerow(row)

    buffer.seek(0)
    filename = f"{(form.title or 'form').replace(' ', '_')}_responses.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{form_id}/responses/{response_id}", response_model=ResponseOut)
def get_response(form_id: str, response_id: str, db: Session = Depends(get_db)):
    get_form_or_404(form_id, db)
    resp = db.get(Response, response_id)
    if not resp or resp.form_id != form_id:
        raise HTTPException(status_code=404, detail="Response not found.")
    return ResponseOut(
        id=resp.id,
        is_complete=resp.is_complete,
        started_at=resp.started_at,
        submitted_at=resp.submitted_at,
        answers=[AnswerOut(question_id=a.question_id, value=a.value) for a in resp.answers],
    )


@router.get("/{form_id}/summary", response_model=FormSummaryStats)
def form_summary(form_id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    all_responses = db.scalars(select(Response).where(Response.form_id == form_id)).all()
    total = len(all_responses)
    completed = [r for r in all_responses if r.is_complete]
    completed_count = len(completed)

    # Gather completed answers grouped by question.
    answers_by_q: dict[str, list] = {}
    for r in completed:
        for a in r.answers:
            answers_by_q.setdefault(a.question_id, []).append(a.value)

    stats: list[QuestionStat] = []
    for q in form.questions:
        values = [v for v in answers_by_q.get(q.id, []) if v not in (None, "", [])]
        breakdown: dict = {}

        if q.type in (QuestionType.multiple_choice, QuestionType.dropdown):
            counts = {opt.value: 0 for opt in q.options}
            for v in values:
                items = v if isinstance(v, list) else [v]
                for item in items:
                    counts[item] = counts.get(item, 0) + 1
            breakdown = counts
        elif q.type == QuestionType.yes_no:
            counts = {"Yes": 0, "No": 0}
            for v in values:
                counts["Yes" if v in (True, "yes", "true", 1) else "No"] += 1
            breakdown = counts
        elif q.type in (QuestionType.rating, QuestionType.number):
            nums = []
            for v in values:
                try:
                    nums.append(float(v))
                except (TypeError, ValueError):
                    pass
            if nums:
                breakdown = {"average": round(sum(nums) / len(nums), 2), "count": len(nums)}

        stats.append(
            QuestionStat(
                question_id=q.id,
                title=q.title,
                type=q.type,
                answered=len(values),
                breakdown=breakdown,
            )
        )

    completion_rate = round(completed_count / total, 3) if total else 0.0
    return FormSummaryStats(
        form_id=form_id,
        total_responses=total,
        completed_responses=completed_count,
        completion_rate=completion_rate,
        questions=stats,
    )
