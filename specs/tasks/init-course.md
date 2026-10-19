# Task: init-course

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

1. Welcome the instructor in one or two sentences and say how many questions follow. Do not repeat a workflow explanation the instructor already received in this chat.
   - **Reuse what is known.** Before asking, collect everything the instructor already said in this chat (`read_chat`) or in `journal.md` (topic, audience, number and length of lessons, how learners work, devices). Do not ask for it again; show it as a prefilled assumption ("Noted so far: … Correct?") and let the instructor correct it.
   - **No unfounded recommendations.** Mark an option as recommended only if the instructor's own statements support it, and name that reason in one line. Otherwise give no recommendation.
   - **Language.** Ask in the language the instructor writes in. Until step 7 is saved, that language is the course language for all chat messages and option labels (see `data/agent-links.md` → Chat Conduct → Language before the frame).
2. If `journal.md` does not exist, instantiate it from `templates/journal.md`:
   - Copy the template **1:1, byte for byte** — no edits, no added comments, no reformatting. The file is already a valid LiaScript document; its first HTML comment is the LiaScript metadata header (`language:`, `@color` macro, `import: ./specs/dashboard/README.md`) and must remain the first comment.
   - All sections keep their `{{...}}` placeholder skeletons until their tasks run; this task only fills `## Course Context`, the course title, the header's `language:` (course language code, step 7), and `## Dashboard` (via `tasks/update-dashboard.md`).
   - If `journal.md` already exists, leave it untouched and only work on the sections below.
3. 🎛️ Ask for the course type as **two short questions in the instructor's own terms** (one form, skip what is already known from step 1). Show only plain labels in the course language, never the type slugs. Phrase the options for the instructor's setting (school, university, adult education) — e.g. "lesson" vs. "session", "pupils" vs. "participants":

   **3a. Scope** (single choice):
   1. One single lesson / session
   2. Several lessons / a teaching unit or lecture series
   3. A project day, workshop or block event (1–3 days)
   4. A self-study course without joint lessons
   5. Improve existing material

   **3b. How do the learners work?** (single choice; skip for 4 and 5):
   1. I lead the lessons; the material supports me
   2. The learners work on their own at their own pace (e.g. self-study phases, workshop tasks, online)
   3. Mixed

   Map the answers onto the course type and pacing:

   | 3a | 3b | Type | Pacing |
   |---|---|---|---|
   | 1 | any | single-lesson | n/a; learner-driven if 3b = 2 |
   | 2 | 1 or 3 | lecture-series | scheduled |
   | 2 | 2 | self-paced | learner-driven within scheduled lessons (note in Additional Notes) |
   | 3 | any | workshop | event-based |
   | 4 | — | self-paced | learner-driven |
   | 5 | — | improve-existing | (from existing) |

4. 💬 Ask in one free-text question for the **working title and the target group** (topic, who the learners are, how many, where they work). Give a neutral example that does not echo anything the instructor said. Skip the parts already known (step 1).
5. Target platform is LiaScript in this project; do not ask. Ask only if the instructor mentions another platform.
6. Based on the course type, set the profile defaults:

   | Type             | Terminology       | Persona         | Agenda default | Pacing          | Assessment              |
   | ---------------- | ----------------- | --------------- | -------------- | --------------- | ----------------------- |
   | lecture-series   | session / lecture | professor       | yes            | scheduled       | quizzes + assignments   |
   | self-paced       | unit / module     | coach           | optional       | learner-driven  | self-check quizzes      |
   | workshop         | block / activity  | facilitator     | yes            | event-based     | reflection + group work |
   | single-lesson    | lesson            | tutor           | optional       | n/a             | optional quiz           |
   | improve-existing | (from existing)   | (from existing) | optional       | (from existing) | (from existing)         |

   Also set the **File Structure** default from course type (see `data/file-structure-modes.md`):

   | Type | Default File Structure mode |
   | ---- | ---------------------------- |
   | lecture-series | multi-file |
   | self-paced | multi-file |
   | workshop | multi-file |
   | single-lesson | single-file |
   | improve-existing | detected in `:analyze-existing` |

   Ask the file structure as a **teacher question** instead of stating a default (single choice, plain labels):
   1. "One link for all units — learners work through the chapters of one course" → `single-file`
   2. "One link per unit — each unit is opened on its own" → `multi-file`
   Recommend 1 for up to about 6 short units (one link or QR code, progress in one place) and say why in one line; otherwise give the type default above without a recommendation.

   **Terminology:** set `sessions-called` and `lectures-called` to the words the instructor will see in the journal, in the course language and fitting the setting (e.g. school: the local words for "learning unit" / "chapter"). Use exactly these words in all instructor-facing text and in the Dashboard.

   **Audience override:** for school learners (primary or secondary school), never use the persona type `professor`; use `coach` (learner-driven) or `tutor` (teacher-led).

   For **self-paced** and **single-lesson**, 🎛️ ask agenda preference in the instructor's terms ("Shall I create a schedule with order and time per unit?") (structured question — single choice):
   - **Yes** — helps with structure planning, especially for longer content
   - **No** — proceed directly to skeleton and materials

   Set `agenda` in the profile to `yes` or `no` based on the answer.
   For **lecture-series** and **workshop**, agenda is always `yes` (required, no question needed).

