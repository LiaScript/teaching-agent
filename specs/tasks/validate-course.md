# Task: validate-course

## Purpose

Checks the consistency, completeness, and LiaScript syntax correctness of the project memory and course materials.
Can be run in two modes:

- **Session mode** (`:validate-course {number}`) — checks a single material file after co-authoring
- **Course mode** (`:validate-course`) — checks the entire course before publishing

## Inputs

- `journal.md` → `## Course Context` — course type and conventions
- `journal.md` → `## Templates` — LiaScript template imports, macros, and examples (if present)
- `checklists/course-quality-checklist.md` — structured checklist
- `tasks/validate-syntax.md` — full LiaScript syntax check, called as a sub-procedure (single source of truth for syntax rules)
- `data/duration-heuristic.md` — reading time + activity time estimate, compared against the declared duration
- `data/didactic-methods.md` — Session Method `Erforderlich` checklists, if a session method is in use
- `templates/session-validation.yaml` — template for each stored session validation report
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`)
- For session mode: the material document for this session (resolved per File Structure mode), matching overview row in `journal.md` → `## Sessions`, and matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- For course mode: `journal.md` sections (`## Outline`, `## Didactics`, `## Agenda`, `## Sessions`) and all material documents (`materials/` in multi-file mode, or the `##` chapters of root `README.md` in single-file mode)

## Output

- **Session mode**: create or replace `#### Validation Report` inside the matching session subsection in `journal.md` → `## Sessions`
- **Course mode**: validate all material files and create or replace `#### Validation Report` inside each matching session subsection in `journal.md` → `## Sessions`

## Validation Storage

Per-session validation is stored directly with the matching session in `journal.md` → `## Sessions`.
Each session has at most one current validation report, rendered from `templates/session-validation.yaml`.

Rules:
- Store the report under the matching `### {number}. {title}` session subsection.
- The report heading is always `#### Validation Report`.
- Wrap the entire rendered report in a single `<section>…</section>` block (same technique as `#### Images` in `tasks/create-image.md`), so LiaScript shows it as one slide — see `data/liascript-cheat-sheet.md` → "Additional Rule: Subheadings within a Slide". Inside the report, findings use **bold labels**, never `#####` headings; the technical part sits in `<details>` below a visible plain-language summary (template `layout`).
- If the session already has a `#### Validation Report`, replace it completely.
- Do not keep historical session validation reports.
- Session mode does not update `journal.md` → `## Validation`.
- Full course validation replaces `journal.md` → `## Validation` → `### Latest Validation Summary` for publishing decisions.
- For publishing decisions, use `### Latest Validation Summary` as the authoritative course-level gate state.
- Publishing requires `Mode: course` and `Result: PASS`; a passing session-mode validation never unlocks publishing by itself.

---

## Session Mode Steps (`:validate-course {number}`)

1. Load `journal.md` → `## Course Context` for course type and conventions.
2. Load `journal.md` → `## Agenda` to get the learning objectives for this session.
3. Load `data/liascript-cheat-sheet.md` as syntax reference. If the skill `liascript-syntax` is available (see `data/skills.md`), use it as second reference (see `tasks/validate-syntax.md`).
3b. Load `checklists/course-quality-checklist.md` and apply **every** item of the categories that concern one unit — Session Subsections, Session Materials, LiaScript Syntax — for this session, also items the checks below do not repeat. A session PASS must not hide a `[mechanical]` item the course check would fail later.
4. Open the material document for this session — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode — and check:

   **Content checks:**
   - [ ] All learning objectives from `journal.md` → `## Agenda` for this session are addressed
   - [ ] No section is vague, content-free, or placeholder-only
   - [ ] References present where content claims are made
   - [ ] `[only if the skill `reference-checker` is available — see `data/skills.md` — and web access exists]` The session's references verified with `reference-checker`; record its summary (✅ / ⚠️ / 🚨 counts) and every 🚨 entry as findings in the report. Without the skill or web access, skip this check and say so in one line.
   - [ ] Content satisfies the `Erforderlich` (required elements) checklist of this session's declared type in `journal.md` → `## Didactics` → `__Session Types:__` (see `data/session-types.md`). If the type has no required elements defined, flag this as a Session Types gap rather than skipping the check.
   - [ ] `[if the session has a **Method:** line]` Content satisfies the `Erforderlich` checklist of the declared Session Method in `data/didactic-methods.md` — checked independently of, and in addition to, the Type check above.
   - [ ] Estimated duration per `data/duration-heuristic.md` (reading time + activity time, not word count alone) is within 70%–150% of the declared duration for this session in `journal.md` → `## Agenda`. This is `[advisory]` — record the flag either way as a hint, never as ❌ or ⏳, and never change the result because of it.

   **Persona & style checks:**
   - [ ] Tone matches the Coauthor role from `journal.md` → `## Agents` → `### Coauthor`
   - [ ] Terminology matches `journal.md` → `## Course Context` (sessions-called, etc.)

   **LiaScript syntax checks:**
   - Run `tasks/validate-syntax.md` for this material and fold its findings into this report. Do not restate the individual syntax rules here — `validate-syntax.md` is the single source of truth for them.

   **Template checks** `[if `journal.md` → `## Templates` exists or the material uses template macros]`:
   - [ ] Every template macro used in the material is documented in `journal.md` → `## Templates`
   - [ ] The material metadata header includes the matching `import: {url}` line for every used template
   - [ ] The project metadata header includes the matching `import: {url}` line for every documented template
   - [ ] Template use follows the examples and constraints documented in `## Templates`

