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
- `data/didactic-methods.md` — Session Method `Required` checklists, if a session method is in use
- `templates/session-validation.yaml` — template for each stored session validation report (heading, outcome words, layout)
- `templates/session-skeleton.yaml` — read completely: status words of the overview and `section_layout.entry_order` (where the report goes)
- `data/session-types.md` — read completely: objectives and duration of a session, resolving its type (step 2)
- `tasks/update-dashboard.md` and `templates/project-dashboard.yaml` — read right before the overview is written (step 6)
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`)
- For session mode: the material document for this session (resolved per File Structure mode), matching overview row in `journal.md` → `## Sessions`, and matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- For course mode: `journal.md` sections (`## Outline`, `## Didactics`, `## Agenda`, `## Sessions`) and all material documents (`materials/` in multi-file mode, or the `##` chapters of root `README.md` in single-file mode)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- **Session mode**: create or replace `#### Validation Report` inside the matching session subsection in `journal.md` → `## Sessions`
- **Course mode**: validate all material files and create or replace `#### Validation Report` inside each matching session subsection in `journal.md` → `## Sessions`

## Validation Storage

Per-session validation is stored directly with the matching session in `journal.md` → `## Sessions`.
Each session has at most one current validation report, rendered from `templates/session-validation.yaml`.

Rules:
- Store the report under the matching `### {number}. {title}` session subsection.
- The report heading is in the course language and unique per unit: `#### {"Validation report", translated} – {unit word} {number}`, with `<section data-key="validation-report">` directly below it (`templates/session-validation.yaml` → `layout`). Tasks find the report by that key; where a task says `#### Validation Report`, it means this block. In older journals a heading that starts with `#### Validation Report` is the same report: replace it with the new heading at its place in the entry order.
- The report heading stands outside; everything below it is wrapped in a single `<section data-key="validation-report">…</section>` block (same technique as `#### Images` in `tasks/create-image.md`), so LiaScript shows it as one slide — see `data/liascript-cheat-sheet.md` → "Additional Rule: Subheadings within a Slide". Inside the report, findings use **bold labels**, never `#####` headings; the technical part sits in `<details>` below a visible plain-language summary (template `layout`).
- If the session already has a validation report, replace it completely (also its heading and position).
- Every link that names a check report — a decision's `href`, an action, a chat message — targets that report's heading anchor (`tasks/update-dashboard.md` → Anchors), never the unit heading; the completion message of a check links it.
- Do not keep historical session validation reports.
- Session mode does not update `journal.md` → `## Validation`.
- Full course validation replaces `journal.md` → `## Validation` → `### Latest Validation Summary` for publishing decisions.
- For publishing decisions, use `### Latest Validation Summary` as the authoritative course-level gate state.
- Publishing requires `Mode: course` and `Result: PASS`; a passing session-mode validation never unlocks publishing by itself.

---

## Session Mode Steps (`:validate-course {number}`)

0. **Concerns only:** if the unit's current report says PASS with concerns and nothing changed since it (no material change, no entry in its "Changed after the check" block newer than the report), do not check again: say so in one line and go straight to the concerns (step 8, "With **PASS with concerns**"), then rewrite the report's outcome, status line and overview. A new full check runs only after a change.
   **Short re-check:** if the report's outcome says "short re-check open" (changes after the check, `tasks/quick-fix.md` → Change path), check only the pages named in its "Changed after the check" block — `tasks/validate-syntax.md` for those pages, `check-material.mjs` (or say that no browser was available), the Type and Method items those pages carry, and every open point that names them; the result rules stay the same. Replace only the affected points, drop the " – {n} point(s) changed since – short re-check open" part of the outcome, status line, Notes cell and overview, and keep the dated lines as the record. Announce it with its duration (`templates/session-validation.yaml` → `recheckExplain`).
