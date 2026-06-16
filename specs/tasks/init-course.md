# Task: init

## Purpose

Initializes a new course project by instantiating `journal.md` from the skeleton template and creating or updating its `## Course Context` section.

This is the **first mandatory step** for every new course project.
The course context acts as the governance layer: it defines the course type, terminology, persona style, conventions, and LiaScript rules that all subsequent tasks will load and follow.

## Inputs

- `templates/journal.md` (skeleton for a new `journal.md`)
- Course type (asked interactively)
- Working title (optional at this stage)
- Instructor preferences (optional)

## Output

- `journal.md` created from `templates/journal.md` if it does not exist yet
- `journal.md` → `## Course Context`
- Optional: `journal.md` main metadata header `import:` lines and `## Templates`
- Structure based on `templates/course-context.yaml`

## Steps

1. Welcome the instructor and briefly explain the workflow.
2. If `journal.md` does not exist, instantiate it from `templates/journal.md`:
   - Copy the template **1:1, byte for byte** — no edits, no added comments, no reformatting. The file is already a valid LiaScript document; its first HTML comment is the LiaScript metadata header (`@style`, imports) and must remain the first comment.
   - All sections keep their `{{...}}` placeholder skeletons until their tasks run; this task only fills `## Course Context`, the course title, and the dashboard date.
   - If `journal.md` already exists, leave it untouched and only work on the sections below.
3. 🎛️ Ask for the **course type** (structured question — single choice):
   1. **lecture-series** – Semester course / lecture series with instructor
   2. **self-paced** – Self-learning course, asynchronous, no live sessions
   3. **workshop** – Intensive, interactive, time-boxed (1–3 days)
   4. **single-lesson** – One standalone lesson or tutorial
   5. **improve-existing** – Analyze and improve an existing course
4. 💬 Ask for a working title (optional, free text).
5. 🎛️ Ask about the target platform (structured question — single choice: LiaScript / Other).
6. Based on the course type, set the profile defaults:

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

7. 🎛️ Ask about project-level conventions in one structured pass (multi-select where applicable):
   - Language: de / en / other (+ free text if other)
   - Tone: formal / informal / conversational
   - Person: Sie / Du / you
   - Accessibility: required / optional / not needed
   - LiaScript conventions: 💬 ask as free text only if instructor has specific requirements

8. Fill the `templates/course-context.yaml` template with the collected inputs.
9. Save the generated context by replacing the content of `journal.md` → `## Course Context` — keep it **flat** (`* __Label:__` bullets only, no sub-headings), exactly as the skeleton prescribes.
10. If LiaScript conventions mention template imports, run `tasks/manage-templates.md` with `templates/course-templates.yaml`:
    - Add `import: {url}` to the main metadata header if missing
    - Create or update `journal.md` → `## Templates`
    - Move detailed template usage examples to `## Templates` instead of bloating `## Course Context`
11. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update the `## Dashboard` HTML shell in place (current step, next commands, quality state, date).
12. Confirm completion and suggest the next step based on course type:
    - **lecture-series / workshop** → `/create-outline`
    - **self-paced** → `/create-outline` (agenda depends on instructor answer)
    - **single-lesson** → `/create-outline` → `/create-didactics` → `/create-agenda` (if yes) → `/create-session 1 lesson`
    - **improve-existing** → `/analyze-existing` (scans existing project memory and materials, offers to fill gaps)

## Notes

- All subsequent tasks (`/create-outline`, `/create-didactics`, `/create-agenda`, etc.) will read `journal.md` → `## Course Context` and adapt their behavior accordingly.
- The profile defaults are suggestions; the instructor can override any field.
- For `improve-existing`, `/analyze-existing` handles the reverse-engineering of missing `journal.md` sections before improvement work begins.
- The skeleton's formatting rules are binding: flat bullet sections, no `###` sub-headings outside `## Sessions` / `## Templates` / `## Agents` / `## Validation` / `## Notes Backup`, and the Dashboard is only ever updated via `tasks/update-dashboard.md`.
