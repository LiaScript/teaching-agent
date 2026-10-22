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

- **single-file:** nothing generated on disk except `journal.md` → `## Publishing`; a confirmed git push and the LiaScript live-viewer URL
- **multi-file:** `project.yaml` in the root folder (includes all materials as separate cards), a GitHub Actions workflow for LiaScript export and publishing, and `journal.md` → `## Publishing`

## Optional Skills

Only if installed (see `data/skills.md`) — never install them:

- `exporter-workflow` — use it next to `data/liascript-workflows.md` for `project.yaml`, the GitHub Actions workflow, and additional exports (PDF, SCORM, ePub, …). The rules of this task (e.g. `force_orphan: true`, confirmation before changes) stay binding.
- `oersi-metadata` — 🎛️ offer once to add a `metadata.yml` so the course can be indexed as OER on OERSI (1. yes · 2. no). It is committed together with the other publishing files via `:manage-git`.

## Steps

0. Load `data/liascript-workflows.md` for the full CLI reference, `project.yaml` schema, and workflow templates. Only fetch the external URLs if a specific question is not answered by the internal reference.
1. Check `journal.md` → `## Validation` → `### Latest Validation Summary`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block publishing and ask the instructor to run `:validate-course`.
   - **Contact address:** if `## Course Context` → Conventions → Contact is empty, ask for it now (publishing needs an `email:` in the material headers). It becomes part of the plan: written to `## Course Context` and as `email:` into every material header after the confirmation.
2. Read `journal.md` → `## Course Context` → `__File Structure:__` and branch:

### single-file mode

3. **Read the repository before anything changes** (read-only git): the `origin` remote and the current branch. Derive `{owner}/{repo}` and the viewer URL for the mode — single-file: `https://liascript.github.io/course/?https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md`; multi-file: `https://{owner}.github.io/{repo}/` (GitHub Pages). This is a stable LiaScript / GitHub convention — recommend the instructor spot-check it once (epistemic rules: never assert unverified syntax as certain). Without a remote: ask whether to create the GitHub repository via `:manage-git` first, or stop.
4. Ask the user about their git/GitHub experience.
5. Check which files must be added to git and which need to be committed (`README.md`, `assets/`).
6. **Show the plan, then confirm in the terminal** (tier "confirm in terminal", `data/agent-links.md`) — before any change: single-file publishes by pushing to GitHub directly, no `project.yaml`, no workflow, no GitHub Pages step (see `data/file-structure-modes.md` → "Publishing"); the files to commit, the push target, the viewer URL, and the `## Publishing` entries that will be written.
7. On confirmation: write `journal.md` → `## Publishing` (`__Repository:__`, `__Branch:__`, `__Viewer URL:__`, `__State:__ not published`), then hand off to `:manage-git` to commit and push.
8. Once pushed: set `__State:__ published on {date} (commit {short hash})`, present the viewer URL, and run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

### multi-file mode

3. **Read the repository before anything changes** (read-only git): the `origin` remote and the current branch. Derive `{owner}/{repo}` and the viewer URL for the mode — single-file: `https://liascript.github.io/course/?https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md`; multi-file: `https://{owner}.github.io/{repo}/` (GitHub Pages). This is a stable LiaScript / GitHub convention — recommend the instructor spot-check it once (epistemic rules: never assert unverified syntax as certain). Without a remote: ask whether to create the GitHub repository via `:manage-git` first, or stop.
4. Ask the user about their git/GitHub experience and if they know how to activate GitHub Pages.
5. Build the `collection:` entries: one entry per `materials/{number}-{slug}/README.md`, in session order; ask the user if any session should be excluded.
6. Read color and style information from `journal.md` → `## Visual Identity` for project.yaml styling, and review the internal reference for the latest workflow and publishing best practices.
7. **Show the plan, then confirm in the terminal** — before any change (a complete `project.yaml` pattern: `data/example-project.yaml`): the `project.yaml` outline (cards in order, styling), the GitHub Actions workflow (export, deployment that always overwrites gh-pages completely, e.g. `force_orphan: true`), the files to commit, the push target, the GitHub Pages URL, and the `## Publishing` entries that will be written.
8. On confirmation: generate `project.yaml` in the root folder and the workflow file, write `journal.md` → `## Publishing` (`__State:__ not published`), then hand off to `:manage-git` to commit and push.
9. Once pushed: set `__State:__ published on {date} (commit {short hash}) – GitHub Pages builds after the workflow run`, remind the instructor to activate GitHub Pages if it is not active yet, and run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

## Usage

This task is invoked when:
- Setting up publishing for the first time, in either mode
- Automating project.yaml and workflow creation (multi-file mode)
- Assisting users with git/GitHub operations and publishing (both modes)
