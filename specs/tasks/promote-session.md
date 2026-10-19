# Task: promote-session

## Purpose

Converts a **Session** into a detailed **Session Material**.  
**The agent also adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona, so all content is written in this voice.**

## Inputs

- number
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- skeleton: matching `### {number}. {title}` subsection from `journal.md` → `## Sessions`
- didactics: content from `journal.md` → `## Didactics`
- agenda: content from `journal.md` → `## Agenda`
- templates: imports and usage notes from `journal.md` → `## Templates` (if present)
- **Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (mandatory handoff)**
- Style, difficulty level, and didactic concept from `journal.md` → `## Didactics`
- Terminology from `journal.md` → `## Course Context`
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`)
- Session Method from the skeleton's `**Method:**` line, if present, and its structural guidance from `data/didactic-methods.md` → "Session Methods"

## Output

- **multi-file mode:** `materials/{number}-{slug}/README.md` (new folder; `{slug}` derived once from the session title — see `data/file-structure-modes.md`)
- **single-file mode:** the `##` chapter matching this session, inserted/replaced in session-number order inside root `/README.md`
- Structure based on `templates/session-material.yaml`

## Steps

1. Load the matching skeleton subsection from `journal.md` → `## Sessions`.
2. Read `journal.md` → `## Course Context` for terminology and conventions.
3. Adopt didactic concept and course type from Didactics.
   - Look up the session's type in `journal.md` → `## Didactics` → `__Session Types:__` (see `data/session-types.md`) and note its `Erforderlich` (required elements) checklist; the generated outline in step 7 must satisfy it.
   - If the skeleton has a `**Method:**` line, look it up in `data/didactic-methods.md` → "Session Methods" and note both its structural guidance and its `Erforderlich` checklist — the generated outline in step 7 must satisfy this in addition to, and independently of, the Type checklist above.
4. **Agent adopts the Coauthor role from `journal.md` → `## Agents` → `### Coauthor` into its own persona.**
   - From this step, the agent writes in the tone of the Coauthor role.
   - If the Coauthor role is missing or inactive, fall back to `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
   - All agenda descriptions reflect this style.
5. Insert agenda information.
6. Consider didactic inputs.
7. Generate planned outline.
8. Apply template.
   - If the skill `liascript-syntax` is available (see `data/skills.md`), use it as authoring reference for every LiaScript construct in the material; otherwise use `data/liascript-cheat-sheet.md`.
   - If `journal.md` → `## Visual Identity` contains a `__LiaScript Theme:__` block, include it in the material's metadata header (multi-file: the new file's own header; single-file: the shared root `README.md` header, if not already present).
9. If the material uses macros from `journal.md` → `## Templates`, include each required `import: {url}` line in the LiaScript metadata header (multi-file: the new file's own header; single-file: the shared root `README.md` header, if not already present).
10. Resolve the File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`) and save accordingly:
    - **multi-file:** derive `{slug}` from the session title, create `materials/{number}-{slug}/README.md` (and its `assets/` subfolder on demand, not upfront).
    - **single-file:** insert or replace the `##` chapter for this session inside root `/README.md`, keeping chapters in session-number order.
11. Update the overview table in `journal.md` → `## Sessions`: set Material column to ✅ for session `{number}` and rewrite that unit's status line in the same write (`templates/session-skeleton.yaml` → `section_layout.overview`).
12. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
