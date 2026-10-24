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
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-language.md`, `data/journal-links.md`

## Output

- `journal.md` created from `templates/journal.md` if it does not exist yet
- `journal.md` → `## Course Context`
- Optional: `journal.md` main metadata header `import:` lines and `## Templates`
- Structure based on `templates/course-context.yaml`

## Steps

1. Welcome the instructor in one or two sentences and say how many question rounds follow — count them from steps 3, 4, 6 (only when it asks) and 7 for this course, never an estimate; use the same number wherever you announce it. Do not repeat a workflow explanation the instructor already received in this chat.
   - **Reuse what is known.** Before asking, collect everything the instructor already said in this chat (`read_chat` when the preview is connected, otherwise this conversation) or in `journal.md` (topic, audience, number and length of lessons, how learners work, devices). Do not ask for it again; show it as a prefilled assumption ("Noted so far: … Correct?") and let the instructor correct it.
   - **No unfounded recommendations.** Mark an option as recommended only if the instructor's own statements support it, and name that reason in one line. Otherwise give no recommendation.
   - **Language.** Ask in the language the instructor writes in. Until step 9 is saved, that language is the course language for all chat messages and option labels (see `data/chat-language.md` → Language before the frame).
2. If `journal.md` does not exist, instantiate it from `templates/journal.md`:
   - Copy the template **1:1, byte for byte** with the single command `cp specs/templates/journal.md journal.md` — no edits, no added comments, no reformatting. The file is already a valid LiaScript document; its first HTML comment is the LiaScript metadata header (`language:`, `@color` macro, `import: ./specs/dashboard/README.md`) and must remain the first comment.
   - Unfilled sections show only their one-line note ("still empty – …"); each task writes its section from its template in `templates/`. This task only fills `## Course Context`, the course title, the header's `language:` (course language code, step 7), and `## Dashboard` (via `tasks/update-dashboard.md`).
   - This copy — and the language switch of `data/chat-language.md` → Language before the frame — are the only writes allowed before the save confirmation in step 9 (`data/agent-links.md` → confirmation tiers): they contain nothing the instructor said. Every content change waits for step 9.
   - If `journal.md` already exists, leave it untouched and only work on the sections below.
3. 🎛️ **Order:** ask step 4 (free text) before this form unless its answers are already known, so the options below fit the setting the instructor named. Ask for the course type as **two short questions in the instructor's own terms** (one form, skip what is already known from step 1 or 4). Show only plain labels in the course language, never the type slugs. Phrase the options for the instructor's setting (school, university, adult education) — e.g. "lesson" vs. "session", "pupils" vs. "participants":

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

