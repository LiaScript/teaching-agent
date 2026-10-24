# Task: scaffold-course

## Purpose

Runs all structural setup steps in one automated pass — after **one** confirmed draft of all sections, without further approval prompts between the generation steps. Offered only on the instructor's request (see `data/chat-wording.md` → One way to start).

The instructor answers all questions **upfront in a single intake interview**. The agent then creates one `journal.md` containing the `## Course Context`, `## Outline`, `## Didactics`, `## Agenda`, and `## Sessions` sections. Co-authoring (`:coauthor-materials`) starts after the scaffold is complete.

This is the "scaffold mode" — fast-track for instructors who know what they want. Replaces the need to run `:init-course` → `:create-outline` → `:create-didactics` → `:create-agenda` → `:create-session` one by one.

## Inputs

- `templates/journal.md` (skeleton for a new `journal.md`)
- `course-type` (optional command parameter): when given, do not ask the scope question; name it in the draft so the instructor confirms it there

All collected in a single intake interview at the start:

- Course type
- Working title
- Target audience
- Language, tone, person (Sie/Du/you)
- Time commitment (where applicable)
- Abstract (topics, benefits)
- 3–5 learning objectives
- Didactic concept preference (structured/exploratory/project-based/mixed) — derived, shown in the draft
- Instructor persona style — derived, shown in the draft (not asked, Block 3)
- Session Types (format variants of a unit) with the grounding answer
- Difficulty level — derived, shown in the draft (not asked)
- Session count and titles (or leave titles open for auto-generation)
- Agenda required? (for self-paced / single-lesson)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-language.md`, `data/journal-links.md`

## Output

Generated in sequence without interruption inside `journal.md`:
- `journal.md` created from `templates/journal.md` if it does not exist yet
- `## Course Context`
- `## Outline`
- `## Didactics`
- `## Agents` (kept from `templates/journal.md`; Coauthor role, optional specialist customizations, and learner persona container)
- `## Templates` (if template imports are specified)
- `## Agenda` (if applicable)
- `## Sessions` containing the overview (`templates/session-skeleton.yaml` → `section_layout.overview`) followed by one subsection per session
- `## Dashboard` updated in place via `tasks/update-dashboard.md`

## Steps

### Phase 1: Intake Interview

1. Announce scaffold mode:
   > "Scaffold mode started. I will now ask you all the questions at once — afterwards, I will automatically generate the complete course structure. You can adjust everything afterwards."

2. Collect all inputs using structured questions where options are fixed, free text where content is needed:
   - If the skill `creativity` is available (see `data/skills.md`) and the instructor has only a vague idea, offer it once as an exploratory warm-up before the interview — never by default.

   **Rules for all blocks:** reuse what is known (the chat — via `read_chat` when the preview is connected — and `journal.md`) as prefilled assumptions instead of asking again; ask in the instructor's own terms (the teacher questions of `tasks/init-course.md` steps 3, 4 and 6 — scope + how learners work, target group, file structure as a teacher question, terminology, audience override); option labels in the course language, never slugs; follow `data/chat-dialog.md` → Forms.

   **🎛️ Block 1 — Course basics (structured questions, one pass):**
   - Course type: as two teacher questions (scope + how learners work), mapped as in `tasks/init-course.md` step 3
   - Language: prefilled with the language the instructor writes in
   - Tone: formal / informal / conversational
   - Person: Sie / Du / you
   - Instructor Address and Author name, as in `tasks/init-course.md` step 7; contact address optional
   - Special needs of the learners (e.g. dyslexia): as part of the target group — accessibility itself is not asked (`tasks/init-course.md` step 5)

   **💬 Block 2 — Content (free text, discuss if needed):**
   - Working title
   - Target audience
   - Abstract (topics, benefits, application)
   - 3–5 learning objectives

   **🎛️ Block 3 — Didactics (structured questions):**
   - Guiding figure / instructor persona: 💬 who speaks in the material (or "none – a neutral teacher voice"); the persona voice sample is written from it in the draft, never invented without this answer
   - Teaching style and difficulty level are not asked: derive them as `tasks/create-didactics.md` steps 5–6 do and show them in the draft
   - Didactic concept: structured/presenter-driven / exploratory / project-based / mixed
   - Session Types: propose the default formats for the course type exactly as `tasks/create-didactics.md` step 3b does (display names in the course language, each with criterion and required elements, `data/session-types.md`), and ask its grounding question — one concretely planned unit and which format it gets, and why. If the answer fits no proposed type, revise the types before the draft.

   **🎛️ Block 4 — Structure (structured questions):**
   - Agenda needed? (for self-paced / single-lesson): yes / no
   - Session count and length: 💬 ask for exact numbers (how many units, minutes each). Never offer ranges and never compute a middle value; if the instructor gives a range, ask which number to plan with.
   - File structure: teacher question from `tasks/init-course.md` step 6 — not for a single lesson (always single-file, named in the draft)
   - LiaScript templates/imports: 💬 free text (optional; template name, import URL, and intended use)

