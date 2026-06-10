# Task: init

## Purpose

Initializes a new course project by creating or updating the `## Course Context` section in `project.md`.

This is the **first mandatory step** for every new course project.
The course context acts as the governance layer: it defines the course type, terminology, persona style, conventions, and LiaScript rules that all subsequent tasks will load and follow.

## Inputs

- Course type (asked interactively)
- Working title (optional at this stage)
- Instructor preferences (optional)

## Output

- `project.md` → `## Course Context`
- Optional: `project.md` main metadata header `import:` lines and `## Templates`
- Structure based on `templates/course-context.yaml`

## Steps

1. Welcome the instructor and briefly explain the workflow.
2. 🎛️ Ask for the **course type** (structured question — single choice):
   1. **lecture-series** – Semester course / lecture series with instructor
   2. **self-paced** – Self-learning course, asynchronous, no live sessions
   3. **workshop** – Intensive, interactive, time-boxed (1–3 days)
   4. **single-lesson** – One standalone lesson or tutorial
   5. **improve-existing** – Analyze and improve an existing course
3. 💬 Ask for a working title (optional, free text).
4. 🎛️ Ask about the target platform (structured question — single choice: LiaScript / Other).
5. Based on the course type, set the profile defaults:

   | Type             | Terminology       | Persona         | Agenda default | Pacing          | Assessment              |
   | ---------------- | ----------------- | --------------- | -------------- | --------------- | ----------------------- |
   | lecture-series   | session / lecture | professor       | required       | scheduled       | quizzes + assignments   |
   | self-paced       | unit / module     | coach           | optional       | learner-driven  | self-check quizzes      |
   | workshop         | block / activity  | facilitator     | required       | event-based     | reflection + group work |
   | single-lesson    | lesson            | tutor           | optional       | n/a             | optional quiz           |
   | improve-existing | (from existing)   | (from existing) | optional       | (from existing) | (from existing)         |

   For **self-paced** and **single-lesson**, 🎛️ ask agenda preference (structured question — single choice):
   - **Yes** — helps with structure planning, especially for longer content
   - **No** — proceed directly to skeleton and materials

   Set `agenda` in the profile to `yes` or `no` based on the answer.
   For **lecture-series** and **workshop**, agenda is always `yes` (required, no question needed).

6. 🎛️ Ask about project-level conventions in one structured pass (multi-select where applicable):
   - Language: de / en / other (+ free text if other)
   - Tone: formal / informal / conversational
   - Person: Sie / Du / you
   - Accessibility: required / optional / not needed
   - LiaScript conventions: 💬 ask as free text only if instructor has specific requirements

7. Fill the `templates/course-context.yaml` template with the collected inputs.
8. Save the generated context by creating or replacing `project.md` → `## Course Context`.
9. If LiaScript conventions mention template imports, run `tasks/manage-templates.md` with `templates/course-templates.yaml`:
   - Add `import: {url}` to the main metadata header if missing
   - Create or update `project.md` → `## Templates`
   - Move detailed template usage examples to `## Templates` instead of bloating `## Course Context`
10. Confirm completion and suggest the next step based on course type:
   - **lecture-series / workshop** → `/create-outline`
   - **self-paced** → `/create-outline` (agenda depends on instructor answer)
   - **single-lesson** → `/create-outline` → `/create-didactics` → `/create-agenda` (if yes) → `/create-session 1 lesson`
   - **improve-existing** → `/analyze-existing` (scans existing project memory and materials, offers to fill gaps)

## Notes

- All subsequent tasks (`/create-outline`, `/create-didactics`, `/create-agenda`, etc.) will read `project.md` → `## Course Context` and adapt their behavior accordingly.
- The profile defaults are suggestions; the instructor can override any field.
- For `improve-existing`, `/analyze-existing` handles the reverse-engineering of missing `project.md` sections before improvement work begins.
