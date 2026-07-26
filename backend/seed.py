"""Seed the database with a default creator and sample forms + responses.

Run from the backend/ directory:  python seed.py
Idempotent-ish: drops and recreates all tables each run so the demo is clean.
"""
from __future__ import annotations

import os
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import inspect, select

from app.database import Base, SessionLocal, engine
from app.models import (
    Answer,
    Creator,
    Form,
    FormStatus,
    Question,
    QuestionOption,
    QuestionType,
    Response,
)
from app.routers.forms import DEFAULT_THEME

THEME_INDIGO = {**DEFAULT_THEME, "primary": "#4F46E5", "answerColor": "#4F46E5"}
THEME_TEAL = {**DEFAULT_THEME, "primary": "#0D9488", "answerColor": "#0D9488", "background": "#F0FDFA"}


def _add_question(db, form, position, qtype, title, description="", required=True, settings=None, options=None, logic=None):
    q = Question(
        form_id=form.id,
        type=qtype,
        title=title,
        description=description or None,
        required=required,
        position=position,
        settings=settings or {},
        logic=logic or [],
    )
    db.add(q)
    db.flush()
    for i, opt in enumerate(options or []):
        db.add(QuestionOption(question_id=q.id, label=opt, value=opt, position=i))
    db.flush()
    return q


def _answer(question, value):
    return {"question_id": question.id, "value": value}


def _add_response(db, form, answers_map, complete=True, days_ago=0):
    started = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 20))
    resp = Response(
        form_id=form.id,
        is_complete=complete,
        started_at=started,
        submitted_at=started + timedelta(minutes=random.randint(1, 6)) if complete else None,
    )
    db.add(resp)
    db.flush()
    for a in answers_map:
        db.add(Answer(response_id=resp.id, question_id=a["question_id"], value=a["value"]))
    db.flush()


