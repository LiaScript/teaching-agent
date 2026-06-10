# Task: validate-course

## Purpose

Checks the consistency, completeness, and LiaScript syntax correctness of the project memory and course materials.
Can be run in two modes:

- **Session mode** (`/validate-course {number} {type}`) — checks a single material file after co-authoring
- **Course mode** (`/validate-course`) — checks the entire course before publishing

## Inputs

- `project.md` → `## Course Context` — course type and conventions
- `project.md` → `## Templates` — LiaScript template imports, macros, and examples (if present)
- `checklists/course-quality-checklist.md` — structured checklist
- `data/liascript-cheat-sheet.md` — syntax reference for LiaScript checks
- `templates/session-validation.yaml` — template for each stored session validation report
- For session mode: `materials/{number}-{type}.md`, matching overview row in `project.md` → `## Sessions`, and matching `### {number}. {title}` subsection in `project.md` → `## Sessions`
- For course mode: `project.md` sections (`## Outline`, `## Didactics`, `## Agenda`, `## Sessions`) and `materials/`

## Output

- **Session mode**: create or replace `#### Validation Report` inside the matching session subsection in `project.md` → `## Sessions`
- **Course mode**: validate all material files and create or replace `#### Validation Report` inside each matching session subsection in `project.md` → `## Sessions`

## Validation Storage

Per-session validation is stored directly with the matching session in `project.md` → `## Sessions`.
Each session has at most one current validation report, rendered from `templates/session-validation.yaml`.

Rules:
- Store the report under the matching `### {number}. {title}` session subsection.
- The report heading is always `#### Validation Report`.
- If the session already has a `#### Validation Report`, replace it completely.
- Do not keep historical session validation reports.
- Session mode does not update `project.md` → `## Validation`.
- Full course validation replaces `project.md` → `## Validation` → `### Latest Validation Summary` for publishing decisions.
- For publishing decisions, use `### Latest Validation Summary` as the authoritative course-level gate state.
- Publishing requires `Mode: course` and `Result: PASS`; a passing session-mode validation never unlocks publishing by itself.

---

## Session Mode Steps (`/validate-course {number} {type}`)

1. Load `project.md` → `## Course Context` for course type and conventions.
2. Load `project.md` → `## Agenda` to get the learning objectives for this session.
3. Load `data/liascript-cheat-sheet.md` as syntax reference.
4. Open `materials/{number}-{type}.md` and check:

   **Content checks:**
   - [ ] All learning objectives from `project.md` → `## Agenda` for this session are addressed
   - [ ] No section is vague, content-free, or placeholder-only
   - [ ] References present where content claims are made

   **Persona & style checks:**
   - [ ] Tone matches the instructor persona from `project.md` → `## Didactics`
   - [ ] Terminology matches `project.md` → `## Course Context` (sessions-called, etc.)

   **LiaScript syntax checks** (against `data/liascript-cheat-sheet.md`):
   - [ ] Exactly one `#` heading in the file (course title)
   - [ ] `###` and deeper headings only inside HTML blocks, lists, or blockquotes
   - [ ] All code blocks properly closed (triple backticks)
   - [ ] Animation counters (`--{{n}}--`, `{{n}}`) reset to 0 after each `##`
   - [ ] Quiz syntax correct: `[(X)]` for single choice, `[[X]]` for multiple choice, `[[answer]]` for text
   - [ ] All media elements have alt text
   - [ ] No unclosed `<div>` blocks

   **Template checks** `[if `project.md` → `## Templates` exists or the material uses template macros]`:
   - [ ] Every template macro used in the material is documented in `project.md` → `## Templates`
   - [ ] The material metadata header includes the matching `import: {url}` line for every used template
   - [ ] The project metadata header includes the matching `import: {url}` line for every documented template
   - [ ] Template use follows the examples and constraints documented in `## Templates`

5. Fill `templates/session-validation.yaml` for this session with:
   - Material path
   - Result: PASS / FAIL / PASS with concerns
   - Mode: session
   - Date
   - Content findings
   - Persona & style findings
   - LiaScript syntax findings
   - Template findings, if applicable
   - Recommended actions
   - Line references where possible
6. Create or replace the rendered `#### Validation Report` in the matching session subsection under `project.md` → `## Sessions`.
7. If no issues found: confirm "Session {number} ({type}) — ✅ Syntax and content verified. Report saved in `project.md` → `## Sessions` → `### {number}. {title}` → `#### Validation Report`."
8. If issues found: confirm the report was saved, list the blockers briefly, and ask the instructor whether to open `/coauthor-materials` to fix them.

