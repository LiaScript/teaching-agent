<!--
language: en
color: <span style="display:inline-block;width:1.5rem;height:1.5rem;background-color:@0;border:1px solid #ccc;border-radius:2px;vertical-align:middle;"></span> `@0`

import: ./specs/dashboard/README.md
-->

# New course

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
    "title": "Set the frame",
    "why": "Topic, target group and format are the basis for learning objectives and material. The assistant asks for them one by one.",
    "label": "Start course",
    "href": "agent:teaching/init-course",
    "command": ":init-course",
    "icon": "▶️"
  },
  "unitsTitle": "Units",
  "units": [],
  "process": {
    "title": "How your course comes together",
    "description": "The steps from the topic to validated material. This overview always shows where we are.",
    "steps": [
      {"title": "Set the frame", "state": "current", "why": "Topic, target group, format and language shape everything that follows.", "next": "Click “Start course” and answer the questions."},
      {"title": "Outline and learning objectives", "state": "planned", "why": "Clear objectives say what learners can do at the end."},
      {"title": "Didactics", "state": "planned", "why": "Methods, task formats and support that fit the objectives."},
      {"title": "Templates for activities", "state": "planned", "why": "Ready-made building blocks such as turtle Python or SQL – or your own if nothing fits."},
      {"title": "Agenda", "state": "optional", "why": "Decided with the frame: order and duration of the units."},
      {"title": "Create material", "state": "planned", "why": "Explanations, tasks and self-checks grow out of the planning."},
      {"title": "Check and revise", "state": "planned", "why": "Clarity and fit to the objectives are checked before the material is used."},
      {"title": "Publish", "state": "optional", "why": "Optional: share the checked course as a link."}
    ],
    "note": "You can step back at any time. A unit only counts as finished once its check has passed and you have approved it."
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
  "footer": "new, empty project"
}
```

---

## Course Context

<!-- class="journal-actions" -->
[▶️ Start course](agent:teaching/init-course) `:init-course`

<!--- Filled by :init-course from templates/course-context.yaml (layout: summary table + <details>). --->

_Still empty – filled with “Start course”._

---

## Outline

<!-- class="journal-actions" -->
[▶️ Create outline](agent:teaching/create-outline) `:create-outline`

<!--- Filled by :create-outline from templates/course-outline.yaml. --->

_Still empty – created with “Create outline”, the step after the course frame._

---

## Didactics

<!-- class="journal-actions" -->
[▶️ Create didactics](agent:teaching/create-didactics) `:create-didactics` · [🎨 Visual identity](agent:artist/create-visuals) `:agent artist` → `:create-visuals`

<!--- Filled by :create-didactics from templates/course-didactics.yaml. --->

_Still empty – created with “Create didactics”, the step after the outline._

---

## Visual Identity

<!-- class="journal-actions" -->
[🎨 Visual identity](agent:artist/create-visuals) `:agent artist` → `:create-visuals` · [🎨 Logo](agent:artist/create-logo) `:agent artist` → `:create-logo`

<!--- Filled by :create-visuals (optional) from templates/visuals.yaml. --->

_Optional – the design assistant fills this in when you want a consistent look for images and colours._

---

## Templates

<!-- class="journal-actions" -->
[▶️ Suggest templates](agent:teaching/suggest-templates) `:suggest-templates` · [👁 Template catalog](agent:teaching/preview?file=specs/catalog/README.md) `:preview specs/catalog/README.md` · [▶️ Manage templates](agent:teaching/manage-templates) `:manage-templates`

<!--- Managed from templates/course-templates.yaml: adopted templates by :manage-templates, the briefs of templates in development by :suggest-templates, the selection line by both, removals included (ownership: agents/teaching-agent.yaml → journal_formatting_rules). --->

LiaScript templates used by this project are imported in the main metadata header at the top of `journal.md` and should also be imported in any standalone material file that uses their macros.

Checked templates are listed in the template catalog (`specs/catalog/README.md`); more community templates can be found at [topics/liascript-template](https://github.com/topics/liascript-template). When a useful template is selected, add its `import:` line to the project header, document it here, and use the same import in materials that need the template. A template that is still being developed is described here by a brief until it is adopted.

* __Template selection:__ open

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
[▶️ Create agenda](agent:teaching/create-agenda) `:create-agenda`

<!--- Filled by :create-agenda from templates/course-agenda.yaml (skip if the course profile says agenda: no). --->

_Still empty – created with “Create agenda”, the step after the didactics._

---

## Sessions

<!-- class="journal-actions" -->
[▶️ Didactics first](agent:teaching/create-didactics) `:create-didactics`

<!--- Managed by :create-session, :promote-session, :coauthor-materials and :validate-course. Overview first — status list, then the technical table in <details> (templates/session-skeleton.yaml → section_layout.overview) — then one `### {n}. {title}` subsection per session. --->

