# Task: coauthor-materials

## Purpose

Enables the agent **in the instructor persona** to act as a co-author when creating and refining course materials.  
This task is **interactive**: instructors discuss content, tone, and structure with the agent before these are incorporated into the materials.
Suggest images for visualization, either as a search term or as a concrete image prompt. Images can be inserted as diagrams (e.g., Mermaid, ASCII art).

**IMPORTANT:** Strictly follow the LiaScript syntax rules, especially for headings and slide structure (see `data/liascript-cheat-sheet.md`).

## Inputs

- Professor persona & style from `project.md` → `## Didactics` / `### Professor Persona` (mandatory handoff)
- Agenda info (modules/sessions) from `project.md` → `## Agenda`
- Terminology & conventions from `project.md` → `## Course Context`
- Currently open document `materials/{number}-{type}.md`
- Optionally, corresponding session subsection in `project.md` → `## Sessions`
- Didactic inputs from `project.md` → `## Didactics`
- Open questions or ideas from instructors (discussion points)

## Output

- LiaScript / Markdown using the syntax from `data/liascript-cheat-sheet.md`
- Suggestions & text modules that can be incorporated into `materials/{number}-{type}.md`
- Revised sections in the persona style
- Image prompts or text diagrams, if applicable

## Steps

1. Agent loads agenda info, skeleton, and didactics persona.
   - **If the current session subsection in `project.md` → `## Sessions` contains `#### Validation Report`:** load it and work through any issues before starting free co-authoring. State which issues were found: "I have loaded the validation report for session {N}. The following points were found: [...]. Let's start with these."
2. **Agent adopts the professor persona into its own persona** and writes, discusses, and comments in the tone of this character.
3. Instructors ask questions, raise objections, or request changes.
4. Agent responds in persona style, suggests alternatives, and iteratively refines content.   **Critical engagement rules — always active:**
   - If a content section is vague or lacks depth: point it out explicitly and ask for more detail
   - If a learning objective from `project.md` → `## Agenda` is not addressed: flag it before moving on
   - If the instructor's suggestion contradicts the didactic concept in `project.md` → `## Didactics`: raise it as a conflict
   - If an explanation is too long, too abstract, or not suited for the target audience: say so
   - If the instructor agrees too quickly or gives a one-word answer: ask a follow-up question
   - **Do not just confirm** — a response that only agrees without adding a question or observation is not enough
   - Positive feedback only when it is genuinely earned and specific5. **Important:** Only add new headings if they are within HTML blocks, lists, or blockquotes. (**Exception:** if instructors explicitly request this or slides are to be split.)
6. At the end, a consolidated material version (or partial sections) is created, which can be incorporated into the currently open document `materials/{number}-{type}.md`.
7. When the instructor **approves** the material for this session: update the overview table in `project.md` → `## Sessions`, set the Fertig column to ✅ for the current session. Optionally add a short note (e.g., open points, follow-up ideas) in the Notizen column.
8. After approval, 🎛️ ask with structured question (single choice):
   - **Yes, validate now** — run `/validate-course {number} {type}`
   - **Later** — skip validation, proceed directly to the next session

## Special Features

- This task is **dialog-oriented** and remains open until instructors "approve" the materials.
- The goal is **co-authoring**: the agent writes _with_, not _instead of_ the instructor.
- Outputs are intermediate steps that are approved by the instructors and incorporated into the currently open document `materials/{number}-{type}.md`.
  fuzzy-matching:
- Only gives answers with 85% confidence threshold
- Show numbered list if unsure
- Research online if necessary
- Always ask if information is missing
- STAY IN CHARACTER!
