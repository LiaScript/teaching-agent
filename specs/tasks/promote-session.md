# Task: promote-session

## Purpose

Converts a **Session** into a detailed **Session Material**.  
**The agent also adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona, so all content is written in this voice.**

## Inputs

- number
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- skeleton: matching `### {number}. {title}` subsection from `journal.md` → `## Sessions`
- didactics: content from `journal.md` → `## Didactics`
- agenda: content from `journal.md` → `## Agenda`; objectives and duration of this session per `data/session-types.md` → "Objectives and duration of a session" (without an agenda from `## Outline` and `## Course Context` → Units)
- templates: imports and usage notes from `journal.md` → `## Templates` (if present)
- **Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (mandatory handoff)**
- Style, difficulty level, and didactic concept from `journal.md` → `## Didactics`
- Terminology from `journal.md` → `## Course Context`
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`)
- Session Method from the skeleton's `**Method:**` line, if present, and its structural guidance from `data/didactic-methods.md` → "Session Methods"
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- **multi-file mode:** `materials/{number}-{slug}/README.md` (new folder; `{slug}` derived once from the session title — see `data/file-structure-modes.md`)
- **single-file mode:** the `##` chapter matching this session, inserted/replaced in session-number order inside root `/README.md`
- Structure based on `templates/session-material.yaml`

## Steps

0. **Existing material:** if the unit already has material (its overview row shows Material ✅, or the material document / `##` chapter exists), this task would replace it — also everything worked out together in `:coauthor-materials` and every fix since. Before anything else, say so in one plain sentence (page count, date of the last check if any) and ask "Replace" / "Keep" (translated; tier "confirm in chat"). "Keep" ends the task without a write and offers `:quick-fix` or `:coauthor-materials` for changes instead. Not when called from `:build-session`, which asks this itself (`tasks/build-session.md` → Content loop, step a). After "Replace", the unit's earlier check no longer applies: Done ❌, status line "material written · check open" (translated, `templates/session-skeleton.yaml`), the old report stays until the next `:validate-course {number}` replaces it.
1. Load the matching skeleton subsection from `journal.md` → `## Sessions`.
2. Read `journal.md` → `## Course Context` for terminology and conventions.
3. Adopt didactic concept and course type from Didactics.
   - Look up the session's type in `journal.md` → `## Didactics` → `__Session Types:__` (see `data/session-types.md`) and note its `Required` checklist; the generated outline in step 7 must satisfy it.
   - If the skeleton has a `**Method:**` line, look it up in `data/didactic-methods.md` → "Session Methods" and note both its structural guidance and its `Required` checklist — the generated outline in step 7 must satisfy this in addition to, and independently of, the Type checklist above.
4. **Agent adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona.**
   - From this step, the agent writes in the tone of the Coauthor role.
   - If the Coauthor role is missing or inactive, fall back to `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
   - All texts of this material reflect this style.
5. Insert the session's objectives and duration (from the agenda, or without one as named in Inputs).
6. Consider didactic inputs.
7. Generate planned outline.
8. Apply template.
   - If the skill `liascript-syntax` is available (see `data/skills.md`), use it as authoring reference for every LiaScript construct in the material; otherwise use `data/liascript-cheat-sheet.md`.
   - Produce the tasks the skeleton names, with their task type — a different type is the instructor's decision (`tasks/quick-fix.md` → "When to use").
   - Answer options and gap cards follow `data/liascript-cheat-sheet.md` → Quizzes for young learners → **No surface cues** (read it completely), and every hint or page text that names something in a picture matches that picture.
9. Save the material as described in `data/file-structure-modes.md` → "Creating the material document": path (reuse the path recorded in the agenda), metadata header (author, language, theme, template imports — a local `./lia-templates/{id}/README.md` rewritten relative to the material, e.g. `../../lia-templates/{id}/README.md` in multi-file mode) and the overview update (Material ✅ with its status line).
10. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