1. Load `journal.md` → `## Course Context` for course type and conventions.
2. Load the learning objectives and declared duration of this session (`data/session-types.md` → "Objectives and duration of a session" — from `## Agenda`, without an agenda from `## Outline`).
3. Load `data/liascript-cheat-sheet.md` as syntax reference. If the skill `liascript-syntax` is available (see `data/skills.md`), use it as second reference (see `tasks/validate-syntax.md`).
3b. Load `checklists/course-quality-checklist.md` and apply **every** item of the categories that concern one unit — Session Subsections, Session Materials, LiaScript Syntax — for this session, also items the checks below do not repeat. A session PASS must not hide a `[mechanical]` item the course check would fail later.
4. Open the material document for this session — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode — and check:

   **Content checks:**
   - [ ] All learning objectives of this session (step 2) are addressed
   - [ ] No section is vague, content-free, or placeholder-only
   - [ ] References present where content claims are made
   - [ ] `[only if the skill `reference-checker` is available — see `data/skills.md` — and web access exists]` The session's references verified with `reference-checker`; record its summary (✅ / ⚠️ / 🚨 counts) and every 🚨 entry as findings in the report. Without the skill or web access, skip this check and say so in one line.
   - [ ] Content satisfies the `Required` checklist of this session's declared type in `journal.md` → `## Didactics` → `__Session Types:__` (see `data/session-types.md`). If the type has no required elements defined, flag this as a Session Types gap rather than skipping the check.
   - **Required means in this unit:** a `Required` element of the type or method is met only by this unit's own material. A reference to another unit ("the explaining follows in unit 4") counts only with a recorded decision (`:save-decision`, scope e.g. "all units of this method"); otherwise it is ❌ (result rule 2) — or, if the element does not fit this unit at all, a Session Types / Method gap the instructor decides.
   - [ ] `[if the session has a **Method:** line]` Content satisfies the `Required` checklist of the declared Session Method in `data/didactic-methods.md` — checked independently of, and in addition to, the Type check above.
   - If the script reports "no installed Playwright found" or "has no browser of its own", offer the install once per conversation as `data/chat-checks.md` → Offering the Rendered Check says.
   - In single-file mode `check-material.mjs` reads the whole `README.md`: count only the findings on this unit's chapter slides (it names each slide's title); findings of other chapters belong to their units.
   - [ ] Image options fit the learners' device: only as measured by `check-material` (its viewport report — name the window) or looked at by the instructor; otherwise "not measured" plus a preparation item (checklist, `data/chat-checks.md` → Say how you checked). A missing warning is no measurement.
   - [ ] Answer options give nothing away and texts match their pictures: the "Answer patterns" warnings of `check-material`, plus a read of every question, option, hint and page text against its picture (checklist → Session Materials)
   - [ ] The unit entry in `journal.md` (summary, content) describes the material as it is now: no to-dos or remarks about fixed points, factual statements checked as in the material — report field `Unit entry (journal)`.
   - [ ] Estimated duration per `data/duration-heuristic.md` (reading time + activity time, not word count alone) is within 70%–150% of the declared duration of this session (step 2). This is `[advisory]` — record the flag either way as a hint, never as ❌ or ⏳, and never change the result because of it.

   **Persona & style checks:**
   - [ ] Tone matches the Coauthor role from `journal.md` → `## Agents` → `### Coauthor`
   - [ ] Terminology matches `journal.md` → `## Course Context` (sessions-called, etc.)

   **LiaScript syntax checks:**
   - Run `tasks/validate-syntax.md` for this material and fold its findings into this report. Do not restate the individual syntax rules here — `validate-syntax.md` is the single source of truth for them.

   **Template checks** `[if `journal.md` → `## Templates` exists or the material uses template macros]`:
   - [ ] Every template macro used in the material is documented in `journal.md` → `## Templates`
   - [ ] The material metadata header includes the matching `import: {url}` line for every used template (a local template `./lia-templates/{id}/README.md` matches in a multi-file material as `../../lia-templates/{id}/README.md`, relative to its folder)
   - [ ] The project metadata header includes the matching `import: {url}` line for every documented template — briefs `### {id} (in development)` are exempt: they have no import yet
   - [ ] Template use follows the examples and constraints documented in `## Templates`

