# Task: create-project

## Purpose

Sets up publishing for the course. Behavior branches hard on `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`):

- **single-file:** no `project.yaml`, no GitHub Actions workflow, no GitHub Pages. Publishing is just pushing `README.md` + `assets/` to GitHub — GitHub's raw content hosting is the whole story. Hand back a direct LiaScript live-viewer link.
- **multi-file:** generates `project.yaml` (one card per session) and a GitHub Pages workflow — as before.

## Inputs

- Colors and style from `journal.md` → `## Visual Identity`
- `journal.md` → `## Validation` → `### Latest Validation Summary` (**must show `Mode: course` and `Result: PASS`**)
- User's git/GitHub experience (ask before proceeding)
- `data/liascript-workflows.md` — internal reference for all CLI options, `project.yaml` schema, and workflow templates (load this first)
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`)

## Output

- **single-file:** nothing generated on disk; a confirmed git push and the LiaScript live-viewer URL
- **multi-file:** `project.yaml` in the root folder (includes all materials as separate cards) and a GitHub Actions workflow for LiaScript export and publishing

## Optional Skills

Only if installed (see `data/skills.md`) — never install them:

- `exporter-workflow` — use it next to `data/liascript-workflows.md` for `project.yaml`, the GitHub Actions workflow, and additional exports (PDF, SCORM, ePub, …). The rules of this task (e.g. `force_orphan: true`, confirmation before changes) stay binding.
- `oersi-metadata` — 🎛️ offer once to add a `metadata.yml` so the course can be indexed as OER on OERSI (1. yes · 2. no). It is committed together with the other publishing files via `:manage-git`.

## Steps

0. Load `data/liascript-workflows.md` for the full CLI reference, `project.yaml` schema, and workflow templates. Only fetch the external URLs if a specific question is not answered by the internal reference.
1. Check `journal.md` → `## Validation` → `### Latest Validation Summary`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block publishing and ask the instructor to run `:validate-course`.
2. Read `journal.md` → `## Course Context` → `__File Structure:__` and branch:

### single-file mode

3. Ask the user about their git/GitHub experience.
4. Check which files must be added to git and which need to be committed (`README.md`, `assets/`).
5. Explain that single-file mode publishes by pushing to GitHub directly — no `project.yaml`, no workflow, no GitHub Pages step (see `data/file-structure-modes.md` → "Publishing"). Confirm before proceeding.
6. Offer to commit and push changes to GitHub if the user agrees (hand off to `:manage-git` for the actual git operations).
7. Once pushed, determine the repo's `{owner}/{repo}/{branch}` and present the LiaScript live-viewer URL:
   ```
   https://liascript.github.io/course/?https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md
   ```
   Note this is a stable LiaScript convention — recommend the instructor spot-check it against https://liascript.github.io if anything looks off (per epistemic rules: never assert unverified syntax as certain).
8. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place (publishing state: pushed + viewer URL, no project.yaml/Pages).

### multi-file mode

3. Ask the user about their git/GitHub experience and if they know how to activate GitHub Pages.
4. Build the `collection:` entries: one entry per `materials/{number}-{slug}/README.md`, in session order; ask the user if any session should be excluded.
5. Read color and style information from `journal.md` → `## Visual Identity` for project.yaml styling.
6. Review the internal reference for the latest workflow and publishing best practices.
7. Generate a `project.yaml` in the root folder, including all materials and styled according to the style guide.
8. Create a GitHub Actions workflow for LiaScript export and publishing to GitHub Pages. The workflow must always overwrite the gh-pages branch completely (no history or previous files kept), e.g. by using `force_orphan: true` in the deployment step.
9. Check which files must be added to git and which need to be committed.
10. Explain each step to the user and confirm before making changes.
11. Offer to commit and push changes to GitHub if the user agrees.
12. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place (publishing state).

## Usage

This task is invoked when:
- Setting up publishing for the first time, in either mode
- Automating project.yaml and workflow creation (multi-file mode)
- Assisting users with git/GitHub operations and publishing (both modes)
