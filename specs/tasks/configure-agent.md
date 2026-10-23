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
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

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

3. If `journal.md` -> `## Agents` or the selected `### {agent}` subsection is missing, plan to create it from `templates/agents.yaml` (only that subsection, inside the `## Agents` `<section>` … `</section>` wrapper) — but do not write anything yet.

4. Ask what should be customized:
   - Behavior additions
   - Preferred interaction or workflow style
   - Project-specific rules
   - Boundaries / never rules

5. Enforce additive-only customization:
   - Do not override base agent YAML.
   - Do not override workflow gates, validation rules, safety rules, epistemic rules, or publishing gates.
   - If the instructor requests an override, save it as a rejected boundary note instead of applying it.
   - In `### Coauthor`, entries ending with `<!-- data-from="didactics" -->` are derived by `:create-didactics` and replaced when the didactics change. Entries added here never get that marker. If the instructor rewrites a marked entry, remove the marker — the entry is theirs from then on and stays.

6. **Before saving:** show the complete new content of the selected subsection (after a change starting with one line naming every change, a rejected override as its boundary note) with "Save" / "Change something" — the single write confirmation of this task. Nothing is written before it.

7. On "Save": create the missing `## Agents` / subsection (step 3) and update only the selected scope.
   Set `* __Customization Status:__ active` if any meaningful customization exists.

8. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update
   `journal.md` -> `## Dashboard` in place.

9. Confirm:
   > "Updated `journal.md` -> `## Agents` -> `### {agent}`. Other agent sections were not read or changed."