4b. **Fix during the check** (session mode; not when called from `:build-session`, whose loop fixes mechanical items): before setting the result, offer in **one** chat confirmation to fix every `[mechanical]` finding that needs no content decision (one targeted change each, `tasks/quick-fix.md` steps 2–3, all in one material write; then `check-material` again). Fixed items no longer count (result rule 0) and are listed as fixed during the check. One round, no loop; declined or not cleanly fixed items count as found.
5. Fill `templates/session-validation.yaml` for this session with:
   - Material path
   - The visible outcome words and the mandatory line "usable with learners now" (template `outcome_words`) — "correction needed ({n})", never a grade word such as "failed"
   - Result: PASS / FAIL / PASS with concerns — apply `result_rules` of the template in their order (deferrals ⏳ decided in the first run; other ❌ on required/mechanical → FAIL; open pedagogical ❌ → PASS with concerns; otherwise PASS). Publishing metadata (contact address, license) is never a finding of a unit check — the publishing gate checks it.
   - Mode: session
   - Date
   - Content findings
   - Type consistency findings
   - Persona & style findings
   - LiaScript syntax findings
   - Method consistency, the duration hint, the reference check summary and template findings — each in its own field of the template, also when there is nothing to report there
   - Recommended actions — check them against the session's decisions list (`data-key="decisions"`) first; never recommend something the instructor has already decided against
   - Page titles of the material as references — never line numbers
   - The visible plain-language summary (`**Outcome:**`, usable with learners now, what works, what is still missing) above the technical `<details>`, as the template's `layout` describes
   - The field `Unit entry (journal)` (step 4)
6. Create or replace the rendered report — heading plus `<section data-key="validation-report">…</section>` (see Validation Storage rules above) — in the matching session subsection under `journal.md` → `## Sessions`, after the skeleton fields and before `#### Images` (`templates/session-skeleton.yaml` → `section_layout.entry_order`).
   Update the overview table in `## Sessions`: set **Done ✅** only with `Result: PASS` (not "PASS with concerns") and no open ⏳ item; otherwise set Done ❌ — also when it was ✅ before. Rewrite the unit's status line in the same write (`templates/session-skeleton.yaml` → `section_layout.overview`).
   Right after this write send "✅ Saved: …" with the outcome and the line "usable with learners now" in one line each, plus the anchor link to the report — never hold the result back until the overview is written. Details follow in step 7.
   Then run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
   A check announced at more than 3 minutes sends one lasting interim message at about half time (`data/agent-links.md` → Progress feedback).
7. **Chat summary:** name every ❌, every ⏳ with its step, every `[pedagogical]` finding (also those you consider minor) and every `[advisory]` hint in plain words. Never write "everything else is fine" while the report lists open points; a checklist item is never downgraded to a "hint".
   If no issues found: confirm "Session {number} ({type}) — ✅ Syntax and content verified." with the anchor link to the report heading, and offer `:try-as-learner {number}` once (only when the MCP gate is open).
