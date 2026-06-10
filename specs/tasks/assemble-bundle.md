# Task: assemble-bundle

## Purpose

Combines the project memory, materials, and assets into a complete, distributable package for handoff, archiving, or offline use.
Produces a structured `course-bundle/` folder with an auto-generated index and all relevant artifacts.

## Inputs

- `project.md` — canonical project memory containing course context, outline, didactics, agenda, sessions, session status, validation, reviews, and notes backup
- `materials/` — full session materials (primary content)
- `assets/` — visual assets and prompts (if exists)
- `project.md` → `## Validation` → `### Latest Validation Summary` — latest QA gate (**required, must show `Mode: course` and `Result: PASS`**)

## Output

```
course-bundle/
├── bundle-index.md          ← auto-generated index
├── project.md               ← canonical project memory
├── materials/
│   └── {n}-{type}.md
└── assets/                  ← if exists
```

## Steps

1. **Pre-flight check:** Confirm `project.md` → `## Validation` → `### Latest Validation Summary` exists and shows `Mode: course` and `Result: PASS`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block bundling. State: "⛔ Please run `/validate-course` first and resolve all issues before creating the bundle."

2. Read course title and abstract from `project.md` → `## Outline`.

3. Scan all source folders and collect files:
   - **Required:** `project.md`, all files in `materials/`
   - **Conditional:** `assets/` (if exists)

4. Generate `bundle-index.md`:

   ```markdown
   # Course Bundle: [Course Title]

   Generated: YYYY-MM-DD
   Course type: [type from `project.md` → `## Course Context`]
   Validation: PASS (see `project.md` → `## Validation` → `### Latest Validation Summary`)

   ## Contents

   | File                    | Description                              |
   |-------------------------|------------------------------------------|
   | project.md              | Project memory: context, outline, didactics, agenda, skeletons, sessions, validation, reviews, notes |
   | materials/{n}-{type}.md | Session N: [title from `project.md` → `## Agenda`] |
   | assets/                 | Visual assets and prompts, if present |

   ## Quick Start

   - **Instructor handoff:** Start with `project.md` → `## Outline` and `project.md` → `## Didactics`
   - **LiaScript publish:** Use files in `materials/` directly
   - **Quality audit:** See `project.md` → `## Validation`
   ```

5. Copy `project.md`, `materials/`, and optional `assets/` into `course-bundle/` preserving subfolder structure.

6. Confirm completion:
   > "Bundle created in `course-bundle/`. Contains `project.md`, [N] material files, and [assets/ ✅ / no assets]."
   > "Next step: `/agent development` → `/create-project` to publish the course."
