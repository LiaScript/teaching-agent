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

## Output

- `journal.md` → `## Didactics`
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
4. 💬 Describe the instructor persona (expertise, role, background) — free text, discuss with instructor.
5. 🎛️ Define teaching style (structured question — single choice with optional free-text addition):
   - humorous / academic / practical / conversational / mixed
6. 🎛️ Set difficulty level (structured question — single choice):
   - beginner / intermediate / advanced
7. Set the delivery format consistent with the course type.
8. Fill the `templates/course-didactics.yaml` template with the results.
9. Save the generated didactics by replacing the content of `journal.md` → `## Didactics` — flat `* __Label:__` bullets only (including `* __Persona Voice Sample:__`), no sub-headings.
10. Create or update `journal.md` → `## Agents` → `### Coauthor` directly, with no `#### Coauthor` subsection:
    - Set `* __Customization Status:__ active`
    - Set `* __Role / Persona:__` from `## Didactics` → `__Professor Persona:__`
    - Set `* __Behavior Additions:__` from the teaching style, didactic concept, and project-specific coauthoring needs
    - Set `* __Preferred Interaction Style:__` from the selected teaching style
    - Set `* __Project-Specific Rules:__` from course type, time format, target platform, and material constraints
    - Set `* __Persona Voice Sample:__` from `## Didactics` → `__Persona Voice Sample:__`
    - Preserve `* __Boundaries / Never:__` and keep it additive-only; never override workflow gates, validation rules, safety rules, or epistemic rules
11. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
