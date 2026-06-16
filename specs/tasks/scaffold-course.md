# Task: scaffold-course

## Purpose

Runs all structural setup steps in one automated pass — without stopping for approval after each step.

The instructor answers all questions **upfront in a single intake interview**. The agent then creates one `journal.md` containing the `## Course Context`, `## Outline`, `## Didactics`, `## Agenda`, and `## Sessions` sections. Co-authoring (`/coauthor-materials`) starts after the scaffold is complete.

This is the "scaffold mode" — fast-track for instructors who know what they want. Replaces the need to run `/init-course` → `/create-outline` → `/create-didactics` → `/create-agenda` → `/create-session` one by one.

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
- `## Sessions` containing an overview table followed by one subsection per session
- `## Dashboard` updated in place via `tasks/update-dashboard.md`

## Steps

### Phase 1: Intake Interview

1. Announce scaffold mode:
   > "Scaffold mode started. I will now ask you all the questions at once — afterwards, I will automatically generate the complete course structure. You can adjust everything afterwards."

2. Collect all inputs using structured questions where options are fixed, free text where content is needed:

   **🎛️ Block 1 — Course basics (structured questions, one pass):**
   - Course type: lecture-series / self-paced / workshop / single-lesson
   - Language: de / en / other (+ free text if other)
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

   **🎛️ Block 4 — Structure (structured questions):**
   - Agenda needed? (for self-paced / single-lesson): yes / no
   - Session approach after scaffold: iterative (one at a time) / batch (all at once)
   - Session count: 💬 free text (number + optional titles, or leave for auto-generation)
   - LiaScript templates/imports: 💬 free text (optional; template name, import URL, and intended use)

3. Present a **summary of all inputs** and ask for confirmation:
   > "Summary: [display all inputs]. Should I generate the structure now? (Yes / Adjust)"

4. If adjustments needed: ask which block to revise, update, confirm again.

### Phase 2: Automated Generation

Run each step silently (no approval prompts between steps):

1. If `journal.md` does not exist, instantiate it from `templates/journal.md`: copy the template **1:1, byte for byte** — no edits, no added comments. The file is already a valid LiaScript document; its first HTML comment is the LiaScript metadata header (`@style`, imports) and must remain the first comment.
2. Replace the content of `journal.md` → `## Course Context` from collected inputs — **flat** `* __Label:__` bullets only, no sub-headings (rule applies to all sections below as well).
3. Replace the content of `journal.md` → `## Outline`.
4. Replace the content of `journal.md` → `## Didactics` — including the **Persona Voice Sample** bullet.
5. If template imports were provided, run `tasks/manage-templates.md` and update `journal.md` → `## Templates`.
6. Replace the content of `journal.md` → `## Agenda` (skip if agenda = no).
7. Replace the content of `journal.md` → `## Sessions` with:
   - An overview table directly below `## Sessions`
   - One row per session: `| {number} | {title} | {type} | ✅ | ❌ | ❌ | |`
   - One `### {number}. {title}` subsection per session below the overview table
8. Fill each session subsection using `templates/session-skeleton.yaml`.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update the `## Dashboard` HTML shell in place (current step, next commands, quality state, session progress, workflow map states, date).

After each section is saved, print a brief progress line:
```
✅ journal.md instantiated from templates/journal.md
✅ journal.md → ## Course Context
✅ journal.md → ## Outline
✅ journal.md → ## Didactics
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

7. Print completion summary:
   > "Scaffold completed. `journal.md` updated with [N] sections/entries."
   >
   > | Section      | Status            |
   > |--------------|-------------------|
   > | Course Context | ✅              |
   > | Outline        | ✅              |
   > | Didactics      | ✅              |
   > | Templates      | ✅ / skipped    |
   > | Agenda         | ✅ / skipped    |
   > | Sessions       | ✅ overview + [N] subsections |
   >
   > "Next step: `/coauthor-materials` to start with Session 1."

8. Offer a note save:
   > "Should I save the course structure decisions as a Decision Note? (`/save-decision course-structure`)"

## Escalation Rules

- If a required input is missing and cannot be reasonably inferred: **pause and ask** — do not guess.
- If the session count is unusually high (>12 for a single-lesson or >20 overall): flag it and ask to confirm before continuing.
- If course type is `improve-existing`: redirect to `/analyze-existing` instead.

## Notes

- Scaffold mode does NOT run `/promote-session` or `/coauthor-materials` — those remain interactive.
- All generated `journal.md` sections are drafts. The instructor reviews and refines them during co-authoring.
- The Persona Voice Sample in `journal.md` → `## Didactics` is especially important — it anchors tone for all future co-authoring sessions.
