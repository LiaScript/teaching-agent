# Task: manage-templates

## Purpose

Creates or updates `journal.md` → `## Templates` and keeps LiaScript template imports synchronized with the main metadata header.

Use this task when:
- `/init-course` captures LiaScript conventions that mention template imports
- `/scaffold` receives template requirements during the intake interview
- The instructor later adds, changes, or removes a LiaScript template
- A material needs a new macro provided by a template

## Inputs

- `journal.md` → `## Course Context` (`__Conventions & Standards:__` and `__LiaScript conventions:__` bullets)
- Template name, import URL, purpose, and usage rules
- Optional runnable examples and special examples
- Template documentation or import source, if accessible
- `templates/course-templates.yaml`

## Output

- `journal.md` main metadata header updated with one `import: {url}` line per active template
- `journal.md` → `## Templates` created or updated

## Steps

1. Read `journal.md` → `## Course Context`, especially `__LiaScript conventions:__`.
2. Detect template import hints:
   - Lines such as `Template import: https://...`
   - Existing header lines such as `import: https://...`
   - Explicit instructor requests such as "add the chart template"
3. For each active template:
   - Determine the template name (e.g. `skulpt`)
   - Determine the import URL
   - Inspect the template documentation, README, or import source when available
   - Determine what macros or syntax it provides from the inspected source
   - Determine where it must be imported (project header, material headers, or both)
   - If the source cannot be inspected, document only confirmed usage and ask the instructor for missing macro details before inventing examples
4. Update the main metadata header at the top of `journal.md`:
   - Add `import: {url}` if missing
   - Do not duplicate existing imports
   - Keep existing metadata lines unchanged
5. Create or update `journal.md` → `## Templates` using `templates/course-templates.yaml`.
   - Keep the overview text with the link to [topics/liascript-template](https://github.com/topics/liascript-template)
   - Create one `### {template_name}` subsection per template
   - Replace an existing template subsection if the same template name already exists
6. Include runnable examples where useful.
   - For Skulpt regular Python examples, include a Python code block followed by `@Skulpt.eval`
   - For Skulpt turtle examples, include a Python code block followed by `@Skulpt.eval(skulpt_canvas)` and a persistent canvas `<div>`
7. When promoting or coauthoring materials, ensure any material using a documented template also includes the matching `import: {url}` in its own LiaScript header.
8. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
9. Confirm what changed:
   - Header imports added or already present
   - Template sections created or updated
   - Any material files that still need imports

## Notes

- `## Templates` is documentation and governance. It does not replace the actual LiaScript `import:` metadata line.
- Keep the `## Course Context` conventions short. Put detailed examples and usage rules in `## Templates`.
- Do not remove a template import unless no material or project section uses its macros anymore.
