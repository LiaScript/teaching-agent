# Task: manage-templates

## Purpose

Creates or updates `journal.md` → `## Templates` and keeps LiaScript template imports synchronized with the main metadata header.

Use this task when:
- `:init-course` captures LiaScript conventions that mention template imports
- `:scaffold` receives template requirements during the intake interview
- The instructor later adds, changes, or removes a LiaScript template
- A material needs a new macro provided by a template
- A catalog card ("Adopt into my course") or `:suggest-templates` adopts a template by its catalog `id`
- An own template in development is ready to test (`name` = the id of its brief)

## Inputs

- `name` (optional command parameter): the template to add or update — a template name, a catalog `id` or the id of a brief `### {id} (in development)`; then do not ask which one
- `journal.md` → `## Course Context` (`__Conventions & Standards:__` and `__LiaScript conventions:__` bullets)
- `journal.md` → `## Templates` (entries, briefs, the line `__Template selection:__`)
- `specs/catalog/templates.json` (shared list, read-only) and `templates.local.json` in the project root (project list, if present)
- Template name, import URL, purpose, and usage rules
- Optional runnable examples and special examples
- Template documentation or import source, if accessible
- `templates/course-templates.yaml`
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- `journal.md` main metadata header updated with one `import: {url}` line per active template
- `journal.md` → `## Templates` created or updated

## Steps

1. Read `journal.md` → `## Course Context`, especially `__LiaScript conventions:__`.
   Without `{name}` and without a template the instructor names: offer the catalog (`:preview specs/catalog/README.md`) and `:suggest-templates`.
1b. **Catalog id:** If `{name}` is also the id of a brief `### {id} (in development)` in `## Templates` (an own template is listed in `templates.local.json` from `ready to test` on, also after "Back to development"), step 1c decides (acceptance check first) — never adopt it through this step. If `{name}` is an `own` entry whose import is `./lia-templates/{id}/README.md` and `## Templates` holds neither a brief nor an adopted entry (`__Catalog id:__ {id}`) for it, adopt nothing: say that its brief is gone, so its acceptance check cannot run, offer `:suggest-templates` (a new brief) instead, write nothing and end here. If `{name}` is a catalog `id` (in `specs/catalog/templates.json` or `templates.local.json`), take `import`, `macros`, `repo` and `demo` from that entry and read the template's README to confirm the macros before writing. Tell the instructor the entry's status in the course language; never present a `found` or `own` entry as checked. If `{name}` matches no `id`, continue as before and point to the catalog (`:preview specs/catalog/README.md`). The entry gets `__Catalog id:__ {id}` and `__Source:__` (`catalog` for the shared list; for the project list `found`, or for an `own` template `lia-templates/{id}/` or its `{repo-url}@{tag}`).
1c. **Brief id:** If `{name}` is the id of a brief `### {id} (in development)` in `## Templates`, act by its `__State:__`:
   - `ready to test`: read `lia-templates/{id}/README.md` and check it against every point of `__Acceptance:__` — run `node --test lia-templates/{id}/check.mjs` if it exists and `node specs/dashboard/check-material.mjs lia-templates/{id}/README.md` (each on its own), and let the instructor try it (`:preview lia-templates/{id}/README.md`). Show the result per point with how it was checked (`data/chat-checks.md` → Say how you checked); a point about what learners see counts as met only once it was tried. 🎛️ "Adopt" (only when every point is met) · "Back to development" (translated).
   - Met and "Adopt": the local import `./lia-templates/{id}/README.md` goes into the header, a normal entry (`template-entry`, `__Catalog id:__ {id}`, `__Source:__ lia-templates/{id}/`) replaces the brief in place, and the selection line follows step 5 (selection line). Then continue with step 3b.
   - Not met or "Back to development": set `__State:__ in development`, add the dated feedback (what failed, what the instructor said) to `__Feedback rounds:__`, adopt nothing. Show these two changes with "Save" / "Change something" (translated), write them in one write, skip steps 2–7 and continue with step 8; then offer `agent:development/switch`.
   - `brief` or `in development`: say that the Development-Agent is still working on it (`agent:development/switch`), write nothing and end here. To drop or replace the brief instead: `:suggest-templates` (its step 1 → Revising).
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
3b. **Before saving:** show the header import lines and the `## Templates` entries as they will be written (after step 1c also the replaced brief; a removed entry with the import line that goes or stays), the changed selection line (step 5), plus the material files that will need the import, with "Save" / "Change something" (translated) — the single write confirmation of this task. Called from `:init-course`, `:scaffold`, `:analyze-existing` or from `:suggest-templates`, their save summary covers it; called from `:update-dashboard` for the missing Dashboard entry (derived state), no question.

4. After "Save", update the main metadata header at the top of `journal.md`:
   - Add `import: {url}` if missing
   - Do not duplicate existing imports
   - Keep existing metadata lines unchanged
5. Create or update `journal.md` → `## Templates` using `templates/course-templates.yaml`.
   - If no existing template provides what the instructor needs, offer `:suggest-templates`: it searches the catalog and online and, if nothing fits, writes a brief for an own template that the Development-Agent builds.
   - If the skill `liascript-syntax` is available (see `data/skills.md`), use it for correct usage examples.
   - Keep the overview text with the link to [topics/liascript-template](https://github.com/topics/liascript-template)
   - Create one `### {template_name}` subsection per template, inside the section's single `<section>` … `</section>` wrapper (create the wrapper if missing; never remove it)
   - Keep the `### Dashboard` entry — the Dashboard library import is part of every project
   - Replace an existing template subsection if the same template name already exists; an adopted brief (step 1c) is replaced in place by its entry
   - Selection line (`* __Template selection:__`, `templates/course-templates.yaml`): an adopted entry with `__Catalog id:__ {id}` (catalog card, step 1b, step 1c) adds `{id}` to a `done – …` line that does not name it (`done – none needed` becomes `done – {id}`; `open` stays `open`). Removing an entry: ask whether its activity still needs a template (before step 3b) — yes → `open`; no → its id leaves the line, none left: `done – none needed` (an `open` line stays `open`); after a yes offer `:suggest-templates`. Written in the same write as the entries, never first. Called from `:suggest-templates`, that task sets the line.
6. Include runnable examples where useful.
   - For Skulpt regular Python examples, include a Python code block followed by `@Skulpt.eval`
   - For Skulpt turtle examples, include a Python code block followed by `@Skulpt.eval(skulpt_canvas)` and a persistent canvas `<div>`
7. When promoting or coauthoring materials, ensure any material using a documented template also includes the matching `import: {url}` in its own LiaScript header.
8. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
9. Confirm what changed:
   - Header imports added or already present
   - Template sections created or updated
   - Any material files that still need imports
   - After step 1c: the units named in the former brief's `__Used in:__` whose placeholders ("here comes the {activity} once the template is ready", `tasks/coauthor-materials.md`) now need the macro — offer `:coauthor-materials {n}` for each

## Notes

- `## Templates` is documentation and governance. It does not replace the actual LiaScript `import:` metadata line.
- Keep the `## Course Context` conventions short. Put detailed examples and usage rules in `## Templates`.
- Do not remove a template import unless no material or project section uses its macros anymore.
- Never write to `specs/catalog/templates.json`; it is replaced on every update of the Teaching-Agent. Project entries go into `templates.local.json` (status `found` or `own`, never `checked`).
