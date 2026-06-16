# Task: create-agenda

## Purpose

Creates the **Course Agenda** as a structured schedule for the course.  
Defines sessions/modules with title, duration, type (lecture/exercise), learning objectives, summary, and the corresponding materials files.
**The agent also adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona, so all content is written in this voice.**

## Inputs

- Learning objectives from `journal.md` → `## Outline` (`__Learning Objectives:__` bullet)
- Abstract from `journal.md` → `## Outline` (`__Abstract:__` bullet)
- Time commitment from `journal.md` → `## Outline` (`__Time Commitment:__` bullet)
- Didactic concept from `journal.md` → `## Didactics` (`__Didactic Concept:__` bullet)
- **Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (mandatory handoff)**
- Style & difficulty level from `journal.md` → `## Didactics`
- Course type from `journal.md` → `## Course Context`

## Output

- `journal.md` → `## Agenda`
- Structure based on `templates/course-agenda.yaml`

## Steps

1. Read `journal.md` → `## Course Context`:
   - Check `agenda` field in the profile:
     - **`no`** → Inform the instructor that the agenda was skipped during init and suggest proceeding with `/create-session 1 {type}`. Stop here.
     - **`optional`** → 🎛️ Ask with structured question (single choice):
       - **Yes** — Create agenda to plan the structure
       - **No** — Proceed directly to `/create-session`
       - **Later** — Skip agenda, create it later
       If no: redirect to `/create-session`. If yes: continue.
     - **`yes`** (required) → Continue without asking.
   - Read terminology (sessions-called, lectures-called) and pacing model.
2. Read learning objectives from the outline.
3. Adopt didactic concept and course type from Didactics.
4. **Agent adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona.**

- From this step, the agent writes in the tone of the Coauthor role.
- If the Coauthor role is missing or inactive, fall back to `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
- All agenda descriptions reflect this style.

5. Define sessions/modules using the terminology from `journal.md` → `## Course Context`.
6. Build the agenda in a structured form adapted to the pacing model:
   - **lecture-series**: sessions with time slots and weekly schedule
   - **workshop**: blocks with approximate time per block
   - **self-paced**: modules without fixed time slots, estimated duration only
   - **single-lesson** (if agenda is yes): sections/chapters within the lesson, no time slots
7. Fill the `templates/course-agenda.yaml` template with the results.
8. Save the generated agenda by replacing the content of `journal.md` → `## Agenda` — flat `* __Label:__` bullets plus the sessions table, no sub-headings.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
