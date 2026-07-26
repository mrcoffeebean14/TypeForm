"""Human-friendly unique slug generation for public form links."""
from __future__ import annotations

import re
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Form


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:40] or "form"


def generate_unique_slug(db: Session, title: str) -> str:
    """Return a URL-safe slug derived from the title with a short random suffix.

    The random suffix keeps public URLs unguessable and avoids collisions
    between forms that share a title.
    """
    base = _slugify(title)
    while True:
        candidate = f"{base}-{secrets.token_hex(3)}"
        exists = db.scalar(select(Form).where(Form.public_slug == candidate))
        if not exists:
            return candidate
