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
  `## Templates` (the line `__Template selection:__` and the briefs `### {id} (in development)` —
  the template step of the course process, Rules → Template step), `## Validation` → `### Latest Validation Summary`,
  `## Publishing` (repository, viewer URL, state — for the publishing step of the course process)
- `journal.md` → `## Agents` → `### Learner Personas` — headings only, for actions
- `templates/project-dashboard.yaml` — semantic data shape
- `dashboard/README.md` — component API of the installed library
- `data/agent-links.md` — link format, action lines, and which commands fit which state
- The `commands:` maps of `agents/*-agent.yaml` — the only commands that may appear as links
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-language.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Dashboard`: exactly one fenced `json @Dashboard.View` block
- `import: ./specs/dashboard/README.md` in the main metadata header (once)
- The action lines (`<!-- class="journal-actions" -->` paragraphs) directly below
  the section headings listed in `data/journal-links.md` → Action lines

## Automatic Trigger

Run this task automatically after any task that changes project state:

- `:init-course`, `:scaffold`, `:analyze-existing`
- `:create-outline`, `:create-didactics`, `:create-agenda`
- `:configure-agent`, `:suggest-templates`, `:manage-templates`, `:create-learner-persona`
- `:create-session`, `:promote-session`, `:build-session`
- `:coauthor-materials` after approval, `:quick-fix`
- `:validate-course`, `:review-as-persona`
- `:save-notes` or `:save-decision`
- `:create-project` or `:update-project`
- Development-Agent: `:develop-template` (its `__State:__` changes) and `:publish-template`
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
   - States are exclusive; if two seem to fit, take the later one in this list.
   - `planned` — in the agenda or skeleton only, not yet worked out. The
     recommended next unit without a skeleton stays `planned`; mark it with
     `selected` and make it the `next` action.
   - `current` — the one unit being worked on now (a task runs on it, or it is
     being worked out together); a skeleton alone is `planned`, but gets
     `statusLabel` = the text of its status line in `## Sessions` ("planning
     sketch ✅ · material open", translated); the recommended next unit
     (`selected`) with a skeleton is `current`
   - `draft` — material exists and the instructor has not approved it yet; the material step
     becomes `done` only with a recorded approval (the approval form of `tasks/quick-fix.md` →
     Approval after a review, or `tasks/coauthor-materials.md` step 7) — a review with fixes alone is no approval
   - `review` — approved or revised material whose check or re-check is still
     pending (material revised after a check and waiting for the re-check is `review`, not `draft`)
   - `revision` — the latest review or validation requires changes
   - Validation result → unit state: FAIL → `revision` with `statusLabel` =
     "check: correction needed ({n})" (translated, the report's outcome words —
     never a grade word such as "failed"; once points were fixed after the check it counts the open
     ones: "check: correction needed: {open} of {n} points open", never the original findings); changed after the check →
     `review` (only while the instructor or a check actually has something to
     look at) with `statusLabel` = "{outcome} – {n} point(s) changed since –
     short re-check open"; PASS with concerns → `current` with `statusLabel` = "passed with
     concerns – your decision needed"; PASS with ⏳ items → `current` with
     `statusLabel` = "passed – still missing: {what}" (e.g. "1 photo"; all translated,
     never a step or command name as subject); PASS + Done ✅ → `done` once the material is approved (material step `done`); a checked draft the instructor has not approved yet (e.g. after `:build-session`) → `current` with `statusLabel` = "passed – waiting for your approval" (translated) and `next` = the learners' view for that look (`tasks/quick-fix.md` → Approval after a review).
     **One wording per state:** `statusLabel`, the unit's status line, its
     Notes cell and the report's outcome line use the same words for the same
     state (`templates/session-validation.yaml` → `outcome_words`), plus other
     open state such as "images {n} of {m}"; `validate-journal.mjs` compares
     status line and `statusLabel` with the report.
     A persona review alone never changes the state; a change it leads to
     makes the unit `review` until the re-check.
   - `done` — only with `Result: PASS` (not "with concerns") and no open ⏳ item in
     the unit's `#### Validation Report` **and** Done ✅ in the overview table. Never infer it from a heading.
   Optional process steps may use `optional`. A unit's `summary` never
   contradicts its state. Once a check ran, the report's answer to "usable with
   learners now" goes into `usable` ({state: yes | limited | no, missing: [...]},
   `templates/session-validation.yaml` → `outcome_words`) — the first line of the
   unit's card; `summary` does not repeat it. Once the material exists, the unit
   gets `view` (`agent:teaching/preview?file={n}`, command `:preview {n}`): the
   material as the learners see it, a button of its own next to the planning link.
