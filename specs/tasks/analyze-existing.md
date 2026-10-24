# Task: analyze-existing

## Purpose

Analyzes an existing course project to identify which `journal.md` sections and material files are present and which are missing.
Used as the **second step after `:init-course`** when the course type is `improve-existing`.

Offers two paths for each missing core section:
- **Auto-generate** — agent reads existing materials and reverse-engineers a draft
- **Interactive creation** — agent guides the instructor through the relevant creation task

## Inputs

- `journal.md` → `## Course Context` (created by `:init-course`, mandatory)
- Existing `journal.md` sections: `## Outline`, `## Didactics`, `## Templates`, `## Agenda`, `## Visual Identity`, `## Sessions`, `## Agents`
- Existing folder: `materials/`
- `import:` lines of the journal header and the material headers; `tasks/manage-templates.md` and `templates/course-templates.yaml` for documenting them (step 6d)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Analysis Status` — status overview with recommended actions
- Optionally: auto-generated drafts for missing core sections (marked as draft)

## Steps

1. Load `journal.md` → `## Course Context` for course type, terminology, and conventions.
   - If `__File Structure:__` is missing (older projects predate this field), detect it from disk (see `data/file-structure-modes.md`): a `materials/*/README.md` layout → `multi-file`; a single root `README.md` with multiple `##` chapters and no `materials/` folder → `single-file`. Propose the detected mode to the instructor; it is written to `## Course Context` only after confirmation, together with the other changes of this task.
   - If `materials/` exists but uses a folder-naming pattern other than `{number}-{slug}` (e.g. legacy `{number}-{type}` folders), note this as an improvement opportunity in step 7 rather than silently renaming existing folders.

2. Scan the project root and relevant folders:

   | Section / Folder | Required                   |
   | -------------- | ---------------------------- |
   | `journal.md` → `## Outline`   | always                       |
   | `journal.md` → `## Didactics` | always                       |
   | `journal.md` → `## Agenda`    | if `journal.md` → `## Course Context` agenda = yes |
   | `journal.md` → `## Visual Identity`   | optional                     |
   | `journal.md` → `## Templates` | optional; required if template imports or macros are used |
   | `journal.md` → `## Sessions` | if sessions expected |
   | `journal.md` → `## Agents` | always; contains the Coauthor role, optional specialist customizations, and learner personas |
   | `journal.md` → `## Course Context` → `__File Structure:__` | always; detect from disk if missing (see step 1) |
   | `materials/`   | if sessions expected and File Structure mode = multi-file |
   | root `README.md` `##` chapters | if File Structure mode = single-file |

3. Display a **Course Memory Status** table:
   - ✅ exists
   - ⚠️ exists but likely incomplete (e.g., missing sections)
   - ❌ missing

4. For each **missing** core section (`## Outline`, `## Didactics`, and `## Agenda` if the course profile needs one), 🎛️ ask with structured question (single choice):
   - **Auto-generate** — I will read your existing materials and create a draft
   - **Interactive creation** — I will guide you through the appropriate creation command
   - **Skip** — proceed without this document

5. If **auto-generate** is chosen:
   - Read any available session subsections in `journal.md` → `## Sessions` and all files in `materials/`
   - Extract: title, target audience, topics, recurring structure, learning objectives
   - Generate a draft with a draft marker at the top: `> **Draft (auto-generated from existing materials)** — please review and update`
   - Show the complete draft as it will be saved, with "Save" / "Change something"; only on "Save" write it to the matching section (e.g., `journal.md` → `## Outline`)

6. If **interactive creation** is chosen, run the relevant task:
   - `journal.md` → `## Outline` → `:create-outline`
   - `journal.md` → `## Didactics` → `:create-didactics`
   - `journal.md` → `## Agenda` → `:create-agenda`

6b. Reconstruct or create `journal.md` → `## Sessions` from project memory and the existing file system — prepared here, written only after "Save" in step 8b:
   - Scan `journal.md` → `## Sessions` for `### {number}. {title}` subsections and for material documents per `data/file-structure-modes.md` — `materials/{number}-{slug}/README.md` (multi-file; legacy `{number}-{type}` names count too, see step 1) or `##` chapters in root `/README.md` (single-file)
   - If a legacy `journal.md` → `## Session Skeletons` section exists, use it only as migration input and move reconstructed skeletons into `## Sessions`
   - For each session found: set Skeleton ✅ if a matching `### {number}. {title}` subsection exists in `## Sessions`, Material ✅ if its material document exists, Done stays ❌ (cannot be inferred — instructor must confirm)
   - Prepare the overview (status list + technical table, `templates/session-skeleton.yaml` → `section_layout.overview`) directly below `## Sessions`, before all `### {number}. {title}` subsections

6c. Ensure `journal.md` → `## Agents` exists — prepared here, written only after "Save" in step 8b:
   - If missing, create it from `templates/agents.yaml`.
   - If a legacy top-level `## Learner Personas` section exists, migrate its persona entries into `journal.md` → `## Agents` → `### Learner Personas`.
   - Convert legacy persona headings from `### Persona: {icon} {name}` to `#### Persona: {icon} {name}`.
   - Remove the legacy top-level `## Learner Personas` section after migration to avoid duplicate persona sources.
   - Do not read or merge Coauthor or specialist agent customization sections unless this task is explicitly checking the `## Agents` section shape.

6d. Document existing template imports — prepared here, written only after "Save" in step 8b: every `import:` line of the journal header or of a material header that `## Templates` does not document yet gets its entry as `tasks/manage-templates.md` steps 3–5 describe (its 3b is covered by step 8b). `* __Template selection:__` stays `open`; `:suggest-templates` later recognises the documented templates and asks only about the remaining activities.

7. After all missing sections are handled, list **improvement opportunities** in the existing content:
   - Sessions without materials
   - Materials without session subsections
   - Session folders whose naming doesn't match the `{number}-{slug}` convention (see `data/file-structure-modes.md`) — flag for the instructor to decide whether to rename or leave as legacy
   - Inconsistent terminology or persona style
   - Template macros used without matching `import:` metadata or `## Templates` documentation
   - Missing references or learning objectives
   - Language/tone inconsistencies vs. `journal.md` → `## Course Context` conventions

8. Suggest a prioritized action list and the recommended next step (usually `:coauthor-materials`).

8b. **Before saving:** show in one message everything this task will still write — the detected File Structure (step 1), the reconstructed `## Sessions` overview (6b), the `## Agents` changes including the removal of a legacy `## Learner Personas` section (6c), the template entries and header imports (6d), and the status overview (step 9) — with "Save" / "Change something" (translated). This is the single write confirmation of these steps; drafts saved in step 5 had their own.

9. After "Save": write the File Structure, the `## Sessions` overview, the `## Agents` changes, the template entries with their header imports and the full status overview as `journal.md` → `## Analysis Status` — one write per section.
10. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
