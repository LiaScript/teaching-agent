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

- `journal.md` → `## Outline`
- Structure based on `templates/course-outline.yaml`

## Steps

1. Read `journal.md` → `## Course Context` to determine course type and conventions.
2. Collect title and target audience — take both from `## Course Context` (Working Title, target group notes) and from goals the instructor already named; only ask for what is missing or contradictory.
   - If the skill `creativity` is available (see `data/skills.md`), 🎛️ offer once before collecting the remaining inputs: 1. structured interview (default) · 2. open exploratory ideation with `creativity` first, then condense its result into the inputs below. Run it only on request; the outline itself is still written by this task.
3. Collect time commitment — adapted by course type:
   - **lecture-series**: required (e.g., semester hours/week, total hours)
   - **workshop**: required (e.g., 1-day, 2-day block)
   - **self-paced**: optional (estimated self-study hours recommended, but not mandatory)
   - **single-lesson**: skip — not applicable
4. Collect abstract (topics, content, benefits).
5. Define 3–5 concrete learning objectives. **Self-check before showing the first proposal** (fix silently, then mention in one line what you adapted):
   - **Observable in this setting:** what can the material, the platform or the instructor actually observe? Prefer verbs whose result is visible in the material (select, assign, show, write) over verbs nobody can check there (understand, explain — unless someone listens).
   - **One action per objective;** split objectives that contain two verbs.
   - **Fits the learners from `## Course Context`:** language level, prior knowledge, support needs — add a language component where the target group needs one, and give a basic and an extension level for heterogeneous groups.
   - **Fits the time:** show a short table *session → objective → self-check*; if it does not fit, propose what to drop.
   - Content questions come **before** the save confirmation, never in the same form; everything that will be saved (incl. the session split) is shown as text first.
6. Optionally add a logo prompt.
7. Fill the `templates/course-outline.yaml` with the inputs.
8. **Before saving:** show the outline as the instructor will read it, with "Save" / "Change something" (single write confirmation). Then save by replacing the content of `journal.md` → `## Outline` — flat `* __Label:__` bullets only, no sub-headings.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place. Stale statements in other sections (e.g. provisional goals in `## Course Context`) go into the Dashboard's `decisions` — never edit foreign sections silently.
