# Task: create-agenda

## Purpose

Creates the **Course Agenda** as a structured schedule for the course.  
Defines sessions/modules with title, duration, type (slug from `journal.md` → `## Didactics` → `__Session Types:__`, see `data/session-types.md`), learning objectives, summary, and the corresponding materials files.
**The agent also adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona, so all content is written in this voice.**

## Inputs

- Learning objectives from `journal.md` → `## Outline` (`__Learning Objectives:__` bullet)
- Abstract from `journal.md` → `## Outline` (`__Abstract:__` bullet)
- Time commitment from `journal.md` → `## Outline` (`__Time Commitment:__` bullet)
- Didactic concept from `journal.md` → `## Didactics` (`__Didactic Concept:__` bullet)
- Session Types from `journal.md` → `## Didactics` (`__Session Types:__` bullet, see `data/session-types.md`)
- **Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (mandatory handoff)**
- Style & difficulty level from `journal.md` → `## Didactics`
- Course type from `journal.md` → `## Course Context`
- Default Session Method from `journal.md` → `## Didactics` → `__Default Session Method:__` (see `data/didactic-methods.md`)
- `data/duration-heuristic.md` — optional orientation when estimating realistic per-session durations (not a required check at this stage)

## Output

- `journal.md` → `## Agenda`
- Structure based on `templates/course-agenda.yaml`

## Steps

1. Read `journal.md` → `## Course Context`:
   - Check `agenda` field in the profile:
     - **`no`** → Inform the instructor that the agenda was skipped during init and suggest proceeding with `:create-session 1`. Stop here.
     - **`optional`** → 🎛️ Ask with structured question (single choice):
       - **Yes** — Create agenda to plan the structure
       - **No** — Proceed directly to `:create-session`
       - **Later** — Skip agenda, create it later
       If no: redirect to `:create-session`. If later: stop here — the agenda stays an open step in the dashboard. If yes: continue.
     - **`yes`** (required) → Continue without asking.
   - Read terminology (sessions-called, lectures-called) and pacing model.
2. Read learning objectives from the outline.
3. Adopt didactic concept and course type from Didactics.
4. **Agent adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona.**

- From this step, the agent writes in the tone of the Coauthor role.
- If the Coauthor role is missing or inactive, fall back to `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
- All agenda descriptions reflect this style.

5. Define sessions/modules using the terminology from `journal.md` → `## Course Context`. Assign each one a type slug from `journal.md` → `## Didactics` → `__Session Types:__` — never a hardcoded `lecture`/`exercise`.
   - `[if journal.md → ## Didactics → __Default Session Method:__ is not "none"]`: assign each session the default Session Method. Choose a different method from `data/didactic-methods.md` for a session yourself only if it fits clearly better; do not ask about methods (`tasks/create-didactics.md` step 3c). Mention a change in plain words in one line of the summary, and only if it changes what the learners do. Skip all of this when the default is `none`.
5a. **Clarify the file structure** if `## Course Context` → `__File Structure:__` conflicts with what the instructor confirmed or was never asked as a teacher question: ask it as in `tasks/init-course.md` step 6 and update only the technical `File Structure` field plus the matching table row, after confirmation.
5b. **Clean up Session Type slugs before writing them:** run `node specs/dashboard/validate-journal.mjs`; if it reports `slug` (a duplicated slug) or `type-name` (a display name equal to a terminology word), the fix belongs to `## Didactics` — change it there only with its own confirmation (see `data/agent-links.md` → "Changing another section"), then use the result in the agenda.
5c. **Net working time per time slot:** if the course runs in fixed slots (lessons, workshop blocks, labs), compute the working time per slot before distributing activities: subtract setup (getting devices, logging in, opening the material) and wrap-up (saving, collecting, tidying). If the instructor has not given these times, propose a default (for a school lesson about 5 minutes setup and 2–3 minutes wrap-up), say that it is an assumption, and show it as its own line in the **first** proposal so the instructor confirms it together with the times. Place whole-group phases (opening, closing) and activities bound to the instructor (one-to-one talks, listening to explanations) explicitly in the plan.
6. Build the agenda in a structured form adapted to the pacing model:
   - **lecture-series**: sessions with time slots and weekly schedule
   - **workshop**: blocks with approximate time per block
   - **self-paced**: modules without fixed time slots, estimated duration only
   - **single-lesson** (if agenda is yes): sections/chapters within the lesson, no time slots

   When assigning a duration, `data/duration-heuristic.md` can help sanity-check that it's realistic for the planned content volume — this is orientation only, not a required check here (the actual check happens later in `:validate-course`).
6a. **Self-check before the summary:** every learning objective is covered by at least one mandatory unit; an objective marked for all units appears in every row; durations add up to the time budget of 5c including a buffer; numbers match `## Course Context` (number and length of lessons).
7. Fill the `templates/course-agenda.yaml` template with the results.
8. **Before saving** show the agenda as text (whole version, changes in bold after a revision) with "Save" / "Change something". Then save by replacing the content of `journal.md` → `## Agenda` following `templates/course-agenda.yaml` → `layout`, no sub-headings.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
