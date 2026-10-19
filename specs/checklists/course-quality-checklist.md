# Checklist: Course Quality

> **Usage note:** Read `journal.md` → `## Course Context` first. Skip any check marked `[condition]` if the condition does not apply to this course type.
>
> **Tags:** `[mechanical]` = verifiable from structure/presence/syntax, no content judgment needed — safe for the automated loop in `tasks/validate-course.md` → "Iteration (mechanical checks only)". `[pedagogical]` = needs content/didactic judgment — always escalated to the instructor, never auto-fixed in a loop. `[advisory]` = computed mechanically, but only a hint for a human judgment — recorded in the report, never ❌, never part of the automated loop and never a reason for FAIL or "PASS with concerns".

## Context

- [ ] [mechanical] `journal.md` → `## Course Context` exists
- [ ] [mechanical] Course type defined
- [ ] [mechanical] Terminology set (sessions-called, lectures-called)
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
- [ ] [mechanical] Optional: Logo prompt

## Didactics

- [ ] [pedagogical] Refers to outline
- [ ] [pedagogical] Didactic concept clear
- [ ] [mechanical] Instructor persona defined (background, role, style)
- [ ] [mechanical] Style & difficulty level specified
- [ ] [mechanical] Course type consistent with `journal.md` → `## Course Context`
- [ ] [mechanical] Session Types defined, each with slug, criterion, and required-elements checklist (see `data/session-types.md`)
- [ ] [mechanical] Didactic Framework and Default Session Method declared (the latter may explicitly be `none`) — see `data/didactic-methods.md`

## Templates `[if template imports or template macros are used]`

- [ ] [mechanical] `journal.md` → `## Templates` exists
- [ ] [mechanical] Every template in `## Templates` has a matching `import:` line in the main metadata header
- [ ] [mechanical] Every material using a template macro has the matching `import:` line in its own metadata header
- [ ] [mechanical] Template usage examples and constraints are documented in `## Templates`
- [ ] [mechanical] Community discovery link included: https://github.com/topics/liascript-template

## Agents

- [ ] [mechanical] `journal.md` → `## Agents` exists
- [ ] [mechanical] Coauthor role, if used, is stored directly under `## Agents` → `### Coauthor`; specialist customizations, if used, are stored only in their matching direct `### {Agent}` subsection
- [ ] [mechanical] Learner personas, if used, are stored under `## Agents` → `### Learner Personas`
- [ ] [mechanical] No legacy top-level `## Learner Personas` section remains

## Agenda `[if agenda flag = yes in journal.md → ## Course Context]`

- [ ] [mechanical] All sessions have: title, duration, type, learning objective, summary
- [ ] [pedagogical] Session learning objectives align with `journal.md` → `## Outline` learning objectives
- [ ] [mechanical] Materials file reference present per session

## Session Progress (`journal.md` → `## Sessions`)

- [ ] [mechanical] `journal.md` → `## Sessions` exists `[not single-lesson]`
- [ ] [mechanical] Overview table appears directly below `## Sessions`
- [ ] [mechanical] All expected sessions have a row in the overview table
- [ ] [mechanical] No session marked ✅ Skeleton without a matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- [ ] [mechanical] No session marked ✅ Material without its material document present (`materials/{number}-{slug}/README.md` in multi-file mode, or a matching `##` chapter in root `README.md` in single-file mode)
- [ ] [mechanical] All sessions marked ✅ Done before publishing

## Session Subsections (`journal.md` → `## Sessions`)

- [ ] [mechanical] Exist for all sessions
- [ ] [mechanical] All mandatory fields present (heading/title, type, summary, content, activities, references)
- [ ] [mechanical] Activities are numbered lists
- [ ] [mechanical] References are numbered lists

## Session Materials

- [ ] [mechanical] All skeletons promoted to materials
- [ ] [mechanical] Outline with subchapters present
- [ ] [pedagogical] References included per section where claims are made
- [ ] [pedagogical] Every factual statement is correct at the stated level of simplification and traceable to a listed reference; no frightening or absolute claims without a source
- [ ] [mechanical] Quizzes follow `data/liascript-cheat-sheet.md` → Quizzes for young learners where the target group needs it (no visible "show solution" button before the first try)
- [ ] [pedagogical] Didactic inputs from `journal.md` → `## Didactics` reflected (methods, learning phases)
- [ ] [pedagogical] Learning objectives from `journal.md` → `## Agenda` addressed in content
- [ ] [pedagogical] Self-check uses different examples, pictures or wording than the practice tasks (tests understanding, not recognition)
- [ ] [pedagogical] A closing proof or reward is reachable only after solving the tasks, or the material says how the instructor checks it; praise does not appear after "show solution"
- [ ] [pedagogical] Question texts *and* answer options can be read aloud where the target group needs it
- [ ] [pedagogical] Matrix/table quizzes have short column headers (one or two words) or are transposed so the options fit a narrow screen
- [ ] [pedagogical] Hints and instructions never point to positions ("above", "below") across slides; they name the page title
- [ ] [mechanical] Each session's content satisfies its declared Session Type's `Erforderlich` checklist from `## Didactics` → `__Session Types:__`
- [ ] [mechanical] Each session's content satisfies its declared Session Method's `Erforderlich` checklist from `data/didactic-methods.md`, independently of the Session Type check above `[if a session method is set — i.e. journal.md → ## Didactics → __Default Session Method:__ is not "none"]`
- [ ] [advisory] Estimated duration per `data/duration-heuristic.md` (reading time + activity time) is within 70%–150% of the declared duration in `journal.md` → `## Agenda` — a deviation is a hint for the instructor, never a fail

## LiaScript Syntax (per material file)

- [ ] [mechanical] All checks in `tasks/validate-syntax.md` pass (see that task's report for the full rule set — not duplicated here)

## Overall Consistency

- [ ] [mechanical] Terminology from `journal.md` → `## Course Context` used consistently throughout project memory and materials
- [ ] [pedagogical] Instructor persona tone consistent across all materials
- [ ] [pedagogical] Learning objectives from `journal.md` → `## Outline` traceable into `journal.md` → `## Agenda` and materials
- [ ] [pedagogical] Context ↔ Outline ↔ Didactics ↔ Agenda ↔ Sessions consistent
- [ ] [mechanical] Numbering correct, no gaps
- [ ] [mechanical] No sessions without materials