5. Fill `templates/session-validation.yaml` for this session with:
   - Material path
   - Result: PASS / FAIL / PASS with concerns — apply `result_rules` of the template in their order (deferrals ⏳ decided in the first run; other ❌ on required/mechanical → FAIL; open pedagogical ❌ → PASS with concerns; otherwise PASS). Publishing metadata (contact address) is ⏳ "before publishing" in session mode, never ❌.
   - Mode: session
   - Date
   - Content findings
   - Type consistency findings
   - Persona & style findings
   - LiaScript syntax findings
   - Method consistency, the duration hint, the reference check summary and template findings — each in its own field of the template, also when there is nothing to report there
   - Recommended actions — check them against the session's decisions list (`data-key="decisions"`) first; never recommend something the instructor has already decided against
   - Page titles of the material as references — never line numbers
   - The visible plain-language summary (`**Outcome:**`, what works, what is still missing) above the technical `<details>`, as the template's `layout` describes
6. Create or replace the rendered `#### Validation Report`, wrapped in `<section>…</section>` (see Validation Storage rules above), in the matching session subsection under `journal.md` → `## Sessions`, directly after the action line and the technical details (`templates/session-skeleton.yaml` → `section_layout.entry_order`).
   Update the overview table in `## Sessions`: set **Done ✅** only with `Result: PASS` (not "PASS with concerns") and no open ⏳ item; otherwise set Done ❌ — also when it was ✅ before. Rewrite the unit's status line in the same write (`templates/session-skeleton.yaml` → `section_layout.overview`).
   Then run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
7. **Chat summary:** name every ❌, every ⏳ with its step, every `[pedagogical]` finding (also those you consider minor) and every `[advisory]` hint in plain words. Never write "everything else is fine" while the report lists open points; a checklist item is never downgraded to a "hint".
   If no issues found: confirm "Session {number} ({type}) — ✅ Syntax and content verified. Report saved in `journal.md` → `## Sessions` → `### {number}. {title}` → `#### Validation Report`."
8. If issues found: confirm the report was saved, list the blockers briefly, and ask the instructor whether to open `:coauthor-materials` to fix them. When called from `:build-session`, do not ask — return the result to the caller, whose loop decides.

---

## Course Mode Steps (`:validate-course`)

