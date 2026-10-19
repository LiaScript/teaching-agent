# Task: scaffold-course

## Purpose

Runs all structural setup steps in one automated pass — after **one** confirmed draft of all sections, without further approval prompts between the generation steps. Offered only on the instructor's request (see `data/agent-links.md` → One way to start).

The instructor answers all questions **upfront in a single intake interview**. The agent then creates one `journal.md` containing the `## Course Context`, `## Outline`, `## Didactics`, `## Agenda`, and `## Sessions` sections. Co-authoring (`:coauthor-materials`) starts after the scaffold is complete.

This is the "scaffold mode" — fast-track for instructors who know what they want. Replaces the need to run `:init-course` → `:create-outline` → `:create-didactics` → `:create-agenda` → `:create-session` one by one.

## Inputs

- `templates/journal.md` (skeleton for a new `journal.md`)

All collected in a single intake interview at the start:

- Course type
- Working title
- Target audience
- Language, tone, person (Sie/Du/you)
- Accessibility requirements
- Time commitment (where applicable)
- Abstract (topics, benefits)
- 3–5 learning objectives
- Didactic concept preference (structured/exploratory/project-based/mixed)
- Instructor persona style (humorous/academic/practical/conversational)
- Session Types (format variants of a unit) with the grounding answer
- Difficulty level
- Session count and titles (or leave titles open for auto-generation)
- Agenda required? (for self-paced / single-lesson)

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

   **Rules for all blocks:** reuse what is known (chat via `read_chat`, `journal.md`) as prefilled assumptions instead of asking again; ask in the instructor's own terms (the teacher questions of `tasks/init-course.md` steps 3, 4 and 6 — scope + how learners work, target group, file structure as a teacher question, terminology, audience override); option labels in the course language, never slugs; follow `data/agent-links.md` → Chat Conduct → Forms.

   **🎛️ Block 1 — Course basics (structured questions, one pass):**
   - Course type: as two teacher questions (scope + how learners work), mapped as in `tasks/init-course.md` step 3
   - Language: prefilled with the language the instructor writes in
   - Tone: formal / informal / conversational
   - Person: Sie / Du / you
   - Accessibility: required / optional / not needed

   **💬 Block 2 — Content (free text, discuss if needed):**
   - Working title
   - Target audience
   - Abstract (topics, benefits, application)
   - 3–5 learning objectives

   **🎛️ Block 3 — Didactics (structured questions):**
   - Teaching style: humorous / academic / practical / conversational / mixed
   - Difficulty level: beginner / intermediate / advanced
   - Didactic concept: structured/presenter-driven / exploratory / project-based / mixed
   - Session Types: propose the default formats for the course type exactly as `tasks/create-didactics.md` step 3b does (display names in the course language, each with criterion and required elements, `data/session-types.md`), and ask its grounding question — one concretely planned unit and which format it gets, and why. If the answer fits no proposed type, revise the types before the draft.

   **🎛️ Block 4 — Structure (structured questions):**
   - Agenda needed? (for self-paced / single-lesson): yes / no
   - Session count and length: 💬 ask for exact numbers (how many units, minutes each). Never offer ranges and never compute a middle value; if the instructor gives a range, ask which number to plan with.
   - File structure: teacher question from `tasks/init-course.md` step 6
   - LiaScript templates/imports: 💬 free text (optional; template name, import URL, and intended use)

3. **Draft before saving.** Generate the complete content of every section that Phase 2 will write (Course Context incl. technical choices such as persona type, pacing, file structure; Outline incl. objectives; Didactics incl. framework, method, level; the Coauthor entries derived from it (step 4b); Agenda; session list with titles, durations and core content) and show it in the chat **before** anything is written — one compact block per section in plain course language, technical choices named in plain words. Nothing may be saved that is not in this draft (`data/agent-links.md` → "Nothing unseen gets saved").
   - Every number and every unit in the draft must come from the instructor's answers. Mark anything you added yourself as a suggestion ("Suggestion: …") and ask about it; never present it as decided.
   - Then ask "Save" / "Change something" as the single write confirmation (its own form, no content questions in it).

