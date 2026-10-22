# Task: update-dashboard

## Purpose

Derive the instructor-facing overview from the project sections and write it as
one semantic JSON data block into `journal.md` → `## Dashboard`. The LiaScript
Dashboard library (`dashboard/README.md`) renders it via `@Dashboard.View`.

The dashboard is **derived state**. It is never the source of truth.

## Inputs

- `journal.md` main metadata header (`language:`, template `import:` lines)
- `journal.md` → `## Course Context`, `## Outline`, `## Didactics`, `## Agenda`,
  `## Sessions` (overview table, `#### Validation Report`, `#### Persona Reviews`),
  `## Templates`, `## Validation` → `### Latest Validation Summary`,
  `## Publishing` (repository, viewer URL, state — for the publishing step of the course process)
- `journal.md` → `## Agents` → `### Learner Personas` — headings only, for actions
- `templates/project-dashboard.yaml` — semantic data shape
- `dashboard/README.md` — component API of the installed library
- `data/agent-links.md` — link format, action lines, and which commands fit which state
- The `commands:` maps of `agents/*-agent.yaml` — the only commands that may appear as links

## Output

- `journal.md` → `## Dashboard`: exactly one fenced `json @Dashboard.View` block
- `import: ./specs/dashboard/README.md` in the main metadata header (once)
- The action lines (`<!-- class="journal-actions" -->` paragraphs) directly below
  the section headings listed in `data/agent-links.md`

## Automatic Trigger

Run this task automatically after any task that changes project state:

- `:init-course`, `:scaffold`, `:analyze-existing`
- `:create-outline`, `:create-didactics`, `:create-agenda`
- `:configure-agent`, `:manage-templates`, `:create-learner-persona`
- `:create-session`, `:promote-session`, `:build-session`
- `:coauthor-materials` after approval, `:quick-fix`
- `:validate-course`, `:review-as-persona`
- `:save-notes` or `:save-decision`
- `:create-project` or `:update-project`
- Artist-Agent: `:create-visuals`, `:create-logo`, `:create-image`, `:generate-image`
- `:try-as-learner` when it saved changes (they go through `:quick-fix`, which triggers this task)

## Steps

0. **Sign of life first** (MCP gate open): when called right after a save, the
   calling task has already sent "✅ Saved: …". Send a status "Updating the
   overview …" (translated) **before** reading and generating anything. Never
   generate the dashboard data while the last visible sign of life is older
   than about 30 seconds.
1. Read the source sections listed above — now, not from memory. Identify course
   title, target audience, duration and file structure. Empty placeholders
   (`{{...}}`, "not yet filled") do not count as completed planning. Keep sample
   values visibly provisional.
2. Collect units from `## Sessions` and `## Agenda`. Do not invent a unit solely
   because a course title exists. In multi-file mode resolve real material paths
   from `## Course Context` → `__File Structure:__`; in single-file mode inspect
   the matching chapter of the root `README.md`.
3. Derive a display state for each unit:
   - `planned` — in the agenda or skeleton only, not yet worked out. The
     recommended next unit without a skeleton stays `planned`; mark it with
     `selected` and make it the `next` action.
   - `current` — a unit that has a skeleton or material and is being worked
     on now, or on which a task is running
   - `draft` — a material draft exists
   - `review` — feedback, instructor approval or a re-check is still pending
     (material revised after a check and waiting for the re-check is `review`, not `draft`)
   - `revision` — the latest review or validation requires changes
   - Validation result → unit state: FAIL → `revision`; re-check pending →
     `review` (only while the instructor or a check actually has something to
     look at); PASS with concerns → `current` with `statusLabel` = "passed with
     concerns – your decision needed"; PASS with ⏳ items → `current` with
     `statusLabel` = "passed – {later step}" (both translated); PASS + Done ✅ → `done`.
     A persona review alone never changes the state; a change it leads to
     makes the unit `review` until the re-check.
   - `done` — only with `Result: PASS` (not "with concerns") and no open ⏳ item in
     the unit's `#### Validation Report` **and** Done ✅ in the overview table. Never infer it from a heading.
   Optional process steps may use `optional`. A unit's `summary` never
   contradicts its state.
4. Build the material process for each unit from actual evidence: `title`,
   `state`, `why`; optionally `result`, `next`, `statusLabel`. Typical steps are
   objectives → activities → material draft → instructor review → validation and
   revision. Checks may return the work to an earlier step. A generated draft is
   not instructor approval, and a session PASS is not a course publication PASS.
