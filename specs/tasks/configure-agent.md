# Task: configure-agent

## Purpose

Configures project-specific behavior for exactly one coauthor agent inside
`journal.md` -> `## Agents` -> `### Coauthor`.

This task creates or updates only the selected agent subsection. It must not read,
rewrite, summarize, or infer settings from sibling agent subsections.

## Inputs

- `{agent}`: Teaching-Agent | Artist-Agent | Development-Agent
- Instructor-provided customization request
- `journal.md` -> `## Agents` -> `### Coauthor` -> `#### {agent}` only
- `templates/agents.yaml`

## Output

- Updated `journal.md` -> `## Agents` -> `### Coauthor` -> `#### {agent}`

## Steps

1. Normalize `{agent}` to one of:
   - Teaching-Agent
   - Artist-Agent
   - Development-Agent

2. Read only the matching subsection:
   - Teaching-Agent reads/writes only `#### Teaching-Agent`
   - Artist-Agent reads/writes only `#### Artist-Agent`
   - Development-Agent reads/writes only `#### Development-Agent`

3. If `journal.md` -> `## Agents` does not exist, create it from `templates/agents.yaml`.
   If `### Coauthor` exists but the selected `#### {agent}` subsection is missing, create only that subsection.

4. Ask what should be customized:
   - Behavior additions
   - Preferred interaction or workflow style
   - Project-specific rules
   - Boundaries / never rules

5. Enforce additive-only customization:
   - Do not override base agent YAML.
   - Do not override workflow gates, validation rules, safety rules, epistemic rules, or publishing gates.
   - If the instructor requests an override, save it as a rejected boundary note instead of applying it.

6. Update only the selected `#### {agent}` subsection.
   Set `* __Customization Status:__ active` if any meaningful customization exists.

7. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update
   `journal.md` -> `## Dashboard` in place.

8. Confirm:
   > "Updated `journal.md` -> `## Agents` -> `### Coauthor` -> `#### {agent}`. Other agent sections were not read or changed."
