"""Creator-facing form CRUD, duplication, and publish/unpublish."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_default_creator, get_form_or_404
from ..models import Creator, Form, FormStatus
from ..schemas import (
    CreatorOut,
    FormCreate,
    FormOut,
    FormSummary,
    FormUpdate,
    MessageOut,
)
from ..services.forms import completed_count, duplicate_form, response_count
from ..services.slug import generate_unique_slug

router = APIRouter(prefix="/api/forms", tags=["forms"])

DEFAULT_THEME = {
    "primary": "#0445AF",
    "background": "#FFFFFF",
    "questionColor": "#1D1D1D",
    "answerColor": "#0445AF",
    "font": "Inter",
    "mode": "light",
}

DEFAULT_SETTINGS = {
    "welcome": {"enabled": False, "title": "", "buttonText": "Start"},
    "thankYou": {"title": "Thank you!", "description": "Your response has been recorded."},
}


@router.get("", response_model=list[FormSummary])
def list_forms(db: Session = Depends(get_db), creator: Creator = Depends(get_default_creator)):
    forms = db.scalars(
        select(Form).where(Form.creator_id == creator.id).order_by(Form.updated_at.desc())
    ).all()
    return [
        FormSummary(
            id=f.id,
            title=f.title,
            description=f.description,
            status=f.status,
            public_slug=f.public_slug,
            response_count=response_count(db, f.id),
            completed_count=completed_count(db, f.id),
            question_count=len(f.questions),
            created_at=f.created_at,
            updated_at=f.updated_at,
        )
        for f in forms
    ]


@router.post("", response_model=FormOut, status_code=201)
def create_form(
    payload: FormCreate,
    db: Session = Depends(get_db),
    creator: Creator = Depends(get_default_creator),
):
    form = Form(
        creator_id=creator.id,
        title=payload.title,
        description=payload.description,
        theme=dict(DEFAULT_THEME),
        settings=dict(DEFAULT_SETTINGS),
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("/{form_id}", response_model=FormOut)
def get_form(form_id: str, db: Session = Depends(get_db)):
    return get_form_or_404(form_id, db)


@router.patch("/{form_id}", response_model=FormOut)
def update_form(form_id: str, payload: FormUpdate, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"] is not None:
        form.title = data["title"]
    if "description" in data:
        form.description = data["description"]
    if "theme" in data and data["theme"] is not None:
        form.theme = {**(form.theme or {}), **data["theme"]}
    if "settings" in data and data["settings"] is not None:
        form.settings = {**(form.settings or {}), **data["settings"]}
    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}", response_model=MessageOut)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    db.delete(form)
    db.commit()
    return MessageOut(detail="Form deleted.")


@router.post("/{form_id}/duplicate", response_model=FormOut, status_code=201)
def duplicate(form_id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    clone = duplicate_form(db, form)
    db.commit()
    db.refresh(clone)
    return clone


@router.post("/{form_id}/publish", response_model=FormOut)
def publish_form(form_id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    if not form.questions:
        raise HTTPException(status_code=400, detail="Add at least one question before publishing.")
    if not form.public_slug:
        form.public_slug = generate_unique_slug(db, form.title)
    form.status = FormStatus.published
    db.commit()
    db.refresh(form)
    return form


@router.post("/{form_id}/unpublish", response_model=FormOut)
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    form = get_form_or_404(form_id, db)
    form.status = FormStatus.draft
    db.commit()
    db.refresh(form)
    return form
