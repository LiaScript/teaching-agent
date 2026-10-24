# Task: build-session

## Purpose

Orchestrates the full pipeline for one session — skeleton → generated material → validated → persona-reviewed → illustrated — as a single command with a clear stop condition, instead of manually invoking `:promote-session`, `:validate-course`, `:review-as-persona`, `:create-image`, and `:generate-image` one at a time and checking each result by hand.

`promote-session.md` itself is unchanged — this task calls it, and the other existing tasks, as sub-procedures.

## Command

`:build-session {number}`

## Inputs

- `number`
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- `journal.md` → `## Sessions` — session skeleton (created if missing, see Step 0)
- declared duration for this session — `data/session-types.md` → "Objectives and duration of a session" (the agenda, without an agenda the length of one unit)
- `journal.md` → `## Agents` → `### Learner Personas` — if present, drives Step 2
- Referenced sub-procedures: `tasks/create-session-skeleton.md`, `tasks/promote-session.md`, `tasks/create-image.md`, `tasks/generate-image.md`, `tasks/validate-course.md`, `tasks/validate-syntax.md`, `tasks/review-as-persona.md`, `tasks/quick-fix.md`, `data/duration-heuristic.md`, `templates/session-skeleton.yaml`, `data/file-structure-modes.md`, `tasks/update-dashboard.md` — **read completely once before the run**, every one of them, including `tasks/generate-image.md` (Phase 0, the image route) and `tasks/quick-fix.md` (its "When to use" table decides step 1d); a later step of the same run may rely on that reading unless the specs changed
- `data/agent-links.md` → Progress feedback and Long runs — status rhythm and questions during the run
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- Fully promoted, validated material for the session
- `#### Validation Report` and (if personas exist) `#### Persona Reviews` in the matching `journal.md` → `## Sessions` subsection
- Real images inserted, replacing placeholders
- Session marked ✅ Done in the `## Sessions` overview table — only with `Result: PASS` (not "PASS with concerns") and no open ⏳ item in its `#### Validation Report`; dashboard updated
- A closing summary (step 4): the runs line with the iterations spent per loop as numbers, every applied fix (page title, before → after), every factual statement that could not be verified (no web access or `reference-checker`) for the instructor to confirm or correct — they keep the unit at "passed with concerns" until then, and `:validate-course {number}` goes through them — final validation result in the outcome words of `templates/session-validation.yaml`, persona verdicts, images per spot (inserted / candidates kept for swapping / none found), and anything that had to be escalated to the instructor

## Before the start

- **Open decisions first:** if open points of the overview (`decisions`) or the unit's skeleton concern this unit, name them and ask them first — in one form, before the start confirmation. A previous unit that is not yet checked is a hint, never a reason to decline the run.
- **Image source per spot:** take it from the rules for writing the material (`### Coauthor`) and `## Visual Identity` (`free-photo`, `generated`, `own`); where neither names one, ask it in the start confirmation (one choice for all spots, changeable per spot later). Without web access during the run, free-photo spots stay `wanted` with "none found" and go into the closing summary with the choice `generated` / `own` — the run never switches a source by itself. If free photos are planned, the start confirmation asks **once** who chooses them (translated): "I choose, you can swap later" (the agent picks the best photo it looked at and keeps the others as candidates) · "I collect up to 3 candidates per spot, you choose afterwards" (nothing inserted; the image step stays open for the choice).
- **The start confirmation** names every kind of project write, the image source and who chooses, and an honest duration; it covers what the instructor confirmed, nothing more — a content question that comes up during the run is asked, never decided alone (step 1d).

## Confirmations

