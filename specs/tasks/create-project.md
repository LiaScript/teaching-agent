# Task: create-project

## Purpose

Automates the creation of a `project.yaml` for LiaScript publishing and sets up a GitHub Pages workflow.  
Supports users with git operations, GitHub integration, and project publishing.

## Inputs

- Colors and style from `docs/visuals.md`
- User's git/GitHub experience (ask before proceeding)
- External resources for workflow for LiaScript publishing:
  1. https://liascript.github.io/blog/automating-liascript-transformations-on-github/
  2. https://liascript.github.io/blog/quality-checks-on-liascript-with-github-ensuring-document-excellence/
  3. https://liascript.github.io/blog/creating-project-websites-with-liascript-exporter/

## Output

- `project.yaml` in the root folder (includes all materials)
- GitHub Actions workflow for LiaScript export and publishing

## Steps

0. Load external resources to understand the latest workflow and publishing best practices.
1. Ask the user about their git/GitHub experience and if they know how to activate GitHub Pages.
2. Refer to the all files in the `materials/` folder or ask the user which one to embed in the materials list.
3. Read color and style information from `docs/visuals.md` for project.yaml styling.
4. Review the external resources to learn the latest workflow and publishing best practices.
5. Generate a `project.yaml` in the root folder, including all materials and styled according to the style guide.
6. Create a GitHub Actions workflow for LiaScript export and publishing to GitHub Pages. The workflow must always overwrite the gh-pages branch completely (no history or previous files kept), e.g. by using `force_orphan: true` in the deployment step.
7. Check which files must be added to git and which need to be commited.
8. Explain each step to the user and confirm before making changes.
9. Offer to commit and push changes and to GitHub if the user agrees.

## Usage

This task is invoked when:
- Setting up a new LiaScript project for publishing
- Automating project.yaml and workflow creation
- Assisting users with git/GitHub operations and publishing
