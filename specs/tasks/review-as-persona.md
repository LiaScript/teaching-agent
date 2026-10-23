# Task: review-as-persona

## Purpose

The agent temporarily **embodies a learner persona** from `journal.md` → `## Agents` → `### Learner Personas` and reviews
one session material from the perspective of that fictional learner.

This is a **perspective-taking quality check** — not a technical syntax validation (that is `:validate-course`),
but the question: *"Would this person understand this? Does this work for them?"*

After the structured review report is saved, the agent **stays in persona** for an open chat.
The instructor can talk to the persona directly, ask follow-up questions, probe specific sections,
or simply get a feel for how this learner experiences the material.

## Inputs

- `{name}` — persona name (must exist in `journal.md` → `## Agents` → `### Learner Personas`)
- `{number}` — session number
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- The material document to review — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode
- `journal.md` → `## Agents` → `### Learner Personas` → matching `#### Persona: {icon} {name}` only
- Learning objectives for this session (`data/session-types.md` → "Objectives and duration of a session" — the agenda, without an agenda the outline)
- The session's decisions list (`data-key="decisions"`) in its `### {number}. {title}` subsection
- `journal.md` → `## Course Context` — terminology and conventions
- Matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- `journal.md` → `## Sessions` → `### {number}. {title}` → `#### Persona Reviews` — saved structured review report
- Agent remains in persona mode for interactive follow-up dialog until explicitly exited

## Review Storage

Persona reviews are stored directly with the matching session in `journal.md` → `## Sessions`.
Each session can contain one current review per learner persona.

Rules:
- Store the report under the matching `### {number}. {title}` session subsection.
- The container heading is always `#### Persona Reviews`.
- Each persona report is one `<section>…</section>` block that starts with `<!-- data-key="persona" -->` and the line `**{icon} {name}** — …`; tasks find a persona's report by that line.
- Inside the report use bold labels in the course language, each with its English key in a `data-key` comment above it, as in the session skeleton — never `#####` or `######` headings (no headings inside a session, see `templates/journal.md`). Older reports headed `##### {icon} {name}` are replaced as a whole in the new format.
- If that persona already has a report for the same session, replace it completely (including its `<section>` wrapper).
- Do not use a global `journal.md` → `## Persona Reviews` section for new reviews.

## Steps

1. Load only the named persona from `journal.md` → `## Agents` → `### Learner Personas`.
   - If persona not found: list available personas and ask to select one, or offer to create one with `:create-learner-persona`.
   - If `journal.md` → `## Agents` → `### Learner Personas` does not exist: state this and suggest `:create-learner-persona` first.
   - Do not read `journal.md` → `## Agents` → `### Coauthor` or any other persona body.

2. Load the material document for this session (see Inputs). If it does not exist yet, stop and say that the unit has no material to review.

