# Duration Heuristic

> Read this before estimating or validating how long a session's material actually takes. Referenced by `:validate-course`, `:build-session`, `:create-agenda`, and `:coauthor-materials`.

A common failure mode is a session that reads as "complete" but is too thin for its declared duration — or the reverse. Word count alone misses this: a single slide can carry 15 minutes of discussion, and a dense slide can be read in 30 seconds. This heuristic combines **reading time** with **activity time** so both cases are estimated correctly.

## Formula

**Estimated total duration = reading time (prose) + activity time**

### Reading time

Word count of the prose (excluding activity/discussion/quiz blocks, which are estimated separately below) ÷ reading pace.

Reading pace depends on the course type from `journal.md` → `## Course Context`:
- **130 words/minute** for narrated/lecture-style course types (content is meant to be read aloud or matches a TTS narration pace)
- **200 words/minute** for self-paced, silent-reading course types

### Activity time

For each activity, discussion, exercise, or quiz block in the material:

- **If the material states a duration explicitly** (e.g. "(15 Min)", "ca. 10 Minuten") — use that value.
- **Otherwise, fall back to this rough table** (adjustable, not precise):

| Activity type | Default estimate |
|---|---|
| Quiz question (single/multiple/text) | 1–2 min each |
| Short discussion prompt | 8–10 min |
| Group exercise / hands-on task | 15–20 min |
| Video/demo embed | stated media length, or 5 min default |
| Case study / longer discussion | 15–20 min |

Sum reading time and activity time for the session's total estimate.

## Comparing against the declared duration

Compare the total estimate to the session's declared duration in `journal.md` → `## Agenda`.

- **Flag** if the estimate falls outside **70%–150%** of the declared duration.
- This is an **`[advisory]` item** (see the tags in `checklists/course-quality-checklist.md`): a hint, never ❌, never a fail, never part of an automated fix loop — final judgment stays with the instructor, or with a persona review if one is available (see `tasks/review-as-persona.md`; a persona's "this feels too short/rushed" comment is a stronger signal than the formula alone).

## Where this is used

- `tasks/validate-course.md` — Content checks (session and course mode): computes the estimate and records the flag, if any.
- `checklists/course-quality-checklist.md` — the "Session Materials" duration checkbox references this file instead of restating the formula.
- `tasks/build-session.md` — records the flag as a hint in the content loop and hands it to the persona review (or the closing report); never fixes it automatically.
- `tasks/create-agenda.md` — optional pointer when the instructor first declares session durations, as a sanity check.
- `tasks/coauthor-materials.md` — optional self-check while drafting, before formal validation.
