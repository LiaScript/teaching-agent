# Session Types

> Read this before generating, validating, or referencing a session's `type`. Referenced by `:create-didactics`, `:create-session`, `:promote-session`, `:create-agenda`, `:quick-fix`, `:review-as-persona`, and `:validate-course`.

A session's `type` is **not** a fixed global enum (`lecture` / `exercise`). It is a per-course vocabulary, defined once in `journal.md` → `## Didactics` → `__Session Types:__` by `:create-didactics`, and referenced by slug everywhere else.

This is a different layer than `journal.md` → `## Course Context` → `__Terminology:__` (`sessions-called`): Terminology names the *unit* (e.g. "what do we call one session — a lesson, a block?"). Session Types names the *format that unit takes* (e.g. "is this particular lesson a lecture, an exercise, a self-check?"). A course can have one `sessions-called` term and several Session Types.

It is also a different, orthogonal layer from **Session Methods** (`data/didactic-methods.md`): Type is the *format* a session takes, Method is the *didactic technique* used to structure and validate its content (e.g. Gagné's Nine Events, Cognitive Load Pacing). A session declares both independently — don't confuse a `**Type:**` line with a `**Method:**` line on the same skeleton.

## Definition format

Each Session Type has four parts — a display name, a stable slug, a one-line criterion, and a short required-elements checklist:

```
* __Session Types:__
  1. __Vortrag__ (slug: `vortrag`) — Von Lehrenden geführte Wissensvermittlung, keine bewertete Aufgabe.
     Required: Inhaltsteil mit durchgehendem roten Faden; keine bewerteten Aktivitäten.
  2. __Übung__ (slug: `uebung`) — Angeleitete Praxis.
     Required: ≥1 konkrete Aufgabe bei den Aktivitäten, Musterlösung oder Feedback-Hinweis.
```

- **Display name** — free text, in the course's language/terminology.
- **Slug** — short, stable, filename-safe (lowercase, no spaces). It appears only in technical details, never in commands or links. Computed once when the type is defined; do not rename later without checking existing file references (same rule as the session-folder slug in `data/file-structure-modes.md`).
- **Criterion** — one sentence: what makes a session this type, not another.
- **Required** (required elements) — 2–3 concrete, checkable items. The key stays English in every course language (`Required:`); older journals use `Erforderlich:` for the same key — read it as `Required:` and write `Required:` when the entry is updated. This is what turns the type from a label into something `:validate-course` can actually check.

## Default suggestions by course type

`:create-didactics` proposes these as a starting point, not a fixed default — the instructor confirms or edits them, and must additionally name one planned session and its type as a grounding check (prevents rubber-stamping an unreflected default).

| Course type | Suggested Session Types |
|---|---|
| lecture-series | **Vortrag** (`lecture`) — von Lehrenden geführt, keine bewertete Aufgabe · **Übung** (`exercise`) — angeleitete Praxis mit Aufgabe + Lösung/Feedback |
| self-paced | **Lernmodul** (`module`) — Selbststudieninhalt · **Selbstcheck** (`selfcheck`) — Lernkontrolle/Quiz |
| workshop | **Input** (`input`) — kurzer Theorieblock · **Praxisphase** (`activity`) — Gruppenarbeit/Hands-on mit Ergebnis |
| single-lesson | Usually **one** type only (named after what the lesson mainly is); skip the discussion step unless the instructor wants to split the lesson into sub-types |

The display names are chosen so they never equal the default unit words of `tasks/init-course.md` (session, unit, block, lesson — translated); still check them against the course's real terminology. The slugs in this table are English placeholders: derive the real slug from the display name in the course language (e.g. `vortrag`, `uebung`), as `templates/course-didactics.yaml` requires.

## Resolving a session's type

Session commands identify a session by its number alone (`:promote-session 3`, `:validate-course 3`, `:review-as-persona Finn 3`); the type is never a command parameter, so it can neither be mistyped nor contradict the plan. Resolve it in this order:

1. The session's subsection in `journal.md` → `## Sessions` (`**Type:**` in its technical details), once a skeleton exists.
2. Otherwise the session's row in the technical table of `journal.md` → `## Agenda`.
3. Otherwise (only `:create-session` without an agenda): if the course has exactly one Session Type, use it; else ask the instructor once, offering the display names from `## Didactics` → `__Session Types:__`.

- If subsection and agenda disagree, say so and ask which is right before continuing — never pick one silently.
- An extra type argument (older typed commands, a `type` parameter in older `agent:` links) is accepted only if it matches the resolved type; otherwise stop and ask.

## Objectives and duration of a session

Read a session's learning objectives and declared duration from its row in `journal.md` → `## Agenda`. Without an agenda (agenda: no, or not created yet): objectives from `## Outline` → Learning Objectives (`data-key="learning-goals"`) and its Session Overview (for a single lesson: all objectives); duration = the length of **one** unit from `## Course Context` → Units (count × length; for a single lesson: the lesson length), minus setup and wrap-up when the instructor named them — never the course's total time (`## Outline` → Time Commitment). Never leave a check without objectives because the agenda is missing.

## Where the slug is used

- `journal.md` → `## Sessions` overview table `Type` column, and `**Type:** {slug}` inside each session subsection
- `journal.md` → `## Agenda` sessions table `Type` column
- `:create-session`, `:promote-session`, `:build-session`, `:validate-course`, `:validate-syntax`, `:quick-fix`, `:review-as-persona`, `:create-image` — resolve the type from the session number (see "Resolving a session's type"); it is one of the slugs defined here, never a hardcoded `lecture`/`exercise`
- Material/asset paths never contain the type: they use the title slug (`materials/{number}-{slug}/`, see `data/file-structure-modes.md`)

## Enforcement loop

A Session Type's `Required` checklist is not documentation-only — it closes a loop across three tasks:

1. **Generation** — `:create-session` and `:promote-session` fill Activities/Content so the required elements are present for the chosen type.
2. **Validation** — `:validate-course` (session and course mode) checks the material against its type's required elements as part of the Content checks, and records the result in `templates/session-validation.yaml` → `type-consistency`.
3. **Course-level check** — `checklists/course-quality-checklist.md` confirms every session's content matches its declared type's required elements before publishing.

If a session's type has no required elements defined, `:validate-course` flags this as a gap in the Session Types definition rather than silently skipping the check.
