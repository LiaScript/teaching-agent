# Task: build-session

## Purpose

Orchestrates the full pipeline for one session — skeleton → generated material → validated → persona-reviewed → illustrated — as a single command with a clear stop condition, instead of manually invoking `:promote-session`, `:validate-course`, `:review-as-persona`, `:create-image`, and `:generate-image` one at a time and checking each result by hand.

`promote-session.md` itself is unchanged — this task calls it, and the other existing tasks, as sub-procedures.

## Command

`:build-session {number} {type}`

## Inputs

- `number`, `type`
- `journal.md` → `## Sessions` — session skeleton (created if missing, see Step 0)
- `journal.md` → `## Agenda` — declared duration for this session
- `journal.md` → `## Agents` → `### Learner Personas` — if present, drives Step 2
- Referenced sub-procedures: `tasks/create-session-skeleton.md`, `tasks/promote-session.md`, `tasks/create-image.md`, `tasks/generate-image.md`, `tasks/validate-course.md`, `tasks/validate-syntax.md`, `tasks/review-as-persona.md`, `tasks/quick-fix.md`, `data/duration-heuristic.md`

## Output

- Fully promoted, validated material for the session
- `#### Validation Report` and (if personas exist) `#### Persona Reviews` in the matching `journal.md` → `## Sessions` subsection
- Real images inserted, replacing placeholders
- Session marked ✅ Done in the `## Sessions` overview table — only with `Result: PASS` (not "PASS with concerns") in its `#### Validation Report`; dashboard updated
- A closing summary: iterations spent per loop, final validation result, persona verdicts, images inserted, and anything that had to be escalated to the instructor

## Steps

### 0. Ensure a skeleton exists

If `journal.md` → `## Sessions` has no `### {number}. {title}` subsection yet, run `tasks/create-session-skeleton.md` first (one-shot — it asks the instructor for a title the normal way). Otherwise continue.

### 1. Content loop (mechanical gate)

a. **First iteration only:** if the session's overview-table `Material` column is already ✅, ask the instructor before regenerating — `:promote-session` replaces the material wholesale and would silently discard any prior co-authoring. Otherwise, run `tasks/promote-session.md {number} {type}` to generate the full material.

b. **First iteration only:** identify spots in the freshly generated material that would benefit from an image (diagrams, illustrations, header art) and run `tasks/create-image.md {number} {type} {description}` for each one, producing prompt-ready placeholders in this session's `#### Images` block. Keep the list of `{image-slug}`s created here — Step 3 needs it.

c. Run `tasks/validate-course.md {number} {type}` (session mode) — this internally calls `tasks/validate-syntax.md` and applies `data/duration-heuristic.md`, and writes `#### Validation Report`.

d. If any `[mechanical]`-tagged item (per `checklists/course-quality-checklist.md`) is FAIL: run `:quick-fix {number} {type} {description}` for each one. If a `:quick-fix` call escalates to `:coauthor-materials` per its own step 5 rule: **stop this loop immediately** and hand off to the instructor — do not invoke `:coauthor-materials` automatically, it requires a human in the loop.

e. If any `[pedagogical]`-tagged item is flagged, or an `[advisory]` hint is recorded (such as the "possibly too short" duration flag): do not auto-fix. Carry it forward into Step 2. If no personas exist to weigh in (Step 2 will be skipped), surface it directly in the closing report instead.

**Loop:** Repeat b–d until every `[mechanical]` item passes, or after 5 iterations — whichever comes first. On hitting the cap: stop, list the remaining `[mechanical]` FAIL items, and report to the instructor instead of continuing to Step 2. See `CLAUDE.md` → "Iteration Pattern" for the general convention.

### 2. Persona review loop `[only if journal.md → ## Agents → ### Learner Personas contains at least one persona]`

a. For each persona, run `tasks/review-as-persona.md {name} {number} {type}` in **report-only mode**: perform its steps 1–7 (produce and save the structured `#### Persona Reviews` report) and skip steps 8–10 (the persistent in-character follow-up chat) — there is no one present to chat with during an automated loop. The instructor can start that chat separately afterward by calling `:review-as-persona` directly.

b. If any persona's `Priority Issues` include a blocking concern — including a "content feels too short/rushed" comment, which is the real judgment call on the Step 1e duration flag — fix it via `:quick-fix` (isolated issue) or by re-running Step 1 (broader issue), using the same "When to use vs. `:coauthor-materials`" table from `tasks/quick-fix.md` as the decision rule. If a fix needs `:coauthor-materials`: stop and hand off to the instructor, same rule as Step 1d.

c. After fixes, re-run Step 1 and then this step again for **all** personas (not just the one that raised the concern, to catch regressions).

**Loop:** Repeat a–c until no persona raises a blocking concern, or after 3 rounds — whichever comes first. On hitting the cap: stop, list the unresolved persona concerns, and report to the instructor.

`[if no personas exist]`: skip this step entirely. Note in the closing report that no persona review was performed and suggest `:create-learner-persona` if that seems useful.

### 3. Image finalization

Runs **once**, only if Steps 1 and 2 both finished clean (did not stop early on a cap or an escalation). If either loop stopped early, do not proceed — the closing report from that step is the end of this run.

For each `{image-slug}` created in Step 1b, run `tasks/generate-image.md {slug}` (single mode, scoped to this session's own images — not the global batch mode, which would also process other sessions' pending images) to generate, download, and insert the real image, replacing the placeholder. This runs automatically, without an extra confirmation, once content and persona checks are clean.

### 4. Finalize

Mark the session ✅ Done in the `journal.md` → `## Sessions` overview table (if not already) — only if its `#### Validation Report` says `Result: PASS`; with "PASS with concerns" Done stays ❌ and the closing summary names the deferred step. Run `tasks/update-dashboard.md`. Report the closing summary described in Output above.

## Cross-agent execution note

Steps 2 and 3 run the Learner-Agent's and Artist-Agent's own task procedures automatically as sub-steps of this loop, rather than through the usual conversational "suggest `:agent X`" handoff (see `CLAUDE.md` → "Agent Coordination" → the `:build-session` exception). Each sub-step still only reads its owning agent's own `### {Agent}` subsection in `journal.md` → `## Agents` — the read-scope rule stays in force even though the switch happens automatically instead of by explicit instructor command.

## When to use vs. manual step-by-step

| Situation | Use |
|---|---|
| First pass on a new session, want the full pipeline in one go | `:build-session` |
| Only want to regenerate material without touching validation/personas/images | `:promote-session` |
| Only want to check syntax/content without the full loop | `:validate-course` |
| Want to sit in the room and co-author interactively | `:coauthor-materials` |
| Want to add or refine one image, not run the whole pipeline | `:create-image` / `:generate-image` |
