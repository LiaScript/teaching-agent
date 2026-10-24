# Task: quick-fix

## Purpose

Fast, focused correction of a single well-defined issue in an existing material file, without running a full co-authoring session.

**Change path after a check:** every change to a unit that already has a validation report — also changes asked for in the chat or after `:try-as-learner` — follows this task: full new wording shown → save confirmation → mini-validation of the changed area (`tasks/validate-syntax.md` scoped to the changed block, persona and figure rules from `## Didactics`, `node specs/dashboard/check-material.mjs <material file>` when a browser is available (if the script reports "no installed Playwright found" or "has no browser of its own", offer the install once per conversation as `data/chat-checks.md` → Offering the Rendered Check says) — without one, say so in the dated line; the mini-check then rests on `validate-syntax` and the next `:validate-course`) → a dated line in the report's block "Changed after the check" (date · page title · change · how it was checked: mini-check, measured at {window}, or looked at by the instructor — `templates/session-validation.yaml`; a layout claim only as measured, `data/chat-checks.md` → Say how you checked); a fully fixed point leaves "Still missing", a partly fixed one stays there with what is still open, and the outcome line gets " – {n} point(s) changed since – short re-check open" (translated; explained where the instructor first meets it, `templates/session-validation.yaml` → `outcome_words`); a FAIL outcome then counts the points still open ("correction needed: {open} of {n} points open", "all {n} points corrected" once none is open, "the point corrected" for a single one — never the original count alone), and the line "usable with learners now" follows the fix → derive the unit state again (`tasks/update-dashboard.md` step 3; never hand-edit the dashboard data).

