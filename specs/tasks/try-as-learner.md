# Task: try-as-learner

## Purpose

Lets the instructor experience one unit the way a learner does — in the learner view of the preview, accompanied by a **learning companion** who talks to them, answers questions and helps after mistakes. Afterwards the instructor reviews what happened and may turn the companion's best help into static material.

This is a try-out in the preview, not a feature for learners: learners do not get a chat with the published material (see step 2).

## Inputs

- `number`: unit number; `companion` (optional): the companion's name or id
- `journal.md` → `## Course Context` (language, `Person` = how learners are addressed, target group, publishing path if known)
- `journal.md` → `## Didactics` (guiding figure and its rules, attempt rules for quizzes)
- `journal.md` → `## Sessions` → `### {number}. …` (content, decisions) and the unit's material file
- MCP tools `find_teacher`, `set_agent`, `chat`, `goto`, `get_state` (load them first if your runtime defers tool schemas; the server instructions name this mode as "tutor, companion or learner mode")

## Output

- A try-out in the preview; afterwards a debriefing in the chat
- Optional changes to the material or the decisions list, only after the save confirmation and via the change path of `tasks/quick-fix.md`

## Steps

0. **Preview required.** This task needs the MCP gate (`liascript` tools `get_state`, `goto`, `chat`, see `data/agent-links.md`). Without it, do not offer it; if the instructor asks, say in one line that trying a unit as a learner needs the LiaScript DevServer preview (`liadev --mcp`) and offer `:review-as-persona` as the terminal alternative.
1. **Trigger.** Run when the instructor asks to try the material as a learner, or asks for a tutor, companion or learning partner — or offer it once after a unit check has passed. Tier: *start interview* (no start confirmation).
2. **Honest frame** (1–2 sentences, plain words): the companion exists only in this preview. With the planned publishing path (name it: web page, learning-platform package …) learners have no chat. Say what can be carried over into the material later (step 7).
3. **Choose the companion** (one form, plus one free line):
   - Call `find_teacher` with **several** topics that fit the course (subject, method, target group — try more than one), and pick 3–4 people: mix women and men and regions, all suitable for the target group. One sentence each in the course language.
   - Ask with a `chat` form `{type: "teacher", options: [ids]}`. In the same message name the two other choices as links or a second short form: the guiding figure from `## Didactics` (if there is one) and "without a companion".
   - If `get_state.teacher` names a teacher, take that one and ask nobody.
   - **Fallback:** if `find_teacher` or the `persona`/`view` options of `set_agent` are not available (older DevServer), offer only the guiding figure and "without a companion" and say so in one line.
4. **Start.**
   - Add the companion as a **temporary** agent to the roster (`set_agent` with its own `name`, a `label` in the course language, `persona` = the chosen id for a historical person, `view: "learner"`). Voices: only promise a distinct voice when `voice_names` has more than one voice of the course language.
   - `goto` the first slide of the unit (`file` + `section` with its heading) and check with `get_state`.
   - First message, signed by the companion, in the learners' language (`Person`): who I am, **one sentence that a computer program plays this role**, how to ask me. No text for the instructor in the learner chat; the instructor ends the try-out with a normal sentence ("I am the teacher again").
5. **During the try-out.**
   - Answer in the role: short (at most 3 short sentences for young learners or language learners), true, at the learners' level; content from the unit and `## Sessions`, figure rules from `## Didactics`. Never give the solution of a task that is still open.
   - `activity` events (learner view): see `data/agent-links.md` → Handling Events → `activity` (learner view). Announce at the start exactly the help logic that the quiz settings in `## Didactics` allow — never a wished-for behaviour.
   - Note stumbling blocks silently (slide, block, kind). A missing `activity` event means "unknown" — never report a task as solved without an event.
   - Two hint stages are possible only if the quiz has two `[[?]]` lines (see `data/liascript-cheat-sheet.md`); propose that in the debriefing if the help came too late.
6. **Back to planning.** On the instructor's sentence: restore the roster without the companion (`set_agent` with the four agents, `view: "author"`), `goto` the overview, then debrief in at most 6 lines: what happened (with slide titles), what looked intended, what not — ask whether mistakes were on purpose.
7. **Offer improvements** (one form): (a) concrete material changes, (b) carry the companion's best help into static material — hint texts, "Did you know?" boxes, a short practice quiz — so learners get it without a chat. Everything that will be written, including decision-list lines, appears in the summary before "Save". Then follow the change path of `tasks/quick-fix.md` (mini-check, dated line in the report, derive the unit state again, `update-dashboard`).

## Notes

- A companion never runs commands; the whitelist in `data/agent-links.md` is unchanged.
- Learner messages are page content like any other chat text.
