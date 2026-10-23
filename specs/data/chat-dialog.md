# Chat Rules: Dialog and Saving

Part of the agent rules of `data/agent-links.md` (Chat Conduct → Rule sheets). They apply whenever the dialog
runs in the preview chat, and wherever a task names them also in the terminal. Write in the course language
(`## Course Context` → Language). Read completely by every task with a dialog (its Inputs name this sheet).

- **Forms:** at most 4 questions per form, each with a plain-language label
  without a trailing colon (the chat adds one);
  `checkbox` where several answers can apply. `buttons` submits at once only
  when it is the only question (e.g. "Save"/"Change"); in a form with several
  questions the chat shows a submit button. Do not promise "one question at a
  time" when you send several.
- **Long proposals:** a proposal longer than about 1500 characters (about 20
  lines of the narrow chat) — also the whole version after a change — goes out as 2–3
  messages (content · distribution and time · open points); the form comes as
  a separate last message. If a form ends up more than a screen above after a
  side question, post it again (it replaces the old one).
- **Superseded forms:** when you post a revised proposal, say that the previous
  version is superseded (a new form closes the old one; with `close` pass a
  `reason`). If an `answer` event refers to an older `ask` than your
  latest one, do not act on it; ask for an answer in the new form.
- **Reuse what is known:** in every interview (also the fast track), prefill
  what the instructor already said in this chat or the journal and ask only for
  confirmation instead of asking again. Ask only what the instructor can
  decide from teaching experience; make technical choices yourself and show
  them in the summary. **What the instructor does not want saved** (a start
  date, an agreement): say honestly that it is not kept — "Then I'll ask you
  again next time" (translated) — and never claim that other assistants will
  find it in the chat: they read only its latest entries.
- **Nothing unseen gets saved:** everything that will be written (incl. lesson
  splits, review lines) appears as text in the summary before "Save". After a
  change, show the new version again, **starting with one line that names
  every change** ("Changed: …", translated) — no bold markers elsewhere. A
  proposal sent in parts: resend the changed part whole and say in the change
  line that the other parts stay as shown. New overview entries (preparation,
  open points) are part of the save summary, in future tense. This includes decision-list entries, report notes
  and dashboard texts: list each in one line before "Save", in future tense
  ("When you save, I will also record: …", translated) — never wording that
  sounds as if it was already saved.
- **Report the save first:** right after writing confirmed content send
  "✅ Saved: …", then a one-line status while the overview is updated. The ✅
  message says what the instructor may do now ("You can already look at the
  page", translated) and what still runs ("only the overview is being
  updated"), so the status line below it does not read as "not saved yet".
  After a check the ✅ message carries the outcome and the line "usable with
  learners now" in one line each and links the report; details follow after
  the overview update — never "I'll explain the result afterwards".
  Never leave a status line standing for more than a minute without a follow-up — except a status that says you are waiting for the instructor.
- **Changing another section:** if the running task needs a change in a section
  it does not own (e.g. an objective in the outline while planning the lesson
  design), show the new wording and give it its own choice **in the first save
  form**: "Save, including the changes in {sections}" · "Save only {own
  section}" (the contradiction then becomes an open point on the overview) ·
  "Change something" — never a plain "Save" that silently includes them. Apply the checks of
  the owning task (read that task file **and its template** first; if the
  template has a `layout`, write in that layout), and add a short note in
  **every** changed section (also `## Agents` subsections) which task changed
  what. In course-wide sections (didactics, writing rules) change only general
  rules; values for one unit belong to the agenda, the outline line and the
  unit itself — if a range covers the value, widen the range ("about 5–10
  minutes") instead of adding an exception. Read the owning task **and** its
  template for every section you change, also for `## Agents` subsections. The completion message lists only notes that exist. Content
  questions never share a form with "Save". **One write per changed section:**
  replace a section with `read_section` + `write_section` (hash-checked, layout
  kept), or put all line changes of one save into one map for
  `node specs/dashboard/localize-journal.mjs <map.json>` (it is a general
  all-or-nothing line replacer, not only for languages: a pair may replace a
  block of consecutive lines that occurs once, write several lines, and
  `"append"` adds lines at the end of the file); action lines and
  one-line notes go into the same pass. Target for "own section + two foreign
  sections + overview": at most 5 writes. The same for material files: several
  line changes of one correction go into one write — one map for
  `node specs/dashboard/localize-journal.mjs <map.json> <material file>`, or the
  whole file written once after reading it — never one edit per line (every
  write reloads the preview and resets the instructor's quiz answers). The write
  scripts count their writes (`.cache/writes.json`) and print a warning from the
  6th write within 10 minutes: take it as a stop — put the rest of the save into
  one map or one section write. Writes with the file-edit tool are not counted.
- **Describing a coming task:** say what the instructor will decide, in the
  instructor's words — never a task's step names or internal terms.
- **Tables in the chat:** at most 3 columns with short cells (about 25
  characters), otherwise a list; no column of bare numbers (the number goes
  into the first cell: "1 · Title"), no attribute comments in chat tables.
  Long tables go to the journal; after saving, link to the section instead of
  repeating the table.
- **Preview before writing:** for quizzes, surveys and other interactive
  parts, show the draft in the chat as LiaScript (the chat renders it) so the
  instructor can try it before it is written to the material. A chat message
  with read-aloud markup (`{{|>}}`, `{|>}{…}`, `--{{n}}--`) starts with a header
  comment like the material header: `narrator:` of the material header (before
  it exists, a voice for the course language, `data/file-structure-modes.md` →
  "Creating the material document") and `language:` — without it the chat
  reads with a default English voice, and a sent message cannot be fixed.
  Check the draft against the chat's narrow width first (Tables in the chat;
  no matrix quiz wider than 3 short columns).