**One journal write per fix:** every journal line the fix touches — report lines, status line, Notes cell, image entries, and every line that still names the fixed item as open (unit summary, step `next`, an image entry's `__To do:__`) — goes into one replacement map (`node specs/dashboard/localize-journal.mjs <map.json>`); remove or update those lines, never leave a done to-do standing. **Find them first:** before the map is written, search the unit entry and its report with `node specs/dashboard/find.mjs` for the page title, the changed item and its old wording, and put every sentence that names the changed item or contradicts the change (summary, content, "What works", "Still missing", the Notes cell) into the same map. **The Notes cell states the state, not a list of changes:** "{outcome} – {n} point(s) changed since – short re-check open" (translated) — the same words and number as the report's outcome line, and the same wording in the unit's status line and `statusLabel` (one wording per state; `validate-journal.mjs` compares them) — plus other open state such as "images {n} of {m}". The overview is written last (`tasks/update-dashboard.md`), never before the journal lines it describes. Every change after a check makes the unit "short re-check open" (`review`, `next` = the short re-check, `tasks/validate-course.md` → Short re-check). Publishing metadata in the header (`email:`, `version:`) set by `:create-project` / `:update-project` is not a content change and does not reopen a check.

**Approval after a review:** when the fix comes from the instructor's own review of material that is not approved yet (its material step is not `done`, e.g. a draft from `:build-session`), end the task — after the mini-validation and the overview update — with one form: "Is {unit} {n} fine like this now?" (translated, with the unit word) and the choices "Approve" and "Change something" (translated). Only "Approve" records the approval — a dated entry `- **{date}:** material approved` (translated) in the session's decisions list, one write — and makes the material step `done` (`tasks/update-dashboard.md` step 3); "Change something" continues with the next fix. Never infer an approval from a fix or from praise for a single page; an unasked "fine like this" for the whole unit brings this form at once (one click on "Approve") — never a silent entry. Not when called from `:build-session` (no instructor review there).

Minimal overhead for small, targeted changes (typos, broken syntax, swapping one example, fixing a quiz answer, correcting a link).

## Inputs

- `number`: session number
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- `description`: what to fix (brief, e.g., "Typo in section 3", "Fix quiz syntax in slide 5", "Replace example for learning objective 2")
- The material document to change — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode
- `journal.md` → `## Course Context` — for conventions and terminology
- `tasks/validate-syntax.md` — for syntax mini-validation if the fix involves LiaScript (single source of truth for syntax rules)
- When the fix writes learner text: `data/liascript-cheat-sheet.md` → "Quizzes for young learners / self-checks" and "Controls as learners see them", read completely
- After a check: `templates/session-validation.yaml` (block "Changed after the check", outcome words) and `templates/session-skeleton.yaml` (status words), read completely
- `tasks/update-dashboard.md` and `templates/project-dashboard.yaml` — read right before the overview is written
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- Updated material document (single targeted change only)
- Short inline confirmation of what was changed and PASS/FAIL of mini-validation

## Steps

**Called from `:build-session`** (mechanical items only): skip the scope confirmation of step 1 and the save confirmation of step 2a — the start confirmation of `:build-session` covers them — and return the change (page title, before → after) to the caller for its closing summary. The change path after a check ("Changed after the check", the outcome suffix) does not apply there: the run writes its report once per iteration after its fixes (`tasks/build-session.md` step c). Escalation (step 5) still stops the caller.

**Called from `:validate-course`** (fix during the check, `tasks/validate-course.md` step 4b, or a round of its course-mode loop): the check's one confirmation of the listed fixes is the scope and save confirmation — skip steps 1 and 2a.

1. **Scope confirmation:** State what will be changed and the acceptance criterion:
   - "I will [describe the change] in [material document]. The change is complete when [condition]. Correct? (Yes / Adjust scope)"

2. **Prepare the targeted change only** — no refactoring, no adjacent edits, no style improvements beyond the stated fix. Nothing is written yet.
   - New or changed learner text follows the current patterns of `data/liascript-cheat-sheet.md` (hints read aloud where `narrator:` is set, controls named as the page shows them). If a pattern is not applied because a decision is still open, say so in the form of step 2a and offer both variants in the same form. A writing rule for every unit is a course decision (rules for writing the material, `:save-decision`), never an open point of one unit. A pattern the instructor reports in one unit (e.g. answer options that give the answer away) is searched in every unit and proposed as such a rule.

2a. **Show and confirm:** show the full new wording of every changed passage — page title, before → after, never only a description of the change — and ask "Save" / "Change something" (translated). This is the single write confirmation of this task; "Change something" returns to step 2.

2b. **Save** after "Save": the material in one write; the journal lines in one map ("One journal write per fix" above).

3. **Mini-validation of the affected section:**
   - Run `tasks/validate-syntax.md` scoped to the changed area — do not restate syntax rules here.
   - If the skill `liascript-syntax` is available (see `data/skills.md`), consult it when the fix touches a construct the cheat sheet does not cover.
   - Persona/tone consistent with `journal.md` → `## Didactics`?
   - No unintended regression in surrounding content?

4. **Report result:**
   - ✅ "Fix applied and validated — done."
   - ⚠️ "The problem is larger than expected: [describe]. Should I open `:coauthor-materials {number}`?"
   - If the fix changed session state (e.g., a Notes entry in the `## Sessions` overview table): run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

5. **Escalate if scope grows:** If the fix reveals structural issues or multiple sections need rework, stop and escalate to `:coauthor-materials` — do NOT proceed silently.

**Loop:** After applying a fix, re-check the specific issue (step 3). If still unresolved, repeat once more — max 2 attempts total. If the second attempt also reveals structural issues or doesn't resolve cleanly, stop and escalate to `:coauthor-materials` per step 5 — do not attempt a third fix. See `CLAUDE.md` → "Iteration Pattern" for the general convention.

---

## When to use vs. :coauthor-materials

| Situation                            | Use                   |
| ------------------------------------ | --------------------- |
| Single typo or broken syntax         | `:quick-fix`          |
| Wrong link or missing alt text       | `:quick-fix`          |
| Swap one example or code snippet     | `:quick-fix`          |
| Fix one quiz answer                  | `:quick-fix`          |
| Reword answer options or gap cards so that none gives the answer away (same task, same correct answer) | `:quick-fix` |
| Multiple sections need rework        | `:coauthor-materials` |
| Learning objective not covered       | `:coauthor-materials` |
| Structural or content change         | `:coauthor-materials` |
| Change a task's type (e.g. tapping → dragging), add or remove a task, or depart from the saved planning sketch — also when a check asks for it | `:coauthor-materials` (inside `:build-session`: ask the instructor first, `tasks/build-session.md` step 1d) |
| Persona tone inconsistent throughout | `:coauthor-materials` |
