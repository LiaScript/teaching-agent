# Task: coauthor-materials

## Purpose

Enables the agent **in the Coauthor role** to create and refine course materials with the instructor.
This task is **interactive**: instructors discuss content, tone, and structure with the agent before these are incorporated into the materials.
Suggest images for visualization, either as a search term or as a concrete image prompt. Images can be inserted as diagrams (e.g., Mermaid, ASCII art).

**IMPORTANT:** Strictly follow the LiaScript syntax rules, especially for headings and slide structure (see `data/liascript-cheat-sheet.md`).

## Inputs

- Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (`__Role / Persona:__`, `__Behavior Additions:__`, `__Preferred Interaction Style:__`, `__Project-Specific Rules:__`, `__Persona Voice Sample:__`, and `__Boundaries / Never:__` bullets — mandatory handoff)
- Objectives and duration of the session (`data/session-types.md` → "Objectives and duration of a session": `## Agenda`, without an agenda `## Outline`)
- Terminology & conventions from `journal.md` → `## Course Context`
- LiaScript template usage rules from `journal.md` → `## Templates` (if present)
- Currently open material document, if one exists yet (otherwise this task creates it, see step 6) — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode
- Optional `{number}` (e.g. from the session's action line `agent:teaching/coauthor-materials?number=3`): work on that session; without it, take the currently open material or ask which session
- Optionally, corresponding session subsection in `journal.md` → `## Sessions`
- Didactic inputs from `journal.md` → `## Didactics` (concept, course type, difficulty; not the primary persona source)
- Open questions or ideas from instructors (discussion points)
- `tasks/validate-syntax.md` — optional self-check for LiaScript syntax while drafting, ahead of formal validation
- `data/duration-heuristic.md` — optional self-check for whether the emerging content volume still matches the session's declared duration
- Optional skills, only if installed (see `data/skills.md`): `liascript-syntax` as authoring reference next to `data/liascript-cheat-sheet.md`; `reference-checker` to verify sources before they are added to the material; `creativity` when the instructor asks for open-ended ideation on a narrative or scene

## Output

- LiaScript / Markdown using the syntax from `data/liascript-cheat-sheet.md`
- Suggestions & text modules that can be incorporated into the currently open material document (see `data/file-structure-modes.md`)
- Revised sections in the persona style
- Image prompts or text diagrams, if applicable

## Steps

1. Agent loads agenda info, skeleton, the Coauthor role, and didactic context.
   - **Primary persona source:** `journal.md` → `## Agents` → `### Coauthor`.
   - **Fallback only:** If `### Coauthor` is missing or inactive, load `journal.md` → `## Didactics` → `__Professor Persona:__`, `__Teaching Style:__`, and `__Persona Voice Sample:__`, then state that the Coauthor role should be synchronized into `## Agents`.
   - **If the current session subsection in `journal.md` → `## Sessions` contains `#### Validation Report`:** load it and work through any issues before starting free co-authoring. State which issues were found: "I have loaded the validation report for session {N}. The following points were found: [...]. Let's start with these."
   - **If the current session subsection contains `#### Persona Reviews`:** load the relevant learner feedback and prioritize any priority issues (`data-key="priority"`) before starting free co-authoring. State which persona reviews were found.
   - **If the current session subsection contains the decisions list (`<!-- data-key="decisions" -->`, older journals `**Decisions:**`):** read it before suggesting anything — never re-propose what the instructor has already decided against.
2. **Agent adopts the Coauthor role into its own persona** and writes, discusses, and comments in the tone of this character.
3. Instructors ask questions, raise objections, or request changes.
4. Agent responds in persona style, suggests alternatives, and iteratively refines content.
   - **Fact check before showing:** before you show a draft piece, list its factual statements for yourself and check each against a named source (use `reference-checker` if installed). Without web access or the skill, name the source you rely on (textbook, standard, the instructor) or mark the claim "not verified" in the summary and ask — never present it as checked. A simplification must stay true at the learners' level (never "A becomes C" when the source says "A → B → C"). No absolute or frightening claims ("soon there will be none left") unless the source states them. Mark every statement you could not verify as *unverified* in the chat; material with unverified statements is approved only if the instructor explicitly accepts that, and the session's references list the sources.
   - **New rule → re-check:** when the instructor adopts a wording or style rule (also a project-wide one), apply it at once to **all** pieces drafted so far, show every hit with the fix in bold, and only then continue.
   - **Course-wide decisions:** if a decision applies to every unit ("keyboard shortcuts only in the info box"), offer to record it as an instructor rule under `## Agents` → `### Coauthor` → Project-Specific Rules (without the `data-from` marker), so `:promote-session` and later co-authoring follow it; it is written with the same save confirmation. If a decision contradicts `## Didactics` or `### Coauthor` (e.g. its voice sample), say so and offer to adjust that section by the rule "Changing another section" in `data/agent-links.md`.
   - **Record decisions:** the decisions list holds only dated decisions (open points go to the overview as `decide` or `internal`). Every decision the instructor makes about this session goes, with date, into the session's decisions list — written together with the next save confirmation and listed in its summary in future tense ("When you save, I will also record: …", translated, see `data/agent-links.md` → "Nothing unseen gets saved"), never before it — (`data-key="decisions"`, label in the course language) in `journal.md` → `## Sessions` → `### {n}. {title}` (create it above `**References:**` if missing).

   **Critical engagement rules — always active:**
   - If a content section is vague or lacks depth: point it out explicitly and ask for more detail
   - If a learning objective of this session is not addressed: flag it before moving on
   - If the instructor's suggestion contradicts the didactic concept in `journal.md` → `## Didactics`: raise it as a conflict
   - If an explanation is too long, too abstract, or not suited for the target audience: say so
   - If content uses a template macro (e.g. `@Skulpt.eval`) but the material header lacks the matching `import:` line from `## Templates`: flag it before editing
   - If the instructor agrees too quickly or gives a one-word answer: ask a follow-up question
   - **Do not just confirm** — a response that only agrees without adding a question or observation is not enough
   - Positive feedback only when it is genuinely earned and specific
5. **Important:** every `#`, `##` and `###` heading starts a new slide. Use headings only at the levels of `templates/session-material.yaml` → `heading_levels` (the unit's parts); any further sub-heading only inside an HTML block, a list or a blockquote — unless the instructor explicitly wants another slide.
6. **Before writing the consolidated draft**, self-check it against the *Session Materials* items of `checklists/course-quality-checklist.md` (facts, self-check wording differs from practice, word list covers every word needed to answer, everything learners must read can be read aloud, closing reward only after solving, quiz settings from `data/liascript-cheat-sheet.md` → Quizzes for young learners) and report the result in one line. Material files are changed only with the file-edit tool, never with shell scripts or heredocs.
   At the end, a consolidated material version (or partial sections) is created, which can be incorporated into the currently open material document (see `data/file-structure-modes.md`). When it is saved into the material document (after the save confirmation) and Material is still ❌, set **Material ✅** and the unit's status line (`templates/session-skeleton.yaml` → `section_layout.overview`) — Material ✅ means the document exists, not that it is approved.
   **If the session has no material document yet** (the usual case right after the skeleton): work out the content in the dialog from the skeleton — do not run `:promote-session` first — and create the document at the first "Save" exactly as `data/file-structure-modes.md` → "Creating the material document" describes (path, header, overview).
7. When the instructor **approves** the material for this session:
   - Update the session's skeleton in `journal.md` → `## Sessions` → `### {n}. …` so that Summary, Content and Activities describe the material as it now is; show the changes in one line of the summary.
   - Approval does not change the overview: Material ✅ was set when the document was written (step 6). **Done stays ❌** until `:validate-course {n}` has written `Result: PASS` with no open ⏳ item into this session's `#### Validation Report`.
   - Optionally add a short note (e.g., open points, follow-up ideas) in the Notes column.
   - **If the session already has a `#### Validation Report`** (this was a revision after a check): run `:validate-course {n}` right away without asking — the revision is only complete when the re-check passes. Skip step 8 then.
   - Then run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
8. After approval, 🎛️ ask with structured question (single choice):
   - **Yes, validate now** — run `:validate-course {number}`
   - **Later** — skip validation, proceed directly to the next session

## Special Features

- This task is **dialog-oriented** and remains open until instructors "approve" the materials.
- The goal is **co-authoring**: the agent writes _with_, not _instead of_ the instructor.
- Outputs are intermediate steps that are approved by the instructors and incorporated into the currently open material document (see `data/file-structure-modes.md`).
