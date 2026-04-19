# Task: update-project

## Purpose

Updates the `project.yaml` with any newly created or updated materials, commits these changes to git, and publishes them on GitHub (via GitHub Pages workflow).

## Inputs

- Existing `project.yaml` in the root folder
- User's git/GitHub experience (ask before proceeding)
- Colors and style from `docs/visuals.md`

## Output

- Updated `project.yaml` in the root folder (reflecting all current materials)
- Committed and pushed changes to GitHub
- Triggered GitHub Actions workflow to publish updates

## Steps

1. Ask the user about their git/GitHub experience and confirm they want to update and publish.
2. Scan the `materials/` folder for new or updated files.
3. Update the `project.yaml` and ask the user to include all of the current materials or to import only a subset. Use colors and style from `docs/visuals.md` for any styling updates.
4. Stage, commit, and push the updated `project.yaml` and new/changed materials to the repository.
5. Trigger the GitHub Actions workflow to publish the updates (overwriting gh-pages as before).
6. Explain each step to the user and confirm before making changes.

## Usage

This task is invoked when:
- New materials have been created or existing ones updated
- The user wants to update the published project on GitHub Pages
- Keeping `project.yaml` and published content in sync with the latest materials