4. Build the material process for **every** unit from the start — the same steps
   for each; a unit not yet started has all steps `planned`, and its first
   step's `next` says when it is due. Fill states from actual evidence: `title`,
   `state`, `why`; optionally `result`, `next`, `statusLabel`. Typical steps are
   objectives → activities → material draft → instructor review → validation and
   revision. Checks may return the work to an earlier step. A generated draft is
   not instructor approval, and a session PASS is not a course publication PASS.
   **Image step:** every unit's process has the step "Insert images" (translated)
   between the material step and the check — `optional` while the unit has no
   image entries (`#### Images`), required (`planned`/`current`) while one is open
   (`tasks/create-image.md` → Image spots), `done` once none is open. While it is
   open after the material step, it is the unit's next step (action
   `artist/create-image?number={n}`), before the check; open image entries do not
   change the unit state. A partial state is visible everywhere it is named: the
   unit's `statusLabel` (= its status line, "material written · images {n} of
   {m}", `templates/session-skeleton.yaml`), the step's `result` ({n} inserted)
   and `next` (the remaining images plus the `__To do:__` lines of the image
   entries), and the Notes cell of the technical table — never a bare "images
   missing" once some are in. A step that is `done` returns to an earlier state only
   through a check result (FAIL, concerns), never through a later decision or new
   work: new work of another kind is its own step.
