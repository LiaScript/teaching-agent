# Task: create-agenda

## Purpose

Creates the **Course Agenda** as a structured schedule for the course.  
Defines sessions/modules with title, duration, type (slug from `journal.md` → `## Didactics` → `__Session Types:__`, see `data/session-types.md`), learning objectives, and the corresponding materials files.
**The agent also adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona, so all content is written in this voice.**

## Inputs

- Learning objectives from `journal.md` → `## Outline` (the field with `data-key="learning-goals"`; in older journals the `__Learning Objectives…:__` bullet)
- Abstract from `journal.md` → `## Outline` (`data-key="abstract"`; older journals: the `__Abstract:__` bullet)
- Time commitment from `journal.md` → `## Outline` (`data-key="time-commitment"`; older journals: `__Time Commitment:__`) and `## Course Context` → Units
- Didactic concept from `journal.md` → `## Didactics` (`data-key="didactic-concept"`; older journals: `__Didactic Concept:__`)
- Session Types from `journal.md` → `## Didactics` (`__Session Types:__` bullet, see `data/session-types.md`)
- **Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (mandatory handoff)**
- Style & difficulty level from `journal.md` → `## Didactics`
- Course type from `journal.md` → `## Course Context`
- Default Session Method from `journal.md` → `## Didactics` → `__Default Session Method:__` (see `data/didactic-methods.md`)
- `data/duration-heuristic.md` — optional orientation when estimating realistic per-session durations (not a required check at this stage)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Agenda`
- Structure based on `templates/course-agenda.yaml`

## Steps

1. Read `journal.md` → `## Course Context`:
   - Check `agenda` field in the profile:
     - **`no`** → the instructor called it although the course frame says no agenda: 🎛️ ask "Create a schedule after all?" (Yes / No). Yes → set `Agenda required: yes` in `## Course Context` (`data/chat-dialog.md` → Changing another section, in the save of this task) and continue. No → if `## Agenda` still holds placeholders, replace them with the one-line note of `tasks/scaffold-course.md` step 6, suggest `:create-session 1` and stop.
     - **`optional`** → 🎛️ Ask with structured question (single choice):
       - **Yes** — Create agenda to plan the structure
       - **No** — Proceed directly to `:create-session`
       - **Later** — Skip agenda, create it later
       If no: set `Agenda required: no` (one line in `## Course Context`, confirmed with this answer) and redirect to `:create-session`. If later: stop here — the agenda stays an open step in the dashboard. If yes: set `Agenda required: yes` in the save of this task and continue.
     - **`yes`** (required) → Continue without asking.
   - Read terminology (sessions-called) and pacing model.
2. Read learning objectives from the outline.
3. Adopt didactic concept and course type from Didactics.
4. **Agent adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona.**

- From this step, the agent writes in the tone of the Coauthor role.
- If the Coauthor role is missing or inactive, fall back to `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
- All agenda descriptions reflect this style.

5. Define sessions/modules using the terminology from `journal.md` → `## Course Context`. Assign each one a type slug from `journal.md` → `## Didactics` → `__Session Types:__` — never a hardcoded `lecture`/`exercise`.
   - `[if journal.md → ## Didactics → __Default Session Method:__ is not "none"]`: assign each session the default Session Method. Choose a different method from `data/didactic-methods.md` for a session yourself only if it fits clearly better; do not ask about methods (`tasks/create-didactics.md` step 3c). Mention a change in plain words in one line of the summary, and only if it changes what the learners do. Skip all of this when the default is `none`.
5a. **Clarify the file structure** if `## Course Context` → `__File Structure:__` conflicts with what the instructor confirmed or was never asked as a teacher question: ask it as in `tasks/init-course.md` step 6 and update only the technical `File Structure` field plus the matching table row, after confirmation.
5b. **Clean up Session Type slugs before writing them:** run `node specs/dashboard/validate-journal.mjs`; if it reports `slug` (a duplicated slug) or `type-name` (a display name equal to a terminology word), the fix belongs to `## Didactics` — change it there only with its own confirmation (see `data/chat-dialog.md` → "Changing another section"), then use the result in the agenda.
5c. **Net working time per time slot:** if the course runs in fixed slots (lessons, workshop blocks, labs), compute the working time per slot before distributing activities: subtract setup (getting devices, logging in, opening the material) and wrap-up (saving, collecting, tidying). If the instructor has not given these times, propose a default (for a school lesson about 5 minutes setup and 2–3 minutes wrap-up), say that it is an assumption, and show it as its own line in the **first** proposal so the instructor confirms it together with the times. Place whole-group phases (opening, closing) and activities bound to the instructor (one-to-one talks, listening to explanations) explicitly in the plan.
6. Build the agenda in a structured form adapted to the pacing model:
   - **lecture-series**: sessions with time slots and weekly schedule
   - **workshop**: blocks with approximate time per block
   - **self-paced**: modules with estimated duration only — unless the learners work in fixed time slots (e.g. lessons in which they study at their own pace); then plan per slot as in step 5c
   - **single-lesson** (if agenda is yes): **exactly one unit row** — No. 1, the lesson with its length and all objectives; its phases (sections/chapters with minutes) go into the time budget (`time-budget`) as a short list, never as numbered rows: the units table counts units (`data/session-types.md` → "Objectives and duration of a session" reads the lesson's row, `validate-journal.mjs` compares rows and units)

   When assigning a duration, `data/duration-heuristic.md` can help sanity-check that it's realistic for the planned content volume — this is orientation only, not a required check here (the actual check happens later in `:validate-course`).
6a. **Self-check before the summary:** every learning objective is covered by at least one mandatory unit; an objective marked for all units appears in every row; durations add up to the time budget of 5c including a buffer — a buffer is free time **or** an explicitly movable part (then say what slower learners move and where they catch up; with 0 free minutes in a slot, say so in its own line); numbers match `## Course Context` (number and length of lessons).
7. Fill the `templates/course-agenda.yaml` template with the results.
8. **Before saving** show the agenda as text (after a revision it starts with one line naming every change — see `data/chat-dialog.md` → Nothing unseen gets saved; new preparation items and open points for the overview are listed in future tense) with "Save" / "Change something". Then save by replacing the content of `journal.md` → `## Agenda` following `templates/course-agenda.yaml` → `layout`, no sub-headings.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
