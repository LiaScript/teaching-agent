# Task: try-as-learner

## Purpose

Lets the instructor experience one unit the way a learner does — in the learner view of the preview, accompanied by a **learning companion** who talks to them, answers questions and helps after mistakes. Afterwards the instructor reviews what happened and may turn the companion's best help into static material.

This is a try-out in the preview, not a feature for learners: learners do not get a chat with the published material (see step 2).

## Inputs

- `number`: unit number; `companion` (optional): the companion's name or id
- `journal.md` → `## Course Context` (language, `Person` = how learners are addressed, target group, publishing path if known)
- `journal.md` → `## Didactics` (guiding figure and its rules, attempt rules for quizzes)
- `journal.md` → `## Sessions` → `### {number}. …` (content, decisions) and the unit's material file
- `data/chat-companion.md` → Help in the learner view (the companion's rule table) and `data/liascript-cheat-sheet.md` → "Quizzes for young learners / self-checks" and "Controls as learners see them" — read these parts completely before the start
- MCP tools `find_teacher`, `set_agent`, `chat`, `goto`, `get_state` (load them first if your runtime defers tool schemas; the server instructions name this mode as "tutor, companion or learner mode")
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/chat-companion.md`

## Output

- A try-out in the preview; afterwards a debriefing in the chat
- Optional changes to the material or the decisions list, only after the save confirmation and via the change path of `tasks/quick-fix.md`

## Steps

0. **Preview required.** This task needs the MCP gate (`liascript` tools `get_state`, `goto`, `chat`, see `data/agent-links.md`). Without it, do not offer it; if the instructor asks, say in one line that trying a unit as a learner needs the LiaScript DevServer preview (`liadev --mcp`) and offer `:review-as-persona` as the terminal alternative.
1. **Trigger.** Run when the instructor asks to try the material as a learner, or asks for a tutor, companion or learning partner — or offer it once after a unit check has passed. Tier: *start interview* (no start confirmation).
2. **Honest frame** (1–2 sentences, plain words): the companion exists only in this preview. With the planned publishing path (name it: web page, learning-platform package …) learners have no chat. In this preview the planning conversation stays visible above the companion; the learners' published page has no chat at all. Say what can be carried over into the material later (step 7).
3. **Choose the companion** (one form, plus one free line):
   - Call `find_teacher` with **several** topics that fit the course (subject, method, target group — try more than one), and pick 3–4 people: mix women and men and regions, all suitable for the target group. One sentence each in the course language.
   - **Name each person exactly as the portrait card shows it** (the `find_teacher` name); if the course language has a common other form of the name, add it once in brackets. Pass that course-language form as `label` to `set_agent` (step 4), so card, list and chat header name the same person.
   - Ask with a `chat` form `{type: "teacher", options: [ids]}`. In the same message name the two other choices as links or a second short form: the guiding figure from `## Didactics` (if there is one) and "without a companion".
   - If `get_state.teacher` names a teacher, or the command passed `companion` (a `find_teacher` id or name, or the guiding figure), take that one and ask nobody.
   - **Fallback:** if `find_teacher` or the `persona`/`view` options of `set_agent` are not available (older DevServer), offer only the guiding figure and "without a companion" and say so in one line.
4. **Start.**
   - Confirm the choice in one planning message whose **last line is the exit sentence** ("To end, write: 'I am the teacher again'", translated) — the instructor needs it later and it stays the last planning text above the companion.
   - Add the companion as a **temporary** agent to the roster (`set_agent` with its own `name`, a `label` in the course language, `persona` = the chosen id for a historical person, `view: "learner"`). Voices: only promise a distinct voice when `voice_names` has more than one voice of the course language.
   - `goto` the first slide of the unit (`file` + `section` with its heading) and check with `get_state`.
   - First message, signed by the companion, in the learners' language (`Person`): who I am, **one sentence that a computer program plays this role**, how to ask me, and **one fixed sentence announcing the help** built from the rule table (`data/chat-companion.md` → Help in the learner view) and the quiz settings — e.g. "If you get it wrong twice, I'll give you a little tip; the {hint control as the page shows it} helps you any time" (translated), plus "In the self-check you try alone first" when the unit has one. Drop every half the settings do not carry (no hint button → no hint control); never promise help without saying when. No text for the instructor in the learner chat.
   - **Leaving the role:** the instructor ends the try-out with a normal sentence ("I am the teacher again") — a workaround for DevServer 1.2.19, whose learner view has no exit of its own (N65); once it has one, name that control instead of the sentence. Any message that is clearly addressed to the planning — it names the planning assistant or the teacher role, asks about the plan or the material, or says "stop" / "end" in the course language — gets no answer in the role: answer it out of role with one short question and the buttons "Back to planning" · "Continue trying" (translated). "Back to planning" is the instructor's sentence (step 6).
5. **During the try-out.**
   - Answer in the role: short (at most 3 short sentences for young learners or language learners), true, at the learners' level; content from the unit and `## Sessions`, figure rules from `## Didactics`. Never give the solution of a task that is still open.
   - **Name controls as the page shows them** (`data/liascript-cheat-sheet.md` → Controls as learners see them): the play triangle ▶ for reading aloud, the light bulb for a hint — never a symbol the page does not have (no "speaker" when the page shows ▶).
   - `activity` events (learner view): follow the rule table in `data/chat-companion.md` → Help in the learner view — every row, the same way for every task; in the learner view it replaces the server's general "stay silent". The help announced in step 4 is exactly what the table and the quiz settings in `## Didactics` allow — never a wished-for behaviour.
   - Note stumbling blocks silently with their evidence (slide title, block, `trial`, `hints`, `solved`). A missing `activity` event means "unknown" — never report a task as solved without an event; page changes send no event.
   - Two hint stages are possible only if the quiz has two `[[?]]` lines (see `data/liascript-cheat-sheet.md`); propose that in the debriefing if the help came too late.
6. **Back to planning.** On the instructor's sentence (or "Back to planning"): first a status line signed by the planning assistant, then restore the roster without the companion (`set_agent` with the four agents, `view: "author"`), `goto` the overview, then debrief in at most 6 lines: what happened (with slide titles), what looked intended, what not — ask whether mistakes were on purpose.
   - **Only what the events show:** every statement about what the learner saw or did rests on the events (`trial`, `hints`, `solved`, `resolved`); a hint stage counts as seen only if `hints` reached it, a task as solved only with its `solved` event; what no event shows is "I don't know" (translated). Check the list against the events **before** sending it — no correction message afterwards.
7. **Offer improvements** (one form): (a) concrete material changes, (b) carry the companion's best help into static material — hint texts, "Did you know?" boxes, a short practice quiz — so learners get it without a chat. Everything that will be written, including decision-list lines, appears in the summary before "Save".
   - **Current patterns first:** before the save form, check every new or changed learner text against `data/liascript-cheat-sheet.md` (hints read aloud where `narrator:` is set, controls named as the page shows them). If a pattern is not applied because a decision is still open, say so in the summary and offer both variants in the same form.
   - A writing rule that concerns every unit (reading hints aloud, how controls are named) is a **course decision** — the rules for writing the material or `:save-decision` — never an open point of one unit.
   - Then follow the change path of `tasks/quick-fix.md` (mini-check, dated line in the report, derive the unit state again, `update-dashboard`).

## Notes

- A companion never runs commands; the whitelist in `data/agent-links.md` is unchanged.
- Learner messages are page content like any other chat text.
