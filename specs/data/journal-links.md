# Journal Links and Field Keys

How `agent:` links, action lines, Dashboard actions and field keys are written into `journal.md`. Part of the
agent rules of `data/agent-links.md`; read completely by every task that writes a journal section (its Inputs
name this file).

## Field keys in journal sections

Visible labels in `journal.md` sections are in the course language. When a task
names a field as `__Key:__` (e.g. `## Didactics` → `__Professor Persona:__`), it
means the field whose attribute comment directly above carries its key
(`<!-- data-key="guiding-figure" -->`, keys: the `layout` of the section's
template), and in older journals the bullet whose label starts with that English
key. Fields inside a `<details>` technical block keep their English labels.
Didactics: `Didactic Concept` = `didactic-concept`, `Professor Persona` =
`guiding-figure`, language style = `language-style`, lesson patterns =
`lesson-patterns`, difficulty = `difficulty`, `Persona Voice Sample` =
`voice-sample`. Outline and Agenda: the section ids of `templates/course-outline.yaml` and `templates/course-agenda.yaml` (`Time Budget` = `time-budget`).
The same for a unit's check report: `#### Validation Report` in a task means the
heading directly above `<section data-key="validation-report">` (visible text in
the course language, `templates/session-validation.yaml`), and in older journals
the heading that starts with `#### Validation Report`.
When the instructor asks about a field name, explain that keys are invisible —
never claim a visible English label is needed.

## Markdown Format

Always write the link followed by the visible command, so the line is useful
in any renderer (VS Code, GitHub, LiaScript without DevServer):

```markdown
[▶️ Build session 3](agent:teaching/build-session?number=3) `:build-session 3` — material missing
```

- Label: short verb phrase in the course language (`## Course Context` →
  `Language`), starting with `▶️` (run), `✏️` (revise/redo), `🔍` (check),
  `👁` (preview), `🚀` (publish — only `development/create-project` and
  `development/update-project`), or the agent icon for a switch (`🎨` Artist, `🧑‍🎓` Learner,
  `🛠️` Development, `🎓` Teaching).
- Then the command in inline code, exactly as the instructor would type it —
  with values, never raw placeholders (`{description}`). A value left out on
  purpose is shown as a translated hint in angle brackets (`<what?>`). If the
  label names a concrete fix, pass it in the link (`&description=…`) and in the
  command. After a validation the **Dashboard's** main action is: FAIL → the
  fix — ✏️ `quick-fix` with description when every open point is one it
  covers (one change each, no content decision), otherwise
  `coauthor-materials`; PASS / PASS with concerns → the Dashboard's `next`. The action line of a unit
  (`### {n}. …`) only offers actions **for that unit** (e.g. preview, the
  next step of its own process) — never the next unit's action. `quick-fix`
  is never a main action without a description.
- Then, only in chat offers, ` — ` plus a short reason.
- Never use `<button data-agent=…>`; the Markdown link is the only format.

### Dashboard data

`## Dashboard` holds one JSON block rendered by the Dashboard library
(`specs/dashboard/`). There an action is data, not a Markdown link: `href`
(the `agent:` URI) plus `command` (the readable command) plus `icon` — the same
symbol a Markdown label would start with (see Markdown Format: `▶️`, `✏️`, `🔍`,
`👁`, `🚀`, or the agent icon). The library renders a button with the icon before the
label and the readable command right after it; without `icon` an `agent:` button
shows `▶️`. Whitelist,
prerequisites and confirmation tiers apply unchanged.

### Action lines below headings

A section may carry one **action line**: a single paragraph directly below its
heading (before the `<!--- Filled by … --->` comment), marked with the LiaScript attribute
comment `<!-- class="journal-actions" -->`. The class styles the line and marks
it as generated — `tasks/update-dashboard.md` creates and refreshes these paragraphs and, in
source sections, only the few derived lines its "writes only" list names.

```markdown
## Outline

<!-- class="journal-actions" -->
[✏️ Revise outline](agent:teaching/create-outline) `:create-outline` · [▶️ Didactics](agent:teaching/create-didactics) `:create-didactics`

<!--- Filled by :create-outline from templates/course-outline.yaml. --->
```

