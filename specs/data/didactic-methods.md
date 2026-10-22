# Didactic Methods

> Read this before choosing, generating for, or validating a course's didactic approach. Referenced by `:create-didactics`, `:create-agenda`, `:create-session`, `:promote-session`, and `:validate-course`.

Didactic concepts fall into three layers here, each handled differently — do not mix them up:

1. **Course Frameworks** — course-wide, named once, documentation only. No task behavior changes based on which one is chosen.
2. **Session Methods** — chosen per session (with a course-level default), each with its own checkable `Required` list. Enforced the same way Session Types are (see `data/session-types.md`).
3. **Validation Mechanisms** — concepts that are already implemented by existing tasks. Named here only so the vocabulary is available; nothing new to build.

## 1) Course Frameworks

Set once in `journal.md` → `## Didactics` → `__Didactic Framework:__`. Pure documentation/vocabulary — the pipeline (`create-outline` → `create-didactics` → `create-agenda`) already follows these patterns structurally, so picking one doesn't change any task's steps.

| Framework | What it means |
|---|---|
| **ADDIE** | Analyse → Design → Development → Implementation → Evaluation. Classic linear instructional-design model. |
| **Backward Design** (Wiggins & McTighe) | Learning objectives first, then assessment, only then content/activities. |
| **Constructive Alignment** (Biggs) | Learning objectives, teaching/learning activities, and assessment are deliberately aligned with each other. |

### Default suggestion by course type

| Course type | Suggested framework | Why |
|---|---|---|
| lecture-series | Backward Design | Objectives/assessment drive a multi-week structure best when fixed early. |
| self-paced | ADDIE | Clear, iterable phases suit solitary, incremental development. |
| workshop | Constructive Alignment | Activities are the core of a workshop — they must stay tightly bound to objectives. |
| single-lesson | Backward Design | A compact lesson benefits from a tight objective → assessment → content chain. |

The agent chooses it at `:create-didactics` (documentation only, named in the technical details, not asked); the instructor can change it any time.

## 2) Session Methods

Chosen per session (course-level default set in `## Didactics` → `__Default Session Method:__`, per-session override possible in `:create-agenda`). Each method has the same four-part definition format as Session Types (see `data/session-types.md` → "Definition format"): display name, slug, one-line criterion, `Required` checklist — and is enforced by `:validate-course` the same way, as a **second, independent** checklist alongside the session's Type checklist. The two never merge and never conflict — a session simply has to satisfy both.

`__Default Session Method:__` may also be set to **`none`** — an explicit opt-out. When set, no Session Method `Required` check runs anywhere in the course; nothing is blocked or degraded, it's simply not used.

### Definitions

```
__Gagné's Nine Events__ (slug: `gagne`) — Sequenced instruction with a clear
attention–activation–practice–feedback structure. Fits presenter-led sessions.
  Required: opening attention hook present; prior knowledge explicitly
  activated; practice with feedback present.

__Cognitive Load Pacing__ (slug: `cognitive-load`) — Deliberate control of
cognitive load: new concepts are dosed, complex material is scaffolded,
redundant re-presentation is avoided.
  Required: no more than ~3–5 new core concepts introduced in the session;
  complex content broken into worked examples or sub-steps; no redundant
  restatement of the same information across formats without added value.

__UDL Format Variety__ (slug: `udl`) — Universal Design for Learning: content
offered through multiple representation/expression formats so different
learners can access and demonstrate understanding.
  Required: at least two distinct media formats used for core concepts
  (text + diagram/video/interaction); at least one way for learners to
  demonstrate understanding beyond a single quiz format; basic accessibility
  considered (alt text, plain language).
```

### Default suggestion by course type

| Course type | Suggested default method | Why |
|---|---|---|
| lecture-series | Gagné's Nine Events (`gagne`) | Presenter-led sessions benefit from a clear sequence. |
| self-paced | UDL Format Variety (`udl`) | No presenter in the room — multiple access paths matter more. |
| workshop | Cognitive Load Pacing (`cognitive-load`) | High interactivity risks overload without deliberate pacing. |
| single-lesson | Gagné's Nine Events (`gagne`) | A compact single arc benefits from a tight, clear structure. |

The agent chooses it at `:create-didactics` (`none` is allowed) without asking and mentions it only if it changes what the learners do; `:create-agenda` may pick another method for a single session the same way. The instructor can change either at any time.

## 3) Validation Mechanisms (already implemented — reference only)

No new mechanism needed for any of these — this table exists so the vocabulary is available when discussing testing strategy with the instructor.

| Concept | Already implemented in | What it covers |
|---|---|---|
| Kirkpatrick Level 1 (Reaction) | `tasks/review-as-persona.md` | Simulated learner's reaction to the material |
| Kirkpatrick Level 2 (Learning) | `tasks/validate-course.md` (Content checks: learning objectives addressed) | Whether the objective is actually covered |
| Formative evaluation | `tasks/validate-course.md` + `tasks/build-session.md` iteration loop | Ongoing check-and-fix during development |
| Summative evaluation | `tasks/validate-course.md` → Publishing Gate | Final go/no-go decision before publishing |
| Persona-based review | `tasks/review-as-persona.md` | Perspective-taking test through a simulated learner |

## Enforcement loop (Session Methods only)

Course Frameworks are documentation-only and Validation Mechanisms are already enforced elsewhere, so only Session Methods need their own loop — the same three-task loop Session Types already use:

1. **Generation** — `:create-agenda` assigns the method per session (the default, or another one the agent picks for that session without asking; the instructor can change it any time); `:create-session` stores it on the skeleton; `:promote-session` follows its structural guidance when generating content.
2. **Validation** — `:validate-course` (session and course mode) checks the material against the method's `Required` list, independently of the Session Type check.
3. **Course-level check** — `checklists/course-quality-checklist.md` confirms every session's content matches its declared method's required elements before publishing (when a method is set).

If `__Default Session Method:__` is missing entirely (not even explicitly `none`), `:validate-course` flags this as a gap rather than silently skipping the check — same principle as an undefined Session Type.

## Relationship to Session Types

**Type** and **Method** are orthogonal properties of a session — do not confuse them:

- **Type** (`data/session-types.md`) is the *format* a session takes — is this a lecture, an exercise, a self-check?
- **Method** (this file) is the *didactic technique* used to structure and validate the content — how is it sequenced, paced, or made accessible?

A session declares both: e.g. a session of Type `exercise` might use Method `cognitive-load`, while another `exercise` session in the same course uses `gagne` instead. Both checklists apply independently.