8. If issues found: confirm the report was saved, list the blockers briefly, and offer the fix: when every open point is one `:quick-fix` covers (one change each, no content decision), offer ✏️ `:quick-fix {number}` with its description; otherwise `:coauthor-materials {number}` (`data/journal-links.md` → Action lines).
   With **PASS with concerns**: go through the concerns one at a time, as at the Publishing Gate — fix it now (`:quick-fix`, or `:coauthor-materials {number}`) or accept it as is with a short reason — for this unit (a dated entry in the session's decisions list) or, if the same concern applies to every unit, for the whole course (one `:save-decision`); listed in the save summary. A concern whose acceptance would contradict `## Course Context` (e.g. a special need of the target group, such as read-aloud for a learner with dyslexia) is named as such and needs its own explicit confirmation. Then, if something was fixed, the short re-check of the changed area (`tasks/quick-fix.md` → Change path); if every concern was accepted, the outcome becomes PASS without a new check. When called from `:build-session`, do not ask — return the result to the caller, whose loop decides.

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
   - Every template documented in `journal.md` → `## Templates` has a matching `import: {url}` line in the main project metadata header — except briefs `### {id} (in development)`, which have no import yet
   - Every material file using a documented template macro has the matching `import: {url}` line in its own LiaScript metadata header (in a multi-file material the relative form `../../lia-templates/{id}/README.md` matches the project's `./lia-templates/{id}/README.md`)
   - Template usage in materials follows the documented examples and constraints in `## Templates`
   - **Publishing gate — templates:** FAIL if `## Templates` holds a brief `### {id} (in development)` whose `__Used in:__` names a unit (that unit relies on a template that is not adopted yet), or if an `import:` line of a published document points to a path the course project's `.gitignore` excludes (the published course could not load it — e.g. an outsourced `lia-templates/{id}/` with its own repository: import its published `{repo-url}@{tag}` instead). Published documents are the material headers (multi-file `materials/{n}-{slug}/README.md`, single-file the root `README.md`); the journal header counts only when `journal.md` itself is published (`tasks/create-project.md` step 5) — its `import: ./specs/dashboard/README.md` is no finding while `journal.md` and `specs/` stay unpublished.

5. **Check Agenda** `[if journal.md → ## Agenda has content, or the agenda flag is yes]`:
   - All sessions have title, duration, type, learning objective
   - `[if journal.md → ## Didactics → __Default Session Method:__ is not "none"]` All sessions have a Method assigned
   - Learning objectives align with `journal.md` → `## Outline`

6. **Check Session Progress:**
   - Load `journal.md` → `## Sessions` as primary source
   - Confirm the overview appears directly below `## Sessions` (status list, then the technical table in `<details>`, `templates/session-skeleton.yaml` → `section_layout.overview`) and every status line matches its table row
   - All expected sessions have a row in the overview table (expected: the agenda's rows; without an agenda the number in `## Course Context` → Units, else the Outline's Session Overview)
   - Cross-check: every ✅ Skeleton row has a matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
   - Cross-check: every ✅ Material row has its material document present — a file in `materials/{number}-{slug}/README.md` in multi-file mode, or a matching `##` chapter in root `/README.md` in single-file mode (see `data/file-structure-modes.md`)
   - All sessions marked ✅ Done `[required before publishing]`

7. **Check each material document** (same LiaScript + content checks as Session Mode Step 4).
   For each material file, fill `templates/session-validation.yaml` with `Mode: course` and create or replace the matching validation report — heading plus `<section data-key="validation-report">…</section>` at its place in the entry order (see Validation Storage rules above) — in that session subsection under `journal.md` → `## Sessions`. Then set Done in the overview table exactly as in session mode step 6 — in both directions: a unit whose report no longer passes, or has an open ⏳ item, goes back to Done ❌ — and rewrite its status line (`templates/session-skeleton.yaml` → `section_layout.overview`).

8. **Consistency check across project memory and materials:**
   - Terminology consistent (sessions-called from `journal.md` → `## Course Context` used throughout)
   - Persona tone consistent across all materials
   - Learning objectives from `journal.md` → `## Outline` traceable into materials — through `journal.md` → `## Agenda` if there is one
   - Numbering correct and no gaps

9. **Replace `journal.md` → `## Validation` → `### Latest Validation Summary`** — bold labels in the course language with their English `data-key`, never `####` or `#####` headings (each would become its own slide); keep the English key lines `Date:`, `Mode:`, `Result:` that the publishing gate reads, as a list (lines directly below each other would merge into one paragraph):

   ```
   - Date: YYYY-MM-DD
   - Mode: course
   - Result: PASS / FAIL / PASS with concerns
   - Issues found: N
   - Mechanical open: N
   - Sessions checked: N

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

   **Course result:** the worst of (a) the course-level checks, rated with `result_rules` of `templates/session-validation.yaml`, and (b) every unit's current report — a unit with an open ⏳ item or Done ❌ makes the course FAIL (publishing waits for it), open pedagogical concerns of a unit or of the course give PASS with concerns, otherwise PASS.
10. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place (validation state, publishing gate, session progress).
11. After all session validation reports and the latest summary are created: suggest next step.
    - If issues exist: per unit as in session mode step 8 — ✏️ `:quick-fix {number}` when every open point of the unit is one quick-fix change, otherwise `:coauthor-materials {number}` — then rerun `:validate-course`.
    - If no issues: "Course is ready for publishing. Next step: `:agent development` → `:create-project`"

---

### Iteration (mechanical checks only)

Applies only when `:validate-course` runs directly in course mode. Called as a sub-procedure (e.g. by `:build-session` in session mode), it runs once and returns — the caller's own loop iterates, so loops never nest.

**Loop:** Repeat "fix `[mechanical]` issues → rerun `:validate-course`" until every `[mechanical]`-tagged item in `checklists/course-quality-checklist.md` passes (`Mechanical open: 0` in the summary), or after 5 iterations — whichever comes first.

- **Confirm each round of fixes:** before the first change of a round, list its fixes (unit, page title, before → after) in **one** chat confirmation, as step 4b does; the changes follow `tasks/quick-fix.md` (that confirmation covers its scope and save confirmation). Declined fixes leave the loop and count as found.

- In scope for the loop: LiaScript syntax findings from `tasks/validate-syntax.md`, broken links/alt text, a required element that is present but malformed (wrong syntax, missing label), structural gaps — everything tagged `[mechanical]`. A required element that is **missing** is missing content: it goes to the instructor (next item). `[advisory]` items such as the duration flag are not in scope: the loop cannot fix them without inventing or cutting content.
- Items only the instructor can resolve are not in scope either, even when tagged `[mechanical]` — missing content or a missing unit, an approval, an answer (e.g. "all sessions Done", "no session without material"). List them at once; if only such items remain, stop now — further iterations would change nothing.
- Never auto-loop on `[pedagogical]`-tagged items — always surface those to the instructor immediately (core rule: critical sparring partner, not a rubber stamp).
- On hitting the 5-iteration cap without a clean mechanical pass: stop, list the remaining `[mechanical]` FAIL items, and hand back to the instructor instead of continuing.
- See `CLAUDE.md` → "Iteration Pattern" for the general convention. Under Claude Code this can additionally be driven with `/goal "journal.md → ## Validation → ### Latest Validation Summary shows Mechanical open: 0, or stop after 5 iterations"`.

---

## Publishing Gate

**Enforced after every course-mode validation run. Controls access to publishing commands.**

| Result                 | Agent behavior                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 FAIL               | Block publishing. Open pedagogical concerns are gone through in the same pass as for PASS with concerns (fix or accept — for this unit or for the whole course), so the next run does not stop at them. State: "⛔ Publishing Gate: FAIL. Please resolve all issues in `journal.md` → `## Validation` and rerun `:validate-course`. `:create-project` and `:update-project` are locked until PASS." |
| 🟡 PASS with concerns | Publishing stays locked. List every open concern in plain words and go through them one at a time: fix it now (`:quick-fix`, or `:coauthor-materials {number}` for broader changes) or accept it as is with a short reason. Record each accepted concern with the save confirmation — session finding: a dated entry in that session's decisions list; course-level finding: `:save-decision`. Then rerun `:validate-course`: accepted concerns no longer count (see `result_rules` in `templates/session-validation.yaml`). Never offer "publish anyway". |
| 🟢 PASS               | Only if `Mode: course`: suggest handoff: "✅ Publishing Gate: PASS. Ready for publishing. Next step: `:agent development` → `:create-project`"                                                                                          |

**Rule:** Never suggest or assist with `:create-project` or `:update-project` unless `journal.md` → `## Validation` → `### Latest Validation Summary` contains both `Mode: course` and `Result: PASS` — regardless of how the instructor asks.
