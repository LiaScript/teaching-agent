# Task: analyze-existing

## Purpose

Analyzes an existing course project to identify which documentation is present and which is missing.
Used as the **second step after `/init-course`** when the course type is `improve-existing`.

Offers two paths for each missing core document:
- **Auto-generate** — agent reads existing materials and reverse-engineers a draft
- **Interactive creation** — agent guides the instructor through the relevant creation task

## Inputs

- `docs/context.md` (created by `/init-course`, mandatory)
- Existing project files in the project root: `docs/outline.md`, `docs/didactics.md`, `docs/agenda.md`, `docs/visuals.md`
- Existing folders: `skeletons/`, `materials/`

## Output

- `docs-status.md` — status overview with recommended actions
- Optionally: auto-generated drafts for missing core docs (marked as draft)

## Steps

1. Load `docs/context.md` for course type, terminology, and conventions.

2. Scan the project root and relevant folders:

   | Document       | Required                     |
   | -------------- | ---------------------------- |
   | `docs/outline.md`   | always                       |
   | `docs/didactics.md` | always                       |
   | `docs/agenda.md`    | if `docs/context.md` agenda = yes |
   | `docs/visuals.md`   | optional                     |
   | `skeletons/`   | if sessions expected         |
   | `materials/`   | if sessions expected         |

3. Display a **Course Doc Status** table:
   - ✅ exists
   - ⚠️ exists but likely incomplete (e.g., missing sections)
   - ❌ missing

4. For each **missing** core document (`docs/outline.md`, `docs/didactics.md`), 🎛️ ask with structured question (single choice):
   - **Auto-generate** — I will read your existing materials and create a draft
   - **Interactive creation** — I will guide you through the appropriate creation command
   - **Skip** — proceed without this document

5. If **auto-generate** is chosen:
   - Read all available files in `skeletons/` and `materials/`
   - Extract: title, target audience, topics, recurring structure, learning objectives
   - Generate a draft and save it (e.g., `docs/outline.md`)
   - Add a draft marker at the top: `> **Draft (auto-generated from existing materials)** — please review and update`

6. If **interactive creation** is chosen, run the relevant task:
   - `docs/outline.md` → `/create-outline`
   - `docs/didactics.md` → `/create-didactics`
   - `docs/agenda.md` → `/create-agenda`

6b. Reconstruct or create `docs/sessions.md` from the existing file system:
   - Scan `skeletons/` and `materials/` for files matching `{number}-{type}.md`
   - For each session found: set Skeleton ✅ if file exists in `skeletons/`, Material ✅ if file exists in `materials/`, Done stays ❌ (cannot be inferred — instructor must confirm)
   - Save as `docs/sessions.md` in the project root

7. After all missing docs are handled, list **improvement opportunities** in the existing content:
   - Sessions without materials
   - Materials without skeletons
   - Inconsistent terminology or persona style
   - Missing references or learning objectives
   - Language/tone inconsistencies vs. `docs/context.md` conventions

8. Suggest a prioritized action list and the recommended next step (usually `/coauthor-materials`).

9. Save the full status overview as `docs-status.md`.