_No units yet – they are created after the didactics (and the agenda, if one is planned)._

<!--- One subsection per session, structured like this:

`### {n}. {Session Title}` (the heading line of each subsection)

{{action line: `class="journal-actions"` attribute comment + state-dependent links, see `data/agent-links.md`}}

{{<details> "Technical settings and more actions": **Type:** slug, **Method:** slug, further commands</details>}}

{{visible kind line: display names of type and method}}

Each bold label is in the course language and carries its key comment on the line above it (data-key = summary, content, activities, decisions, references — templates/session-skeleton.yaml); the comment is left out here only because it would end this note.

**{{"Summary", translated}}:**

{{2–4 sentences: focus, didactic intent, known stumbling blocks}}

**{{"Content", translated}}:**

{{topic list / content skeleton per templates/session-skeleton.yaml}}

**{{"Activities", translated}}:**

1. {{activity}}

**{{"Decisions", translated}}:**

- **{{date}}:** {{instructor decision about this unit — added during :coauthor-materials; a bullet with the date in bold, never a numbered item that starts with the date}}

**{{"References", translated}}:**

1. {{reference}}

The block order is fixed in `templates/session-skeleton.yaml` → `section_layout.entry_order`: action line, technical
details, then the skeleton fields; after them the validation report (after :validate-course; a heading in the course
language, "Validation report – {unit} {n}", above `<section data-key="validation-report">`), `#### Images` (created with
the first image entry, by :coauthor-materials or :create-image) and `#### Persona Reviews` (after :review-as-persona),
in this order. Never use `#####` headings inside a session.
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

<!--- Read-scope rule: Coauthor and specialist agents are direct ### subsections; each agent reads only its assigned subsection. --->

_Project-specific settings of the assistants and learner profiles._

<section>

### Coauthor

_Rules for writing the material: voice of the guide, hints, limits._

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

<!--- Optional — filled by :create-learner-persona. One `#### Persona: {icon} {name}` subsection per persona (structure: tasks/create-learner-persona.md). --->

_No learner profiles yet._

---

## Validation

<!--- Replaced by :validate-course (course mode). The ### Latest Validation Summary below is the authoritative publishing gate — publishing requires `Mode: course` and `Result: PASS`. Per-session reports live in ## Sessions → #### Validation Report, not here. The action line is added by update-dashboard once every unit has material. --->

### Latest Validation Summary

<!--- Not yet run. Format: tasks/validate-course.md, course mode step 9. When the language switches, replace the visible line below with its translation. --->
Course check not yet run. Unit checks are under "Sessions"; the course check runs before publishing.

---

## Publishing

<!--- Maintained by the Development-Agent (:create-project, :update-project): read from the repository before anything is published. The dashboard shows it. __State:__ stays an English key. --->

* __Repository:__ none yet
* __Branch:__ —
* __Viewer URL:__ —
* __State:__ not published

---

## Analysis Status

<!--- Filled by :analyze-existing. --->

_Only used when an existing course is improved._

---

## Notes Backup

<!-- class="journal-actions" -->
[▶️ Save notes](agent:teaching/save-notes) `:save-notes` · [▶️ Save decision](agent:teaching/save-decision) `:save-decision <title>`

<!--- Appended to by :save-notes and :save-decision from templates/note-backup.yaml. Each note is one append-only `### {Type, in the course language}: {Descriptive Title} ({YYYY-MM-DD})` subsection. --->

_No notes yet._
