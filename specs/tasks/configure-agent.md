# Task: configure-agent

## Purpose

Configures project-specific behavior for exactly one role or agent inside
`journal.md` -> `## Agents`.

This task creates or updates only the selected role/agent scope. It must not read,
rewrite, summarize, or infer settings from sibling agent subsections.

## Inputs

- `{agent}`: Coauthor | Teaching-Agent | Artist-Agent | Development-Agent
- Instructor-provided customization request
- `journal.md` -> `## Agents` -> `### {agent}` only
- `templates/agents.yaml`

## Output

- Updated `journal.md` -> `## Agents` -> `### {agent}`

## Steps

1. Normalize `{agent}` to one of:
   - Coauthor
   - Teaching-Agent
   - Artist-Agent
   - Development-Agent

2. Read only the matching `### {agent}` subsection:
   - Coauthor reads/writes only `### Coauthor`
   - Teaching-Agent reads/writes only `### Teaching-Agent`
   - Artist-Agent reads/writes only `### Artist-Agent`
   - Development-Agent reads/writes only `### Development-Agent`

3. If `journal.md` -> `## Agents` does not exist, create it from `templates/agents.yaml`.
   If the selected `### {agent}` subsection is missing, create only that subsection from `templates/agents.yaml`.

4. Ask what should be customized:
   - Behavior additions
   - Preferred interaction or workflow style
   - Project-specific rules
   - Boundaries / never rules

5. Enforce additive-only customization:
   - Do not override base agent YAML.
   - Do not override workflow gates, validation rules, safety rules, epistemic rules, or publishing gates.
   - If the instructor requests an override, save it as a rejected boundary note instead of applying it.

6. Update only the selected scope.
   Set `* __Customization Status:__ active` if any meaningful customization exists.

7. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update
   `journal.md` -> `## Dashboard` in place.

8. Confirm:
   > "Updated `journal.md` -> `## Agents` -> `### {agent}`. Other agent sections were not read or changed."
