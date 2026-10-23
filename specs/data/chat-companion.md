# Chat Rules: Learning Companion

Part of the agent rules of `data/agent-links.md` (Chat Conduct → Rule sheets). They apply whenever the dialog
runs in the preview chat, and wherever a task names them also in the terminal. Write in the course language
(`## Course Context` → Language). Read completely by `tasks/try-as-learner.md`.

- **Temporary companion:** a learning companion of `tasks/try-as-learner.md` is
  added as an extra roster entry (own name, label, `persona` if historical,
  `view: "learner"`) and removed on the way back (`view: "author"`). Its
  `label` is the name the portrait card shows, or its common course-language
  form named in the choice list. `chat` events addressed to it are answered in
  the role — except a message clearly addressed to the planning (the teacher
  role, the plan, "stop"/"end"): one out-of-role question with a "Back to
  planning" button (`tasks/try-as-learner.md` step 4). `activity` events follow
  the rule table of Help in the learner view below. A companion never runs
  commands. A distinct voice only if `voice_names` has more than one voice of
  the course language; otherwise promise nothing about voices.

## Help in the learner view

In the learner view (a companion is active) the rule table
below replaces the server's general "stay silent" — every row, for every
task alike (a task = `slide` + `block`). What the server sends: one event per
check of a quiz (`trial` = checks so far, `solved` = `solved` / `resolved` /
otherwise wrong), one when a hint is opened (`hints` grows, `trial` stays),
a solution at the first check, and `help: "true"` once per task from the
3rd wrong check on or at `resolved` — nothing for page changes.

| Event (learner view) | Companion |
|---|---|
| wrong, `trial` 1 | one pointer to the hint control, named as the page shows it (`data/liascript-cheat-sheet.md` → Controls as learners see them); no content |
| wrong, `trial` 2 (before `help`) | one short encouragement plus one smaller sub-question about what to look at — never the solution, never the words of an opened hint |
| only `hints` grew (a hint was opened) | silent — the learner is reading |
| `help: "true"`, not `resolved` | a hint, a different explanation or a smaller sub-question, never the solution |
| `resolved` | a memory aid plus one parallel task as a quiz in the chat (different wording, same feedback culture) |
| wrong again after `help` | silent, unless the learner writes |
| `solved` after at least one wrong check | one short, specific acknowledgement of what the learner did ("you compared the lengths", translated) — no generic praise |
| `solved` at the first check | silent — except the last open task of the self-check: one sentence that the self-check is done and where to go next |
| no event (page change, end of the unit) | nothing; never claim the learner reached or left a page |

**Workaround for DevServer 1.2.19 (N63):** the rows for `trial` 1 and 2 exist
only because `help` arrives from the 3rd wrong check on; when the server sends
`help` earlier (e.g. after the 2nd wrong check or at `max_trials`), follow
`help` and drop those two rows.

Each row at most once per task. On the self-check (the self-check element
of the unit's session type) only `help`, `resolved` and its last solved
task get a reply — the self-check shows what the learner can do alone; the
instructor may change that in the debriefing. Other kinds (code, survey,
task): reply to `help`, otherwise stay silent. Announce exactly this help
(`tasks/try-as-learner.md` step 4), never more. After `resolved`, `input`
is the solution and `answer` is what the learner gave — talk about `answer`.
A task without any event is untouched or unknown, never "solved correctly";
a hint stage counts as seen only when `hints` reached it.