1. Load `journal.md` → `## Course Context` to understand course type and applicable conventions.
2. Load `checklists/course-quality-checklist.md` — apply only the checks relevant for this course type (skip sections marked with conditions that don't apply). The steps below group the checks; **every** applicable checklist item is applied, also one no step names — report it under the closest category of the summary.
3. Load `data/liascript-cheat-sheet.md` as syntax reference. If the skill `liascript-syntax` is available (see `data/skills.md`), use it as second reference (see `tasks/validate-syntax.md`).

4. **Check Context & Foundation:**
   - `journal.md` → `## Course Context` complete (course type, terminology, agenda flag, conventions)
   - `journal.md` → `## Outline`: title, target audience, time commitment `[not single-lesson]`, abstract, learning objectives
   - `journal.md` → `## Didactics`: instructor persona, didactic concept, style, difficulty level, Session Types (each with slug, criterion, and required-elements checklist)
   - `journal.md` → `## Didactics` has both `__Didactic Framework:__` and `__Default Session Method:__` set (the latter may explicitly be `none`). If either is missing entirely, flag this as a gap rather than silently skipping — same principle as an undefined Session Type (see `data/didactic-methods.md`).
   - `journal.md` → `## Agents` exists and contains scoped `### Coauthor` and `### Learner Personas` containers

4b. **Check Templates** `[if `journal.md` → `## Templates` exists or material files use template macros]`:
   - Every template documented in `journal.md` → `## Templates` has a matching `import: {url}` line in the main project metadata header
   - Every material file using a documented template macro has the matching `import: {url}` line in its own LiaScript metadata header
   - Template usage in materials follows the documented examples and constraints in `## Templates`

5. **Check Agenda** `[if agenda flag = yes in journal.md → ## Course Context]`:
   - All sessions have title, duration, type, learning objective, summary
   - `[if journal.md → ## Didactics → __Default Session Method:__ is not "none"]` All sessions have a Method assigned
   - Learning objectives align with `journal.md` → `## Outline`

6. **Check Session Progress:**
   - Load `journal.md` → `## Sessions` as primary source
   - Confirm the overview appears directly below `## Sessions` (status list, then the technical table in `<details>`, `templates/session-skeleton.yaml` → `section_layout.overview`) and every status line matches its table row
   - All expected sessions have a row in the overview table
   - Cross-check: every ✅ Skeleton row has a matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
   - Cross-check: every ✅ Material row has its material document present — a file in `materials/{number}-{slug}/README.md` in multi-file mode, or a matching `##` chapter in root `/README.md` in single-file mode (see `data/file-structure-modes.md`)
   - All sessions marked ✅ Done `[required before publishing]`

7. **Check each material document** (same LiaScript + content checks as Session Mode Step 4).
   For each material file, fill `templates/session-validation.yaml` with `Mode: course` and create or replace the matching `#### Validation Report`, wrapped in `<section>…</section>` (see Validation Storage rules above), in that session subsection under `journal.md` → `## Sessions`. Then set Done in the overview table exactly as in session mode step 6 — in both directions: a unit whose report no longer passes, or has an open ⏳ item, goes back to Done ❌ — and rewrite its status line (`templates/session-skeleton.yaml` → `section_layout.overview`).

8. **Consistency check across project memory and materials:**
   - Terminology consistent (sessions-called from `journal.md` → `## Course Context` used throughout)
   - Persona tone consistent across all materials
   - Learning objectives from `journal.md` → `## Outline` traceable through `journal.md` → `## Agenda` into materials
   - Numbering correct and no gaps

9. **Replace `journal.md` → `## Validation` → `### Latest Validation Summary`** — bold labels in the course language with their English `data-key`, never `####` or `#####` headings (each would become its own slide); keep the English key lines `Date:`, `Mode:`, `Result:` that the publishing gate reads:

   ```
   Date: YYYY-MM-DD
   Mode: course
   Course type: [type]
   Result: PASS / FAIL / PASS with concerns
   Issues found: N
   Sessions checked: N

   <!-- data-key="course-findings" -->
   **{"Course-level findings", translated}:**

   - **{"Foundation", translated}:** [issue or ✅ OK]
   - **{"Templates", translated}:** [issue or ✅ OK / SKIPPED]
   - **{"Agenda", translated}:** [issue or ✅ OK / SKIPPED (course type)]
   - **{"Session progress", translated}:** [issue or ✅ OK]
   - **{"Materials", translated}:** Session {N} — {title}: [issue or ✅ OK]
   - **{"Consistency", translated}:** [issue or ✅ OK]

   <!-- data-key="recommended-actions" -->
   **{"Recommended actions", translated}:**
   1. [Concrete action with file reference]
   ```

10. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place (validation state, publishing gate, session progress).
11. After all session validation reports and the latest summary are created: suggest next step.
    - If issues exist: "Open `:coauthor-materials {number}` to resolve the issues in Session X, then rerun `:validate-course`."
    - If no issues: "Course is ready for publishing. Next step: `:agent development` → `:create-project`"

---

### Iteration (mechanical checks only)

Applies only when `:validate-course` runs directly in course mode. Called as a sub-procedure (e.g. by `:build-session` in session mode), it runs once and returns — the caller's own loop iterates, so loops never nest.

**Loop:** Repeat "fix `[mechanical]` issues → rerun `:validate-course`" until every `[mechanical]`-tagged item in `checklists/course-quality-checklist.md` passes, or after 5 iterations — whichever comes first.

- In scope for the loop: LiaScript syntax findings from `tasks/validate-syntax.md`, broken links/alt text, missing required elements, structural gaps — everything tagged `[mechanical]`. `[advisory]` items such as the duration flag are not in scope: the loop cannot fix them without inventing or cutting content.
- Never auto-loop on `[pedagogical]`-tagged items — always surface those to the instructor immediately (core rule: critical sparring partner, not a rubber stamp).
- On hitting the 5-iteration cap without a clean mechanical pass: stop, list the remaining `[mechanical]` FAIL items, and hand back to the instructor instead of continuing.
- See `CLAUDE.md` → "Iteration Pattern" for the general convention. Under Claude Code this can additionally be driven with `/goal "journal.md → ## Validation → ### Latest Validation Summary shows all [mechanical] checklist items passing, or stop after 5 iterations"`.

---

## Publishing Gate

**Enforced after every course-mode validation run. Controls access to publishing commands.**

| Result                 | Agent behavior                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 FAIL               | Block publishing. State: "⛔ Publishing Gate: FAIL. Please resolve all issues in `journal.md` → `## Validation` and rerun `:validate-course`. `:create-project` and `:update-project` are locked until PASS." |
| 🟡 PASS with concerns | Publishing stays locked. List every open concern in plain words and go through them one at a time: fix it now (`:quick-fix`, or `:coauthor-materials {number}` for broader changes) or accept it as is with a short reason. Record each accepted concern with the save confirmation — session finding: a dated entry in that session's decisions list; course-level finding: `:save-decision`. Then rerun `:validate-course`: accepted concerns no longer count (see `result_rules` in `templates/session-validation.yaml`). Never offer "publish anyway". |
| 🟢 PASS               | Only if `Mode: course`: suggest handoff: "✅ Publishing Gate: PASS. Ready for publishing. Next step: `:agent development` → `:create-project`"                                                                                          |

**Rule:** Never suggest or assist with `:create-project` or `:update-project` unless `journal.md` → `## Validation` → `### Latest Validation Summary` contains both `Mode: course` and `Result: PASS` — regardless of how the instructor asks.
