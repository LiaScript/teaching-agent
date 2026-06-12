# Task: promote-session

## Purpose

Converts a **Session** into a detailed **Session Material**.  
**The agent also adopts the instructor persona and style from `journal.md` → `## Didactics` into its own persona, so all content is written in this voice.**

## Inputs

- number, type
- skeleton: matching `### {number}. {title}` subsection from `journal.md` → `## Sessions`
- didactics: content from `journal.md` → `## Didactics`
- agenda: content from `journal.md` → `## Agenda`
- templates: imports and usage notes from `journal.md` → `## Templates` (if present)
- **Instructor persona from `journal.md` → `## Didactics` (mandatory handoff)**
- **Style & difficulty level from `journal.md` → `## Didactics` (mandatory handoff)**
- Terminology from `journal.md` → `## Course Context`

## Output

- `materials/{number}-{type}.md`
- Structure based on `templates/session-material.yaml`

## Steps

1. Load the matching skeleton subsection from `journal.md` → `## Sessions`.
2. Read `journal.md` → `## Course Context` for terminology and conventions.
3. Adopt didactic concept and course type from Didactics.
4. **Agent adopts the instructor persona & style from Didactics into its own persona.**

- From this step, the agent writes in the tone of the professor persona.
- All agenda descriptions reflect this style.

4. Insert agenda information.
5. Consider didactic inputs.
6. Generate planned outline.
7. Apply template.
8. If the material uses macros from `journal.md` → `## Templates`, include each required `import: {url}` line in the LiaScript metadata header of `materials/{number}-{type}.md`.
9. Save the material file as `materials/{number}-{type}.md`.
10. Update the overview table in `journal.md` → `## Sessions`: set Material column to ✅ for session `{number}`.
11. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