4. If adjustments needed: ask what to change, update the draft, show the changed parts (bold), confirm again.

### Phase 2: Automated Generation

Write exactly the confirmed draft — no additions, no silently filled details. Run each step without approval prompts between steps:

1. If `journal.md` does not exist, instantiate it from `templates/journal.md`: copy the template **1:1, byte for byte** — no edits, no added comments. The file is already a valid LiaScript document; its first HTML comment is the LiaScript metadata header (`language:`, `@color` macro, `import: ./specs/dashboard/README.md`) and must remain the first comment. Set `language:` to the course language code.
2. Replace the content of `journal.md` → `## Course Context` from collected inputs — **flat** `* __Label:__` bullets only, no sub-headings (rule applies to all sections below as well). Set `__File Structure:__` from the instructor's answer to the file-structure question. Follow the layout of `templates/course-context.yaml` (confirmed summary first, technical keys in `<details>`).
3. Replace the content of `journal.md` → `## Outline`.
4. Replace the content of `journal.md` → `## Didactics` — including the **Persona Voice Sample** bullet and the confirmed Session Types.
4b. Synchronize `journal.md` → `## Agents` → `### Coauthor` exactly as `tasks/create-didactics.md` step 10 does (role, behavior, interaction style, project rules, voice sample; `__Customization Status:__ active`), so later tasks do not fall back to `## Didactics`.
5. If template imports were provided, run `tasks/manage-templates.md` and update `journal.md` → `## Templates`.
6. Replace the content of `journal.md` → `## Agenda` (skip if agenda = no).
7. Replace the content of `journal.md` → `## Sessions` with:
   - The overview directly below `## Sessions` as defined in `templates/session-skeleton.yaml` → `section_layout.overview`: one status line per session ("{number}. {title} – skeleton ✅ · material open", translated) and one table row per session (`| {number} | {title} | {type} | ✅ | ❌ | ❌ | |`, plus the Method column if a method is in use)
   - One `### {number}. {title}` subsection per session below the overview
8. Fill each session subsection using `templates/session-skeleton.yaml`; every unit gets one of the confirmed Session Types (from the agenda, or as planned in the draft).
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
   > "Next step: `:coauthor-materials` to start with Session 1."

2. 🎛️ If no `.mcp.json` exists in the project root and the MCP gate is closed (see `data/agent-links.md`), offer the live dashboard once (single choice):
   1. **Yes** — copy `templates/mcp.json` to `.mcp.json`. Then explain: requires the LiaScript DevServer (`npm install -g @liascript/devserver`); restart the agent (Claude Code: `claude --dangerously-load-development-channels server:liascript`) so `journal.md` opens in the browser with clickable actions.
   2. **No / later** — continue in the terminal; links in `journal.md` stay readable as commands.
3. Offer a note save:
   > "Should I save the course structure decisions as a Decision Note? (`:save-decision course-structure`)"

## Escalation Rules

- If a required input is missing: **pause and ask** — do not guess, do not average ranges, do not add units or stations.
- Promises made in the chat after saving (e.g. "I will plan for X") must be written to the journal (Additional Notes or the matching section) in the same step, or not made.
- Provenance notes (`_Filled by …_`) name the task that actually wrote the section (`:scaffold`).
- If a single-lesson gets more than one unit, ask whether it is really a single lesson; if the session count is above 20, flag it and ask to confirm before continuing.
- If course type is `improve-existing`: redirect to `:init-course` instead — `:analyze-existing` needs the Course Context that `:init-course` writes first.

## Notes

- Scaffold mode does NOT run `:promote-session` or `:coauthor-materials` — those remain interactive.
- All generated `journal.md` sections are drafts. The instructor reviews and refines them during co-authoring.
- The Persona Voice Sample in `journal.md` → `## Didactics` is especially important — it anchors tone for all future co-authoring sessions.
