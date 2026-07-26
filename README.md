# Typeclone — a Typeform clone

A functional clone of Typeform: build forms with a drag-and-drop builder, publish them via a shareable link, collect responses through the signature **one-question-at-a-time conversational flow**, and view results with summary stats — all in a clean, animated interface.

> Built for the SDE Fullstack assignment. Frontend in **Next.js (TypeScript)**, backend in **Python / FastAPI**, data in **SQLite**.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Database schema](#database-schema)
- [API overview](#api-overview)
- [Local setup](#local-setup)
- [Deployment](#deployment)
- [Assumptions & decisions](#assumptions--decisions)
- [Project structure](#project-structure)

---

## Features

**Form builder** (`/forms/[id]/edit`)
- Three-pane Typeform-style layout: sortable question list · live preview canvas · settings panel.
- Drag-and-drop reordering (`@dnd-kit`), inline title/description editing, debounced autosave with a save indicator.
- 8 question types: **short text, long text, multiple choice, dropdown, email, number, yes/no, rating**.
- Per-question settings: required toggle, help text, placeholder, rating scale, number min/max, allow-multiple, and per-question **logic jumps**.

**Form management** (`/`)
- Dashboard listing every form with status (draft/published) and response count.
- Create, rename, duplicate (deep copy), and delete — with modals and toasts.
- Publish / unpublish, generating a shareable public slug.

**Respondent flow** (`/f/[slug]`) — the heart of the experience
- Full-screen, one question at a time with smooth Framer Motion transitions.
- Keyboard navigation: `Enter`/↓ to advance, ↑ to go back, letter keys to pick choices, number keys for ratings.
- Progress bar, welcome screen, and thank-you screen.
- Client **and** server validation (required, email format, number range).
- No login required. Partial responses are tracked as the respondent advances.

**Results** (`/forms/[id]/results`)
- Summary tab: total/completed responses, **completion rate**, and per-question breakdowns (choice counts as bar charts, average for ratings/numbers).
- Responses tab: a table of submissions with a slide-in detail drawer for any single response.
- **CSV export** of all responses.

**Extras (bonus features implemented)**
- 🌙 Dark mode across the whole app.
- 🎨 Custom themes per form (accent, background, text colors + presets) applied to the respondent flow.
- 🔀 Logic jumps / conditional branching.
- 📊 Partial-response tracking & completion rate.
- Placeholders ("Coming soon") for Integrations/Connect, matching the assignment's mocked sections.

---

## Tech stack

| Layer      | Choice                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router) · TypeScript · Tailwind CSS                     |
| Animation  | Framer Motion                                                          |
| DnD        | @dnd-kit                                                                |
| Data layer | TanStack Query (server state) · lightweight local builder state        |
| Backend    | FastAPI · SQLAlchemy 2.0 · Pydantic v2                                  |
| Database   | SQLite                                                                  |

---

## Architecture overview

```
┌────────────────────────┐         HTTP / JSON          ┌──────────────────────────┐
│  Next.js frontend       │  ─────────────────────────▶ │  FastAPI backend          │
│                         │                              │                          │
│  • Dashboard            │   /api/forms, /api/questions │  routers/                │
│  • Builder (3-pane)     │   /api/public/... (no auth)  │   forms · questions      │
│  • Respondent flow      │   /api/forms/{id}/summary    │   public · results       │
│  • Results              │                              │  services/               │
│                         │                              │   validation · csv ·     │
│  lib/api.ts (typed)     │                              │   slug · forms           │
└────────────────────────┘                              │  models.py (SQLAlchemy)  │
                                                         └───────────┬──────────────┘
                                                                     │
                                                              ┌──────▼──────┐
                                                              │  SQLite db   │
                                                              └─────────────┘
```

**Key design idea — one renderer, two consumers.** A single set of question-field
components (`components/fields/QuestionField.tsx`) renders every question type. It
drives **both** the builder's live preview and the public respondent flow, so the
two can never visually diverge. Validation is likewise mirrored: the same rules
live in `backend/app/services/validation.py` (authoritative, on submit) and
`frontend/lib/validation.ts` (instant feedback).

**Backend layering.** Thin routers handle HTTP; reusable logic (validation, CSV
generation, slug creation, form duplication) lives in `services/`. Pydantic
schemas define the API contract; SQLAlchemy models define persistence.

---

## Database schema

Five related tables (plus a single default creator). Type-specific config with no
relational shape (rating scale, number bounds, branching rules) is stored as JSON;
everything with real relationships (options, answers) gets its own table.

```
creator ──1:N──▶ form ──1:N──▶ question ──1:N──▶ question_option
                   │
                   └──1:N──▶ response ──1:N──▶ answer ──N:1──▶ question
```

| Table              | Key columns                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| **creator**        | `id`, `name`, `email` — one seeded default creator (auth simplified)                                  |
| **form**           | `id`, `creator_id`, `title`, `description`, `status`(draft/published), `public_slug`, `theme`(JSON), `settings`(JSON), timestamps |
| **question**       | `id`, `form_id`, `type`(enum), `title`, `description`, `required`, `position`, `settings`(JSON), `logic`(JSON) |
| **question_option**| `id`, `question_id`, `label`, `value`, `position`                                                      |
| **response**       | `id`, `form_id`, `is_complete`, `started_at`, `submitted_at`, `metadata`(JSON)                          |
| **answer**         | `id`, `response_id`, `question_id`, `value`(JSON) — unique per (response, question)                     |

- `is_complete` distinguishes partial from submitted responses → completion rate.
- Foreign keys cascade on delete (deleting a form removes its questions, options, responses, answers).
- `public_slug` is unique and only set once published.

---

## API overview

Interactive docs available at `http://localhost:8000/docs` when the backend runs.

**Forms (creator)**
| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | `/api/forms` | List forms with status + response count |
| POST   | `/api/forms` | Create a blank draft |
| GET    | `/api/forms/{id}` | Full form with ordered questions + options |
| PATCH  | `/api/forms/{id}` | Rename / update theme / settings |
| DELETE | `/api/forms/{id}` | Delete form (cascades) |
| POST   | `/api/forms/{id}/duplicate` | Deep-copy as a new draft |
| POST   | `/api/forms/{id}/publish` · `/unpublish` | Toggle publish, manage slug |

**Questions**
| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST   | `/api/forms/{id}/questions` | Add a question |
| PATCH  | `/api/questions/{id}` | Edit (type, title, settings, options, logic) |
| DELETE | `/api/questions/{id}` | Delete + compact positions |
| PUT    | `/api/forms/{id}/questions/reorder` | Persist new order |

**Public respondent (no auth)**
| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | `/api/public/forms/{slug}` | Published form definition (404 if draft) |
| POST   | `/api/public/forms/{slug}/responses/start` | Begin a partial response |
| PATCH  | `/api/public/responses/{id}` | Save answers as the user advances |
| POST   | `/api/public/responses/{id}/complete` | Validate all answers + submit |

**Results**
| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | `/api/forms/{id}/responses` | List submissions |
| GET    | `/api/forms/{id}/responses/{rid}` | One full response |
| GET    | `/api/forms/{id}/summary` | Per-question stats + completion rate |
| GET    | `/api/forms/{id}/responses/export.csv` | CSV download |

---

## Local setup

**Prerequisites:** Node 18+ and Python 3.11+.

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python seed.py                 # creates app.db with sample forms + responses
uvicorn app.main:app --reload  # http://localhost:8000  (docs at /docs)
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev                    # http://localhost:3000
```

Open **http://localhost:3000**. Seeded published forms are live at:
- `/f/customer-feedback-demo`
- `/f/techconf-2026-demo`

---

## Deployment

Designed for **Vercel (frontend) + Render (backend)**.

**Backend on Render**
- The included `render.yaml` provisions a Python web service with a 1 GB persistent
  disk mounted at `/var/data`, so the SQLite file survives restarts.
- On first deploy the build runs `seed.py` (which no-ops if data already exists —
  set `SEED_FORCE=1` to reseed).
- Set `CORS_ORIGINS` and `PUBLIC_BASE_URL` to your Vercel URL.

**Frontend on Vercel**
- Import the repo, set the **root directory** to `frontend`.
- Add env var `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL.

---

## Assumptions & decisions

- **Auth is simplified** to a single seeded default creator (allowed by the brief).
  Every form belongs to that creator; there's no login.
- **SQLite** is used directly. In production it lives on Render's persistent disk;
  for a single-instance demo this is simpler and fully sufficient.
- **Options are relational** (`question_option` table) while type-specific config
  is JSON — a deliberate split between what has relationships and what doesn't.
- **File-upload and payment** question types are intentionally out of scope
  (placeholders), per the assignment's mocked sections.
- **Validation runs twice**: client-side for instant UX, server-side as the source
  of truth on submit.
- All code is original, written for this assignment.

---

## Project structure

```
backend/
  app/
    main.py            # FastAPI app + CORS + routers
    config.py          # env-driven settings
    database.py        # engine, session, Base
    models.py          # SQLAlchemy models (the schema)
    schemas.py         # Pydantic request/response models
    deps.py            # shared dependencies (default creator, 404 helpers)
    routers/           # forms · questions · public · results
    services/          # validation · csv · slug · form duplication
  seed.py              # sample data
  requirements.txt

frontend/
  app/
    page.tsx                    # dashboard
    forms/[id]/edit/page.tsx    # builder
    forms/[id]/results/page.tsx # results
    f/[slug]/page.tsx           # public respondent flow
  components/
    fields/QuestionField.tsx    # shared per-type renderer (builder + flow)
    builder/                    # question list, canvas, settings, theme, logic
    respondent/                 # FormRunner + screens (welcome/question/thankyou)
    results/                    # summary stats + responses table
    ui/                         # Button, Modal, Toggle, etc.
  lib/                          # api client, types, hooks, validation, logic
```
