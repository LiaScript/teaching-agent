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
3a. Choose a **Didactic Framework** from `data/didactic-methods.md` → "Course Frameworks" yourself, based on course type. It is documentation only: do **not** ask the instructor; name it only inside the technical details. Ask only if the instructor uses such terms themselves.
3b. Define `__Session Types:__` (see `data/session-types.md` for the full mechanism):
   - **single-lesson**: default to one type named after `lectures-called`; skip the discussion unless the instructor wants to split the lesson into sub-types.
   - **all other course types**: 🎛️ propose the default Session Types for this course type from the table in `data/session-types.md`, each with slug, one-line criterion, and a 2–3 item required-elements checklist. Let the instructor confirm or edit.
   - 💬 Grounding check (mandatory, do not skip): ask the instructor to name one concretely planned session and which Session Type it would get, and why. If the answer doesn't fit any proposed type, revise the types before continuing — don't let an unfitting default stand.
   - Display names in the course language; slugs as defined in the template layout (lowercase ASCII words in the course language, not English defaults). With more than one type, no display name equals a Terminology word (`sessions-called`, `lectures-called`) — choose another name before proposing (e.g. "Lernmodul" when units are called "Modul").

3c. Choose a **Default Session Method** yourself (several may be combined as "a + b") from `data/didactic-methods.md` → "Session Methods", based on course type — **`none`** is allowed. Do not ask; mention it in plain words in the summary only if it changes what the learners do. This becomes the course-wide default; `:create-agenda` can override it per session later.
4. 💬 Describe the instructor persona (expertise, role, background) — free text, discuss with instructor.
5. Derive the teaching style from `## Course Context` (Tone) and confirm it only as one line of the summary.
6. Derive the difficulty level from target group and outline; confirm it only as one line of the summary.
7. Set the delivery format consistent with the course type.
8. Fill the `templates/course-didactics.yaml` template with the results.
9. **Before saving** show the complete section as the instructor will read it (after a change: the whole new version with the changed parts in bold, never only the changes), with "Save" / "Change something". Then save by replacing the content of `journal.md` → `## Didactics` using the `layout` of `templates/course-didactics.yaml` (visible part in the course language, technical fields in `<details>`), no sub-headings.
10. Create or update `journal.md` → `## Agents` → `### Coauthor` directly, with no `#### Coauthor` subsection — **merge, never overwrite** what the instructor added:
    - Every entry this step derives ends with the invisible marker `<!-- data-from="didactics" -->`. Replace only marked entries; keep every entry without the marker (added via `:configure-agent`) unchanged and in place.
    - The changes to `### Coauthor` are part of step 9's save summary, in future tense ("When you save, I will also adjust the co-author: …", translated) — nothing in it changes unseen, and no separate confirmation is needed.
    - Set `* __Customization Status:__ active`
    - Set `* __Role / Persona:__` from `## Didactics` → `__Professor Persona:__`
    - Set `* __Behavior Additions:__` from the teaching style, didactic concept, and project-specific coauthoring needs
    - Set `* __Preferred Interaction Style:__` from the selected teaching style
    - Set `* __Project-Specific Rules:__` from course type, time format, target platform, and material constraints
    - Set `* __Persona Voice Sample:__` from `## Didactics` → `__Persona Voice Sample:__`
    - Preserve `* __Boundaries / Never:__` and keep it additive-only; never override workflow gates, validation rules, safety rules, or epistemic rules
11. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
