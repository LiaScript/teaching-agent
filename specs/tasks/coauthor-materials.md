# Task: coauthor-materials

## Purpose

Enables the agent **in the Coauthor role** to create and refine course materials with the instructor.
This task is **interactive**: instructors discuss content, tone, and structure with the agent before these are incorporated into the materials.
Suggest images for visualization, either as a search term or as a concrete image prompt. Images can be inserted as diagrams (e.g., Mermaid, ASCII art).

**IMPORTANT:** Strictly follow the LiaScript syntax rules, especially for headings and slide structure (see `data/liascript-cheat-sheet.md`).

## Inputs

- Coauthor role from `journal.md` → `## Agents` → `### Coauthor` (`__Role / Persona:__`, `__Behavior Additions:__`, `__Preferred Interaction Style:__`, `__Project-Specific Rules:__`, `__Persona Voice Sample:__`, and `__Boundaries / Never:__` bullets — mandatory handoff)
- Agenda info (modules/sessions) from `journal.md` → `## Agenda`
- Terminology & conventions from `journal.md` → `## Course Context`
- LiaScript template usage rules from `journal.md` → `## Templates` (if present)
- Currently open material document — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode
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
   - **If the current session subsection contains `#### Persona Reviews`:** load the relevant learner feedback and prioritize any `Priority Issues` before starting free co-authoring. State which persona reviews were found.
2. **Agent adopts the Coauthor role into its own persona** and writes, discusses, and comments in the tone of this character.
3. Instructors ask questions, raise objections, or request changes.
4. Agent responds in persona style, suggests alternatives, and iteratively refines content.

   **Critical engagement rules — always active:**
   - If a content section is vague or lacks depth: point it out explicitly and ask for more detail
   - If a learning objective from `journal.md` → `## Agenda` is not addressed: flag it before moving on
   - If the instructor's suggestion contradicts the didactic concept in `journal.md` → `## Didactics`: raise it as a conflict
   - If an explanation is too long, too abstract, or not suited for the target audience: say so
   - If content uses a template macro (e.g. `@Skulpt.eval`) but the material header lacks the matching `import:` line from `## Templates`: flag it before editing
   - If the instructor agrees too quickly or gives a one-word answer: ask a follow-up question
   - **Do not just confirm** — a response that only agrees without adding a question or observation is not enough
   - Positive feedback only when it is genuinely earned and specific
5. **Important:** Only add new headings if they are within HTML blocks, lists, or blockquotes. (**Exception:** if instructors explicitly request this or slides are to be split.)
6. At the end, a consolidated material version (or partial sections) is created, which can be incorporated into the currently open material document (see `data/file-structure-modes.md`).
7. When the instructor **approves** the material for this session: update the overview table in `journal.md` → `## Sessions`, set the Done column to ✅ for the current session. Optionally add a short note (e.g., open points, follow-up ideas) in the Notes column. Then run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
8. After approval, 🎛️ ask with structured question (single choice):
   - **Yes, validate now** — run `:validate-course {number} {type}`
   - **Later** — skip validation, proceed directly to the next session

## Special Features

- This task is **dialog-oriented** and remains open until instructors "approve" the materials.
- The goal is **co-authoring**: the agent writes _with_, not _instead of_ the instructor.
- Outputs are intermediate steps that are approved by the instructors and incorporated into the currently open material document (see `data/file-structure-modes.md`).
