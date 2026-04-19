# Task: assemble-bundle

## Purpose

Combines all course documents into a complete, distributable package for handoff, archiving, or offline use.
Produces a structured `course-bundle/` folder with an auto-generated index and all relevant artifacts.

## Inputs

- `docs/context.md` — course metadata and conventions
- `docs/outline.md` — course title and abstract (used in bundle index)
- `docs/didactics.md` — teaching approach and persona documentation
- `docs/agenda.md` — session schedule (if exists)
- `docs/sessions.md` — production status tracking
- `skeletons/` — session skeletons (optional, for documentation trail)
- `materials/` — full session materials (primary content)
- `docs/visuals.md` + `assets/` — visual style guide and assets (if exists)
- `docs/validation-report.md` — latest QA report (**required, must show PASS**)
- `notes/` — decision records and summaries (optional)

## Output

```
course-bundle/
├── bundle-index.md          ← auto-generated index
├── docs/context.md
├── docs/outline.md
├── docs/didactics.md
├── docs/agenda.md                ← if exists
├── docs/sessions.md
├── docs/validation-report.md
├── materials/
│   └── {n}-{type}.md
├── skeletons/               ← optional
│   └── {n}-{type}.md
├── assets/                  ← if exists
└── notes/                   ← if exists
```

## Steps

1. **Pre-flight check:** Confirm `docs/validation-report.md` exists and shows PASS.
   - If missing or FAIL: block bundling. State: "⛔ Please run `/validate-course` first and resolve all issues before creating the bundle."

2. Read course title and abstract from `docs/outline.md`.

3. Scan all source folders and collect files:
   - **Required:** `docs/context.md`, `docs/outline.md`, `docs/didactics.md`, `docs/sessions.md`, all files in `materials/`, `docs/validation-report.md`
   - **Conditional:** `docs/agenda.md` (if exists), `skeletons/` (if exists), `assets/` (if exists), `notes/` (if exists)

4. Generate `bundle-index.md`:

   ```markdown
   # Course Bundle: [Course Title]

   Generated: YYYY-MM-DD
   Course type: [type from docs/context.md]
   Validation: PASS (see docs/validation-report.md)

   ## Contents

   | File                    | Description                              |
   |-------------------------|------------------------------------------|
   | docs/context.md              | Course governance and conventions        |
   | docs/outline.md              | Title, audience, learning objectives     |
   | docs/didactics.md            | Teaching approach and instructor persona |
   | docs/agenda.md               | Session schedule and structure           |
   | docs/sessions.md             | Production status per session            |
   | docs/validation-report.md    | Quality validation results               |
   | materials/{n}-{type}.md | Session N: [title from docs/agenda.md]        |

   ## Quick Start

   - **Instructor handoff:** Start with `docs/outline.md` and `docs/didactics.md`
   - **LiaScript publish:** Use files in `materials/` directly
   - **Quality audit:** See `docs/validation-report.md`
   ```

5. Copy all collected files into `course-bundle/` preserving subfolder structure.

6. Confirm completion:
   > "Bundle created in `course-bundle/`. Contains [N] material files, [docs/agenda.md ✅ / no agenda], [assets/ ✅ / no assets]."
   > "Next step: `/agent development` → `/create-project` to publish the course."