5. After a check with FAIL or open concerns, `next` is resolving them ("Resolve concerns" / "Revise", translated), never another check of the same state — for open concerns that is `validate-course {n}`, which then goes straight through them without a new check (`tasks/validate-course.md` step 0). A FAIL whose open points are all `:quick-fix` cases (one change each, no content decision) gets the small correction as action (✏️ `quick-fix` with its description, "Correct", translated), not `coauthor-materials` (`data/journal-links.md` → Action lines).
   Choose **exactly one** prominent next action (`next`) with an understandable
   `title`, `why`, `label`, `href`, readable `command` and `icon` (the action
   symbol from `data/journal-links.md` → Markdown Format; the same for actions in
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
   - A brief under `## Templates` (`### {id} (in development)`) that lacks a required field, has an
     unknown `__State:__`, or is `ready to test` without its folder `lia-templates/{id}/README.md`
     (hint `template-brief` of the validation script) → `decide`, key `template-brief-{id}`; `how` says
     what is missing and who completes it (the brief together with the instructor, the folder through the
     development assistant). Plain words: German "Vorlage" or "Baustein", never "Template".
   Never fix foreign sections silently — listing them is this task's job. Every
   item gets a unique `key` (the hint key printed by the validation script, e.g.
   `provisional`, `slug`, `type-name`, `preparation`, `file-structure`, `template-brief`; several items for one
   hint use `{hint}-{topic}`; open priority issues of a persona review use `review-{unit}-{n}`
   (`decide`), prompt-only images and open `own` image spots `image-{unit}-{slug}` (`prepare`: create
   the image elsewhere or with `:generate-image` once an image route exists; for `own`: provide the
   photo)) and a `kind`:
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
   field by field, never with shell heredocs or inline scripts.
   **Fresh cache:** after each run the script stores `_journalHash` (the hash of
   the block it wrote) in the cache file. If `.cache/dashboard.json` carries it,
   change only the keys the triggering write affects — plus every text the
   re-read of the Rules finds stale — with the edit tool and run the script; it
   refuses a cache whose hash no longer matches the journal block ("cache
   stale"). Write the whole draft only when the cache is missing, has no
   `_journalHash` or was refused. Before a whole draft send a status with its
   duration (`data/agent-links.md` → Progress feedback). Fill
   `unitLabel` (`{one, many}`) and `unitsTitle` from `## Course Context` →
   Terminology in the course language (while `sessions-called` is unset: the
   course-language word for the template's default unit word, the same word
   as the `## Sessions` suffix). If the course language is neither
   German nor English, also fill `labels` with all fixed texts of the library
   in the course language (keys and placeholders: `specs/dashboard/README.md`
   → `labels`); otherwise fill only `labels.decide` and `labels.prepare` with
   the library's built-in group titles of that language, so the chat can name
   the groups exactly as the page shows them (`data/chat-wording.md` → Name
   things as the overview does) — plus, only where the course has its own word
   for the learners, `usable.yes`, `usable.limited`, `usable.no` and
   `viewMaterial` with that word; never `plan`. Keep the translated suffix of
   `## Sessions` and `## Agenda` in line with that terminology and update
   `links` in the same run. Ensure the template import exists once in the header; CSS and
   JavaScript are owned by the library. Document the template in `## Templates`
   via the `tasks/manage-templates.md` procedure if it is missing there.
9. **Validate** with `node specs/dashboard/validate-journal.mjs` (run from the
   project root, on its own — no pipes or `;`, it prints its own exit code).
   Exit code 2 means likely contradictions while `decisions` is empty, or a
   malformed report: fix (step 6) and run it again. Do not use other ad-hoc
   commands (e.g. `python3 -m json.tool`).
   **Older journal layout:** if it names an older journal layout (`{{…}}`
   skeletons in unfilled sections, `#### Validation Report` headings of an older
   template), run `node specs/dashboard/migrate-journal.mjs --check` and show its
   list in plain words ("Your journal still uses an older layout. I would update
   it – only the presentation, none of your entries:" plus the list, translated),
   with "Update" / "Not now" (tier "confirm in chat"). "Update" → run
   `node specs/dashboard/migrate-journal.mjs`, then validate again; a line it
   lists under "Left for you" is a section filled by hand — name it and propose
   filling or removing that line in the same form. "Not now" → write no
   Dashboard and say that the overview stays at its last state until then.
10. Refresh the action lines:
    - For every heading listed in `data/journal-links.md` → Action lines (core `##`
      sections and every `### {n}. {title}` under `## Sessions`): replace the
      `<!-- class="journal-actions" -->` paragraph directly below the heading, or
      insert one there.
    - Fill it with the commands from that table that fit the current state, with
      concrete arguments (session number, persona names). Session
      subsections get exactly one main action; further fitting commands go into
      the `<details><summary>Technical settings and more actions</summary>` block
      directly after the action line (block order: `templates/session-skeleton.yaml` → `section_layout.entry_order`).
      Exception: once the material exists, the action line also carries the learners' view as
      second link (👁 "How learners see it", translated, `agent:teaching/preview?file={n}`) — never
      only inside the `<details>` block; when the main action already is that preview, once.
    - Leave a line that already says the right thing untouched. When several
      lines change at once (a language switch, a new unit word), put all of them
      into one `localize-journal.mjs` map (`data/chat-language.md` → Language
      before the frame) instead of one edit per line — every write reloads the
      preview.
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
         and only if it is missing (step 8);
      5. the layout changes of `migrate-journal.mjs`, only after the instructor's
         "Update" (step 9);
      6. the one-line note under `## Sessions`, which follows the state (Rules → "The one-line note under `## Sessions`").
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
  subtitle — describe the state in words. Texts that mention open points
  (`subtitle`, `next`, `why`) name them by their titles, not by a count; a count,
  if any, counts exactly the items of the group it names.
- Write all visible texts in the course language (`## Course Context` →
  Language; while that is still empty, the header's `language:`) and address
  the instructor as `## Course Context` → `Instructor Address` says (while
  empty: the formal form of that language). For the empty project keep the
  meaning of the template texts and translate them, including a real date in
  `footer` instead of a placeholder. `Person` is the learners' address in the material
  and is never used for dashboard texts.
- **One ranking of the three measures:** (1) usable with learners now (`usable`, from the
  check report) — the first line of the card and the first thing a text about the unit
  says; (2) open points (`statusLabel`, counting the points still open); (3) process
  steps (the step counter). Status words never discourage a unit that is usable: no
  "nothing finished" in `subtitle`, `summary` or `why` while a unit is usable — the
  library's progress line then names it ("Fully checked: none yet · Usable now: …").
- **How the learners see it:** every unit with material (Material ✅) has `view`, and
  its action line the 👁 preview link (step 10); `validate-journal.mjs` warns without
  either. The planning link (`href`) is always named "See planning" by the library
  (translated) — never set `labels.plan` in German or English, never a label that
  hides the target ("To unit 1").
- Plain language for the instructor: no command names, slugs, file names or
  section keys in `title`, `subtitle`, `why`, `label` or `description` — those
  belong only in `command` and `href`.
- Use the terminology from `## Course Context` → `__Terminology:__`
  (`sessions-called`) for `unitsTitle` and all unit wording.
- **`next` names one step.** `next.title` is exactly the title of the step it advances, as the process panel shows it: when `next` belongs to a unit, that unit's current step plus the unit ("Insert images – unit 1", translated) — the course step stays visible in the course process, never in `next.title`; otherwise the current course step. `next.label` is the same step as an action with the same key noun (title "Outline and learning objectives" → button "Create outline"; "Insert images – unit 1" → "Insert images for unit 1"). Name each unit step by its result ("Plan the unit" for the planning sketch); the step, `next`, the unit's action line and chat offers use the same words. A command that serves another purpose in the same unit (images after the text) gets its own step (step 4) — never a new label for an existing step.
- `process.steps[].result` states what exists, without a leading status word (the library adds its own label), and only what holds for every item.
- The one-line note under `## Sessions` follows the state: (1) before the agenda: the template note; (2) agenda saved, no unit yet: the units are planned in the schedule and are created one after another, starting with unit 1; (3) some created: "{n} of {N} created; the next follows after the material of unit {n}" (translated, with the unit word); (4) all created: no note. Written in the same pass as the action line.
- `explore` items never use the icon of `next`: optional actions use ➕ or the icon of their agent, so exactly one ▶️ button stands for the next step.
- The JSON block is only ever written through `specs/dashboard/write-dashboard.mjs` (step 8) — one write, never field by field.
- Exactly one definition of "finished" per project, stated once in
  `process.note` (finished = validation PASS and Done ✅). Process-step `why`
  texts never define "finished". On every run re-read all existing texts of
  the data (`why`, `note`, `summary`, `subtitle`, and `result`/`next` of every
  step) against the current rules **and the current state**, and rewrite
  contradicting or stale ones — e.g. a `why` that says a task "cannot be
  solved without the images" after those images were inserted. Refresh `why`
  and `result` of every step the triggering write touched. The previous block
  is not a template: a fresh cache (step 8) saves rewriting unchanged keys,
  never this check.
- Use "finished/done" only for units whose check passed without an open ⏳ item (Done ✅) and that are approved. Instructor approval is "approved", never "finished" — in process steps, `why` texts and `note`.
- Keep the global process steps stable from the empty journal on: the agenda step
  is listed as `optional` until `Agenda required` is set, then `planned` (yes) or
  removed with a `note` (no). The last step, publishing, stays `optional` until the
  publishing gate is PASS, then `planned`, and `done` once `## Publishing` →
  `__State:__` starts with `published` (an English key, never translated). Never let the number of steps change without a `note`.
- **Template step:** the global step "Templates for activities" (translated, German "Vorlagen für
  Aktivitäten" — never "Template" in a German text for the instructor) stands between the didactics and
  the agenda and is counted. Its state comes from `## Templates` (the line that starts with
  `## Templates`, layout `templates/course-templates.yaml`) — the line `__Template selection:__`
  (missing = `open`) and the briefs `### {id} (in development)`:
  1. `planned` while `## Didactics` is not saved.
  2. Didactics saved, selection `open` and no brief: the step is `current` and the `next` of the course
     (`agent:teaching/suggest-templates`, command `:suggest-templates`, label "Suggest templates",
     translated). Once the agenda is saved or a unit is being worked on, `next` stays with them and the
     suggestion goes into `explore` (icon ➕) — also in an existing journal whose selection line is
     missing, and also when the previous Dashboard's `next` was the agenda: a missing selection line
     never takes `next` away from work in progress (`validate-journal.mjs` warns once the agenda is saved or a
     unit is being worked on).
  3. A brief not yet adopted exists — whatever the selection value (`open`, or a `done – …` that does
     not name it) — and takes precedence over 2: `current`, `result` by the briefs' `__State:__` —
     "{n} in development" (translated, German "{n} in Entwicklung") for `brief` and `in development`,
     "{n} ready to test" (German "{n} bereit zum Ausprobieren") for `ready to test`, both joined with
     " · " when both occur (`validate-journal.mjs` warns about "in development" once every open brief is
     ready to test) — and `next` by the brief's `__State:__` — `brief` or
     `in development` → `agent:development/develop-template?id={id}` (command `:agent development` →
     `:develop-template {id}`), `ready to test` → `agent:teaching/manage-templates?name={id}` (command
     `:manage-templates {id}`, "Try and adopt", translated). With several briefs the first one in the
     section. The brief takes `next` only when no unit is being worked on or the unit being worked on is
     named in its `__Used in:__` (by number, by range such as "2–4", or as all units); otherwise `next` stays with that unit and the brief's action
     (`:develop-template {id}` or `:manage-templates {id}`) goes into `explore` (icon ➕) — the step stays
     `current` (`validate-journal.mjs` warns). The agenda and the units do not wait for a brief: the agenda step keeps the state it has
     without the brief (`planned`, `current` while it is being created, `done` once saved), its button
     stays in the `## Agenda` action line, and while `next` is the brief `:create-agenda` (or the
     next unit's action) is an `explore` card (icon ➕); the units keep their actions in their
     action lines.
  4. Selection `done – …` (ids or `none needed`) without an open brief: `done`, `result` = the names of
     the adopted entries as `## Templates` shows them — every entry except `### Dashboard`, also one
     without `__Catalog id:__`; "none needed" (translated) only when there is no such entry.
  **Existing journals:** a Dashboard whose `process.steps` lack this step gets it at the next run,
  directly after the didactics step, in the state above (a missing selection line is `open`, but rule 2
  keeps `next` with an agenda or unit in progress), and `process.note` gets one appended sentence
  (e.g. "New: the step “Templates for activities” – ready-made building blocks for activities, or your
  own.", translated); the definition of "finished" in the note stays as it is.
- `plan` (provisional planning) only while Outline/Didactics assign content to
  lessons and no `## Agenda` exists yet. As soon as the agenda is confirmed, every
  agenda row is a unit (`planned`, progress 0 of N) — even before `## Sessions`
  has it — and `plan` is removed. A unit without skeleton is offered only
  commands that create it: `create-session`, and — once one unit has been worked
  out together and approved — `build-session?number={n}` (its step 0 creates
  the skeleton).
- Next step for the first unit: create its skeleton, then work it out together
  with `coauthor-materials`. Offer `build-session` (automatic loop) only after one
  unit has been worked out together and approved. From then on the next unit
  without skeleton gets **two** actions: "plan together" (`create-session`) and
  "let it be prepared after a short sketch" (`build-session?number={n}`, which
  asks for the same start confirmation as in the chat) — one as `next`, the
  other in `explore` (icon ➕), and both in the `## Sessions` action line; its
  first step's `next` names both ways. A previous unit that is not yet checked
  does not hold this offer back.
- Each unit with a skeleton gets `href` to its `### {n}. {title}` subsection in
  `## Sessions` (anchor of the heading, see below).
- **Anchors (LiaScript):** an anchor is the full heading text in lower case,
  spaces and "-" collapsed to single "-", **punctuation kept** ("." "?" "–" ":").
  Examples: `## Outline – Learning goals` → `#outline-–-learning-goals`;
  `### 3. Why do leaves fall?` → `#3.-why-do-leaves-fall?`; a unit's check
  report `#### Validation report – Unit 2` → `#validation-report-–-unit-2`.
  Report headings are unique per unit (`templates/session-validation.yaml`), and
  every link that names a check report (a decision's `href`, an action) targets
  that report's anchor, never the unit heading. An unknown anchor
  silently opens slide 1, a bare slide number (`#10`) breaks when slides are
  added — use neither. Link only headings outside HTML blocks: a heading inside a
  `<section>` block (e.g. an agent subsection under `## Agents`) is no slide —
  link its enclosing `##` heading and name the subsection in the text.
  `validate-journal.mjs` checks every `#` link.
- Section links in `links` use the anchor of the current heading line.
- Publishing remains gated by `## Validation` → `### Latest Validation Summary`:
  `Mode: course` and `Result: PASS`.
- Keep `## Dashboard` near the top of `journal.md`, directly after the course title.
