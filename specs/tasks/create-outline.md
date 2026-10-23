# Task: create-outline

## Purpose

Creates the **Lecture Outline** as a starting point for a lecture.
Defines title, target audience, abstract, and learning objectives.

## Inputs

- Title of the lecture
- Target audience (e.g., students, professionals, beginners)
- Time commitment (e.g., semester hours per week, total hours)
- Abstract (topics, content, benefits)
- Learning objectives (3–5 concrete goals)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Outline`
- Structure based on `templates/course-outline.yaml`

## Steps

1. Read `journal.md` → `## Course Context` to determine course type and conventions, and take every `Additional Notes` line "For outline: …" (or for learning objectives) as the instructor's own input — start from it, never ask for it again. If the instructor's goals are neither there nor in your memory of this session, search the chat history (`read_chat`) before asking.
2. Collect title and target audience — take both from `## Course Context` (Working Title, target group notes) and from goals the instructor already named; only ask for what is missing or contradictory.
   - If the skill `creativity` is available (see `data/skills.md`), 🎛️ offer once before collecting the remaining inputs: 1. structured interview (default) · 2. open exploratory ideation with `creativity` first, then condense its result into the inputs below. Run it only on request; the outline itself is still written by this task.
3. Collect time commitment — prefill it from `## Course Context` → Units (the time frame of `:init-course` step 4) and ask only for what is missing; adapted by course type:
   - **lecture-series**: required (e.g., semester hours/week, total hours)
   - **workshop**: required (e.g., 1-day, 2-day block)
   - **self-paced**: optional (estimated self-study hours recommended, but not mandatory)
   - **single-lesson**: skip — not applicable
4. Collect abstract (topics, content, benefits).
5. Define 3–5 concrete learning objectives. **Start from the instructor's goal:** if the instructor already named what learners should be able to do at the end (chat, `## Course Context`), keep that goal and its verb; if not, ask for it first ("What should the learners be able to do at the end?"). **Self-check before showing the first proposal** — the check may add, never silently remove; name every change in one line and ask before dropping or replacing anything the instructor said:
   - **Observable in this setting:** say how each objective becomes visible — in the material (select, assign, write, record) or through a person who listens or watches (check `## Course Context`: is the instructor or a partner present?). If an objective cannot be observed in the material, keep it and add the observable step or the occasion where someone checks it — do not swap the verb. A check by a person needs a **scheduled joint phase** with its minutes in the time check (learners × minutes per learner ≤ phase; otherwise say it is only a sample). When learners work at their own pace or alone with headphones, a partner is not available unless such a phase is planned — propose the phase or a recording instead.
   - **Every level counts:** the self-check applies to added objectives and to every basic/extension level too — the observable step uses the objective's verb, or names a preliminary step and the occasion for the verb itself. If you narrow or concretise an instructor's goal, show "your words → proposal" in one line.
   - **One action per objective;** split objectives that contain two verbs.
   - **Fits the learners from `## Course Context`:** language level, prior knowledge, support needs — add a language component where the target group needs one, and give a basic and an extension level for heterogeneous groups.
   - **Fits the time:** show a short list *session → objective → self-check* (at most 3 columns if shown as a table); include every time estimate you mention (e.g. listening time). If it does not fit, propose what to drop. **Repeat this time check after every revision** and show the new result; a gap that stays open goes into the Dashboard's `decisions`.
   - Content questions come **before** the save confirmation, never in the same form; everything that will be saved (incl. the session split) is shown as text first.
6. If the instructor wants a logo, mention that the Artist-Agent creates it after the outline is saved (`:agent artist` → `:create-logo`, stored in `## Visual Identity`).
7. Fill the `templates/course-outline.yaml` with the inputs.
8. **Before saving:** show the outline as the instructor will read it, with "Save" / "Change something" (single write confirmation). The preview contains every field of `templates/course-outline.yaml` in its saved wording; a field taken over from `## Course Context` may be one line ("Target audience: as in the course frame, plus: …"). Summary claims ("every objective has …") must hold for every item. Then save by replacing the content of `journal.md` → `## Outline` following `templates/course-outline.yaml` → `layout` (no sub-headings).
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place. Stale statements in other sections (e.g. provisional goals in `## Course Context`) go into the Dashboard's `decisions` — never edit foreign sections silently.
