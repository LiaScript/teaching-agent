# Task: develop-template

## Purpose

Builds an own LiaScript template from its brief `### {id} (in development)` in `journal.md` →
`## Templates`, inside the course project in `lia-templates/{id}/` — README with macros and examples,
JavaScript/CSS beside it, model tests — tests it, lets the instructor try it in the preview and hands it
back to the Teaching-Agent once it is `ready to test`. The Teaching-Agent checks and adopts it with
`:manage-templates {id}`; publishing it as its own repository is a later, optional step
(`:publish-template {id}`).

Use this task when:
- The Dashboard's `next` names `:develop-template {id}` (a brief with `__State:__ brief` or `in development`)
- `:manage-templates {id}` sent the template back (`__State:__ in development`, new entry in `__Feedback rounds:__`)

## Inputs

- `id` (required command parameter): the id of a brief `### {id} (in development)`
- `journal.md` → `## Templates` → **only** the brief `### {id} (in development)` (the read scope of `agents/development-agent.yaml`; the Dashboard write of step 6 reads the selection line and all briefs — update-dashboard reads them as derived state)
- `journal.md` → `## Course Context` (language, target group)
- Skill `liascript-templates` — **required** (`data/skills.md` → Where the Workflow Uses Them); there is no built-in replacement guide in `specs/`
- `specs/dashboard/README.md` and `specs/dashboard/check.mjs` — the pattern for README, macros, library and model tests (read as the step needs them)
- `data/skills.md` → Installing a Missing Skill
- `templates.local.json` in the project root (project list, if present; data format: `specs/catalog/README.md` → Data format)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`, `data/chat-checks.md`

## Output

- `lia-templates/{id}/`: `README.md` (header with the macros, one example per macro, a runnable LiaScript document), the JavaScript/CSS files beside it, `check.mjs` (model tests for `node --test`)
- `journal.md` → `## Templates` → the brief: `__Folder:__ lia-templates/{id}/` and `__State:__` (`in development`, at the end `ready to test`)
- `templates.local.json`: the entry `{id}` with `status: "own"` and the local import `./lia-templates/{id}/README.md` (at `ready to test`)
- `journal.md` → `## Dashboard` updated

## Steps

0. **Skill first.** Detect `liascript-templates` (`data/skills.md` → Detection). If it is missing, offer
   the installation once (`data/skills.md` → Installing a Missing Skill — tier confirm in terminal, also
   when the command came from the preview chat). Declined, or no shell: end the command here with the
   note that building a template needs this skill and the install command — write nothing and give no
   replacement instructions. Say in one line that the step uses `liascript-templates`.
