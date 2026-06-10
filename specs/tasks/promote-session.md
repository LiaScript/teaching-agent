# Task: promote-session

## Purpose

Converts a **Session** into a detailed **Session Material**.  
**The agent also adopts the instructor persona and style from `project.md` → `## Didactics` into its own persona, so all content is written in this voice.**

## Inputs

- number, type
- skeleton: matching `### {number}. {title}` subsection from `project.md` → `## Sessions`
- didactics: content from `project.md` → `## Didactics`
- agenda: content from `project.md` → `## Agenda`
- templates: imports and usage notes from `project.md` → `## Templates` (if present)
- **Instructor persona from `project.md` → `## Didactics` (mandatory handoff)**
- **Style & difficulty level from `project.md` → `## Didactics` (mandatory handoff)**
- Terminology from `project.md` → `## Course Context`

## Output

- `materials/{number}-{type}.md`
- Structure based on `templates/session-material.yaml`

## Steps

1. Load the matching skeleton subsection from `project.md` → `## Sessions`.
2. Read `project.md` → `## Course Context` for terminology and conventions.
3. Adopt didactic concept and course type from Didactics.
4. **Agent adopts the instructor persona & style from Didactics into its own persona.**

- From this step, the agent writes in the tone of the professor persona.
- All agenda descriptions reflect this style.

4. Insert agenda information.
5. Consider didactic inputs.
6. Generate planned outline.
7. Apply template.
8. If the material uses macros from `project.md` → `## Templates`, include each required `import: {url}` line in the LiaScript metadata header of `materials/{number}-{type}.md`.
9. Save the material file as `materials/{number}-{type}.md`.
10. Update the overview table in `project.md` → `## Sessions`: set Material column to ✅ for session `{number}`.
