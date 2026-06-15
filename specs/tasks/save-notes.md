# Task: save-notes

## Purpose

Saves a useful discussion result, research request, or decision as an append-only entry in
`journal.md` -> `## Notes Backup`.

Use this task for both:
- `/save-notes {type?} {title?}` - summary, research, or decision note
- `/save-decision {title}` - decision note with ADR-style content

## Inputs

- Current conversation or instructor-provided note content
- Optional `type`: summary | research | decision (default: summary)
- Optional `title`: short command argument or free-text title
- Optional `related`: Outline / Didactics / Agenda / session number / material file / etc.
- `templates/note-backup.yaml`
- Existing `journal.md` -> `## Notes Backup`, if present

## Output

- Appended entry inside `journal.md` -> `## Notes Backup`
- Entry heading format:

  ```markdown
  ### {Type}: {Descriptive Title} ({YYYY-MM-DD})
  ```

## Steps

1. Determine note type:
   - `/save-decision {title}` always uses `decision`.
   - `/save-notes` defaults to `summary` unless the instructor provides `research` or `decision`.

2. Create a descriptive heading title:
   - If no title is provided, derive one from the content.
   - If the title is a slug, expand it into a readable heading.
   - Use 4-8 meaningful words when possible.
   - Avoid vague titles such as `Summary`, `Notes`, `Update`, or `Decision`.

   Examples:
   - `agenda-structure` -> `Agenda Structure And Session Rhythm`
   - `persona-chat-lina-2-exercise` -> `Lina Feedback On Session 2 Exercise`
   - `course-type-decision` -> `Course Type And Scope Decision`

3. Read `templates/note-backup.yaml` and select the content block matching the note type:
   - summary -> Summary Content
   - research -> Research Content
   - decision -> Decision Content

4. Fill the template:
   - `type_label`: Summary / Research / Decision
   - `descriptive_title`: meaningful heading title
   - `date`: current date
   - `topic`, `related`, `source`
   - type-specific content

5. Append the rendered entry to `journal.md` -> `## Notes Backup`.
   - If `## Notes Backup` does not exist, create it near the end of `journal.md`.
   - Do not replace, reorder, or summarize existing entries.
   - Each note is one `###` subsection.
   - Do not use `##` headings inside a note entry.

6. For decision notes, use ADR-style content:
   - Context
   - Options considered
   - Decision
   - Rationale
   - Consequences

7. Confirm the saved heading and location:
   > "Saved to `journal.md` -> `## Notes Backup` -> `### {Type}: {Descriptive Title} ({YYYY-MM-DD})`."

8. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update
   `journal.md` -> `## Dashboard` in place.