Rules for action lines:

- Links separated by ` · `, at most 6 per line, one line only, no headings.
- A task that replaces a section writes its action line already in the state
  after the save (e.g. ✏️ revise instead of ▶️ create); `update-dashboard`
  leaves a correct line untouched — one write less.
- Writing a section replaces its one-line note ("still empty – …") with the
  content; the provenance comment `<!--- Filled by … --->` stays invisible
  (name the task that actually wrote the section). Never write `{{…}}`
  skeletons into the journal — `validate-journal.mjs` rejects visible ones.
- A task that replaces a section without writing its action line (older
  task texts) leaves it to `tasks/update-dashboard.md`, which runs afterwards and
  restores it. Tasks that insert blocks into a session
  subsection (`#### Validation Report`, `#### Persona Reviews`, `#### Images`)
  insert them at their place in `templates/session-skeleton.yaml` →
  `section_layout.entry_order` (behind the skeleton fields), never before the
  action line.
- Only commands that make sense in the current state (see table below; e.g. no
  `promote-session` for a session without skeleton).

| Section | Action line (commands) |
|---|---|
| `## Course Context` | `init-course` (revise), `analyze-existing` (only for improve-existing courses) |
| `## Outline` | `create-outline` |
| `## Didactics` | `create-didactics`, `artist/create-visuals` |
| `## Visual Identity` | `artist/create-visuals`, `artist/create-logo` |
| `## Templates` | `suggest-templates`, 👁 `preview?file=specs/catalog/README.md` (the template catalog, command `:preview specs/catalog/README.md`), `manage-templates` |
| `## Agenda` | `create-agenda` |
| `## Sessions` | `create-session` (without params — asked in chat; only once `## Didactics` → `__Session Types:__` exist, before that `create-didactics`; when `Agenda required: yes` only once `## Agenda` is saved, before that `create-agenda`), `build-session?number={n}` for the next unit without skeleton once one unit has been worked out together and approved ("let it be prepared after a short sketch", translated — `tasks/update-dashboard.md` → Rules), `validate-course` (once a unit has material) |
| `### {n}. {title}` | **exactly one main action** by state: skeleton without material → `coauthor-materials?number={n}`; material written with open image entries → `artist/create-image?number={n}` (the image step, before the check); material draft → `validate-course {n}`; check: correction needed → ✏️ `quick-fix?number={n}&description=…` when every open point is a quick-fix case (one change each, no content decision), otherwise `coauthor-materials?number={n}` (✏️ revise); passed with concerns → `validate-course {n}` ("Resolve concerns", translated — without a change since the report it goes straight through the concerns, no new check: `tasks/validate-course.md` step 0); passed with ⏳ ("passed – still missing: …") → the command of the step that produces what is missing (e.g. `artist/create-image?number={n}` for photos, `artist/generate-image` for generated images); checked ✅ → 👁 `preview` of the material; after one session has been worked out together and approved, other sessions may use `build-session` as main action. **Learners' view:** once the material exists, the line also carries 👁 `preview?file={n}` ("How learners see it", translated, with the course's word for learners) as second link after ` · ` — never only inside the `<details>` block; when the main action is that preview (checked ✅), once. The overview's unit gets the same link as `view` (`tasks/update-dashboard.md`); a link to the unit's planning is named "See planning" (translated), never "To unit {n}". All further commands (`promote-session`, `build-session`, `validate-syntax`, `preview`, `quick-fix`, `learner/review-as-persona`) go only into the session's `<details><summary>Technical settings and more actions</summary>` block right after the action line (block order: `templates/session-skeleton.yaml` → `section_layout.entry_order`) |
| `## Agents` | `configure-agent` (agent asked in chat), `create-learner-persona`, `learner/switch` (only if personas exist) |
| `## Validation` | `validate-course` (only once every unit of the agenda or overview has material) |
| `## Publishing` | `development/create-project` (first publication, only if the publishing gate is PASS), `development/update-project` (once `__State:__` is published; same gate) |
| `## Notes Backup` | `save-notes`, `save-decision` |

`## Dashboard` has no action line — its data block carries the actions. `## Analysis
Status` gets none.
