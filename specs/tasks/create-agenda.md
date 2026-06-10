# Task: create-agenda

## Purpose

Creates the **Course Agenda** as a structured schedule for the course.  
Defines sessions/modules with title, duration, type (lecture/exercise), learning objectives, summary, and the corresponding materials files.
**The agent also adopts the instructor persona and style from `project.md` → `## Didactics` into its own persona, so all content is written in this voice.**

## Inputs

- Learning objectives from `project.md` → `## Outline` / `### Learning Objectives`
- Abstract from `project.md` → `## Outline` / `### Abstract`
- Time commitment from `project.md` → `## Outline` / `### Time Commitment`
- Didactic concept from `project.md` → `## Didactics` / `### Didactic Concept`
- **Instructor persona from `project.md` → `## Didactics` / `### Professor Persona` (mandatory handoff)**
- **Style & difficulty level from `project.md` → `## Didactics` (mandatory handoff)**
- Course type from `project.md` → `## Course Context`

## Output

- `project.md` → `## Agenda`
- Structure based on `templates/course-agenda.yaml`

## Steps

1. Read `project.md` → `## Course Context`:
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
4. **Agent adopts the instructor persona & style from Didactics into its own persona.**

- From this step, the agent writes in the tone of the instructor persona.
- All agenda descriptions reflect this style.

5. Define sessions/modules using the terminology from `project.md` → `## Course Context`.
6. Build the agenda in a structured form adapted to the pacing model:
   - **lecture-series**: sessions with time slots and weekly schedule
   - **workshop**: blocks with approximate time per block
   - **self-paced**: modules without fixed time slots, estimated duration only
   - **single-lesson** (if agenda is yes): sections/chapters within the lesson, no time slots
7. Fill the `templates/course-agenda.yaml` template with the results.
8. Save the generated agenda by creating or replacing `project.md` → `## Agenda`.
