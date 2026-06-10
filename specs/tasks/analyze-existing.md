# Task: analyze-existing

## Purpose

Analyzes an existing course project to identify which `project.md` sections and material files are present and which are missing.
Used as the **second step after `/init-course`** when the course type is `improve-existing`.

Offers two paths for each missing core section:
- **Auto-generate** — agent reads existing materials and reverse-engineers a draft
- **Interactive creation** — agent guides the instructor through the relevant creation task

## Inputs

- `project.md` → `## Course Context` (created by `/init-course`, mandatory)
- Existing `project.md` sections: `## Outline`, `## Didactics`, `## Templates`, `## Agenda`, `## Visual Identity`, `## Sessions`
- Existing folder: `materials/`

## Output

- `project.md` → `## Analysis Status` — status overview with recommended actions
- Optionally: auto-generated drafts for missing core sections (marked as draft)

## Steps

1. Load `project.md` → `## Course Context` for course type, terminology, and conventions.

2. Scan the project root and relevant folders:

   | Section / Folder | Required                   |
   | -------------- | ---------------------------- |
   | `project.md` → `## Outline`   | always                       |
   | `project.md` → `## Didactics` | always                       |
   | `project.md` → `## Agenda`    | if `project.md` → `## Course Context` agenda = yes |
   | `project.md` → `## Visual Identity`   | optional                     |
   | `project.md` → `## Templates` | optional; required if template imports or macros are used |
   | `project.md` → `## Sessions` | if sessions expected |
   | `materials/`   | if sessions expected         |

3. Display a **Course Memory Status** table:
   - ✅ exists
   - ⚠️ exists but likely incomplete (e.g., missing sections)
   - ❌ missing

4. For each **missing** core section (`## Outline`, `## Didactics`), 🎛️ ask with structured question (single choice):
   - **Auto-generate** — I will read your existing materials and create a draft
   - **Interactive creation** — I will guide you through the appropriate creation command
   - **Skip** — proceed without this document

5. If **auto-generate** is chosen:
   - Read any available session subsections in `project.md` → `## Sessions` and all files in `materials/`
   - Extract: title, target audience, topics, recurring structure, learning objectives
   - Generate a draft and save it to the matching section (e.g., `project.md` → `## Outline`)
   - Add a draft marker at the top: `> **Draft (auto-generated from existing materials)** — please review and update`

6. If **interactive creation** is chosen, run the relevant task:
   - `project.md` → `## Outline` → `/create-outline`
   - `project.md` → `## Didactics` → `/create-didactics`
   - `project.md` → `## Agenda` → `/create-agenda`

6b. Reconstruct or create `project.md` → `## Sessions` from project memory and the existing file system:
   - Scan `project.md` → `## Sessions` for `### {number}. {title}` subsections and `materials/` for files matching `{number}-{type}.md`
   - If a legacy `project.md` → `## Session Skeletons` section exists, use it only as migration input and move reconstructed skeletons into `## Sessions`
   - For each session found: set Skeleton ✅ if a matching `### {number}. {title}` subsection exists in `## Sessions`, Material ✅ if a file exists in `materials/`, Fertig stays ❌ (cannot be inferred — instructor must confirm)
   - Save the overview table directly below `## Sessions`, before all `### {number}. {title}` subsections

7. After all missing sections are handled, list **improvement opportunities** in the existing content:
   - Sessions without materials
   - Materials without session subsections
   - Inconsistent terminology or persona style
   - Template macros used without matching `import:` metadata or `## Templates` documentation
   - Missing references or learning objectives
   - Language/tone inconsistencies vs. `project.md` → `## Course Context` conventions

8. Suggest a prioritized action list and the recommended next step (usually `/coauthor-materials`).

9. Save the full status overview as `project.md` → `## Analysis Status`.