1. **Read the brief.** Read only `### {id} (in development)` in `## Templates`.
   - No such brief: say so; briefs are written by the Teaching-Agent with `:suggest-templates` — offer
     `agent:teaching/switch` and end here.
   - `__State:__ ready to test`: the template waits for the Teaching-Agent's check — offer
     `agent:teaching/switch` (the Dashboard's `next` shows `:manage-templates {id}`) and end here.
   - `brief` or `in development`: continue. The newest entry of `__Feedback rounds:__`, if any, is the work
     list of this round.
   - **Unclear points go back, never invent them:** a missing field, an acceptance point that cannot be
     checked, or a learner action or feedback too vague to build — name it, write nothing, and hand back
     with `agent:teaching/switch` (the brief is the Teaching-Agent's). Never fill a gap with your own
     assumption.
2. **Plan, confirmed in the chat.** Show in plain words (course language): the folder
   `lia-templates/{id}/`, the macros (name, what each does for the learners, its parameters), the files
   (`README.md`, JavaScript/CSS, `check.mjs`), every external library with its fixed version (from the
   library's own documentation — never invented), and how each `__Acceptance:__` point will be checked
   (model test, rendered in the preview, tried by the instructor). 🎛️ "Start" / "Change something"
   (translated). This is the confirmation of the tier "confirm in chat" (`data/agent-links.md`) — no
   second question before it; nothing is written before "Start".
3. **Build.** Create or update `lia-templates/{id}/` with the file-edit tool, following
   `liascript-templates` and the pattern of `specs/dashboard/`:
   - `README.md`: LiaScript header with `script:` / `link:` to the files beside it and the macros
     (named after the template, e.g. `@Dashboard.View`), then one runnable example per macro — the file is
     itself a LiaScript document that `:preview lia-templates/{id}/README.md` shows. Texts in the course
     language for now (`:publish-template` makes the documentation English).
   - JavaScript/CSS beside it: plain files without a build step; logic the tests need goes into functions
     that load in the browser and in Node (pattern `specs/dashboard/dashboard.js`).
   - `check.mjs`: model tests with `node:test` (pattern `specs/dashboard/check.mjs`), at least one per
     `__Acceptance:__` point that a model test can decide.
   In the first round set in the brief `__Folder:__ lia-templates/{id}/` and `__State:__ in development` —
   one write (the only journal fields this task changes besides step 6).
4. **Test** — each command on its own:
   - `node --test lia-templates/{id}/check.mjs`
   - with the MCP gate open: show `lia-templates/{id}/README.md` in the preview (`goto`) and use
     `run_in_page` to check that every macro rendered and that the console shows no error
   - the rendered check `node specs/dashboard/check-material.mjs lia-templates/{id}/README.md`; if it prints
     "Rendered check not possible": `data/chat-checks.md` → Offering the Rendered Check
   Fix what fails before step 5. Name each result with how it was checked (`data/chat-checks.md` → Say how
   you checked); a missing browser test is said, never passed over.
5. **The instructor tries it.** Offer the preview (`agent:development/preview?file=lia-templates/{id}/README.md`,
   in the terminal `:preview lia-templates/{id}/README.md`) and ask per `__Acceptance:__` point: 🎛️ "met" /
   "not yet" (translated, one form, at most 4 points), what is missing as a typed reply. A point about what
   learners see counts as met only once the instructor tried it.

   **Loop:** Repeat steps 3–5 until the instructor confirms the brief's `__Acceptance:__` points in the preview, or after 3 iterations — whichever comes first. On hitting the cap without meeting the condition: stop and report the remaining points to the instructor instead of continuing.

   At the cap `__State:__` stays `in development`; name the open points and offer either a new
   `:develop-template {id}` later or `agent:teaching/switch` to sharpen the brief.
6. **Ready to test.** Every point confirmed: set `__State:__ ready to test` (one write; `__Folder:__` names
   the folder and `lia-templates/{id}/README.md` exists), run `node specs/dashboard/validate-journal.mjs`.
   Then write or update the entry `{id}` in `templates.local.json` with the file-edit tool (create the file
   as `{ "version": 1, "templates": [ … ] }` if missing; replace an existing entry with the same id): `id`,
   `name`, `description` (English), `import: "./lia-templates/{id}/README.md"`, `subjects` and `audiences`
   (from `## Course Context` and the brief's `__Audience:__`), `macros` (from the README), `status: "own"` —
   no `repo` and no `demo` while the template stays in the project, never `status: "checked"`. Then run
   `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` →
   `## Dashboard` in place.
7. **Finish:** a short summary (macros, files, how each point was checked) and the hand-back:
   `agent:teaching/switch` — the Dashboard's `next` shows `:manage-templates {id}`, where the Teaching-Agent
   checks it against the brief and adopts it. One line: after the adoption the template can get its own
   repository with `:publish-template {id}` (optional).

## Notes

- This task writes only: the files in `lia-templates/{id}/`, the fields `__State:__` and `__Folder:__` of the brief `### {id} (in development)`, the entry `{id}` in `templates.local.json` (step 6), and `journal.md` → `## Dashboard` (through `tasks/update-dashboard.md`).
- It never writes other brief fields, `__Feedback rounds:__`, the selection line, adopted entries, `import:` lines (header or materials — the adoption by `:manage-templates {id}` sets them), other entries of `templates.local.json` or `specs/catalog/templates.json`, and it runs no git command.
- Develop in the project, never in `specs/` and never in a folder or clone outside the project.
- Nothing is invented: macros, library versions and APIs only from the library's documentation and what the tests and the preview showed.
