# Checklist: Course Quality

> **Usage note:** Read `journal.md` → `## Course Context` first. Skip any check marked `[condition]` if the condition does not apply to this course type.
>
> **Tags:** `[mechanical]` = verifiable from structure/presence/syntax, no content judgment needed — safe for the automated loop in `tasks/validate-course.md` → "Iteration (mechanical checks only)". `[pedagogical]` = needs content/didactic judgment — always escalated to the instructor, never auto-fixed in a loop. `[advisory]` = computed mechanically, but only a hint for a human judgment — recorded in the report, never ❌, never part of the automated loop and never a reason for FAIL or "PASS with concerns".

## Context

- [ ] [mechanical] `journal.md` → `## Course Context` exists
- [ ] [mechanical] Course type defined
- [ ] [mechanical] Terminology set (sessions-called)
- [ ] [mechanical] Language & tone conventions set
- [ ] [mechanical] Agenda flag correct (yes / no / optional)
- [ ] [mechanical] Person (Sie / Du / you) set
- [ ] [mechanical] File Structure mode declared (`single-file` / `multi-file`) and matches the actual materials layout on disk (see `data/file-structure-modes.md`)

## Outline

- [ ] [mechanical] Title present
- [ ] [pedagogical] Target audience clearly defined
- [ ] [mechanical] Time commitment specified `[lecture-series, workshop]`
- [ ] [mechanical] Time commitment present or estimated `[self-paced]`
- [ ] [pedagogical] Abstract complete (topics, benefits, application)
- [ ] [pedagogical] 3–5 learning objectives formulated, measurable (verb + context)

## Didactics

- [ ] [pedagogical] Refers to outline
- [ ] [pedagogical] Didactic concept clear
- [ ] [mechanical] Instructor persona defined (background, role, style)
- [ ] [mechanical] Style & difficulty level specified
- [ ] [mechanical] Course type consistent with `journal.md` → `## Course Context`
- [ ] [mechanical] Session Types defined, each with slug, criterion, and required-elements checklist (see `data/session-types.md`)
- [ ] [mechanical] Didactic Framework and Default Session Method declared (the latter may explicitly be `none`) — see `data/didactic-methods.md`

## Templates `[only if a template or a brief is documented in ## Templates or a material uses a template macro — an empty template section or the selection line alone does not count]`

- [ ] [mechanical] `journal.md` → `## Templates` exists
- [ ] [mechanical] Every template in `## Templates` has a matching `import:` line in the main metadata header — briefs `### {id} (in development)` are exempt
- [ ] [mechanical] Every material using a template macro has the matching `import:` line in its own metadata header (a multi-file material imports a local template as `../../lia-templates/{id}/README.md`; that counts as matching)
- [ ] [mechanical] Publishing gate: no brief `### {id} (in development)` whose `__Used in:__` names a unit — that unit waits for the template's adoption
- [ ] [mechanical] Publishing gate: no `import:` line of a published document points to a path the course project's `.gitignore` excludes — the material headers (single-file: the root `README.md`); the journal header only when `journal.md` itself is published
- [ ] [mechanical] Template usage examples and constraints are documented in `## Templates`
- [ ] [mechanical] Community discovery link included: https://github.com/topics/liascript-template

## Agents

- [ ] [mechanical] `journal.md` → `## Agents` exists
- [ ] [mechanical] Coauthor role, if used, is stored directly under `## Agents` → `### Coauthor`; specialist customizations, if used, are stored only in their matching direct `### {Agent}` subsection
- [ ] [mechanical] Learner personas, if used, are stored under `## Agents` → `### Learner Personas`
- [ ] [mechanical] No legacy top-level `## Learner Personas` section remains

## Agenda `[if journal.md → ## Agenda has content, or the agenda flag is yes]`

- [ ] [mechanical] All sessions have: title, duration, type, learning objective (the summary of a unit lives in its skeleton under `## Sessions`)
- [ ] [pedagogical] Session learning objectives align with `journal.md` → `## Outline` learning objectives
- [ ] [mechanical] Materials file reference present per session

## Session Progress (`journal.md` → `## Sessions`)

- [ ] [mechanical] `journal.md` → `## Sessions` exists
- [ ] [mechanical] Overview appears directly below `## Sessions` — status list, then the technical table in `<details>` (`templates/session-skeleton.yaml` → `section_layout.overview`); every status line matches its table row
- [ ] [mechanical] All expected sessions have a row in the overview table
- [ ] [mechanical] No session marked ✅ Skeleton without a matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- [ ] [mechanical] No session marked ✅ Material without its material document present (`materials/{number}-{slug}/README.md` in multi-file mode, or a matching `##` chapter in root `README.md` in single-file mode)
- [ ] [mechanical] All sessions marked ✅ Done before publishing

## Session Subsections (`journal.md` → `## Sessions`)

- [ ] [mechanical] Exist for all sessions
- [ ] [mechanical] All mandatory fields present (heading/title, type, summary, content, activities, references)
- [ ] [mechanical] Activities are numbered lists
- [ ] [mechanical] References are numbered lists
- [ ] [mechanical] Summary and content of the unit entry describe the material as it is now: no to-dos, no remarks about single images or points fixed since (`templates/session-skeleton.yaml` → summary note) — offered as a fix during the check (`tasks/validate-course.md` → session mode step 4b)

