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

## Output

- **single-file:** committed and pushed changes to GitHub; no other generated files
- **multi-file:** updated `project.yaml` in the root folder (reflecting all current materials); committed and pushed changes; triggered GitHub Actions workflow to publish updates

## Optional Skills

Only if installed (see `data/skills.md`) — never install them:

- `exporter-workflow` — use it next to `data/liascript-workflows.md` for `project.yaml`, the GitHub Actions workflow, and additional exports (PDF, SCORM, ePub, …). The rules of this task (e.g. `force_orphan: true`, confirmation before changes) stay binding.
- `oersi-metadata` — 🎛️ offer once to add a `metadata.yml` so the course can be indexed as OER on OERSI (1. yes · 2. no). It is committed together with the other publishing files via `:manage-git`.

## Steps

1. Check `journal.md` → `## Validation` → `### Latest Validation Summary`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block publishing and ask the instructor to run `:validate-course`.
2. Read `journal.md` → `## Course Context` → `__File Structure:__` and branch:

### single-file mode

3. Ask the user about their git/GitHub experience and confirm they want to publish the update.
4. Stage, commit, and push the changed `README.md` and/or `assets/` to the repository (hand off to `:manage-git` for the actual git operations).
5. Confirm: the LiaScript live-viewer URL from the last `:create-project` run is unchanged and now reflects the update (raw GitHub content updates as soon as the push lands — no rebuild step).
6. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place (publishing state).

### multi-file mode

3. Ask the user about their git/GitHub experience and confirm they want to update and publish.
4. Scan the `materials/` folder for new or updated session files.
5. Update the `project.yaml` `collection:` entries accordingly (one entry per `materials/{number}-{slug}/README.md`) and ask the user to include all of the current materials or to import only a subset. Use colors and style from `journal.md` → `## Visual Identity` for any styling updates.
6. Stage, commit, and push the updated `project.yaml` and new/changed materials to the repository.
7. Trigger the GitHub Actions workflow to publish the updates (overwriting gh-pages as before).
8. Explain each step to the user and confirm before making changes.
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place (publishing state).

## Usage

This task is invoked when:
- New materials have been created or existing ones updated
- The user wants to publish an update, in either mode
- Keeping published content in sync with the latest materials
