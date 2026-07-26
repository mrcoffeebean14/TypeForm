"""FastAPI application entrypoint."""
from __future__ import annotations

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .deps import get_default_creator
from .models import Creator
from .routers import forms, public, questions, results
from .schemas import CreatorOut

app = FastAPI(
    title="Typeform Clone API",
    version="1.0.0",
    description="Backend for a Typeform-style form builder and respondent flow.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/me", response_model=CreatorOut, tags=["account"])
def me(creator: Creator = Depends(get_default_creator)) -> Creator:
    return creator


app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(results.router)