- The start confirmation of `:build-session` (tier "confirm in chat", `data/agent-links.md`) covers every write **inside the project** during this run: generated material, validation reports, mechanical fixes, persona reports, image prompts. Sub-procedures called by this task do not ask again — `quick-fix` skips its scope and save confirmations, `validate-course` skips its closing question, `review-as-persona` runs report-only, `create-image` (Free photos) skips its "go" per batch and its choice form — the start decision on who chooses replaces them.
- Sub-procedures called by this task do not refresh the dashboard themselves; Step 4 runs `tasks/update-dashboard.md` once, also when the run stops early. The one exception is the small overview patch of step 0, so that the journal stays valid during the run.
- Nothing stays unseen: the closing summary lists every applied fix with page title and before → after.
- **Outside the project** it covers nothing: if Step 3 takes the browser route of `tasks/generate-image.md` (no own image tool), ask **once in the terminal** (tier "confirm in terminal") for all images of this run **before the run starts**, right after the start confirmation — not at step 3, when the instructor may no longer look at the terminal. Without that confirmation, skip Step 3 and say so in the closing summary. With the agent's own image tool, the start confirmation covers Step 3.
- **Rendered check:** the loop runs `check-material.mjs` on its own. Before the start confirmation run `node specs/dashboard/check-material.mjs <an existing material file or README.md>` once; only its "Rendered check not possible: …" reason line counts. If that reason is "no installed Playwright found" or "has no browser of its own", ask once in the terminal **before the run starts** (`data/chat-checks.md` → Offering the Rendered Check); a refusal means the run continues with the source checks and says so in the closing summary.

## Steps

### 0. Ensure a skeleton exists

If `journal.md` → `## Sessions` has no `### {number}. {title}` subsection yet, run `tasks/create-session-skeleton.md` first (one-shot — it asks the instructor for a title the normal way). Otherwise continue.

- **Check the sketch before the start:** before its save form, check the planning sketch against the `Required` lists of the session's Type and Method (`tasks/create-session-skeleton.md` step 7); name every gap in the sketch and offer the fix in the same form. What the sketch says about task types is a content decision of the instructor — the run produces it, never another task type.
- **Overview patch in the same save:** right after the skeleton is saved, patch the overview cache (`.cache/dashboard.json`, `tasks/update-dashboard.md` step 8 → Fresh cache): `units[{n}].href` to the new subsection, its `statusLabel` (the new status line) and its first process step, then run `node specs/dashboard/write-dashboard.mjs .cache/dashboard.json` (a few seconds). The journal then passes `validate-journal.mjs` during the whole run; the full overview follows in step 4.

### 1. Content loop (mechanical gate)

a. **First iteration only:** if the session's overview-table `Material` column is already ✅, ask the instructor before regenerating — `:promote-session` replaces the material wholesale and would silently discard any prior co-authoring. Otherwise, run `tasks/promote-session.md {number}` to generate the full material — **in parts of at most about a minute of generation each** (e.g. read-aloud pages · tasks · self-check; at most 3 parts, one write each, each part a complete state of the document), with a status naming the part and its duration before each one and a look at waiting chat messages between them (`data/agent-links.md` → Long runs).