def seed() -> None:
    # Skip if the database already holds forms, unless SEED_FORCE=1. This keeps
    # real responses intact across redeploys while still seeding a fresh DB.
    force = os.environ.get("SEED_FORCE") == "1"
    if not force and inspect(engine).has_table("form"):
        db = SessionLocal()
        try:
            if db.scalar(select(Form).limit(1)):
                print("Database already seeded — skipping. Set SEED_FORCE=1 to reseed.")
                return
        finally:
            db.close()

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        creator = Creator(name="Alex Rivera", email="creator@typeclone.dev")
        db.add(creator)
        db.flush()

        # ---------------- Form 1: Customer Feedback ----------------
        f1 = Form(
            creator_id=creator.id,
            title="Customer Feedback Survey",
            description="Help us improve — it only takes a minute.",
            status=FormStatus.published,
            public_slug="customer-feedback-demo",
            theme=THEME_INDIGO,
            settings={
                "welcome": {"enabled": True, "title": "We'd love your feedback 💬", "buttonText": "Start"},
                "thankYou": {"title": "Thanks a bunch! 🎉", "description": "Your feedback helps us get better."},
            },
        )
        db.add(f1)
        db.flush()

        q1_name = _add_question(db, f1, 0, QuestionType.short_text, "What's your first name?", "So we can keep things personal.", required=True, settings={"placeholder": "Type your answer here..."})
        q1_role = _add_question(db, f1, 1, QuestionType.multiple_choice, "How would you describe your role?", required=True, options=["Student", "Engineer", "Designer", "Manager", "Other"])
        q1_rating = _add_question(db, f1, 2, QuestionType.rating, "How would you rate your overall experience?", required=True, settings={"rating_max": 5})
        q1_rec = _add_question(db, f1, 3, QuestionType.yes_no, "Would you recommend us to a friend?", required=True)
        q1_email = _add_question(db, f1, 4, QuestionType.email, "What's your email?", "Only if you'd like a follow-up.", required=False)
        q1_more = _add_question(db, f1, 5, QuestionType.long_text, "Anything else you'd like to share?", required=False, settings={"placeholder": "Your thoughts..."})

        names = ["Jordan", "Sam", "Priya", "Chen", "Maria", "Liam", "Noah", "Ava"]
        roles = ["Student", "Engineer", "Designer", "Manager", "Other"]
        comments = ["Loved it!", "Pretty good overall.", "Could be faster.", "Great support team.", ""]
        for i in range(8):
            _add_response(
                db, f1,
                [
                    _answer(q1_name, names[i]),
                    _answer(q1_role, random.choice(roles)),
                    _answer(q1_rating, random.randint(3, 5)),
                    _answer(q1_rec, random.random() > 0.25),
                    _answer(q1_email, f"{names[i].lower()}@example.com" if random.random() > 0.4 else ""),
                    _answer(q1_more, random.choice(comments)),
                ],
                complete=True, days_ago=random.randint(0, 14),
            )
        # Two partial responses (respondent dropped off) for completion-rate demo.
        for i in range(2):
            _add_response(db, f1, [_answer(q1_name, random.choice(names)), _answer(q1_role, random.choice(roles))], complete=False, days_ago=random.randint(0, 5))

        # ---------------- Form 2: Event Registration ----------------
        f2 = Form(
            creator_id=creator.id,
            title="Tech Conference 2026 Registration",
            description="Reserve your spot at the biggest dev event of the year.",
            status=FormStatus.published,
            public_slug="techconf-2026-demo",
            theme=THEME_TEAL,
            settings={
                "welcome": {"enabled": True, "title": "Register for TechConf 2026 🚀", "buttonText": "Register"},
                "thankYou": {"title": "You're all set! 🎟️", "description": "Check your inbox for a confirmation email."},
            },
        )
        db.add(f2)
        db.flush()

        q2_name = _add_question(db, f2, 0, QuestionType.short_text, "Full name", required=True)
        q2_email = _add_question(db, f2, 1, QuestionType.email, "Email address", "We'll send your ticket here.", required=True)
        q2_track = _add_question(db, f2, 2, QuestionType.dropdown, "Which track are you most interested in?", required=True, options=["Frontend", "Backend", "AI / ML", "DevOps", "Product"])
        q2_days = _add_question(db, f2, 3, QuestionType.multiple_choice, "Which days will you attend?", required=True, settings={"allow_multiple": True}, options=["Day 1 — Workshops", "Day 2 — Talks", "Day 3 — Hackathon"])
        q2_size = _add_question(db, f2, 4, QuestionType.number, "How many people in your team?", required=False, settings={"number_min": 1, "number_max": 50})
        q2_diet = _add_question(db, f2, 5, QuestionType.long_text, "Any dietary restrictions?", required=False)

        tracks = ["Frontend", "Backend", "AI / ML", "DevOps", "Product"]
        days_opts = ["Day 1 — Workshops", "Day 2 — Talks", "Day 3 — Hackathon"]
        for i in range(5):
            _add_response(
                db, f2,
                [
                    _answer(q2_name, f"{random.choice(names)} {random.choice(['Lee','Patel','Garcia','Kim'])}"),
                    _answer(q2_email, f"attendee{i}@example.com"),
                    _answer(q2_track, random.choice(tracks)),
                    _answer(q2_days, random.sample(days_opts, k=random.randint(1, 3))),
                    _answer(q2_size, random.randint(1, 8)),
                    _answer(q2_diet, random.choice(["None", "Vegetarian", "Gluten-free", ""])),
                ],
                complete=True, days_ago=random.randint(0, 10),
            )

        # ---------------- Form 3: Draft (product idea) ----------------
        f3 = Form(
            creator_id=creator.id,
            title="Product Idea Intake (Draft)",
            description="A work-in-progress form.",
            status=FormStatus.draft,
            theme=DEFAULT_THEME,
            settings={"thankYou": {"title": "Thank you!", "description": "We'll review your idea."}},
        )
        db.add(f3)
        db.flush()
        _add_question(db, f3, 0, QuestionType.short_text, "What's your idea in one line?", required=True)
        _add_question(db, f3, 1, QuestionType.rating, "How excited are you about it?", required=False, settings={"rating_max": 5})

        db.commit()
        print("Seed complete:")
        print("  Creator: creator@typeclone.dev")
        print("  Published: /f/customer-feedback-demo, /f/techconf-2026-demo")
        print("  Draft: Product Idea Intake")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
