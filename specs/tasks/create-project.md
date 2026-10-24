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
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- **single-file:** no new files except `metadata.yml` if the OERSI offer is accepted; changed: `journal.md` → `## Publishing` and `## Course Context` → Contact, and the header lines `email:` / `version:` of `README.md`; a confirmed git push and the LiaScript live-viewer URL
- **multi-file:** `project.yaml` in the root folder (includes all materials as separate cards) and a GitHub Actions workflow for LiaScript export and publishing; changed: `journal.md` → `## Publishing` and `## Course Context` → Contact, and the header lines `email:` / `version:` of every material document

## Optional Skills

Only if installed (see `data/skills.md`); a missing one is offered once per conversation (`data/skills.md` → Installing a Missing Skill):

- `liascript-exporter` — use it next to `data/liascript-workflows.md` for `project.yaml`, the GitHub Actions workflow, and additional exports (PDF, SCORM, ePub, …). The rules of this task (e.g. `force_orphan: true`, confirmation before changes) stay binding.
- `oersi-metadata` — 🎛️ offer once to add a `metadata.yml` so the course can be indexed as OER on OERSI (1. yes · 2. no). It is committed together with the other publishing files via `:manage-git`.

## Steps

1. Check `journal.md` → `## Validation` → `### Latest Validation Summary`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block publishing and ask the instructor to run `:validate-course`.
   - **Contact address:** if `## Course Context` → Conventions → Contact is empty, ask for it now (publishing needs an `email:` in the material headers). It becomes part of the plan: written to `## Course Context` and as `email:` into every material header after the confirmation.
   - **Version:** LiaScript stores quiz and survey state only from `version: 1.0.0` on. The plan sets every material header below 1.0.0 to `1.0.0` (first publication). Header lines set here are publishing metadata and do not reopen a check.
1b. Only once the gate is open: load `data/liascript-workflows.md` for the full CLI reference, `project.yaml` schema, and workflow templates. Only fetch the external URLs if a specific question is not answered by the internal reference.
2. Read `journal.md` → `## Course Context` → `__File Structure:__` and branch:

### single-file mode

3. **Read the repository before anything changes** (read-only git): the `origin` remote and the current branch. Derive `{owner}/{repo}` and the viewer URL for the mode — single-file: `https://liascript.github.io/course/?https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md`; multi-file: `https://{owner}.github.io/{repo}/` (GitHub Pages). This is a stable LiaScript / GitHub convention — recommend the instructor spot-check it once (epistemic rules: never assert unverified syntax as certain). Without a remote: ask whether to create the GitHub repository via `:manage-git` first, or stop.
4. Ask the user about their git/GitHub experience.
5. Decide which files to commit: the course content (`README.md` or `materials/`, and `assets/`) always; `journal.md` and `specs/` (the planning and the assistant) only if the instructor wants the planning in the public repository — ask; never `.cache/` and never the assistant's own files (`CLAUDE.md`, `AGENTS.md`, `.mcp.json`) unless the planning is published too; the `.gitignore` itself is committed (propose one with `.cache/`, `node_modules/`, the installed skill folders of `data/skills.md` and every outsourced template folder `lia-templates/{id}/` that is its own git repository). Local templates that are not outsourced (`lia-templates/{id}/`) and `templates.local.json` are committed with the course content — its imports load them. A repository without a first commit gets it from `:manage-git`.
6. **Show the plan, then confirm in the terminal** (tier "confirm in terminal", `data/agent-links.md`) — before any change: single-file publishes by pushing to GitHub directly, no `project.yaml`, no workflow, no GitHub Pages step (see `data/file-structure-modes.md` → "Publishing"); the files to commit, the push target, the viewer URL, the header lines (`email:` from the contact address, `version:`), and the `## Publishing` entries that will be written. On "cancel" nothing is written — say that the contact address was not saved either.
7. On confirmation: write `journal.md` → `## Publishing` (`__Repository:__`, `__Branch:__`, `__Viewer URL:__`, `__State:__ not published`), then hand off to `:manage-git` to commit and push.
8. Once pushed: set `__State:__ published on {date} (commit {short hash})`, present the viewer URL, and run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

### multi-file mode

3. **Read the repository before anything changes** (read-only git): the `origin` remote and the current branch. Derive `{owner}/{repo}` and the viewer URL for the mode — single-file: `https://liascript.github.io/course/?https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md`; multi-file: `https://{owner}.github.io/{repo}/` (GitHub Pages). This is a stable LiaScript / GitHub convention — recommend the instructor spot-check it once (epistemic rules: never assert unverified syntax as certain). Without a remote: ask whether to create the GitHub repository via `:manage-git` first, or stop.
4. Ask the user about their git/GitHub experience and if they know how to activate GitHub Pages.
5. Build the `collection:` entries: one entry per `materials/{number}-{slug}/README.md`, in session order; ask the user if any session should be excluded.
6. Read color and style information from `journal.md` → `## Visual Identity` for project.yaml styling, and review the internal reference for the latest workflow and publishing best practices.
7. **Show the plan, then confirm in the terminal** — before any change (a complete `project.yaml` pattern: `data/example-project.yaml`): the `project.yaml` outline (cards in order, styling), the GitHub Actions workflow (export, deployment that always overwrites gh-pages completely, e.g. `force_orphan: true`), the header lines (`email:` from the contact address, `version:`), the files to commit (decided as in the single-file branch: which files to commit: the course content (`README.md` or `materials/`, and `assets/`) always; `journal.md` and `specs/` (the planning and the assistant) only if the instructor wants the planning in the public repository — ask; never `.cache/` and never the assistant's own files (`CLAUDE.md`, `AGENTS.md`, `.mcp.json`) unless the planning is published too; the `.gitignore` itself is committed (propose one with `.cache/`, `node_modules/`, the installed skill folders of `data/skills.md` and every outsourced template folder `lia-templates/{id}/` that is its own git repository). Local templates that are not outsourced (`lia-templates/{id}/`) and `templates.local.json` are committed with the course content — its imports load them. A repository without a first commit gets it from `:manage-git`.), the push target, the GitHub Pages URL, and the `## Publishing` entries that will be written.
   On "cancel" nothing is written — say that the contact address was not saved either.
8. On confirmation: generate `project.yaml` in the root folder and the workflow file, write the header lines, write `journal.md` → `## Publishing` (`__State:__ not published`), then hand off to `:manage-git` to commit and push.
9. Once pushed: set `__State:__ published on {date} (commit {short hash}) – GitHub Pages builds after the workflow run`, remind the instructor to activate GitHub Pages if it is not active yet, and run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

## Usage

This task is invoked when:
- Setting up publishing for the first time, in either mode
- Automating project.yaml and workflow creation (multi-file mode)
- Assisting users with git/GitHub operations and publishing (both modes)
