# Task: suggest-templates

## Purpose

Suggests LiaScript templates for the learning activities of the course, after the didactics: from the
shared catalog, the project list and an online search, each suggestion explained by subject, target group
and activity. Per activity the instructor adopts one, tries it first, has an own one developed (a brief for
the Development-Agent) or decides that none is needed. The result is the line `__Template selection:__`
in `journal.md` → `## Templates`.

Use this task when:
- `:create-didactics` was saved (the Dashboard's `next`)
- `:coauthor-materials` finds an interaction for one unit that no adopted template covers (`{activity}`)
- The instructor asks for a tool, a simulation or an interactive building block
- The instructor wants to look at the selection again or revise a decision (another template, drop or replace a brief) — repeatable, without reopening the didactics

Only templates are suggested. Interactions LiaScript offers itself (quizzes, surveys, executable
JavaScript, charts, animations) are not proposed here.

## Inputs

- `journal.md` → `## Course Context` (subject, target group, language)
- `journal.md` → `## Didactics` (didactic concept, lesson patterns and their required elements, methods — the learning activities)
- `journal.md` → `## Outline` (learning objectives, for a brief) and the units of `## Agenda` or `## Sessions` (for `__Used in:__`), if present
- `journal.md` → `## Templates` (selection line, adopted entries, briefs) and the `import:` lines of the main metadata header
- `specs/catalog/templates.json` (shared list, read-only) and `templates.local.json` in the project root (project list, if present)
- Optional `{activity}` (e.g. from `:coauthor-materials`): suggest only for this activity
- `templates/course-templates.yaml` (`template-entry`, `template-brief`, notes on the selection line)
- `tasks/manage-templates.md` — read completely: adoptions go through its steps
- Optional skill `liascript-templates`, only if installed (see `data/skills.md`; a missing one is offered once per conversation, `data/skills.md` → Installing a Missing Skill): to judge a find's README and what an own template can do
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Templates`: the line `* __Template selection:__` (`open` | `done – {id}, {id}` | `done – none needed`), adopted entries (through `tasks/manage-templates.md`) and briefs `### {id} (in development)`; on a revision the removed or replaced entry or brief
- `journal.md` main metadata header: the `import:` line of every adopted template (a removed template's line only when no material uses its macros)
- `templates.local.json`: one `found` entry per online find the instructor uses and, on a revision, the removal of a dropped brief's `own` entry `{id}` (only after "Save")
- `journal.md` → `## Dashboard` updated

## Steps

1. **Learning activities that need a tool.** From `## Didactics` (and the subject in `## Course Context`)
   list the activities whose tool LiaScript does not bring itself — e.g. programming with feedback, SQL
   queries on a sample database, chemical formulas and reactions. Name each in the instructor's terms
   ("the children draw shapes by programming", translated). With `{activity}` only that one. Without a
   saved `## Didactics`, say that the suggestions follow from the didactics and offer `:create-didactics`
   first; continue only on the instructor's wish, with the activities they name.
   **Already decided:** an adopted entry under `## Templates` (other than `### Dashboard`) or a brief
   covers its activity — show it as decided and do not suggest for it again on your own.
   **Revising:** a decided activity may be reopened when the instructor asks (another template, or a brief
   to drop or replace): it gets suggestions like an open activity, and step 5 adds "Keep as it is"
   (translated); any other choice replaces its entry or brief ("None needed" removes it). A removal touches
   only that entry or brief and its id in the selection line (step 7); dropping or replacing a brief
   also removes its `own` entry `{id}` from `templates.local.json` (if there is one) in the same save —
   otherwise that template could later be adopted without its acceptance check; its folder
   `lia-templates/{id}/` stays — say so, and that the instructor deletes it themselves if it is no longer
   wanted (this task deletes no files); an adopted entry's header
   `import:` goes only when no material uses its macros (`tasks/manage-templates.md` → Notes) — name the
   materials that still do. An existing journal may document
   templates without the selection line: an entry without `__Catalog id:__` whose import or repository
   matches a catalog entry gets the offer to add `__Catalog id:__ {id}` and `__Source:__ catalog`; one
   that matches no entry gets the offer of a `templates.local.json` entry (`found`, from its README) and
   the same two fields; an `import:` line in the header without an entry is documented as
   `tasks/manage-templates.md` does. These changes are part of the save in step 7.
2. **Catalog and project list.** Filter `specs/catalog/templates.json` and `templates.local.json` by
   subject (`subjects`) **and** target group (`audiences`: `primary`, `secondary`, `vocational`,
   `higher-education`, `adult`, from `## Course Context`). An entry that fits the subject but not the
   target group is mentioned only with that reason. An `own` entry whose id is an open brief
   `### {id} (in development)` is not suggested: it is adopted only through `:manage-templates {id}` (the
   Dashboard's `next`), after its acceptance check — its activity is decided by the brief (step 1). Nor is
   an `own` entry with the local import `./lia-templates/{id}/README.md` that has neither a brief nor an
   adopted entry `{id}` (`tasks/manage-templates.md` step 1b refuses it).
3. **Online search.** Run `node specs/catalog/search.mjs {subject keyword}` (English keyword, e.g.
   `python`, `sql`, `chemistry`; on its own). It lists repositories with the topic `liascript-template`
   that neither list contains. For every hit you want to name, read its README before you name it (the
   `readme` URL, with the file-reading or fetch tool) — macros, import URL and demo only from that README,
   never from the repository name or description; a hit whose README you could not read is not named.
   Exit code 2 (no network, rate limit): one sentence that the online search did not work and that the
   suggestions come from the catalog only.
4. **Suggestions.** Per activity 1–3 templates, each with its reason (subject, target group, activity) in
   the course language and, with several, the difference that matters for these learners (e.g. for
   children a Python with turtle drawing such as Skulpt versus a full Python such as Pyodide, which suits
   older learners). Mark each by its status: `checked` → "checked {date}", plus its `note` when it has one
   (e.g. "the import follows the default branch", translated); an online find of this run
   or a `found` entry of `templates.local.json` → "newly found, not checked" with a short risk note (e.g. "import without a fixed version", "last changed
   {year}", "macros only from its README", translated — `data/chat-checks.md` → Say how you checked:
   *read in the documentation*); `own` → "only this project". When nothing fits, say so — the activity
   may still need no template.
5. 🎛️ **Decision per activity** (one form, at most 4 activities per form): "Adopt {name}" (one option per
   suggestion) · "Try first" (the `demo` link opens the template's own page; in the preview chat a link,
   in the terminal the URL — then ask again; an `own` entry without `demo` is tried with `:preview lia-templates/{id}/README.md`) · "Develop one ourselves" · "None needed" (translated); for a reopened activity (step 1 → Revising) first "Keep as it is".
6. 💬 **Develop one ourselves — the brief.** Per such activity ask in plain words, reusing what is known
   (`data/chat-dialog.md` → Reuse what is known): what the learners do with it, what they see or get back
   after an action, which learning objective of `## Outline` it serves, the target group (prefilled from
   `## Course Context`), the units that will use it, and 1–3 checkable acceptance points ("the turtle
   draws the square the learner programmed", translated). `__Why not existing:__` you fill yourself from
   the candidates of steps 2–3 and why none fits. The id: lowercase letters, digits and single hyphens,
   unique in `## Templates`, never a catalog id. Fill `template-brief` of `templates/course-templates.yaml`
   (`### {id} (in development)`, `__State:__ brief`, `__Folder:__` and `__Feedback rounds:__` empty;
   values in the course language, field names English).
7. **Before saving:** prepare every adoption with `tasks/manage-templates.md` (its step 1b for a catalog
   id and step 3: import, macros from the README, examples) and show in one message everything that will
   be written — the header `import:` lines, the adopted entries, the briefs, the selection line, the
   additions of step 1, what a revision removes or replaces (entry or brief, header `import:`, the `own`
   entry of a dropped brief in `templates.local.json`, with the files that stay) and, for a find the instructor uses, its `templates.local.json` entry
   (`status: "found"`, with a `note` on the risk) — with "Save" / "Change something" (translated). This is
   the single write confirmation of this task (`data/chat-dialog.md` → Nothing unseen gets saved).
   The selection line: `done – {id}, {id}` once every activity is decided, naming only the ids of entries
   with `__Catalog id:__ {id}` and of briefs `### {id} (in development)` — an existing entry without
   `__Catalog id:__` (the instructor declined the offer of step 1) counts as decided but is not named, and
   when no id is left to name the line is `done – none needed`; also `done – none needed` when no activity
   needs a template, otherwise `open`. With
   `{activity}` add the new id to an existing `done – …` (`done – none needed` becomes `done – {id}`) and
   leave `open` as it is — never reopen the other decisions on your own. A revision (step 1 → Revising):
   the removed or replaced id leaves the line and the new one, if any, joins it — the line is
   recomputed in the same write as the removal by the rule above, never left naming a removed entry or
   brief. A removal without a replacement follows the same rule as `tasks/manage-templates.md` step 5 —
   whether its activity still needs a template (the step-5 answer: "None needed" is no, an activity left
   without a decision is yes): yes → `open`; no → its id leaves the line, none left: `done – none needed`.
   **One write, the selection line never first:** the selection line is written in the same write as the
   entries and briefs it names — `validate-journal.mjs` reports a `done – {id}` without its entry or brief
   as a problem, and that blocks the Dashboard write. At most two journal writes: (1) header and
   `## Templates` in one map for `node specs/dashboard/localize-journal.mjs <map.json>`
   (`data/chat-dialog.md` → Changing another section), then (2) the Dashboard. A fix that
   `validate-journal.mjs` asks for in step 8 goes into one more write; say so.
8. After "Save": write the adoptions through steps 3–7 of `tasks/manage-templates.md` without its 3b
   (this task's step 7 is the confirmation), the briefs, the removals of a revision and the selection
   line — all in the one write of step 7; then `templates.local.json` with the file-edit tool, in one edit:
   the `found` entries of step 7 added, the `own` entries of dropped briefs removed (create it as
   `{ "version": 1, "templates": [ … ] }` if missing; never `status: "checked"`). Run
   `node specs/dashboard/validate-journal.mjs` and fix what it reports before step 9 (in one more write,
   named to the instructor).
9. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` →
   `## Dashboard` in place.
10. **Finish:** a short summary (adopted, in development, none needed) and 1–3 next steps. After a brief,
    the Development-Agent builds the template: offer `agent:development/switch` — the Dashboard's `next`
    shows `:develop-template {id}`. Otherwise the Dashboard's `next` (usually the agenda or unit 1), and
    `agent:artist/switch` while `## Visual Identity` is still empty.

## Notes

- Checked means listed in the shared catalog with its check date: never present a `found` or `own` entry as checked, also not after reading its README.
- The shared list is read-only: never write to `specs/catalog/templates.json`; it is replaced on every update of the Teaching-Agent. Project entries go into `templates.local.json`.
- `## Templates` records only what the course uses: candidates and finds that were not adopted are not written there.
- Catalog data is English; explain the templates in the course language (in German „Vorlage“, never „Template“).
- Web chat without shell or file access: suggestions only from the catalog in the bundle, without the online search — say so in one sentence.
