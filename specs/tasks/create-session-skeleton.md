# Task: create-session

## Purpose

Creates a **skeleton** for one session (or unit/block/lesson — see `journal.md` → `## Course Context` for terminology) as a structured framework.
**The agent also adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona, so all content is written in this voice.**

## Inputs

- number: session number
- type: session type slug, one of `journal.md` → `## Didactics` → `__Session Types:__` (see `data/session-types.md`)
- title (optional)
- Didactic concept from `journal.md` → `## Didactics`
- **Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (mandatory handoff)**
- Style, difficulty level, and didactic concept from `journal.md` → `## Didactics`
- Terminology from `journal.md` → `## Course Context` (sessions-called, lectures-called)
- Default Session Method from `journal.md` → `## Didactics` → `__Default Session Method:__`, and the matching session's Method column in `journal.md` → `## Agenda` if an agenda exists (see `data/didactic-methods.md`)

## Output

- `journal.md` → `## Sessions`
- Structure based on `templates/session-skeleton.yaml`

## Steps

1. Collect session number, type, and optional title.
2. Read `journal.md` → `## Course Context` for terminology and conventions.
3. Adopt didactic concept and course type from Didactics.
   - Look up the given type in `journal.md` → `## Didactics` → `__Session Types:__`. If it doesn't match a defined slug, stop and ask — do not invent a type on the fly.
   - Note its `Erforderlich` (required elements) checklist; Activities/Content in step 5 must satisfy it.
   - Resolve the session's Method: if `journal.md` → `## Agenda` exists and has a Method column, use this session's value from there; otherwise use `journal.md` → `## Didactics` → `__Default Session Method:__`. If that default is `none`, skip Method entirely — no line is stored, no checklist applies. Note the method's `Erforderlich` checklist from `data/didactic-methods.md`, independently of the Type checklist above.
4. **Agent adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona.**
   - From this step, the agent writes in the tone of the Coauthor role.
   - If the Coauthor role is missing or inactive, fall back to `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
   - All agenda descriptions reflect this style.
5. Generate the basic structure for the session.
6. Fill out template `templates/session-skeleton.yaml`.
7. Save the skeleton as a `### {number}. {title}` subsection under `journal.md` → `## Sessions`.
   The `## Sessions` section has one canonical structure:
   1. An overview table directly below `## Sessions`
   2. One `### {number}. {title}` subsection per session below the overview table

   - Directly below the heading, write the action line from the template (`<!-- class="journal-actions" -->` plus the promote/build links, see `data/agent-links.md`).
   - Store the session type as its own line: `**Type:** {type}`.
   - Do not include the type in the subsection heading.
   - If a Method was resolved (step 3): store it as its own line directly after `**Type:**`: `**Method:** {method}`. Omit this line entirely if the resolved default is `none`.
   - `**Summary:**` and `**Content:**` are free text blocks and may contain more than one paragraph.
   - `**Activities:**` must be a numbered list.
   - `**References:**` must be a numbered list.
   - End the subsection with an empty `#### Images` block (placeholder note); it is later filled by `:create-image` and rendered by `:generate-image`.
8. Update the overview table inside `journal.md` → `## Sessions`:
   - If `journal.md` → `## Sessions` does not exist yet, create it with the overview table first. Include a `Method` column only if `journal.md` → `## Didactics` → `__Default Session Method:__` is not `none`:
     ```
     | # | Title | Type | Method | Skeleton | Material | Done | Notes |
     |---|---|---|---|---|---|---|---|
     ```
   - Add a new row: `| {number} | {title} | {type} | {method} | ✅ | ❌ | ❌ | |` (omit the Method column entirely, matching the table header, if no method is in use)
   - If a row for this session already exists, update the Skeleton column to ✅.
   - Keep the overview table before all `### {number}. {title}` subsections.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