4. 💬 Ask in one free-text question for the **working title, the target group and the time frame** (topic; who the learners are, how many, where they work; how many lessons or meetings, how long, over what period). Give a neutral example that does not echo anything the instructor said. Skip the parts already known (step 1). The time frame fills `Units` (step 8) and decides the file-structure recommendation (step 6).
5. The Teaching-Agent builds LiaScript courses only — never ask for a platform. If the instructor mentions another one, say in one line that this assistant creates LiaScript material, which can later be exported (e.g. as a SCORM package for a learning platform). Accessibility is not asked: LiaScript brings read-aloud (text to speech), screen-reader labels and keyboard navigation for every course, and the material rules (alt texts, read-aloud for what learners must read, the question as the quiz label) apply to every course. Special needs of the learners (e.g. dyslexia, little German) belong to the target group, where the tasks take them into account.
6. Based on the course type, set the profile defaults:

   | Type             | Unit word         | Persona         | Agenda default | Pacing          | Assessment              |
   | ---------------- | ----------------- | --------------- | -------------- | --------------- | ----------------------- |
   | lecture-series   | session           | professor       | yes            | scheduled       | quizzes + assignments   |
   | self-paced       | unit              | coach           | optional       | learner-driven  | self-check quizzes      |
   | workshop         | block             | facilitator     | yes            | event-based     | reflection + group work |
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

   For a single lesson do not ask: it is `single-file` (one link); name it in one line of the summary. For every other course type, ask the file structure as a **teacher question** instead of stating a default (single choice, plain labels):
   1. "One link for all units — learners work through the chapters of one course" → `single-file`
   2. "One link per unit — each unit is opened on its own" → `multi-file`
   Ask this only once the time frame (step 4) is known. Recommend 1 if it is up to about 6 short units (one link or QR code, progress in one place) and say why in one line; otherwise give no recommendation. Never label an option as "usual" or "default", and never offer an internal threshold (e.g. "up to 6") as an answer option.

   **Terminology:** set `sessions-called` to the word the instructor will see for one unit in the journal, in the course language and fitting the setting (e.g. school: the local word for "lesson" or "learning unit"). Use exactly these words in all instructor-facing text and in the Dashboard.

   **Audience override:** for school learners (primary or secondary school), never use the persona type `professor`; use `coach` (learner-driven) or `tutor` (teacher-led, and also for "mixed").

   For **self-paced** and **single-lesson**, 🎛️ ask agenda preference in the instructor's terms ("Shall I create a schedule with order and time per unit?") (structured question — single choice):
   - **Yes** — helps with structure planning, especially for longer content
   - **No** — proceed directly to skeleton and materials

   Set `agenda` in the profile to `yes` or `no` based on the answer.
   For **lecture-series** and **workshop**, agenda is always `yes` (required, no question needed).

7. 🎛️ Ask about project-level conventions in one structured pass (multi-select where applicable):
   - Language: prefill with the language the instructor writes in; ask only if the material should be in another language
   - Tone: formal / informal / conversational (if not answered: informal for school learners, formal otherwise)
   - Person: Sie / Du / you — how *learners* are addressed in the material
   - Author name for the material header (a display name learners and parents see, e.g. title + surname; no private address needed). Contact address (optional, an e-mail learners may write to): needed only before publishing — if not given now, the dashboard lists it as `prepare`, and `:create-project` asks for it.
   - Instructor Address: how the agents address the instructor (default: the formal form of the course language, unless the instructor offers otherwise) — never derived from Person
   - LiaScript conventions: 💬 ask as free text only if instructor has specific requirements

8. Fill the `templates/course-context.yaml` template with the collected inputs, including the `__File Structure:__` field (mode + session folder naming) from step 6 and `Units` from the time frame of step 4.
9. **Before saving:** show a short summary of everything that will be written (this step and step 10), with "Save" / "Change something" — the single write confirmation of this task.
   - The summary table lists under "Decided" **only what the instructor answered**, in the instructor's own words (e.g. describe the course type by the two answers of step 3, not by a translated type slug).
   - Anything you derived or propose (a learning companion, self-checks …) goes into a separate list "Suggestions — not decided yet" or is left out; it is saved only after the instructor accepts it.
   - Below the table, say in one plain-language line **what the mapped keys change in the material** (who leads, how each unit ends, one link or several) — never name or translate a type, pacing or persona key, never use the label of an option the instructor did not choose, and never present the assistant as the persona (the persona is decided in `create-didactics`). That line belongs to the summary only and is not saved; the keys themselves go into the technical block.
   - A revised summary (after "Change something") starts with one line naming every change ("Changed: units 6 → 4; new: preparation"), before the table — no bold markers inside the table.
   - Content the instructor already gave for a later step (e.g. learning objectives, ideas for tasks) goes into `Additional Notes` as "For {step}: …" and is listed below the summary as "noted for later"; the later task reads it from there.
   Then save:
   - **Language pack first:** if the course language is not English, a language pack exists (`specs/templates/i18n/<code>.json`) and `journal.md` is still the untouched copy of step 2, run `node specs/dashboard/localize-journal.mjs --lang <code>` **before** any other write of this step — the pack replaces lines of the empty template only, so after the first content write it no longer applies (unless it already ran at the language switch, `data/chat-language.md` → Language before the frame).
   - Then replace the content of `journal.md` → `## Course Context` following `templates/course-context.yaml` → `layout` (summary table first, technical `* __Label:__` bullets inside `<details>`, no sub-headings).