## Session Materials

- [ ] [mechanical] Every unit with a skeleton has its material document (written together or prepared)
- [ ] [mechanical] Outline with subchapters present
- [ ] [pedagogical] References included per section where claims are made
- [ ] [pedagogical] Every factual statement is correct at the stated level of simplification and traceable to a listed reference; no frightening or absolute claims without a source — in the material and in the unit's journal entry (summary, content)
- [ ] [mechanical] Quizzes follow `data/liascript-cheat-sheet.md` → Quizzes for young learners where the target group needs it (no visible "show solution" button before the first try)
- [ ] [pedagogical] Didactic inputs from `journal.md` → `## Didactics` reflected (methods, learning phases)
- [ ] [pedagogical] Learning objectives of each session (`data/session-types.md` → "Objectives and duration of a session") addressed in content
- [ ] [pedagogical] Self-check uses different examples, pictures or wording than the practice tasks (tests understanding, not recognition)
- [ ] [pedagogical] A closing proof or reward is reachable only after solving the tasks, or the material says how the instructor checks it; praise does not appear after "show solution"
- [ ] [pedagogical] Question texts, answer options *and* hint texts can be read aloud where the target group needs it (`{|>}{…}` works in a hint line, `data/liascript-cheat-sheet.md` → Quizzes for young learners)
- [ ] [pedagogical] Matrix/table quizzes have at most 3 short columns (one or two words each) or are split into single-choice questions, so the options fit a narrow screen
- [ ] [pedagogical] Every quiz is solvable: no two options with the same text, exactly the intended options marked correct; a question whose stem or options depend on a missing image is not solvable until the image is in (deferred with the image step, never "ready")
- [ ] [mechanical] No answer-pattern warning of `node specs/dashboard/check-material.mjs` (its "Answer patterns" line): the correct option is not clearly the longest, not built differently from all others, not at the same position in 3 or more questions in a row; no gap card carries an article or a capital that tells its gap; no gap sentence stands a second time as its own line — fixed by rewording options or cards (same task, same correct answer, `tasks/quick-fix.md`)
- [ ] [pedagogical] Distractors give no other surface cue the script cannot see: every option has the same subject and grammatical form and is plausible for the target group, so that only understanding finds the answer (`data/liascript-cheat-sheet.md` → No surface cues)
- [ ] [pedagogical] Every learner text that names something visible in a picture (colour, number, position, a detail) matches the picture (its alt text, or the photo as looked at); no text refers to a picture that is not there (a spot without image)
- [ ] [pedagogical] Image markers, alt texts, captions and image-credit lines of a question or its options never name the answer term — they describe what is visible; notes for the instructor stand only in authoring comments `<!--- … --->`
- [ ] [mechanical] Every inserted photo from a free collection has its credit line in the credits chapter of the material: what it shows, author, licence with link, file page (`validate-journal.mjs` warns when one is missing; `tasks/create-image.md` → Free photos step 6).
- [ ] [pedagogical] All image options of a question are visible together on the learners' device — ✅ only when measured (the check script's viewport report at that device's window size) or looked at there by the instructor; measured and not fitting → ❌; not measured → say so ("not measured") and add a preparation item to look at it on the learners' device. The display limit and thumbnail width themselves are the `[mechanical]` media check of `tasks/validate-syntax.md` (item 7): one fact, one tag — a missing limit is reported only there.
- [ ] [mechanical] Every link and image target has `(`, `)` and spaces percent-encoded (`%28`, `%29`, `%20`) — in the material and in the journal's image entries
- [ ] [pedagogical] Hints and instructions never point to positions ("above", "below") across slides; they name the page title
- [ ] [pedagogical] Every control named in a learner text (read aloud, hint, check) exists on that page and is named by its visible symbol or label (`data/liascript-cheat-sheet.md` → Controls as learners see them) — never a "speaker" for the play triangle ▶
- [ ] [mechanical] Each session's content satisfies its declared Session Type's `Required` checklist from `## Didactics` → `__Session Types:__` — met only by this unit's own material (another unit counts only with a recorded decision, `tasks/validate-course.md` → session mode step 4)
- [ ] [mechanical] Each session's content satisfies its declared Session Method's `Required` checklist from `data/didactic-methods.md`, independently of the Session Type check above, met only by this unit's own material as well `[if a session method is set — i.e. journal.md → ## Didactics → __Default Session Method:__ is not "none"]`
- [ ] [advisory] Estimated duration per `data/duration-heuristic.md` (reading time + activity time) is within 70%–150% of the declared duration (`data/session-types.md` → "Objectives and duration of a session") — a deviation is a hint for the instructor, never a fail

## LiaScript Syntax (per material file)

- [ ] [mechanical] All checks in `tasks/validate-syntax.md` pass (see that task's report for the full rule set — not duplicated here)

## Overall Consistency

- [ ] [mechanical] Terminology from `journal.md` → `## Course Context` used consistently throughout project memory and materials
- [ ] [pedagogical] Instructor persona tone consistent across all materials
- [ ] [pedagogical] Learning objectives from `journal.md` → `## Outline` traceable into the materials (through `## Agenda` if there is one)
- [ ] [pedagogical] Context ↔ Outline ↔ Didactics ↔ Agenda ↔ Sessions consistent
- [ ] [mechanical] Numbering correct, no gaps