7. 🎛️ Ask about project-level conventions in one structured pass (multi-select where applicable):
   - Language: prefill with the language the instructor writes in; ask only if the material should be in another language
   - Tone: formal / informal / conversational
   - Person: Sie / Du / you — how *learners* are addressed in the material
   - Author name for the material header (a display name learners and parents see, e.g. title + surname; no private address needed). A contact address for publishing goes to the Dashboard as `prepare`.
   - Instructor Address: how the agents address the instructor (default: the formal form of the course language, unless the instructor offers otherwise) — never derived from Person
   - Accessibility: required / optional / not needed
   - LiaScript conventions: 💬 ask as free text only if instructor has specific requirements

8. Fill the `templates/course-context.yaml` template with the collected inputs, including the `__File Structure:__` field (mode + session folder naming) from step 6.
9. **Before saving:** show a short summary of everything that will be written (this step and step 10), with "Save" / "Change something" — the single write confirmation of this task.
   - The summary table lists under "Decided" **only what the instructor answered**, in the instructor's own words (e.g. describe the course type by the two answers of step 3, not by a translated type slug).
   - Anything you derived or propose (a learning companion, self-checks, a persona type …) goes into a separate list "Suggestions — not decided yet" or is left out; it is saved only after the instructor accepts it.
   - Technical keys that are mapped from the answers (Type, Pacing, Persona type) are named in one plain-language line below the table ("For the assistant this means: …"), so the technical block never says something the instructor has not seen.
   Then save by replacing the content of `journal.md` → `## Course Context` following `templates/course-context.yaml` → `layout` (summary table first, technical `* __Label:__` bullets inside `<details>`, no sub-headings).
10. If LiaScript conventions mention template imports, run `tasks/manage-templates.md` with `templates/course-templates.yaml`:
    - Add `import: {url}` to the main metadata header if missing
    - Create or update `journal.md` → `## Templates`
    - Move detailed template usage examples to `## Templates` instead of bloating `## Course Context`
11. Set `language:` in the metadata header to the course language code, and run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to regenerate the `## Dashboard` JSON data block.
12. 🎛️ If no `.mcp.json` exists in the project root and the MCP gate is closed (see `data/agent-links.md`), offer the live dashboard once (single choice):
   1. **Yes** — copy `templates/mcp.json` to `.mcp.json`. Then explain: requires the LiaScript DevServer (`npm install -g @liascript/devserver`); restart the agent (Claude Code: `claude --dangerously-load-development-channels server:liascript`) so `journal.md` opens in the browser with clickable actions.
   2. **No / later** — continue in the terminal; links in `journal.md` stay readable as commands.
13. Confirm completion and suggest the next step based on course type:
    - **lecture-series / workshop** → `:create-outline`
    - **self-paced** → `:create-outline` (agenda depends on instructor answer)
    - **single-lesson** → `:create-outline` → `:create-didactics` → `:create-agenda` (if yes) → `:create-session 1 lesson`
    - **improve-existing** → `:analyze-existing` (scans existing project memory and materials, offers to fill gaps)

## Notes

- All subsequent tasks (`:create-outline`, `:create-didactics`, `:create-agenda`, etc.) will read `journal.md` → `## Course Context` and adapt their behavior accordingly.
- The profile defaults are suggestions; the instructor can override any field.
- For `improve-existing`, `:analyze-existing` handles the reverse-engineering of missing `journal.md` sections before improvement work begins.
- The skeleton's formatting rules are binding: no sub-headings inside sections (Course Context uses the `layout` of its template: table + `<details>`), no `###` sub-headings outside `## Sessions` / `## Templates` / `## Agents` / `## Validation` / `## Notes Backup`, and the Dashboard is only ever updated via `tasks/update-dashboard.md`.
