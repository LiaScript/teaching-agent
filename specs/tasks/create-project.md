# Task: create-project

## Purpose

Automates the creation of a `project.yaml` for LiaScript publishing and sets up a GitHub Pages workflow.  
Supports users with git operations, GitHub integration, and project publishing.

## Inputs

- Colors and style from `journal.md` → `## Visual Identity`
- `journal.md` → `## Validation` → `### Latest Validation Summary` (**must show `Mode: course` and `Result: PASS`**)
- User's git/GitHub experience (ask before proceeding)
- `data/liascript-workflows.md` — internal reference for all CLI options, `project.yaml` schema, and workflow templates (load this first)

## Output

- `project.yaml` in the root folder (includes all materials)
- GitHub Actions workflow for LiaScript export and publishing

## Steps

0. Load `data/liascript-workflows.md` for the full CLI reference, `project.yaml` schema, and workflow templates. Only fetch the external URLs if a specific question is not answered by the internal reference.
1. Check `journal.md` → `## Validation` → `### Latest Validation Summary`.
   - If missing, not `Mode: course`, or not `Result: PASS`: block publishing and ask the instructor to run `/validate-course`.
2. Ask the user about their git/GitHub experience and if they know how to activate GitHub Pages.
3. Refer to the all files in the `materials/` folder or ask the user which one to embed in the materials list.
4. Read color and style information from `journal.md` → `## Visual Identity` for project.yaml styling.
5. Review the internal reference for the latest workflow and publishing best practices.
6. Generate a `project.yaml` in the root folder, including all materials and styled according to the style guide.
7. Create a GitHub Actions workflow for LiaScript export and publishing to GitHub Pages. The workflow must always overwrite the gh-pages branch completely (no history or previous files kept), e.g. by using `force_orphan: true` in the deployment step.
8. Check which files must be added to git and which need to be commited.
9. Explain each step to the user and confirm before making changes.
10. Offer to commit and push changes and to GitHub if the user agrees.

## Usage

This task is invoked when:
- Setting up a new LiaScript project for publishing
- Automating project.yaml and workflow creation
- Assisting users with git/GitHub operations and publishing