---

## Course Mode Steps (`/validate-course`)

1. Load `project.md` → `## Course Context` to understand course type and applicable conventions.
2. Load `checklists/course-quality-checklist.md` — apply only the checks relevant for this course type (skip sections marked with conditions that don't apply).
3. Load `data/liascript-cheat-sheet.md` as syntax reference.

4. **Check Context & Foundation:**
   - `project.md` → `## Course Context` complete (course type, terminology, agenda flag, conventions)
   - `project.md` → `## Outline`: title, target audience, time commitment `[not single-lesson]`, abstract, learning objectives
   - `project.md` → `## Didactics`: instructor persona, didactic concept, style, difficulty level

4b. **Check Templates** `[if `project.md` → `## Templates` exists or material files use template macros]`:
   - Every template documented in `project.md` → `## Templates` has a matching `import: {url}` line in the main project metadata header
   - Every material file using a documented template macro has the matching `import: {url}` line in its own LiaScript metadata header
   - Template usage in materials follows the documented examples and constraints in `## Templates`

5. **Check Agenda** `[if agenda flag = yes in project.md → ## Course Context]`:
   - All sessions have title, duration, type, learning objective, summary
   - Learning objectives align with `project.md` → `## Outline`

6. **Check Session Progress:**
   - Load `project.md` → `## Sessions` as primary source
   - Confirm the overview table appears directly below `## Sessions`
   - All expected sessions have a row in the overview table
   - Cross-check: every ✅ Skeleton row has a matching `### {number}. {title}` subsection in `project.md` → `## Sessions`
   - Cross-check: every ✅ Material row has a file in `materials/`
   - All sessions marked ✅ Fertig `[required before publishing]`

7. **Check each material file** in `materials/` (same LiaScript + content checks as Session Mode Step 4).
   For each material file, fill `templates/session-validation.yaml` with `Mode: course` and create or replace the matching `#### Validation Report` in that session subsection under `project.md` → `## Sessions`.

8. **Consistency check across project memory and materials:**
   - Terminology consistent (sessions-called from `project.md` → `## Course Context` used throughout)
   - Persona tone consistent across all materials
   - Learning objectives from `project.md` → `## Outline` traceable through `project.md` → `## Agenda` into materials
   - Numbering correct and no gaps

9. **Replace `project.md` → `## Validation` → `### Latest Validation Summary`:**

   ```
   Date: YYYY-MM-DD
   Mode: course
   Course type: [type]
   Result: PASS / FAIL / PASS with concerns
   Issues found: N
   Sessions checked: N

   #### Course-Level Findings
   ##### Foundation
   - [issue or ✅ OK]

   ##### Templates
   - [issue or ✅ OK / SKIPPED]

   ##### Agenda
   - [issue or ✅ OK / SKIPPED (course type)]

   ##### Session Progress
   - [issue or ✅ OK]

   ##### Materials
   - Session {N} — {title}: [issue or ✅ OK]

   ##### Consistency
   - [issue or ✅ OK]

   #### Recommended Actions
   1. [Concrete action with file reference]
   ```

10. After all session validation reports and the latest summary are created: suggest next step.
    - If issues exist: "Open `/coauthor-materials {number} {type}` to resolve the issues in Session X, then rerun `/validate-course`."
    - If no issues: "Course is ready for publishing. Next step: `/agent development` → `/create-project`"

---

## Publishing Gate

**Enforced after every course-mode validation run. Controls access to publishing commands.**

| Result                 | Agent behavior                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 FAIL               | Block publishing. State: "⛔ Publishing Gate: FAIL. Please resolve all issues in `project.md` → `## Validation` and rerun `/validate-course`. `/create-project` and `/update-project` are locked until PASS." |
| 🟡 PASS with concerns | Ask: "There are open points, but no critical blockers. Do you want to proceed to publishing anyway? (Yes / No / Resolve issues first)"                                                                            |
| 🟢 PASS               | Only if `Mode: course`: suggest handoff: "✅ Publishing Gate: PASS. Ready for publishing. Next step: `/agent development` → `/create-project`"                                                                                          |

**Rule:** Never suggest or assist with `/create-project` or `/update-project` unless `project.md` → `## Validation` → `### Latest Validation Summary` contains both `Mode: course` and `Result: PASS` — regardless of how the instructor asks.
