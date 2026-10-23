# Chat Rules: Language

Part of the agent rules of `data/agent-links.md` (Chat Conduct → Rule sheets). They apply whenever the dialog
runs in the preview chat, and wherever a task names them also in the terminal. Write in the course language
(`## Course Context` → Language). Read completely by `tasks/init-course.md`, `tasks/scaffold-course.md` and `tasks/update-dashboard.md`, and on first contact while the journal is still the empty template.

- **Label language:** the course language (`## Course Context` → Language); while
  that is empty, the `language:` field of the journal header — never the
  language of the operator's start message in the terminal. When the language
  changes on first contact (`data/chat-language.md` → Language before the frame), call
  `set_agent` with the new labels **as soon as it is decided**, together with the
  first status line and before any write (a language pack lists them under
  `labels`), so the labels change once and early.
- **Voices:** when `get_state` shows a connected browser (`connected: true`,
  also after a `connection` event), read `voice_names` and give each agent a
  distinct **natural** voice of the course language (`set_agent` with
  `agents[].voice`). Skip synthetic variants (names containing `espeak` or a
  `+Variant` suffix). If fewer than two natural voices of the course language
  are listed — or `voice_names` is empty, or `tts` is present — leave `voice`
  unset for every agent (the browser picks a voice by message language) and do
  not promise anything about voices unless asked. `voice_names` is a snapshot
  in the page language at the moment of the call and may be cut short: after a
  language switch read it again once `reload_pending` is false, then set the
  voices. Never tell the instructor that a voice or language is missing because
  it is not in `voice_names` — say what you can set, and that the browser may
  have more voices than you can see.
- **Language before the frame** (the journal part — title, welcome paragraph, heading
  suffixes, intro and placeholder lines — also applies in terminal mode, via
  `tasks/init-course.md` step 11 and `tasks/scaffold-course.md` step 8b): while `## Course Context` is still empty, the
  course language is the language the instructor writes in. The chat interface,
  the read-aloud voices and the Dashboard texts follow the `language:` field of
  the `journal.md` header. So as soon as the language is known — the first
  instructor message, or before it `get_state.browser_lang` when the journal is
  still the empty template — if that field differs, set it to the matching code and run
  `tasks/update-dashboard.md` (tier **run**: setup — language and the journal's own fixed texts only). Tell the
  instructor in one line ("I switched the page to German.") — only once
  `get_state.reload_pending` is false (check right before sending); the
  notice that the switch is running goes only into the `status` line, never
  into a lasting message. On first contact send the greeting only after the
  reload and do not mention the switch in it. Until then, and
  whenever a message is in a language other than the header's, pass `lang` to
  the `chat` tool. If the page language was decided from `browser_lang` alone
  (no instructor text yet), offer the other language in the status line during
  the switch (one short clause in that other language) and as the **last** line
  of the greeting, short and in italics — never as its first line (the chat
  takes its title from the first line).
  **At the switch**, change exactly these and nothing else: the header
  `language:`, the course title (the template's neutral `# New course`, or any
  `# {{…}}` placeholder, becomes the neutral title in that language;
  `init-course` sets the real title later), the welcome paragraph and the start
  link below it (its target is the anchor of the Dashboard heading, which
  changes with the heading suffix), the heading suffixes, the action lines, the
  fixed placeholder lines (e.g. the "course check not yet run" line under
  `## Validation`) and the Dashboard. If the language is not English,
  every fixed `##` heading and every fixed `###` heading of the
  template (not agent names, not unit titles) gets a translated suffix after an en
  dash (`## Outline – <translation>`); keep the English key first and wrap
  nothing else. `## Sessions` gets the plural of the unit word: while
  `sessions-called` is unset, the course-language plural of the template's
  default unit word — the same word the Dashboard uses for `unitsTitle` — and
  the plural of `sessions-called` once it is set; `## Agenda` gets the
  translation of "schedule". Translate link labels only: the inline-code
  command after a link stays verbatim as in the agent's `commands:` map
  (`:configure-agent <agent>`, `:save-decision <title>`). Tasks find a section by the line that **starts** with
  `## {Key}`; Dashboard links use the full heading slug.
  **Later, with `init-course` step 11 / `scaffold` step 8b** (not at the
  switch, and only without a language pack — a pack covers all of it): the
  one-line notes of unfilled sections, the explanatory paragraphs under
  `## Templates` and `## Agents`, `<summary>` labels and placeholder values.
  When the switch is written, a `connection` event with `reloaded: true` (or
  `reload_pending` false) means it is done: send the greeting at once; it
  replaces the status line.
  **Do it fast — language pack first:** if `specs/templates/i18n/<code>.json`
  exists and the journal is still the empty template, set the labels from the
  pack, then run `node specs/dashboard/localize-journal.mjs --lang <code>` — one
  write covers the lines and the Dashboard; nothing else to translate, no
  `update-dashboard` run. Exit 2 means the journal is no longer the empty
  template: continue with your own map. **Otherwise two writes:** send a one-line status first. Put every line
  change into one map file (`.cache/localize.json`:
  `{"language": "<code>", "replace": [["<old line>", "<new line>"], …]}`, each
  old line copied exactly from the file) and apply it with
  `node specs/dashboard/localize-journal.mjs .cache/localize.json` — one write,
  nothing is written if a line does not match. Then run `update-dashboard`
  (its JSON write is the second). Never edit heading by heading; never rewrite
  the whole file. Target from the `connection` event or the instructor's
  message to the switched page: under 10 s with a language pack, under 30 s
  without one; refresh the status if it is older than 20 s before the writes. Update the roster labels and
  voices (Agent Roster) **before** the next chat message, so it is already
  signed in the new language.