5. Choose **exactly one** prominent next action (`next`) with an understandable
   `title`, `why`, `label`, `href`, readable `command` and `icon` (the action
   symbol from `data/agent-links.md` → Markdown Format; the same for actions in
   `decisions` and `explore`). Check prerequisites
   first: no session creation before Session Types exist, no separate agenda when
   the profile says `Agenda required: no`, no promotion without a skeleton, no
   publication before a course-mode PASS. Put further optional actions in `explore`.
6. **Open points (mandatory checklist).** Re-read all source sections and add
   every hit to `decisions`:
   - A `## Course Context` summary value that contradicts its technical field
     (e.g. a described layout vs. `File Structure: Mode`).
   - Provisional entries ("provisional", "to be decided") in a section whose topic
     has since been saved elsewhere.
   - Numbers that disagree between sections (number of units, lessons, minutes).
   - Session Type slugs that are duplicated (`slug`), or — with several types — a type display name equal to a terminology word (`type-name`).
   - Preparation tasks for the instructor recorded in a section (equipment, printouts, accounts).
   - Agenda phases led by the instructor outside the material (opening, closing,
     one-to-one talks, checklists to print) → `prepare`, with `how`.
   Never fix foreign sections silently — listing them is this task's job. Every
   item gets a unique `key` (the hint key printed by the validation script, e.g.
   `provisional`, `slug`, `type-name`, `preparation`, `file-structure`; several items for one
   hint use `{hint}-{topic}`) and a `kind`:
   - `decide` — the instructor must decide; `how` says where and how.
   - `prepare` — the instructor must do or get something before using the material; `how` says how.
   - `internal` — cleanup the agent does itself at the next suitable write (old
     notes, duplicate slugs). No `how`; rendered collapsed for experts. Resolve it
     at the next write and mention it in that task's completion message.
   Titles never repeat the group name. Empty list if there is nothing open.
7. Produce the JSON following `templates/project-dashboard.yaml`. No HTML, CSS,
   JavaScript, progress percentages or duplicated totals — the library derives
   counts from `units[].state`. Always include the global course `process`, also
   once units exist — the view offers it as the "whole course" entry next to the
   units. An empty project uses `units: []` plus that global
   `process`; it shows no fake 0/1 or invalid percentage.
8. Keep the `## Dashboard` heading line unchanged and replace the whole JSON block
   below it **in one write**: write the complete JSON with the file-write tool
   to `.cache/dashboard.json` and run `node specs/dashboard/write-dashboard.mjs
   .cache/dashboard.json` (on its own). It checks the data, replaces the whole
   block in one step and runs the validation of step 9; never edit the block
   field by field, never with shell heredocs or inline scripts. Fill
   `unitLabel` (`{one, many}`) and `unitsTitle` from `## Course Context` →
   Terminology in the course language. If the course language is neither
   German nor English, also fill `labels` with all fixed texts of the library
   in the course language (keys and placeholders: `specs/dashboard/README.md`
   → `labels`); otherwise leave `labels` out. Keep the translated suffix of
   `## Sessions` and `## Agenda` in line with that terminology and update
   `links` in the same run. Ensure the template import exists once in the header; CSS and
   JavaScript are owned by the library. Document the template in `## Templates`
   via the `tasks/manage-templates.md` procedure if it is missing there.
9. **Validate** with `node specs/dashboard/validate-journal.mjs` (run from the
   project root, on its own — no pipes or `;`, it prints its own exit code).
   Exit code 2 means likely contradictions while `decisions` is empty, or a
   malformed report: fix (step 6) and run it again. Do not use other ad-hoc
   commands (e.g. `python3 -m json.tool`).
10. Refresh the action lines:
    - For every heading listed in `data/agent-links.md` → Action lines (core `##`
      sections and every `### {n}. {title}` under `## Sessions`): replace the
      `<!-- class="journal-actions" -->` paragraph directly below the heading, or
      insert one there.
    - Fill it with the commands from that table that fit the current state, with
      concrete arguments (session number, persona names). Session
      subsections get exactly one main action; further fitting commands go into
      the `<details><summary>Technical settings and more actions</summary>` block
      directly after the action line (block order: `templates/session-skeleton.yaml` → `section_layout.entry_order`).
    - If an action line ended up below a `#### Validation Report`,
      `#### Persona Reviews`, or `#### Images` block, move it back directly below
      the `###` heading.
    - Touch nothing else in source sections. This task writes only:
      1. the action lines, and the further commands inside the sessions'
         "Technical settings and more actions" blocks — never their Type or Method lines;
      2. the translated suffix of the `## Sessions` and `## Agenda` headings, kept in
         line with the terminology (step 8) — the start of every heading stays unchanged;
      3. the dashboard template `import:` line in the main header, once (step 8);
      4. the `## Templates` entry of the dashboard template, via `tasks/manage-templates.md`
         and only if it is missing (step 8).
