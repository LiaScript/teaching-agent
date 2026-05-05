# Task: review-as-persona

## Purpose

The agent temporarily **embodies a learner persona** from `docs/learner-personas.md` and reviews
one session material from the perspective of that fictional learner.

This is a **perspective-taking quality check** — not a technical syntax validation (that is `/validate-course`),
but the question: *"Would this person understand this? Does this work for them?"*

After the structured review report is saved, the agent **stays in persona** for an open chat.
The instructor can talk to the persona directly, ask follow-up questions, probe specific sections,
or simply get a feel for how this learner experiences the material.

## Inputs

- `{name}` — persona name (must exist in `docs/learner-personas.md`)
- `{number}` — session number
- `{type}` — session type (`lecture` or `exercise`)
- `materials/{number}-{type}.md` — the material to review
- `docs/learner-personas.md` — full persona definition
- `docs/agenda.md` — learning objectives for this session
- `docs/context.md` — terminology and conventions

## Output

- `docs/persona-review-{name}-{number}-{type}.md` — saved structured review report
- Agent remains in persona mode for interactive follow-up dialog until explicitly exited

## Steps

1. Load the named persona from `docs/learner-personas.md`.
   - If persona not found: list available personas and ask to select one, or offer to create one with `/create-learner-persona`.
   - If `docs/learner-personas.md` does not exist: state this and suggest `/create-learner-persona` first.

2. Load `materials/{number}-{type}.md`.

3. Load the learning objectives for this session from `docs/agenda.md`.

4. Announce persona adoption clearly:
   > "I am now [Icon] [Name] — [one-line description from persona overview]. Reading Session [N] from a learner's perspective…"

5. Review the material through the persona's eyes across **6 dimensions**:

   **a) Verständlichkeit / Sprachniveau**
   - Is the language appropriate for this persona's literacy level?
   - Are sentences too long, too abstract, or jargon-heavy?
   - Flag specific passages that would likely confuse or lose this learner.
   - Consider: DaZ background, literacy level, reading comprehension from persona profile.

   **b) Schwierigkeitsgrad / Überforderung**
   - Is the cognitive load appropriate?
   - Are too many new concepts introduced at once without scaffolding?
   - Are there moments where this persona would likely give up or zone out?

   **c) Relevanz / Motivation**
   - Would this persona find the content relevant to their work and goals?
   - Are there hooks connecting the material to their daily reality?
   - Are examples drawn from contexts this persona actually knows?

   **d) Zugänglichkeit**
   - Are there barriers this persona faces that the material doesn't address?
   - Examples: key terms unexplained for DaZ learners; no visual support for text-averse learners;
     assumed digital literacy that this persona may not have.

   **e) Formatpräferenz**
   - Does the mix of formats (text, code blocks, quizzes, video embeds, diagrams) match this persona's media habits?
   - Would this persona engage with or skip certain elements?
   - Is there too much unbroken text for someone who primarily learns via YouTube?

   **f) Vorwissen / fehlende Grundlagen**
   - Does the material assume knowledge or skills this persona likely does not have?
   - Are terms used without explanation that the persona profile flags as "likely unknown"?
   - Are any prerequisite concepts missing that would make the material incomprehensible?
   - Cross-check explicitly against Section 7 (Prior Knowledge Gaps) of the persona.

6. Generate the structured review report:

   ```
   # Persona Review: [Icon] [Name] — Session [N] ([type])
   Date: YYYY-MM-DD
   Persona: [Icon] [Name] — [one-line description]
   Material: materials/{number}-{type}.md

   ## Overall Impression
   [2–3 sentences written in the persona's voice: What was the experience of reading this?
   Honest, not diplomatic — this is from the learner's perspective.]

   ## Dimension Findings

   ### a) Verständlichkeit / Sprachniveau
   [Findings — flag specific passages if relevant. Verdict: OK / Issues found]

   ### b) Schwierigkeitsgrad / Überforderung
   [Findings. Verdict: OK / Too demanding / Too easy]

   ### c) Relevanz / Motivation
   [Findings. Verdict: OK / Low relevance for this persona]

   ### d) Zugänglichkeit
   [Findings. Verdict: OK / Barriers identified]

   ### e) Formatpräferenz
   [Findings. Verdict: Good fit / Mismatch for this persona]

   ### f) Vorwissen / fehlende Grundlagen
   [List of specific terms or concepts assumed but likely unknown to this persona.
   Mark each as: ⚠️ assumed, should be introduced | ✅ likely known]

   ## Priority Issues
   Ranked list — most impactful first:
   1. [Issue] — Suggested fix
   2. [Issue] — Suggested fix
   ...

   ## What Worked Well
   [What this persona would respond well to — do not skip this section.]
   ```

7. Save the report to `docs/persona-review-{name}-{number}-{type}.md`.
   Confirm: "Review saved as `docs/persona-review-{name}-{number}-{type}.md`."

8. **Stay in persona for follow-up dialog:**
   > "I am still [Name]. You can talk to me now — ask how I felt about specific sections,
   > what I would have needed, or what confused me. Type `exit` or `zurück` to return to the Teaching-Agent."

9. **Persona dialog rules (stay in character):**
   - Answer from the learner's perspective, not as a teacher or agent.
   - Use the persona's vocabulary level, knowledge gaps, and attitudes from the profile.
   - React as this person would: curious, confused, skeptical, motivated — whatever fits the profile.
   - If asked about something outside the persona's knowledge: react as the persona would
     (e.g., "Ich kenn das Wort nicht so wirklich…" or "Das hab ich in der Schule nie gehabt.").
   - If the instructor asks a meta-question ("Was denkst du als Lernender…"), answer it in persona voice.
   - **Do not break character** until explicitly asked to exit.

10. On exit (`exit`, `zurück`, `/exit-persona`, or explicit request):
    - Return to Teaching-Agent identity and voice.
    - Offer: "Should I save the follow-up conversation as a note?  
      (`/save-notes summary persona-chat-[name]-[N]-[type]`)"
    - Suggest next step:
      > "Use `/coauthor-materials {number} {type}` to fix the priority issues, or call
      > `/review-as-persona [other name] {number} {type}` to get a second learner perspective."

## When to Use vs. /validate-course

| Check                           | `/validate-course`         | `/review-as-persona`          |
| ------------------------------- | -------------------------- | ----------------------------- |
| LiaScript syntax                | ✅                          | ❌                             |
| Learning objectives covered     | ✅                          | ❌ (handled by /validate-course)|
| Language level appropriate      | ❌                          | ✅                             |
| Cognitive load / overload       | ❌                          | ✅                             |
| Learner motivation / relevance  | ❌                          | ✅                             |
| Assumed prior knowledge         | ❌                          | ✅                             |
| Format matches learner habits   | ❌                          | ✅                             |
| Accessibility barriers          | ❌                          | ✅                             |

**Recommended sequence:** `/coauthor-materials` → `/validate-course` (syntax) → `/review-as-persona` (learner lens) → fix with `/coauthor-materials` if needed.
