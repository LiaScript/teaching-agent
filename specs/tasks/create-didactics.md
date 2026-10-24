# Task: create-didactics

## Purpose

Creates the document **Course Didactics & Style**.  
Defines the didactic concept, instructor persona, style, and course type.  
Builds on the outline to ensure a consistent teaching strategy aligned with the course type from `journal.md` → `## Course Context`.

## Inputs

- Abstract from `journal.md` → `## Outline`
- Target audience from `journal.md` → `## Outline`
- Learning objectives from `journal.md` → `## Outline`
- Course type & conventions from `journal.md` → `## Course Context`
- `data/didactic-methods.md` — course frameworks, session methods, and their default suggestions by course type
- `specs/catalog/templates.json` — only for the one-sentence template hint of step 3
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Didactics`, including `__Session Types:__`
- `journal.md` → `## Agents` → `### Coauthor` updated with the coauthor role derived from the professor persona, teaching style, project-specific rules, and persona voice sample
- Structure based on `templates/course-didactics.yaml`

## Steps

1. Read `journal.md` → `## Course Context` for course type, persona type, and conventions.
2. Read abstract, target audience, and learning objectives from `journal.md` → `## Outline`.
3. 💬 Design a suitable didactic concept (teaching methods, learning phases) adapted to the course type — discuss with instructor if unclear:
   - **lecture-series**: structured phases, presenter-driven, attendance-based
   - **self-paced**: modular, learner-driven, self-check oriented
   - **workshop**: activity-driven, collaborative, time-boxed
   - **single-lesson**: focused, compact, single arc
   - **Template hint:** when catalog entries fit the subject (`subjects`), say in one sentence which kinds of templates exist for it, because the tool can shape the method (e.g. "programming by drawing" with a turtle) — a hint only, no selection; the choice follows in `:suggest-templates` after this task.
3a. Choose a **Didactic Framework** from `data/didactic-methods.md` → "Course Frameworks" yourself, based on course type. It is documentation only: do **not** ask the instructor; name it only inside the technical details. Ask only if the instructor uses such terms themselves.
3b. Define `__Session Types:__` (see `data/session-types.md` for the full mechanism):
   - **single-lesson**: default to one type, named after what the lesson mainly is (from the grounding answer, e.g. "introduction with practice"); skip the discussion of types unless the instructor wants to split the lesson into sub-types. The grounding check below still applies, in its short form: "Your lesson is mainly … — right?"
   - **all other course types**: 🎛️ propose the default Session Types for this course type from the table in `data/session-types.md`, each with its display name (the slug only in the saved technical block, never in the chat), one-line criterion, and a 2–3 item required-elements checklist. Let the instructor confirm or edit.
   - Toward the instructor, call Session Types "recurring lesson patterns" (translated, or the instructor's own word) and illustrate each with one unit of this course — never "kinds of units" or the task's step names. On first mention link the term in half a sentence to the lesson phases teachers plan with, and show each pattern with its phases. If the instructor offers a word of their own, ask whether to use it on the page and in the overview.
   - The required elements of each pattern (later check criteria) appear word for word in the preview; anything added at saving is listed as its own line in the save summary.
   - 💬 Grounding check (mandatory, do not skip): when the outline already lists the units, propose the pattern for each unit yourself and let the instructor confirm one concrete unit ("Does unit N look like this in your lessons?"); only without such a list ask the instructor to name one concretely planned session, which pattern it would get, and why. If the answer doesn't fit any proposed type, revise the types before continuing — don't let an unfitting default stand.
   - Display names in the course language; slugs as defined in the template layout (lowercase ASCII words in the course language, not English defaults). With more than one type, no display name equals a Terminology word (`sessions-called`) — choose another name before proposing (e.g. "Lernmodul" when units are called "Modul").

3c. Choose a **Default Session Method** yourself (several may be combined as "a + b") from `data/didactic-methods.md` → "Session Methods", based on course type — **`none`** is allowed. Do not ask; name it in plain words in the summary together with its `Required` elements (one line — the check later demands them), e.g. "Every unit ends with a short self-check" (translated). This becomes the course-wide default; `:create-agenda` can override it per session later.
4. 💬 Describe the instructor persona (expertise, role, background) — free text, discuss with instructor.
5. Derive the teaching style from `## Course Context` (Tone) and confirm it only as one line of the summary.
6. Derive the difficulty level from target group and outline; confirm it only as one line of the summary.
7. If the delivery situation from `## Course Context` (classroom, online, self-study) shapes the lesson phases, describe that in `__Didactic Concept:__` — there is no separate field for it.
8. Fill the `templates/course-didactics.yaml` template with the results.
9. **Before saving** show the complete section as the instructor will read it (after a change: the whole new version, starting with one line naming every change — `data/chat-dialog.md` → Nothing unseen gets saved), with "Save" / "Change something". Then save by replacing the content of `journal.md` → `## Didactics` using the `layout` of `templates/course-didactics.yaml` (visible part in the course language, technical fields in `<details>`), no sub-headings.
10. Create or update `journal.md` → `## Agents` → `### Coauthor` directly, with no `#### Coauthor` subsection — **merge, never overwrite** what the instructor added:
    - Every entry this step derives ends with the invisible marker `<!-- data-from="didactics" -->`. Replace only marked entries; keep every entry without the marker (added via `:configure-agent`) unchanged and in place.
    - The changes to `### Coauthor` are part of step 9's save summary, in future tense, described as rules for writing the material later ("When you save, I will also note these rules for writing the material: …", translated) — never as another helper or figure; nothing in it changes unseen, and no separate confirmation is needed.
    - A rule that holds for one pattern only names that pattern; rules about levels are checked against the levels per objective in `## Outline` — an objective without levels is excluded, never covered by "every task".
    - Set `* __Customization Status:__ active`
    - Set `* __Role / Persona:__` from `## Didactics` → `__Professor Persona:__`
    - Set `* __Behavior Additions:__` from the teaching style, didactic concept, and project-specific coauthoring needs
    - Set `* __Preferred Interaction Style:__` from the selected teaching style
    - Set `* __Project-Specific Rules:__` from course type, time format, and material constraints (the platform is always LiaScript)
    - Set `* __Persona Voice Sample:__` from `## Didactics` → `__Persona Voice Sample:__`
    - Preserve `* __Boundaries / Never:__` and keep it additive-only; never override workflow gates, validation rules, safety rules, or epistemic rules
11. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place. The next step is then `:suggest-templates` (the Dashboard's `next`: templates for the learning activities); the visual identity (`agent:artist/switch`) can come before or after it.