3. **Draft before saving.** Generate the complete content of every section that Phase 2 will write (Course Context incl. technical choices such as persona type, pacing, file structure; Outline incl. objectives; Didactics incl. framework, method, level; the Coauthor entries derived from it (step 4b); Agenda; session list with titles, durations and core content) and show it in the chat **before** anything is written — one compact block per section in plain course language, technical choices named in plain words. Nothing may be saved that is not in this draft (`data/chat-dialog.md` → "Nothing unseen gets saved").
   - Every number and every unit in the draft must come from the instructor's answers. Mark anything you added yourself as a suggestion ("Suggestion: …") and ask about it; never present it as decided.
   - **Checks before the draft is shown,** as the single tasks run them before their save form: the objectives' fit with the time (`tasks/create-outline.md` step 5 → "Fits the time"), the agenda self-check (`tasks/create-agenda.md` step 6a), and per session sketch "Type and Method first" plus "Self-check before saving" (`tasks/create-session-skeleton.md` step 7). Build their results into the draft and name every adaptation in one line; Phase 2 writes what was confirmed and runs no check that could change it.
   - Then ask "Save" / "Change something" as the single write confirmation (its own form, no content questions in it).

4. If adjustments needed: ask what to change, update the draft, show the changed parts (bold), confirm again.

### Phase 2: Automated Generation

Write exactly the confirmed draft — no additions, no silently filled details. Run each step without approval prompts between steps:

1. If `journal.md` does not exist, instantiate it from `templates/journal.md`: copy the template **1:1, byte for byte** (`cp specs/templates/journal.md journal.md`) — no edits, no added comments. The file is already a valid LiaScript document; its first HTML comment is the LiaScript metadata header (`language:`, `@color` macro, `import: ./specs/dashboard/README.md`) and must remain the first comment. Set `language:` to the course language code. **Language pack first:** if the course language is not English and a language pack exists (`specs/templates/i18n/<code>.json`), run `node specs/dashboard/localize-journal.mjs --lang <code>` right after the copy, before step 2 — the pack replaces lines of the empty template only and also sets `language:`.
2. Replace the content of `journal.md` → `## Course Context` from collected inputs — no sub-headings (rule applies to all sections below as well). Set `__File Structure:__` from the instructor's answer to the file-structure question. Follow the layout of `templates/course-context.yaml` (confirmed summary first, technical keys in `<details>`).
3. Replace the content of `journal.md` → `## Outline`.
4. Replace the content of `journal.md` → `## Didactics` — including the **Persona Voice Sample** bullet and the confirmed Session Types.
4b. Synchronize `journal.md` → `## Agents` → `### Coauthor` exactly as `tasks/create-didactics.md` step 10 does (role, behavior, interaction style, project rules, voice sample; `__Customization Status:__ active`), so later tasks do not fall back to `## Didactics`.
5. If template imports were provided, run `tasks/manage-templates.md` and update `journal.md` → `## Templates`. Leave `* __Template selection:__ open` as it is — `:suggest-templates` after the scaffold makes the selection and recognises the templates documented here.
6. Replace the content of `journal.md` → `## Agenda` (if agenda = no: replace its placeholders with one line in the course language, "No agenda — decided with the course frame", and keep its action line for planning one later).
7. Replace the content of `journal.md` → `## Sessions` with:
   - The overview directly below `## Sessions` as defined in `templates/session-skeleton.yaml` → `section_layout.overview`: one status line per session ("{number}. {title} – planning sketch ✅ · material open", translated — the fixed word for skeleton, `templates/session-skeleton.yaml`) and one table row per session (`| {number} | {title} | {type} | ✅ | ❌ | ❌ | |`, plus the Method column if a method is in use)
   - One `### {number}. {title}` subsection per session below the overview
