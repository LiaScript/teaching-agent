# Task: create-outline

## Purpose

Creates the **Lecture Outline** as a starting point for a lecture.
Defines title, target audience, abstract, learning objectives, and optionally a logo.

## Inputs

- Title of the lecture
- Target audience (e.g., students, professionals, beginners)
- Time commitment (e.g., semester hours per week, total hours)
- Abstract (topics, content, benefits)
- Learning objectives (3–5 concrete goals)
- Logo (optional, as a prompt)

## Output

- `project.md` → `## Outline`
- Structure based on `templates/course-outline.yaml`

## Steps

1. Read `project.md` → `## Course Context` to determine course type and conventions.
2. Collect title and target audience.
3. Collect time commitment — adapted by course type:
   - **lecture-series**: required (e.g., semester hours/week, total hours)
   - **workshop**: required (e.g., 1-day, 2-day block)
   - **self-paced**: optional (estimated self-study hours recommended, but not mandatory)
   - **single-lesson**: skip — not applicable
4. Collect abstract (topics, content, benefits).
5. Define 3–5 concrete learning objectives.
6. Optionally add a logo prompt.
7. Fill the `templates/course-outline.yaml` with the inputs.
8. Save the generated outline by creating or replacing `project.md` → `## Outline`.
