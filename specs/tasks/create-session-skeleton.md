# Task: create-session

## Purpose

Creates a **skeleton** for one session (or unit/block/lesson — see `journal.md` → `## Course Context` for terminology) as a structured framework.
**The agent also adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona, so all content is written in this voice.**

## Inputs

- number: session number
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- title (optional)
- Didactic concept from `journal.md` → `## Didactics`
- **Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (mandatory handoff)**
- Style, difficulty level, and didactic concept from `journal.md` → `## Didactics`
- Terminology from `journal.md` → `## Course Context` (sessions-called)
- Objectives and duration of this session — `data/session-types.md` → "Objectives and duration of a session" (the agenda row; without an agenda `## Outline` → Learning Objectives and Session Overview, which also suggests the title)
- Default Session Method from `journal.md` → `## Didactics` → `__Default Session Method:__`, and the matching session's Method column in `journal.md` → `## Agenda` if an agenda exists (see `data/didactic-methods.md`)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Sessions`
- Structure based on `templates/session-skeleton.yaml`

## Steps

1. Collect session number and optional title. Resolve the session's type from the number (`data/session-types.md` → "Resolving a session's type"); without an agenda this is the one place that may ask for it.
2. Read `journal.md` → `## Course Context` for terminology and conventions.
3. Adopt didactic concept and course type from Didactics.
   - Look up the resolved type in `journal.md` → `## Didactics` → `__Session Types:__`. If it doesn't match a defined slug, stop and ask — do not invent a type on the fly.
   - Note its `Required` checklist; Activities/Content in step 5 must satisfy it.
   - Resolve the session's Method: if `journal.md` → `## Agenda` exists and has a Method column, use this session's value from there; otherwise use `journal.md` → `## Didactics` → `__Default Session Method:__`. If that default is `none`, skip Method entirely — no line is stored, no checklist applies. Note the method's `Required` checklist from `data/didactic-methods.md`, independently of the Type checklist above.
4. **Agent adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona.**
   - From this step, the agent writes in the tone of the Coauthor role.
   - If the Coauthor role is missing or inactive, fall back to `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
   - All texts of this skeleton reflect this style.
5. Generate the basic structure for the session.
6. Fill out template `templates/session-skeleton.yaml`.
7. **Before saving** (after the checks "Type and Method first" and "Self-check before saving" below, which run before this form): show the new unit as it will be written — every visible block of the template (status line, kind line, summary with every paragraph, content, activities, references); for changes only inside the `<details>` technical block one line in the save summary is enough with "Save" / "Change something" — also in the terminal. Then save the skeleton as a `### {number}. {title}` subsection under `journal.md` → `## Sessions`.
   The `## Sessions` section has one canonical structure:
   1. The overview directly below `## Sessions` — status list, then the technical table in `<details>` (`templates/session-skeleton.yaml` → `section_layout.overview`)
   2. One `### {number}. {title}` subsection per session below the overview

   - Directly below the heading, write the action line from the template: exactly **one** main action (`coauthor-materials?number={n}`) — see `data/agent-links.md`.
   - Then the technical `<details>` block with `**Type:** {type}`, `**Method:** {method}` and the further commands, followed by the visible line with kind and checklist (display names in the course language) — the order of all blocks is `templates/session-skeleton.yaml` → `section_layout.entry_order`.
   - Visible bold labels are **only in the course language**, no abbreviations (no "UDL"). Each carries its English key invisibly in the attribute comment directly above it (`<!-- data-key="summary" -->`); tasks find a label by that key (older journals: by the English label).
   - Do not include the type in the subsection heading.
   - If a Method was resolved (step 3): `**Method:** {method}` directly after `**Type:**` inside the `<details>` block. Omit this line entirely if the resolved default is `none`.
   - Summary and content (`data-key` `summary`, `content`) are free text blocks and may contain more than one paragraph.
   - `**Activities:**` must be a numbered list.
   - `**References:**` must be a numbered list.
   - Do **not** create an `#### Images` block — the save of `:coauthor-materials` (image spots) or `:create-image` creates it with the first entry (an empty `####` heading becomes an empty slide).
   - Do not create a `**Decisions:**` list yet — `:coauthor-materials` adds it with the first decision.
   - **Type and Method first:** before the save form, check the activities and the self-check against the `Required` lists of the session's Type and Method (step 3) — e.g. a second form of answering when the method asks for one. Name every gap in the sketch and offer the fix **in the same form** (adapted sketch · keep as planned with a reason); never leave it for the check to find after the material is written, where it would become a change of task type.
   - **Self-check before saving** (adapt, then name every change in one line; ask before dropping or replacing anything the instructor asked for): the skeleton describes the material that will really be produced, not a wish list; new terms stay within the scope set in `## Didactics` (terms of later sessions are not used yet); every matching or assignment task has exactly one correct answer per item; every task, including extension tasks, can be solved with the material the learners get (text, pictures); every support need named in `## Course Context` or `## Outline` (language support, learning support) has a concrete measure in this unit; the self-check shows what *each* learner can do (also in pair or group work); a closing proof or reward cannot be reached without doing the tasks, or the skeleton says how the instructor checks it; every term learners must tell apart in a task or self-check has its own picture and sentence in the content; domain terms are factually precise (no everyday term a later unit contradicts); carry-over says *when* in course words ("in the next lesson"), never a time the learners are already in. When a change trades one goal against another you defended earlier (e.g. shortening a buffer), name the conflict.
8. Update the overview inside `journal.md` → `## Sessions` as defined in `templates/session-skeleton.yaml` → `section_layout.overview`: the unit's status line ("{n}. {title} – planning sketch ✅ · material open", translated — the fixed word for skeleton) and its row in the technical overview table inside `<details><summary>{"Technical overview", translated}</summary> … </details>`:
   - If `journal.md` → `## Sessions` does not exist yet, create it with the overview first. Include a `Method` column only if `journal.md` → `## Didactics` → `__Default Session Method:__` is not `none`:
     ```
     | # | Title | Type | Method | Skeleton | Material | Done | Notes |
     |---|---|---|---|---|---|---|---|
     ```
   - Add a new row: `| {number} | {title} | {type} | {method} | ✅ | ❌ | ❌ | |` (omit the Method column entirely, matching the table header, if no method is in use)
   - If a row for this session already exists, update the Skeleton column to ✅.
   - Keep the overview (status list and table) before all `### {number}. {title}` subsections.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
10. **Show the new unit** (MCP gate open): after the overview is updated, the completion message carries the anchor link to the new unit (`data/chat-wording.md` → Point, don't describe — `goto` only if verified by title), says in one line what the instructor finds there, and offer the next step (work out the material together).
