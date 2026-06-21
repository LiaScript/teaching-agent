# Task: create-learner-persona

## Purpose

Creates one or more **Learner Personas** — evidence-based fictional profiles of typical course participants.  
Personas ground material design in the real constraints, skills, and motivations of the target audience,
and serve as the basis for `:review-as-persona` feedback sessions.

**Two modes:**

- **Quick mode** — persona derived directly from `journal.md` → `## Outline` (target audience) and `journal.md` → `## Didactics`
- **Data-driven mode** — generates a structured research prompt; instructor provides external research data; agent writes persona from that data

## Inputs

- Name (optional — agent suggests if not provided)
- Target audience from `journal.md` → `## Outline` (`__Target Audience:__` bullet)
- Difficulty level, course type, and style from `journal.md` → `## Didactics`
- `templates/agents.yaml` — used if `journal.md` → `## Agents` does not exist yet
- Optional: research data provided by instructor (for data-driven mode)

## Output

- `journal.md` → `## Agents` → `### Learner Personas` — created if missing; new persona appended as a separate entry if it exists

## Steps

1. Read `journal.md` → `## Outline` for target audience and learning objectives.
2. Read `journal.md` → `## Didactics` for difficulty level, course type, and instructor style.
3. 💬 Ask for persona name and icon (optional):
   - Name: if left empty, agent generates a name typical for the target context (e.g., regional, age-appropriate)
   - Icon: agent always selects a fitting emoji that reflects the persona's background, occupation, or dominant trait (e.g., 👩‍🔧 for a trainee in a trade, 🧑‍💻 for a tech learner, 📦 for logistics). The instructor can override it at the confirmation step.
4. 🎛️ Ask for creation mode (structured question — single choice):
   - **Quick** — derive persona directly from available docs (assumptions clearly marked)
   - **Data-driven** — generate a research prompt, then create persona from provided research data

---

### Quick Mode

5. Extract key characteristics from the target audience description in `journal.md` → `## Outline`.
6. Build a realistic profile covering all 7 dimensions (see **Persona Structure** below).
7. Mark clearly which values are inferred/assumed vs. drawn from the docs.
8. Proceed to Step 10.

---

### Data-driven Mode

5. Generate a structured research prompt:

   ```
   ---
   🔍 **Research Request: Learner Persona**
   **Context:** [Course title and target audience from `journal.md` → `## Outline`]
   **Goal:** Create an evidence-based learner persona for [audience]
   **Dimensions to research:**
   1. Sociodemographics: age distribution, gender, migration background
   2. Educational background: school qualifications, literacy/numeracy level
   3. Training & work context: training duration, schedule, work environment, commute
   4. Digital behavior: device preferences, app usage, media consumption, AI familiarity
   5. Motivation: reasons for choosing this field, goals, relationship to course content
   6. Barriers: known difficulties, time pressure, exhaustion, attitude toward digital learning
   7. Prior knowledge gaps: concepts, terms, and skills typically missing at course start
   **Desired outcome:** Statistics per dimension with source and year; flag where no specific data exists (use proxy data if noted)
   **Search suggestions:**
   - `[audience] Ausbildung Statistik [year]`
   - `BIBB [occupation] Auszubildende`
   - `[region] Berufsausbildung Digitalnutzung Jugendliche`
   - `DGB Ausbildungsreport [year] [region]`
   ---
   ```

6. Wait for instructor to provide research findings (paste or describe).
7. Once data is provided: build persona from the data, flagging proxies vs. direct evidence.
8. Proceed to Step 10.

---

10. Generate persona section using the **Persona Structure** template (see below).
11. Display a 3-line summary and 🎛️ ask for confirmation:
    > "Persona [Icon] [Name] created. [Brief summary]. Save to `journal.md` → `## Agents` → `### Learner Personas`? (Yes / Adjust)"
12. On approval: save to `journal.md` → `## Agents` → `### Learner Personas`.
    - If `## Agents` does not exist: create it from `templates/agents.yaml`
    - If `### Learner Personas` does not exist inside `## Agents`: create that subsection
    - Append as a new `#### Persona: {icon} {name}` subsection
13. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.
14. Suggest next step:
    > "Persona saved. Call `:review-as-persona [Name] [number] [type]` to use [Icon] [Name] as a reviewer for a session."

---

## Persona Structure

Each persona is one `####` subsection inside `journal.md` → `## Agents` → `### Learner Personas` — never use `##` or `###` inside a persona entry (they would terminate the target container) and never go deeper than `#####`:

```markdown
#### Persona: [Icon] [Name]

*Created: YYYY-MM-DD | Mode: quick / data-driven*

##### Overview

Short narrative description (3–5 sentences) — brings the persona to life.
Written in present tense, third person, like a brief character sketch.
Includes: age, background, where they are in their training, attitude toward learning.

##### 1. Sociodemographics
- Age: ...
- Gender: ...
- Origin / Background: ...
- Language: ... (native / DaZ / bilingual)

*[Source / Assumption note]*

##### 2. Educational Background
- Highest school qualification: ...
- Literacy / text comprehension: ...
- Numeracy: ...

*[Source / Assumption note]*

##### 3. Training & Work Context
- Training structure: ... (e.g., block schedule, weeks per block)
- Typical work day / schedule: ...
- Commute / accessibility: ...
- Financial situation: ...

*[Source / Assumption note]*

##### 4. Digital Behavior
- Primary device: ...
- Apps used regularly: ...
- Learning app or e-learning experience: ...
- AI / chatbot familiarity: ...
- Attitude toward digital learning in training: ...

*[Source / Assumption note]*

##### 5. Motivation & Goals
- Reason for choosing this field / training: ...
- Short-term goal: ...
- Long-term goal: ...
- Relationship to this course / topic: ... (interested / skeptical / indifferent)

*[Source / Assumption note]*

##### 6. Barriers & Risk Factors
- Known learning difficulties: ...
- Time pressure / exhaustion during training: ...
- Attitude toward additional digital learning: ...
- Other barriers: ...

*[Source / Assumption note]*

##### 7. Prior Knowledge Gaps
- Concepts likely unknown at course start: ...
- Skills likely missing: ...
- Terminology that must be introduced, not assumed: ...

*[Source / Assumption note]*

##### Design Implications
5–7 concrete consequences for material design, directly derived from this persona:

- [e.g., "Avoid paragraphs longer than 4 lines — reading comprehension is limited"]
- [e.g., "Always explain technical terms on first use — no prior knowledge assumed"]
- [e.g., "Use short video clips and interactive elements — YouTube-native audience"]
- [e.g., "Relate examples to concrete work situations in the trade"]
- [e.g., "Keep quiz questions simple and binary — no complex multi-part answers"]
```

## Usage

This task is invoked when:
- The instructor wants a learner-centered perspective during course development
- After `:create-didactics` when the target audience is defined
- Before `:coauthor-materials` to anchor material design in learner reality
- Before `:review-as-persona` — a persona must exist first