8. Fill each session subsection using `templates/session-skeleton.yaml`; every unit gets one of the confirmed Session Types (from the agenda, or as planned in the draft). Write it in the Coauthor voice synchronized in step 4b, exactly as confirmed — its self-check ran before the draft (Phase 1 step 3).
8b. Set `language:` in the metadata header to the course language code and the course title to the confirmed working title; if the language is not English, the journal's own texts follow the course language in terminal mode too. With a language pack it already ran in step 1; then only the unit word is left, as `tasks/init-course.md` step 11 says. Without one, apply the journal part of `data/chat-language.md` → "Language before the frame": the course title, the welcome paragraph and its start link, a translated suffix for every fixed `##` / `###` heading (English key first), the one-line notes of unfilled sections and fixed placeholder lines such as the "course check not yet run" line under `## Validation`; headings that name a template keep that name (e.g. `### Dashboard` under `## Templates`), while placeholder values such as "none yet" are translated — except the `__State:__` value under `## Publishing`, an English key (`not published` / `published on …`) read by the dashboard; also the explanatory paragraphs under `## Templates` and `## Agents`, their visible values and boundary lines, and the `<summary>` labels of technical blocks. English stay only keys that tasks read: `__Customization Status:__` (active / inactive), `__State:__`, `Mode:` / `Result:`, and the header rows of technical tables; all line changes in one `localize-journal.mjs` map (`data/chat-language.md` → Language before the frame → Do it fast), never one edit per line and never a rewrite of the file. The chat-only parts of that rule (`lang` for the chat tool, roster labels) apply only with the MCP gate open.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to regenerate the `## Dashboard` JSON data block for `@Dashboard.View`.

After each section is saved, print a brief progress line:
```
✅ journal.md instantiated from templates/journal.md
✅ journal.md → ## Course Context
✅ journal.md → ## Outline
✅ journal.md → ## Didactics
✅ journal.md → ## Agents / Coauthor
✅ journal.md → ## Templates
✅ journal.md → ## Agenda
✅ journal.md → ## Sessions / overview
✅ journal.md → ## Sessions / 1. Session title
✅ journal.md → ## Sessions / 2. Session title
...
✅ journal.md → ## Dashboard (regenerated)
```

### Phase 3: Handoff

> ⚠️ The summary below is **chat output only** — never write it into `journal.md`.
> The journal's `## Dashboard` section is maintained exclusively by `tasks/update-dashboard.md` (already run in Phase 2, step 9).

1. Print completion summary:
   > "Scaffold completed. `journal.md` updated with [N] sections/entries. [One sentence in plain words on how the course is split into files, as answered in Block 4.]"
   >
   > | Section      | Status            |
   > |--------------|-------------------|
   > | Course Context | ✅              |
   > | Outline        | ✅              |
   > | Didactics      | ✅              |
   > | Coauthor       | ✅ active       |
   > | Templates      | ✅ / skipped    |
   > | Agenda         | ✅ / skipped    |
   > | Sessions       | ✅ overview + [N] subsections |
   >
   > "Next step: `:coauthor-materials 1` to start with Session 1."

2. 🎛️ If no `.mcp.json` exists in the project root and the MCP gate is closed (see `data/agent-links.md`), offer the live dashboard once (single choice):
   1. **Yes** — read `templates/mcp.json` and write it as `.mcp.json` with the file-write tool (no shell copy). Then explain: requires the LiaScript DevServer (`npm install -g @liascript/devserver`); restart the agent (Claude Code: `claude --dangerously-load-development-channels server:liascript`) so `journal.md` opens in the browser with clickable actions.
   2. **No / later** — continue in the terminal; links in `journal.md` stay readable as commands.
3. Offer a note save:
   > "Should I save the course structure decisions as a Decision Note? (`:save-decision course-structure`)"

## Escalation Rules

- If a required input is missing: **pause and ask** — do not guess, do not average ranges, do not add units or stations.
- Promises made in the chat after saving (e.g. "I will plan for X") must be written to the journal (Additional Notes or the matching section) in the same step, or not made.
- Provenance comments (`<!--- Filled by … --->`) name the task that actually wrote the section (`:scaffold`).
- If a single-lesson gets more than one unit, ask whether it is really a single lesson; if the session count is above 20, flag it and ask to confirm before continuing.
- If course type is `improve-existing`: redirect to `:init-course` instead — `:analyze-existing` needs the Course Context that `:init-course` writes first.

## Notes

- Scaffold mode does NOT run `:promote-session` or `:coauthor-materials` — those remain interactive.
- All generated `journal.md` sections are drafts. The instructor reviews and refines them during co-authoring.
- The Persona Voice Sample in `journal.md` → `## Didactics` is especially important — it anchors tone for all future co-authoring sessions.