b. **First iteration only:** identify spots in the freshly generated material that would benefit from an image (diagrams, illustrations, header art), each with its source as decided before the start (`free-photo`, `generated`, `own`).
   - **`generated`:** first determine the image route as in `tasks/generate-image.md` Phase 0. **With a route:** run `tasks/create-image.md {number} {description}` for each spot — prompts in this session's `#### Images` block and a marker in the material. **Without a route** (no own image tool, no browser): run it in prompt-only mode — prompts saved with `__Status:__ prompt-only`, no marker in the material and no ⏳, so the unit can still be Done; the closing summary lists the prompts. Keep the list of `{image-slug}`s created here — Step 3 needs it.
   - **`free-photo` and `own`: record the spot first** — one `wanted` entry per spot in this session's `#### Images` block (`tasks/create-image.md` → Image spots: status, source, place, description, search terms) and its marker in the material (`tasks/create-image.md` step 12), in the same writes as the other image changes of this step. Only then the source's own path below finds the spot, and the open image step keeps the unit from Done until the picture is in.
   - **`free-photo`:** run `tasks/create-image.md` → "Free photos" steps 1–4 and 6 with its limits (at most 3 looked-at candidates per spot, about 2 minutes per spot, then "none found"; a status per batch of up to 5 spots). Instructor chooses afterwards → record the candidates (`candidate`), insert nothing; the image step stays open (⏳) for the choice. Agent chooses → insert the best looked-at candidate **before step c** (no looked-at candidate for a spot: insert nothing there and keep the candidates for the instructor's choice), so the check measures the real layout, and keep the other candidates under `__Candidates:__` for swapping. After choosing, re-read the page's texts and hints against each photo (Free photos step 3); a spot left "none found" gets no sentence that refers to a picture (Free photos step 7).
   - **`own`:** the recorded spot and its marker stay; it is an open point for the instructor (⏳ with the image step).
   - **One write per file for all images of the run:** every marker, credit line and changed sentence of the material in one map (`node specs/dashboard/localize-journal.mjs <map.json> <material file>`; markers as block pairs and a new credits chapter via `"append"`, `tasks/create-image.md` → Free photos step 6), every image entry and the status line of the journal in one write — never one edit per marker. Announce "one write" only when the route really gives it.

c. Run `tasks/validate-course.md {number}` (session mode) — this internally calls `tasks/validate-syntax.md` and applies `data/duration-heuristic.md`, and writes `#### Validation Report`. Inside the loop, write the report **once per iteration, after the fixes of step d and their re-check** — also when step d stops the loop, then with the points still open — never a report followed by correction edits of its numbers. A re-check that ran only part of the checks (e.g. only `check-material` for one changed page) is named as such in the report.

d. If any `[mechanical]`-tagged item (per `checklists/course-quality-checklist.md`) is FAIL: run `:quick-fix {number} {description}` for each one. If a `:quick-fix` call escalates to `:coauthor-materials` per its own step 5 rule: **stop this loop immediately** and hand off to the instructor — do not invoke `:coauthor-materials` automatically, it requires a human in the loop.
   **Never a "mechanical" fix:** a fix that changes a task's type (e.g. tapping → dragging), adds or removes a task, or departs from the saved planning sketch is a content change (`tasks/quick-fix.md` → "When to use"), also when a `[mechanical]` item such as a Type or Method `Required` element asks for it. If the instructor is in the chat, ask with one form (the change, the reason, "keep as planned") and continue after the answer; otherwise stop the loop and list it.

e. If any `[pedagogical]`-tagged item is flagged, or an `[advisory]` hint is recorded (such as the "possibly too short" duration flag): do not auto-fix. Carry it forward into Step 2. If no personas exist to weigh in (Step 2 will be skipped), surface it directly in the closing report instead.

**Loop:** Repeat c–d until every `[mechanical]` item passes, or after 5 iterations — whichever comes first. On hitting the cap: stop, list the remaining `[mechanical]` FAIL items, and report to the instructor instead of continuing to Step 2. See `CLAUDE.md` → "Iteration Pattern" for the general convention.

### 2. Persona review loop `[only if journal.md → ## Agents → ### Learner Personas contains at least one persona]`

a. For each persona, run `tasks/review-as-persona.md {name} {number}` in **report-only mode**: perform its steps 1–7 (produce and save the structured `#### Persona Reviews` report) and skip steps 8–10 (the persistent in-character follow-up chat) — there is no one present to chat with during an automated loop. The instructor can start that chat separately afterward by calling `:review-as-persona` directly.

b. If any persona's priority issues (`data-key="priority"`) include a blocking concern (one that makes the unit unusable for that persona: it cannot follow, cannot do a task, or cannot access the material — everything else is reported, not fixed in this loop; a concern that exists only because a planned picture is not in yet — its spot is an open `#### Images` entry with its marker — is not blocking: the image step resolves it, and the closing summary names it with that step) — including a "content feels too short/rushed" comment, which is the real judgment call on the Step 1e duration flag — fix it via `:quick-fix` if it is an isolated issue, using the "When to use vs. `:coauthor-materials`" table from `tasks/quick-fix.md` as the decision rule. A broader issue needs `:coauthor-materials`: stop and hand off to the instructor, same rule as Step 1d — never regenerate the material to fix it.

c. After fixes, re-run Step 1c–1d — never 1a or 1b: regenerating would discard every fix of this run — and then this step again for **all** personas (not just the one that raised the concern, to catch regressions).

**Loop:** Repeat a–c until no persona raises a blocking concern, or after 3 rounds — whichever comes first. On hitting the cap: stop, list the unresolved persona concerns, and report to the instructor.

`[if no personas exist]`: skip this step entirely. Note in the closing report that no persona review was performed and offer, as one link, trying the unit as a learner (`try-as-learner?number={number}` when the MCP gate is open, otherwise `:create-learner-persona`).

### 3. Image finalization

Runs **once**, only if Steps 1 and 2 both finished clean (did not stop early on a cap or an escalation). If either loop stopped early, skip this step and go to step 4, which runs in every case (report of the last iteration, Done rule, overview, closing summary with the runs line).

Only for `generated` images: for each `{image-slug}` created in Step 1b, run `tasks/generate-image.md {slug}` (single mode, scoped to this session's own images — not the global batch mode, which would also process other sessions' pending images) to generate, download, and insert the real image, replacing the placeholder. Start only after the single terminal confirmation described in "Confirmations".

### 4. Finalize

Mark the session ✅ Done in the `journal.md` → `## Sessions` overview table (if not already, together with its status line) — only if its `#### Validation Report` says `Result: PASS` and lists no open ⏳ item; with "PASS with concerns" Done stays ❌ and the closing summary names the deferred step. Run `tasks/update-dashboard.md`. Report the closing summary described in Output above:

- **Runs line** (fixed, translated): "Runs: content check {n} of at most 5 · persona review {n} of at most 3 (or: skipped – no learner profiles) · images {in} of {spots} (inserted and generated)".
- **Outcome** in the words of `templates/session-validation.yaml` → `outcome_words` (e.g. "passed – still missing: 1 photo", translated) — the same words as the report, the status line and the overview. A word the instructor has not seen before is explained where it first appears (the short re-check: "I look over the changed pages once more, about {m} minutes", translated).
- **Duration hint** by its content, never by a name such as "the formula" (`data/duration-heuristic.md` → Naming the estimate).
- **Usable first:** the line "usable with learners now" of the report comes before the outcome details, as on the overview card (`tasks/update-dashboard.md` → One ranking of the three measures).
- **One offer** to try the unit as a learner (`try-as-learner?number={number}` when the MCP gate is open, otherwise `:create-learner-persona` when no personas exist), plus the overview's `next`.
- **Approval stays with the instructor:** the generated material is a draft (material step `draft`) until the instructor has looked at it — offer the learners' view (👁 `preview?file={number}`) for that look. After the instructor's review and any fixes, `tasks/quick-fix.md` → Approval after a review asks the one approval form; only "Approve" makes the material step `done`.

## Writes per run

Every write reloads the preview and resets the answers of an instructor who is trying a page. Target per run — material: the generated text (at most 3 parts), images 1, each fix iteration 1; journal: sketch save 1 plus the overview patch of step 0, report + image entries + status line 1 per iteration, overview 1 (step 4). Changes of several lines go into one map (`localize-journal.mjs`) or one section write (`data/chat-dialog.md` → Changing another section). Sub-procedures write in these batches: all persona reports of one round in one journal write, the image entries and status line of a batch in one, all images of step 3 in one material write. A run that needs more writes names the number in its runs line ("writes: {n}", translated; the write scripts' log `.cache/writes.json` counts theirs, writes with the file-edit tool are added) — never splits silently.

## Cross-agent execution note

Steps 2 and 3 run the Learner-Agent's and Artist-Agent's own task procedures automatically as sub-steps of this loop, rather than through the usual conversational "suggest `:agent X`" handoff (see `CLAUDE.md` → "Agent Coordination" → the `:build-session` exception). Each sub-step still only reads its owning agent's own part of `journal.md` → `## Agents` — the `### Artist-Agent` subsection for the image steps, and for the Learner-Agent only the named `#### Persona:` entry in `### Learner Personas` (it has no `### Learner-Agent` subsection) — the read-scope rule stays in force even though the switch happens automatically instead of by explicit instructor command.

## When to use vs. manual step-by-step

| Situation | Use |
|---|---|
| First pass on a new session, want the full pipeline in one go | `:build-session` |
| Only want to regenerate material without touching validation/personas/images | `:promote-session` |
| Only want to check syntax/content without the full loop | `:validate-course` |
| Want to sit in the room and co-author interactively | `:coauthor-materials` |
| Want to add or refine one image, not run the whole pipeline | `:create-image` / `:generate-image` |
