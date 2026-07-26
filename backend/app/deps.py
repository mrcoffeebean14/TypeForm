"""Shared dependencies and helpers for routers."""
from __future__ import annotations

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import get_db
from .models import Creator, Form


def get_default_creator(db: Session = Depends(get_db)) -> Creator:
    """Return the single seeded creator (auth is simplified per the assignment)."""
    creator = db.scalars(select(Creator).order_by(Creator.created_at)).first()
    if not creator:
        raise HTTPException(status_code=500, detail="No creator seeded. Run seed.py.")
    return creator


def get_form_or_404(form_id: str, db: Session) -> Form:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found.")
    return form