10. If LiaScript conventions mention template imports, run `tasks/manage-templates.md` with `templates/course-templates.yaml`:
    - Add `import: {url}` to the main metadata header if missing
    - Create or update `journal.md` → `## Templates`
    - Move detailed template usage examples to `## Templates` instead of bloating `## Course Context`
    - Leave `* __Template selection:__ open` as it is — the selection for the learning activities follows after the didactics (`:suggest-templates`), which recognises the templates documented here
11. Set `language:` in the metadata header to the course language code; if it is not English, the journal's own texts follow the course language in terminal mode too. **With a language pack** (`specs/templates/i18n/<code>.json`) it already ran in step 9 (or at the language switch); then only the unit word is left: in the pack's `unitLines`, replace its `unitWord` by the word of `sessions-called` (one map, one write). **Without a pack**, apply the journal part of `data/chat-language.md` → "Language before the frame": the course title, the welcome paragraph and its start link, a translated suffix for every fixed `##` / `###` heading (English key first), the one-line notes of unfilled sections and fixed placeholder lines such as the "course check not yet run" line under `## Validation`; headings that name a template keep that name (e.g. `### Dashboard` under `## Templates`), while placeholder values such as "none yet" are translated — except the `__State:__` value under `## Publishing`, an English key (`not published` / `published on …`) read by the dashboard; also the explanatory paragraphs under `## Templates` and `## Agents`, their visible values and boundary lines, and the `<summary>` labels of technical blocks. English stay only keys that tasks read: `__Customization Status:__` (active / inactive), `__State:__`, `Mode:` / `Result:`, and the header rows of technical tables; all line changes in one `localize-journal.mjs` map (`data/chat-language.md` → Language before the frame → Do it fast), never one edit per line and never a rewrite of the file. The chat-only parts of that rule (`lang` for the chat tool, roster labels) apply only with the MCP gate open. Then run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to regenerate the `## Dashboard` JSON data block.
12. 🎛️ If no `.mcp.json` exists in the project root and the MCP gate is closed (see `data/agent-links.md`), offer the live dashboard once (single choice):
   1. **Yes** — read `templates/mcp.json` and write it as `.mcp.json` with the file-write tool (no shell copy). Then explain: requires the LiaScript DevServer (`npm install -g @liascript/devserver`); restart the agent (Claude Code: `claude --dangerously-load-development-channels server:liascript`) so `journal.md` opens in the browser with clickable actions.
   2. **No / later** — continue in the terminal; links in `journal.md` stay readable as commands.
13. Confirm completion and suggest the next step based on course type:
    - **lecture-series / workshop** → `:create-outline`
    - **self-paced** → `:create-outline` (agenda depends on instructor answer)
    - **single-lesson** → `:create-outline` → `:create-didactics` → `:create-agenda` (if yes) → `:create-session 1`
    - **improve-existing** → `:analyze-existing` (scans existing project memory and materials, offers to fill gaps)

    Name the next step exactly as the Dashboard's `next.title` and its button do.

## Notes

- All subsequent tasks (`:create-outline`, `:create-didactics`, `:create-agenda`, etc.) will read `journal.md` → `## Course Context` and adapt their behavior accordingly.
- The profile defaults are suggestions; the instructor can override any field.
- For `improve-existing`, `:analyze-existing` handles the reverse-engineering of missing `journal.md` sections before improvement work begins.
- The skeleton's formatting rules are binding: no sub-headings inside sections (Course Context uses the `layout` of its template: table + `<details>`), no `###` sub-headings outside `## Sessions` / `## Templates` / `## Agents` / `## Validation` / `## Notes Backup`, and the Dashboard is only ever updated via `tasks/update-dashboard.md`.