11. Confirm the dashboard was updated only after step 9 passed, and name the next
    recommended command. If the MCP gate is open (`data/agent-links.md`), `goto` the
    Dashboard slide, check with `get_state`, and post the next action as an
    `agent:` link to the preview chat (Chat Offers). Never present a renderer
    check as course validation.

## Rules

- All facts and workflow decisions come from source sections, never from the dashboard.
  If dashboard and source sections disagree, trust the source and regenerate.
- Never ask the instructor to update the dashboard manually.
- Links only for commands that exist in an agent's `commands:` map and fit the
  current state — never `exit`, never a command whose prerequisites are missing.
  Every `agent:` link in the data carries its readable `command`.
- The layout is owned by the library in `specs/dashboard/`. Changes to the
  appearance belong there; never invent a new layout per update and never add
  HTML, CSS, tables or a Mermaid map to `## Dashboard`.
- Keep one data set for the composed view; do not repeat numeric progress in the
  subtitle — describe the state in words.
- Write all visible texts in the course language (`## Course Context` →
  Language; while that is still empty, the header's `language:`) and address
  the instructor as `## Course Context` → `Instructor Address` says (while
  empty: the formal form of that language). For the empty project keep the
  meaning of the template texts and translate them, including a real date in
  `footer` instead of a placeholder. `Person` is the learners' address in the material
  and is never used for dashboard texts.
- Plain language for the instructor: no command names, slugs, file names or
  section keys in `title`, `subtitle`, `why`, `label` or `description` — those
  belong only in `command` and `href`.
- Use the terminology from `## Course Context` → `__Terminology:__`
  (`sessions-called`) for `unitsTitle` and all unit wording.
- The JSON block is only ever written through `specs/dashboard/write-dashboard.mjs` (step 8) — one write, never field by field.
- Exactly one definition of "finished" per project, stated once in
  `process.note` (finished = validation PASS and Done ✅). Process-step `why`
  texts never define "finished". On every run re-read all existing texts of
  the data (`why`, `note`, `summary`, `subtitle`) against the current rules and
  rewrite contradicting ones — the previous block is not a template.
- Use "finished/done" only for units with a validation PASS. Instructor approval is "approved", never "finished" — in process steps, `why` texts and `note`.
- `next.title` uses exactly the name of the current process step as shown in
  the process panel (same words in `next`, `steps` and chat offers).
- Keep the global process steps stable from the empty journal on: the agenda step
  is listed as `optional` until `Agenda required` is set, then `planned` (yes) or
  removed with a `note` (no). The last step, publishing, stays `optional` until the
  publishing gate is PASS, then `planned`, and `done` once `## Publishing` →
  `__State:__` says published. Never let the number of steps change without a `note`.
- `plan` (provisional planning) only while Outline/Didactics assign content to
  lessons and no `## Agenda` exists yet. As soon as the agenda is confirmed, every
  agenda row is a unit (`planned`, progress 0 of N) — even before `## Sessions`
  has it — and `plan` is removed. The only command offered for a unit without
  skeleton is creating it.
- Next step for the first unit: create its skeleton, then work it out together
  with `coauthor-materials`. Offer `build-session` (automatic loop) only after one
  unit has been worked out together and approved.
- Each unit with a skeleton gets `href` to its `### {n}. {title}` subsection in
  `## Sessions` (anchor of the heading, see below).
- **Anchors (LiaScript):** an anchor is the full heading text in lower case,
  spaces and "-" collapsed to single "-", **punctuation kept** ("." "?" "–" ":").
  Examples: `## Outline – Learning goals` → `#outline-–-learning-goals`;
  `### 3. Why do leaves fall?` → `#3.-why-do-leaves-fall?`. An unknown anchor
  silently opens slide 1, a bare slide number (`#10`) breaks when slides are
  added — use neither. `validate-journal.mjs` checks every `#` link.
- Section links in `links` use the anchor of the current heading line.
- Publishing remains gated by `## Validation` → `### Latest Validation Summary`:
  `Mode: course` and `Result: PASS`.
- Keep `## Dashboard` near the top of `journal.md`, directly after the course title.
