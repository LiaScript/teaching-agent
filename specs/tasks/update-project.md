# Task: update-project

## Purpose

Publishes new or changed content. Behavior branches hard on `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`):

- **single-file:** there is no `project.yaml` to update — just commit and push the changed `README.md` / `assets/` to GitHub. The existing LiaScript live-viewer URL keeps working unchanged (it always points at the latest `README.md` on the branch).
- **multi-file:** updates `project.yaml`'s `collection:` entries and republishes via the existing GitHub Pages workflow — as before.

## Inputs

- `journal.md` → `## Validation` → `### Latest Validation Summary` (**must show `Mode: course` and `Result: PASS`**)
- User's git/GitHub experience (ask before proceeding)
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`)
- **multi-file only:** existing `project.yaml` in the root folder; colors and style from `journal.md` → `## Visual Identity`; `data/liascript-workflows.md` — internal reference for `project.yaml` schema and workflow templates
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- **single-file:** committed and pushed changes to GitHub; no other generated files
- **multi-file:** updated `project.yaml` in the root folder (reflecting all current materials); committed and pushed changes; triggered GitHub Actions workflow to publish updates

## Optional Skills

Only if installed (see `data/skills.md`); a missing one is offered once per conversation (`data/skills.md` → Installing a Missing Skill):

- `liascript-exporter` — use it next to `data/liascript-workflows.md` for `project.yaml`, the GitHub Actions workflow, and additional exports (PDF, SCORM, ePub, …). The rules of this task (e.g. `force_orphan: true`, confirmation before changes) stay binding.
- `oersi-metadata` — 🎛️ offer once to add a `metadata.yml` so the course can be indexed as OER on OERSI (1. yes · 2. no). It is committed together with the other publishing files via `:manage-git`.

## Steps

1. Check `journal.md` → `## Validation` → `### Latest Validation Summary`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block publishing and ask the instructor to run `:validate-course`.
   - **Contact address:** if `## Course Context` → Conventions → Contact is empty, ask for it now (publishing needs an `email:` in the material headers). It becomes part of the plan: written to `## Course Context` and as `email:` into every material header after the confirmation.
   - **Version:** LiaScript stores quiz and survey state only from `version: 1.0.0` on. The plan sets every material header below 1.0.0 to `1.0.0`; when content changed since the last publication, raise the minor version (e.g. 1.0.0 → 1.1.0). Header lines set here are publishing metadata and do not reopen a check.
2. Read `journal.md` → `## Course Context` → `__File Structure:__` and branch:

### both modes

3. Read `journal.md` → `## Publishing` (repository, branch, viewer URL). If it is missing or empty, read the repository first exactly as `tasks/create-project.md` step 3 does.
4. Ask the user about their git/GitHub experience.
4b. **Template files in the commit list:** changed local templates that are not outsourced (`lia-templates/{id}/`) and `templates.local.json` are committed with the course content; outsourced template folders (their own git repository), the installed skill folders and `node_modules/` stay in the `.gitignore` — a missing entry goes into the plan (as in `tasks/create-project.md` step 5).

### single-file mode

5. Check which changed files must be committed (`README.md`, `assets/`, the template files of step 4b).
6. **Show the plan, then confirm in the terminal** — before any change: the files to commit, the push target, and that the viewer URL stays the same (raw GitHub content updates as soon as the push lands — no rebuild step).
7. On confirmation: hand off to `:manage-git` to commit and push.

### multi-file mode

5. Scan the `materials/` folder for new or updated session files and propose the new `project.yaml` `collection:` entries (one entry per `materials/{number}-{slug}/README.md`); ask whether to include all current materials or only a subset. Use colors and style from `journal.md` → `## Visual Identity` for any styling updates.
6. **Show the plan, then confirm in the terminal** — before any change: the `project.yaml` changes, the files to commit, the push target, and that the GitHub Actions workflow republishes the GitHub Pages URL (overwriting gh-pages as before).
7. On confirmation: update `project.yaml`, then hand off to `:manage-git` to commit and push; the push triggers the workflow.

### after the push (both modes)

8. Set `journal.md` → `## Publishing` → `__State:__ published on {date} (commit {short hash})` and run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

## Usage

This task is invoked when:
- New materials have been created or existing ones updated
- The user wants to publish an update, in either mode
- Keeping published content in sync with the latest materials
