<!--
language: en
color: <span style="display:inline-block;width:1.5rem;height:1.5rem;background-color:@0;border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span> `@0`

import: ./specs/dashboard/README.md
-->

# {{Course Working Title}}

This is where your course plan grows. You bring your teaching idea; the assistant in the chat helps you turn it into learning objectives, activities and finished material. You check every proposal and decide what is kept. **Nothing is saved without your confirmation.**

<!-- class="journal-start" -->
[Open the overview →](#dashboard)

## Dashboard

```json @Dashboard.View
{
  "title": "Welcome – your course is still empty",
  "context": "No topic, target group or time frame yet",
  "subtitle": "In the first step you tell the assistant what you want to teach. Everything else builds on that frame.",
  "next": {
    "title": "Start a new course",
    "why": "Topic, target group and format are the basis for learning objectives and material. The assistant asks for them one by one.",
    "label": "Start course",
    "href": "agent:teaching/init-course",
    "command": ":init-course"
  },
  "unitsTitle": "Units",
  "units": [],
  "process": {
    "title": "How your course comes together",
    "description": "The steps from the topic to validated material. This overview always shows where we are.",
    "steps": [
      {"title": "Set the frame", "state": "current", "why": "Topic, target group, format and language shape everything that follows.", "next": "Click “Start course” and answer the questions."},
      {"title": "Learning objectives and scope", "state": "planned", "why": "Clear objectives say what learners can do at the end."},
      {"title": "Didactics", "state": "planned", "why": "Methods, task formats and support that fit the objectives."},
      {"title": "Agenda", "state": "optional", "why": "Decided with the frame: order and duration of the units."},
      {"title": "Create material", "state": "planned", "why": "Explanations, tasks and self-checks grow out of the planning."},
      {"title": "Check and revise", "state": "planned", "why": "Clarity and fit to the objectives are checked before the material is used."},
      {"title": "Publish", "state": "optional", "why": "Optional: share the checked course as a link."}
    ],
    "note": "You can step back at any time. A draft only counts as finished once you have approved it."
  },
  "explore": [
    {"icon": "⚡", "title": "Fast track", "description": "One interview fills context, objectives and didactics at once.", "label": "Fast track", "href": "agent:teaching/scaffold", "command": ":scaffold"},
    {"icon": "🔍", "title": "Improve an existing course", "description": "Only if LiaScript material already exists and should be revised.", "label": "Analyze course", "href": "agent:teaching/analyze-existing", "command": ":analyze-existing"},
    {"icon": "💬", "title": "Just ask", "description": "Ask in your own words whenever something is unclear.", "label": "What can the assistant do?", "href": "agent:teaching/help", "command": ":help"}
  ],
  "links": [
    {"label": "Course Context", "href": "#course-context"},
    {"label": "Outline", "href": "#outline"},
    {"label": "Notes", "href": "#notes-backup"}
  ],
  "footer": "{{YYYY-MM-DD}} · new, empty project"
}
```

---

## Course Context

<!-- class="journal-actions" -->
[✏️ Revise context](agent:teaching/init-course) `:init-course` · [🔍 Analyze existing course](agent:teaching/analyze-existing) `:analyze-existing`

_Filled by `:init-course` from `templates/course-context.yaml`._

* __Course Type:__
  1. Type: {{lecture-series | self-paced | workshop | single-lesson | improve-existing}}
  2. Working Title: {{working title}}
  3. Target Group: {{who learns, how many, where}}

* __Terminology:__
  1. sessions-called: {{session | unit | block | lesson | ...}}

* __Course Profile:__
  1. Persona type: {{professor | coach | facilitator | tutor}}
  2. Agenda required: {{yes | optional | no}}
  3. Pacing: {{scheduled | learner-driven | event-based}}
  4. Assessment defaults: {{one or more of quizzes, self-check quizzes, reflection, group work, assignments — or none}}
  5. Units: {{count × length, if known}}

* __File Structure:__
  1. Mode: {{single-file | multi-file}} — see `data/file-structure-modes.md`
  2. Session folder naming: {{n/a for single-file | `{number}-{slug}`}}

* __Conventions & Standards:__
  1. Language: {{de | en | other}}
  2. Tone: {{formal | informal | conversational}}
  3. Person: {{Sie | Du | you}} — learners in the material
  4. Instructor Address: {{Sie | Du | you}} — the instructor in chat and dashboard
  5. Author: {{display name for the material header}}
  6. Contact: {{e-mail, or empty — needed only before publishing}}

* __LiaScript conventions:__
  - {{project-specific rules; mention required templates briefly — details belong in `## Templates`}}

* __Additional Notes:__
  - {{project-specific rules, constraints, or reminders — remove if none}}

---

## Outline

<!-- class="journal-actions" -->
[✏️ Revise outline](agent:teaching/create-outline) `:create-outline`

_Filled by `:create-outline` from `templates/course-outline.yaml`._

* __Title:__
  {{name of the lecture or course}}

* __Target Audience:__
  {{who is this course for? prior knowledge, age group, equipment}}

* __Time Commitment:__
  {{estimated commitment, e.g. hours per week or total hours}}

* __Abstract:__
  {{detailed abstract with all topics, benefits, and application}}

* __Learning Objectives:__
  1. {{clear learning objective with application scenario}}
  2. {{clear learning objective with application scenario}}
  3. {{clear learning objective with application scenario}}

* __Session Overview:__
  {{session → objective → self-check, as a list or a table with at most 3 columns}}

---

## Didactics

<!-- class="journal-actions" -->
[✏️ Revise didactics](agent:teaching/create-didactics) `:create-didactics` · [🎨 Visual identity](agent:artist/create-visuals) `:agent artist` → `:create-visuals`

_Filled by `:create-didactics` from `templates/course-didactics.yaml`._

* __Didactic Concept:__
  {{teaching methods, learning phases, didactic considerations — e.g. lesson rhythm, scaffolding, error culture}}

* __Professor Persona:__
  {{name, background, expertise, and role of the instructor persona}}

* __Teaching Style:__
  {{e.g. humorous, academic, practical, conversational — and how it shows in the material}}

* __Course Type:__
  {{copied from Course Context: lecture-series | self-paced | workshop | single-lesson — and what it means for pacing}}

* __Didactic Framework:__
  {{framework name (see `data/didactic-methods.md`)}}

* __Default Session Method:__
  {{method name (slug) or `none`}}

* __Session Types:__ (format variants of one {{sessions-called}} — see `data/session-types.md`)
  1. __{{display name}}__ (slug: `{{slug}}`) — {{one-line criterion}}
     Required: {{2–3 required elements}}

* __Difficulty Level:__
  {{beginner | intermediate | advanced}}

* __Persona Voice Sample:__
  {{3–5 sentences written in the exact voice of the persona, explaining a core course concept — anchors tone for all co-authoring}}

---

## Visual Identity

<!-- class="journal-actions" -->
[🎨 Visual identity](agent:artist/create-visuals) `:agent artist` → `:create-visuals` · [🎨 Logo](agent:artist/create-logo) `:agent artist` → `:create-logo`

_Filled by `:create-visuals` (optional) from `templates/visuals.yaml`._

* __Logo Generation Guidelines:__
  1. Style: {{...}}
  2. Format: {{...}}
  3. Elements: {{...}}
  4. Mood: {{...}}

* __Logo Color Palette:__
  1. Primary: @color(#000000) — {{name}}
  2. Secondary: @color(#000000) — {{name}}
  3. Accent: @color(#000000) — {{name}}
  4. Background: @color(#FFFFFF) — {{name}}

* __Course Image Generation Guidelines:__
  1. Style: {{...}}
  2. Color scheme: {{...}}
  3. Composition: {{...}}
  4. Mood: {{...}}
  5. In-image text language: {{...}}

* __Image Consistency Rules:__
  - {{palette, character design, backgrounds, fonts}}

* __Website Color Palette:__
  1. Primary: @color(#000000) — {{usage}}
  2. Accent: @color(#000000) — {{usage}}
  3. Text: @color(#000000) — {{usage}}
  4. Background: @color(#FFFFFF) — {{usage}}
  5. Surface: @color(#FFFFFF) — {{usage}}

* __Example Prompts:__
  1. Logo: "{{full image-generation prompt}}"

---

## Templates

<!-- class="journal-actions" -->
[▶️ Manage templates](agent:teaching/manage-templates) `:manage-templates`

_Managed by `:manage-templates` from `templates/course-templates.yaml`._

LiaScript templates used by this project are imported in the main metadata header at the top of `journal.md` and should also be imported in any standalone material file that uses their macros.

More community templates can be found at [topics/liascript-template](https://github.com/topics/liascript-template). When a useful template is selected, add its `import:` line to the project header, document it here, and use the same import in materials that need the template.

<section>

### Dashboard

* __Import:__
  `./specs/dashboard/README.md`

* __Header entry:__
  `import: ./specs/dashboard/README.md`

* __Purpose:__
  Renders the project overview (next step, units, work process, open points) from one JSON data block.

* __Use when:__
  1. Showing the planning state in `## Dashboard` of `journal.md`

* __How to use:__
  1. Keep the import in the main metadata header.
  2. Regenerate the data block with `:update-dashboard`; never edit it by hand.

* __Special usage notes:__
  1. Component documentation and examples: `specs/dashboard/README.md`; check with `node specs/dashboard/validate-journal.mjs`.

</section>

---

## Agenda

<!-- class="journal-actions" -->
[✏️ Revise agenda](agent:teaching/create-agenda) `:create-agenda`

_Filled by `:create-agenda` from `templates/course-agenda.yaml` (skip if the course profile says agenda: no)._

* __Overview:__
  {{number of sessions, duration, pacing — 2–4 sentences}}

* __Time Budget:__
  {{per time slot: slot length − setup − wrap-up = working time; sum of the mandatory units; buffer}}

* __Modules / Sessions:__

  <!-- data-type="none" -->
  | No. | Title | Time | Kind | Objectives |
  |---|---|---|---|---|
  | 1 | {{title (mandatory/optional)}} | {{time}} | {{display name of the Session Type}} | {{objectives}} |

  <details><summary>Technical settings for the assistant</summary>

  | No. | type slug | method slug | material path |
  |---|---|---|---|
  | 1 | {{slug}} | {{method slug}} | {{material path, see `data/file-structure-modes.md`}} |

  </details>

---

## Sessions

<!-- class="journal-actions" -->
[▶️ Didactics first](agent:teaching/create-didactics) `:create-didactics`

_Managed by `:create-session`, `:promote-session`, `:coauthor-materials`, and `:validate-course`. Overview first — status list, then the technical table in `<details>` (`templates/session-skeleton.yaml` → `section_layout.overview`) — then one `### {n}. {title}` subsection per session._

<!--- One subsection per session, structured like this:

### {{n}}. {{Session Title}}

{{action line: `class="journal-actions"` attribute comment + state-dependent links, see `data/agent-links.md`}}

{{<details> "Technical settings and more actions": **Type:** slug, **Method:** slug, further commands</details>}}

{{visible kind line: display names of type and method}}

**Summary:**

{{2–4 sentences: focus, didactic intent, known stumbling blocks}}

**Content:**

{{topic list / content skeleton per templates/session-skeleton.yaml}}

**Activities:**

1. {{activity}}

**Decisions:**

1. {{instructor decision about this unit, with date — added during :coauthor-materials}}

**References:**

1. {{reference}}

The block order is fixed in `templates/session-skeleton.yaml` → `section_layout.entry_order`: the `#### Validation Report`
(after :validate-course) follows the action line and the technical details, before the
skeleton; `#### Images` (created by :create-image only when the first image exists) and
`#### Persona Reviews` (after :review-as-persona) come last, in this order. Never use `#####` headings inside a session.
--->

<details><summary>Technical overview</summary>

<!-- data-type="none" -->
| # | Title | Type | Skeleton | Material | Done | Notes |
|---|-------|------|----------|----------|------|-------|

</details>

---

## Agents

<!-- class="journal-actions" -->
[▶️ Configure agent](agent:teaching/configure-agent) `:configure-agent <agent>` · [▶️ New learner persona](agent:teaching/create-learner-persona) `:create-learner-persona`

_Agent-specific project customizations and learner personas._
_Read-scope rule: Coauthor and specialist agents are direct `###` subsections; each agent reads only its assigned subsection._

<section>

### Coauthor

* __Customization Status:__ inactive
* __Role / Persona:__
  none
* __Behavior Additions:__
  1. none
* __Preferred Interaction Style:__
  none
* __Project-Specific Rules:__
  1. none
* __Persona Voice Sample:__
  none
* __Boundaries / Never:__
  1. Do not override base workflow, validation, safety, or epistemic rules.

### Teaching-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. none
* __Preferred Interaction Style:__
  none
* __Project-Specific Rules:__
  1. none
* __Boundaries / Never:__
  1. Do not override base workflow, validation, safety, or epistemic rules.

### Artist-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. none
* __Preferred Visual Priorities:__
  none
* __Project-Specific Rules:__
  1. none
* __Boundaries / Never:__
  1. Do not override base visual consistency, accessibility, or uncertainty rules.

### Development-Agent

* __Customization Status:__ inactive
* __Behavior Additions:__
  1. none
* __Preferred Publishing Workflow:__
  none
* __Project-Specific Rules:__
  1. none
* __Boundaries / Never:__
  1. Do not override validation gates, git safety, or publishing checks.

</section>

### Learner Personas

_Optional — filled by `:create-learner-persona`. One `#### Persona: {icon} {name}` subsection per persona (structure defined in `tasks/create-learner-persona.md`)._

---

## Validation

<!-- class="journal-actions" -->
[🔍 Validate course](agent:teaching/validate-course) `:validate-course`

_Replaced by `:validate-course` (course mode). The `### Latest Validation Summary` below is the authoritative publishing gate — publishing requires `Mode: course` and `Result: PASS`. Per-session reports live in `## Sessions` → `#### Validation Report`, not here._

### Latest Validation Summary

<!--- Not yet run. Format: tasks/validate-course.md, course mode step 9. When the language switches, replace the visible line below with its translation. --->
Course check not yet run. Unit checks are under "Sessions"; the course check runs before publishing.

---

## Publishing

_Maintained by the Development-Agent (`:create-project`, `:update-project`): read from the repository before anything is published. The dashboard shows it._

* __Repository:__ none yet
* __Branch:__ —
* __Viewer URL:__ —
* __State:__ not published

---

## Analysis Status

_Only used for improve-existing courses — filled by `:analyze-existing`._

---

## Notes Backup

<!-- class="journal-actions" -->
[▶️ Save notes](agent:teaching/save-notes) `:save-notes` · [▶️ Save decision](agent:teaching/save-decision) `:save-decision <title>`

_Appended to by `:save-notes` and `:save-decision` from `templates/note-backup.yaml`._
_Each note is one append-only `### {Type, in the course language}: {Descriptive Title} ({YYYY-MM-DD})` subsection._
