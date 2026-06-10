# Checklist: Course Quality

> **Usage note:** Read `project.md` → `## Course Context` first. Skip any check marked `[condition]` if the condition does not apply to this course type.

## Context

- [ ] `project.md` → `## Course Context` exists
- [ ] Course type defined
- [ ] Terminology set (sessions-called, lectures-called)
- [ ] Language & tone conventions set
- [ ] Agenda flag correct (yes / no / optional)
- [ ] Person (Sie / Du / you) set

## Outline

- [ ] Title present
- [ ] Target audience clearly defined
- [ ] Time commitment specified `[lecture-series, workshop]`
- [ ] Time commitment present or estimated `[self-paced]`
- [ ] Abstract complete (topics, benefits, application)
- [ ] 3–5 learning objectives formulated, measurable (verb + context)
- [ ] Optional: Logo prompt

## Didactics

- [ ] Refers to outline
- [ ] Didactic concept clear
- [ ] Instructor persona defined (background, role, style)
- [ ] Style & difficulty level specified
- [ ] Course type consistent with `project.md` → `## Course Context`

## Templates `[if template imports or template macros are used]`

- [ ] `project.md` → `## Templates` exists
- [ ] Every template in `## Templates` has a matching `import:` line in the main metadata header
- [ ] Every material using a template macro has the matching `import:` line in its own metadata header
- [ ] Template usage examples and constraints are documented in `## Templates`
- [ ] Community discovery link included: https://github.com/topics/liascript-template

## Agenda `[if agenda flag = yes in project.md → ## Course Context]`

- [ ] All sessions have: title, duration, type, learning objective, summary
- [ ] Session learning objectives align with `project.md` → `## Outline` learning objectives
- [ ] Materials file reference present per session

## Session Progress (`project.md` → `## Sessions`)

- [ ] `project.md` → `## Sessions` exists `[not single-lesson]`
- [ ] Overview table appears directly below `## Sessions`
- [ ] All expected sessions have a row in the overview table
- [ ] No session marked ✅ Skeleton without a matching `### {number}. {title}` subsection in `project.md` → `## Sessions`
- [ ] No session marked ✅ Material without a file in `materials/`
- [ ] All sessions marked ✅ Fertig before publishing

## Session Subsections (`project.md` → `## Sessions`)

- [ ] Exist for all sessions
- [ ] All mandatory fields present (heading/title, type, summary, content, activities, references)
- [ ] Activities are numbered lists
- [ ] References are numbered lists

## Session Materials

- [ ] All skeletons promoted to materials
- [ ] Outline with subchapters present
- [ ] References included per section where claims are made
- [ ] Didactic inputs from `project.md` → `## Didactics` reflected (methods, learning phases)
- [ ] Learning objectives from `project.md` → `## Agenda` addressed in content

## LiaScript Syntax (per material file)

- [ ] Exactly one `#` heading per file (course title)
- [ ] `###` and deeper headings only inside HTML blocks (`<div>`), lists, or blockquotes
- [ ] All code blocks properly closed (triple backticks)
- [ ] Animation counters (`--{{n}}--`, `{{n}}`) reset to 0 after each `##` heading
- [ ] Quiz syntax correct: `[(X)]` single choice, `[[X]]` multiple choice, `[[answer]]` text
- [ ] All media elements (`![]`, `?[]`, `!?[]`) have meaningful alt text
- [ ] No unclosed HTML blocks (`<div>` without `</div>`)
- [ ] Course header metadata present (author, version, language, narrator) `[lecture-series, self-paced, workshop]`

## Overall Consistency

- [ ] Terminology from `project.md` → `## Course Context` used consistently throughout project memory and materials
- [ ] Instructor persona tone consistent across all materials
- [ ] Learning objectives from `project.md` → `## Outline` traceable into `project.md` → `## Agenda` and materials
- [ ] Context ↔ Outline ↔ Didactics ↔ Agenda ↔ Sessions consistent
- [ ] Numbering correct, no gaps
- [ ] No sessions without materials
