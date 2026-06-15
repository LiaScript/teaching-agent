# Task: create-session

## Purpose

Creates a **skeleton** for one session (or unit/block/lesson — see `journal.md` → `## Course Context` for terminology) as a structured framework.
**The agent also adopts the instructor persona and style from `journal.md` → `## Didactics` into its own persona, so all content is written in this voice.**

## Inputs

- number: session number
- type: type of session (`lecture` or `exercise`)
- title (optional)
- Didactic concept from `journal.md` → `## Didactics`
- **Instructor persona from `journal.md` → `## Didactics` (mandatory handoff)**
- **Style & difficulty level from `journal.md` → `## Didactics` (mandatory handoff)**
- Terminology from `journal.md` → `## Course Context` (sessions-called, lectures-called)

## Output

- `journal.md` → `## Sessions`
- Structure based on `templates/session-skeleton.yaml`

## Steps

1. Collect session number, type, and optional title.
2. Read `journal.md` → `## Course Context` for terminology and conventions.
3. Adopt didactic concept and course type from Didactics.
4. **Agent adopts the instructor persona & style from Didactics into its own persona.**
   - From this step, the agent writes in the tone of the professor persona.
   - All agenda descriptions reflect this style.
5. Generate the basic structure for the session.
6. Fill out template `templates/session-skeleton.yaml`.
7. Save the skeleton as a `### {number}. {title}` subsection under `journal.md` → `## Sessions`.
   The `## Sessions` section has one canonical structure:
   1. An overview table directly below `## Sessions`
   2. One `### {number}. {title}` subsection per session below the overview table

   - Store the session type as its own line: `**Type:** {type}`.
   - Do not include the type in the subsection heading.
   - `**Summary:**` and `**Content:**` are free text blocks and may contain more than one paragraph.
   - `**Activities:**` must be a numbered list.
   - `**References:**` must be a numbered list.
8. Update the overview table inside `journal.md` → `## Sessions`:
   - If `journal.md` → `## Sessions` does not exist yet, create it with the overview table first:
     ```
     | # | Title | Type | Skeleton | Material | Done | Notes |
     |---|---|---|---|---|---|---|
     ```
   - Add a new row: `| {number} | {title} | {type} | ✅ | ❌ | ❌ | |`
   - If a row for this session already exists, update the Skeleton column to ✅.
   - Keep the overview table before all `### {number}. {title}` subsections.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
