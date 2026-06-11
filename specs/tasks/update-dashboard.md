# Task: update-dashboard

## Purpose

Creates or replaces the generated `project.md` → `## Dashboard` section.
The dashboard gives the instructor a compact, visual entry point into the project state.

The dashboard is **derived state**. It is never the source of truth.

## Inputs

- `project.md` main metadata header, especially `@style` and template `import:` lines
- `project.md` → `## Course Context`
- `project.md` → `## Templates`
- `project.md` → `## Outline`
- `project.md` → `## Didactics`
- `project.md` → `## Agenda`
- `project.md` → `## Sessions`, including overview table, `#### Validation Report`, and `#### Persona Reviews`
- `project.md` → `## Validation` → `### Latest Validation Summary`, if present
- `templates/project-dashboard.yaml`

## Output

- `project.md` → `## Dashboard`
- Optional minimal `@style` block in the main metadata header if dashboard classes are missing

## Automatic Trigger

Run this task automatically after any task that changes project state:

- `/init-course`
- `/scaffold`
- `/create-outline`
- `/create-didactics`
- `/manage-templates`
- `/create-agenda`
- `/create-session`
- `/promote-session`
- `/coauthor-materials` after approval
- `/quick-fix`
- `/validate-course`
- `/review-as-persona`
- `/assemble-bundle`
- `/create-project` or `/update-project`

## Steps

1. Read the source sections listed above.
2. Derive the current project status:
   - Current step
   - Next useful commands
   - Course validation state
   - Publishing gate state
   - Session progress
   - Open blockers
   - Optional learner persona review status
3. Ensure the main metadata header contains the imports required by the dashboard:
   - If the Mermaid LiaScript template is imported, render workflow diagrams as fenced code blocks with `@mermaid`.
   - If Mermaid is not imported, either use plain Mermaid syntax supported by the target renderer or suggest `/manage-templates mermaid`.
4. Ensure the main metadata header contains only minimal dashboard CSS:
   - Prefer one reusable `<article class="dashboard">`.
   - Use simple `<div class="dashboard-card">` sections.
   - Use compact status classes such as `dashboard-status-done`, `dashboard-status-current`, and `dashboard-status-blocked`.
   - Keep CSS generic and short; do not encode course-specific colors, text, or session names in CSS.
5. Replace only `project.md` → `## Dashboard`.
6. Do not modify the source sections used to derive the dashboard.
7. Confirm the dashboard was updated and name the next recommended command.

## Dashboard Structure

Use this structure unless the instructor asks for a different layout:

````markdown
## Dashboard

<article class="dashboard">

_Generated from the project sections below. Do not edit manually._

<div class="dashboard-grid">

<div class="dashboard-card">

### Current State

...

</div>

<div class="dashboard-card">

### Next Commands

...

</div>

<div class="dashboard-card">

### Quality State

...

</div>

<div class="dashboard-card dashboard-card-wide">

### Workflow Map

```mermaid @mermaid
...
```

</div>

<div class="dashboard-card dashboard-card-wide">

### Session Progress

...

</div>

<div class="dashboard-card">

### Open Blockers

...

</div>

<div class="dashboard-card">

### Quick Links

...

</div>

</div>
</article>
````

## Rules

- Never ask the instructor to update the dashboard manually.
- Never use dashboard values as authority for workflow decisions.
- If dashboard and source sections disagree, trust the source sections and regenerate the dashboard.
- Mermaid `click` links are helpful but renderer-dependent; always include regular Markdown quick links as fallback.
- Keep the dashboard near the top of `project.md`, directly after the main course title.
