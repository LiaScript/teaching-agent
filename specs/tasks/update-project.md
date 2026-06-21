# Task: update-project

## Purpose

Updates the `project.yaml` with any newly created or updated materials, commits these changes to git, and publishes them on GitHub (via GitHub Pages workflow).

## Inputs

- Existing `project.yaml` in the root folder
- `journal.md` → `## Validation` → `### Latest Validation Summary` (**must show `Mode: course` and `Result: PASS`**)
- User's git/GitHub experience (ask before proceeding)
- Colors and style from `journal.md` → `## Visual Identity`
- `data/liascript-workflows.md` — internal reference for `project.yaml` schema and workflow templates

## Output

- Updated `project.yaml` in the root folder (reflecting all current materials)
- Committed and pushed changes to GitHub
- Triggered GitHub Actions workflow to publish updates

## Steps

1. Check `journal.md` → `## Validation` → `### Latest Validation Summary`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block publishing and ask the instructor to run `:validate-course`.
2. Ask the user about their git/GitHub experience and confirm they want to update and publish.
3. Scan the `materials/` folder for new or updated files.
4. Update the `project.yaml` and ask the user to include all of the current materials or to import only a subset. Use colors and style from `journal.md` → `## Visual Identity` for any styling updates.
5. Stage, commit, and push the updated `project.yaml` and new/changed materials to the repository.
6. Trigger the GitHub Actions workflow to publish the updates (overwriting gh-pages as before).
7. Explain each step to the user and confirm before making changes.
8. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place (publishing state).

## Usage

This task is invoked when:
- New materials have been created or existing ones updated
- The user wants to update the published project on GitHub Pages
- Keeping `project.yaml` and published content in sync with the latest materials