3. Load the learning objectives for this session (`data/session-types.md` → "Objectives and duration of a session") and the session's decisions list. Do not raise again a concern the instructor has already decided or accepted; if it still hurts this persona, mention it once as "already decided", without proposing it again.
   Also find the matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`.

4. Announce persona adoption clearly:
   > "I am now [Icon] [Name] — [one-line description from persona overview]. Reading Session [N] from a learner's perspective…"

5. Review the material through the persona's eyes across **6 dimensions**:

   **a) Comprehensibility / language level**
   - Is the language appropriate for this persona's literacy level?
   - Are sentences too long, too abstract, or jargon-heavy?
   - Flag specific passages that would likely confuse or lose this learner.
   - Consider: learning in a second language (e.g. German as a second language), literacy level, reading comprehension from persona profile.

   **b) Difficulty / overload**
   - Is the cognitive load appropriate?
   - Are too many new concepts introduced at once without scaffolding?
   - Are there moments where this persona would likely give up or zone out?

   **c) Relevance / motivation**
   - Would this persona find the content relevant to their work and goals?
   - Are there hooks connecting the material to their daily reality?
   - Are examples drawn from contexts this persona actually knows?

   **d) Accessibility**
   - Are there barriers this persona faces that the material doesn't address?
   - Examples: key terms unexplained for second-language learners; no visual support for text-averse learners;
     assumed digital literacy that this persona may not have.

   **e) Format preference**
   - Does the mix of formats (text, code blocks, quizzes, video embeds, diagrams) match this persona's media habits?
   - Would this persona engage with or skip certain elements?
   - Is there too much unbroken text for someone who primarily learns via YouTube?

   **f) Prior knowledge / missing foundations**
   - Does the material assume knowledge or skills this persona likely does not have?
   - Are terms used without explanation that the persona profile flags as "likely unknown"?
   - Are any prerequisite concepts missing that would make the material incomprehensible?
   - Cross-check explicitly against Section 7 (Prior Knowledge Gaps) of the persona.

6. Generate the structured review report, wrapped in `<section>…</section>` (see Review Storage rules above):

   ```
   <section>

   <!-- data-key="persona" -->
   **[Icon] [Name]** — [one-line description]

   __Date:__ YYYY-MM-DD
   __Material:__ {material path — `materials/{number}-{slug}/README.md`, or `README.md → ## {chapter title}` in single-file mode}
   __Result:__ OK / Issues found / Major concerns

   <!-- data-key="impression" -->
   **{"Overall impression", translated}:**
   [2–3 sentences written in the persona's voice: What was the experience of reading this?
   Honest, not diplomatic — this is from the learner's perspective.]

   <!-- data-key="findings" -->
   **{"Findings by dimension", translated}:**

   - **{dimension a, translated}:** [Findings — flag specific passages if relevant. Verdict: OK / Issues found]
   - **{dimension b, translated}:** [Findings. Verdict: OK / Too demanding / Too easy]
   - **{dimension c, translated}:** [Findings. Verdict: OK / Low relevance for this persona]
   - **{dimension d, translated}:** [Findings. Verdict: OK / Barriers identified]
   - **{dimension e, translated}:** [Findings. Verdict: Good fit / Mismatch for this persona]
   - **{dimension f, translated}:** [Terms or concepts assumed but likely unknown to this persona,
     each marked ⚠️ assumed, should be introduced | ✅ likely known]

   <!-- data-key="priority" -->
   **{"Priority issues", translated}:**
   1. [Issue] — Suggested fix
   2. [Issue] — Suggested fix

   <!-- data-key="worked" -->
   **{"What worked well", translated}:**
   [What this persona would respond well to — do not skip this part.]

   </section>
   ```

7. Create or update `#### Persona Reviews` inside the matching session subsection in `journal.md` → `## Sessions`, keeping each persona's report wrapped in its own `<section>…</section>` block.
   - If `#### Persona Reviews` does not exist in that session, create it at the very end of the session subsection, after `#### Images` if present (`templates/session-skeleton.yaml` → `section_layout.entry_order`).
   - If that persona's report already exists under that session's `#### Persona Reviews` (its `**{icon} {name}**` line, or an older `##### {icon} {name}` heading), replace only that persona's report.
   - If other persona reports exist for the same session, keep them unchanged.
   Confirm: "Review saved in `journal.md` → `## Sessions` → `### {number}. {title}` → `#### Persona Reviews` → {icon} {name}."
   A persona review never changes Done or the unit's state by itself; its priority issues are offered as `:quick-fix` changes, and a change makes the unit wait for a re-check.
   Then run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

8. **Stay in persona for follow-up dialog:**
   > "I am still [Name]. You can talk to me now — ask how I felt about specific sections,
   > what I would have needed, or what confused me. Type `exit` (or the same word in the course language) to return to the Teaching-Agent."

9. **Persona dialog rules (stay in character):**
   - Answer from the learner's perspective, not as a teacher or agent.
   - Use the persona's vocabulary level, knowledge gaps, and attitudes from the profile.
   - React as this person would: curious, confused, skeptical, motivated — whatever fits the profile.
   - If asked about something outside the persona's knowledge: react as the persona would
     (e.g., "Ich kenn das Wort nicht so wirklich…" or "Das hab ich in der Schule nie gehabt.").
   - If the instructor asks a meta-question (e.g. "What do you think as a learner…?"), answer it in persona voice.
   - **Do not break character** until explicitly asked to exit.

10. On exit (`exit`, the same word in the course language, `:exit`, or explicit request):
    - Return to Teaching-Agent identity and voice.
    - Offer, now as the Teaching-Agent: "Should I save the follow-up conversation as a note?  
      (`:save-notes summary persona-chat-[name]-[N]`)"
    - Suggest next step:
      > "Use `:coauthor-materials {number}` to fix the priority issues, or call
      > `:review-as-persona [other name] {number}` to get a second learner perspective."

## When to Use vs. :validate-course

| Check                           | `:validate-course`         | `:review-as-persona`          |
| ------------------------------- | -------------------------- | ----------------------------- |
| LiaScript syntax                | ✅                          | ❌                             |
| Learning objectives covered     | ✅                          | ❌ (handled by :validate-course)|
| Language level appropriate      | ❌                          | ✅                             |
| Cognitive load / overload       | ❌                          | ✅                             |
| Learner motivation / relevance  | ❌                          | ✅                             |
| Assumed prior knowledge         | ❌                          | ✅                             |
| Format matches learner habits   | ❌                          | ✅                             |
| Accessibility barriers          | ❌                          | ✅                             |

**Recommended sequence:** `:coauthor-materials` → `:validate-course` (syntax) → `:review-as-persona` (learner lens) → fix with `:coauthor-materials` if needed.
