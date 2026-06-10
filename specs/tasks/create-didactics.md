# Task: create-didactics

## Purpose

Creates the document **Course Didactics & Style**.  
Defines the didactic concept, instructor persona, style, and course type.  
Builds on the outline to ensure a consistent teaching strategy aligned with the course type from `project.md` → `## Course Context`.

## Inputs

- Abstract from `project.md` → `## Outline`
- Target audience from `project.md` → `## Outline`
- Learning objectives from `project.md` → `## Outline`
- Course type & conventions from `project.md` → `## Course Context`

## Output

- `project.md` → `## Didactics`
- Structure based on `templates/course-didactics.yaml`

## Steps

1. Read `project.md` → `## Course Context` for course type, persona type, and conventions.
2. Read abstract, target audience, and learning objectives from `project.md` → `## Outline`.
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
9. Save the generated didactics by creating or replacing `project.md` → `## Didactics`.
