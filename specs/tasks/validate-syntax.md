# Task: validate-syntax

## Purpose

The single source of truth for LiaScript syntax validation of one material document — derived from every normative section of `data/liascript-cheat-sheet.md`. Other tasks call this task as a sub-procedure instead of re-describing syntax rules themselves, so the rules are defined once and never drift out of sync across `validate-course`, `quick-fix`, `build-session`, and the quality checklist.

## Command

`:validate-syntax {number}` — checks LiaScript syntax for one session's material document.

This task is also invoked internally (not just via the command) by `tasks/validate-course.md` (session and course mode), `tasks/quick-fix.md` (mini-validation), and `tasks/build-session.md` (content loop) — those tasks call it as a sub-procedure rather than repeating the checks below.

## Inputs

- `number`
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` — checks 1 and 2 differ by mode
- the session's type — resolved from the session number as described in `data/session-types.md` → "Resolving a session's type"; never a command parameter
- The material document for this session — resolved from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`): `materials/{number}-{slug}/README.md` in multi-file mode, or the matching `##` chapter in root `/README.md` in single-file mode
- `data/liascript-cheat-sheet.md` as the syntax reference
- Optionally, a narrower scope (e.g. "only the changed section") when called by `quick-fix.md`
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-checks.md`

## Output

- A structured findings list: rule, ✅/❌, and the page title (slide heading) of the material where the finding is.
- **When called as a sub-procedure:** return the findings list to the calling task — do not write to `journal.md` directly; the caller decides where the combined report lands (e.g. inside `#### Validation Report`). Findings returned to a caller never contain line numbers — the validation report refers to page titles only (`templates/session-validation.yaml`), and `validate-journal.mjs` rejects reports that cite lines.
- **When run standalone via `:validate-syntax`:** report the findings to the instructor directly in chat; no `journal.md` write. Here a line number may follow the page title in parentheses.

## Steps

1. Resolve the material document (or the given narrower scope) per the Inputs above.
2. Load `data/liascript-cheat-sheet.md` as the syntax reference.
   - If the skill `liascript-syntax` is available (see `data/skills.md`), use it as second reference for constructs the cheat sheet does not cover and for unclear findings. The check list below and the findings format stay as defined here.
3. Run every check below against the material, noting rule, ✅/❌, and the page title of each finding.
4. If invoked as a sub-procedure: return the findings list to the caller — do not ask the instructor anything.
5. If invoked directly: report the findings using the Output Format below.

## Checks

1. **Metadata header** (cheat sheet §1): `author`, `version`, `language`, `narrator` present and well-formed in the `<!-- ... -->` header block — multi-file: the material document's own header; single-file: the one shared header of root `README.md` (a session's `##` chapter has no header of its own and is never ❌ for it). `email` is not part of this check in either mode: the contact address is publishing metadata, checked only by the publishing gate (`tasks/create-project.md`).
2. **Heading structure** (§2): multi-file: exactly one `#` heading (course title) per material document; single-file: exactly one `#` in root `README.md`, and a session's chapter starts with its `##` heading and contains no `#`; every `#`, `##` and `###` starts a new slide, so headings follow `templates/session-material.yaml` → `heading_levels`; `####`-or-deeper only inside a `<div>`/semantic wrapper, a list, or a blockquote — never bare.
3. **Code blocks** (§8): every fenced code block opened with triple backticks is closed; correct language tag used (`js`, `py`, `html`, etc.); interactive code blocks pair a `<script>`/`@input` block directly after the code block where applicable.
4. **Alerts** (§3): alert blockquotes use only supported types (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`); every line of the alert starts with `>`.
5. **Citations** (§3): citation blockquotes have a `--` source line, preceded by an empty `>` line.
6. **Animations & TTS** (§4, §14): `--{{n}}--` / `{{n}}` numbering resets to 0 after each `##`; every `{{n}}` animated content block has a matching `--{{n}}--` TTS comment; narrator overrides use the `<!-- narrator: ... -->` form; `{{|>}}` play-button syntax is well-formed where used.
7. **Media** (§5): every `![]`, `?[]`, `!?[]`, `??[]` element has meaningful alt text/caption; every link and media target has `(`, `)` and spaces percent-encoded (an unencoded `(` cuts the address); image answer options carry a display limit (`<!-- style="max-height: …" -->` directly after the image) and request a standard thumbnail width (cheat sheet §5). This is the only place the limit is checked; whether the options fit the learners' screen is the `[pedagogical]` checklist item, never a syntax finding.
8. **Diagrams** (§6): Mermaid code blocks tagged `@mermaid`; ASCII diagrams tagged `ascii`.
9. **Formulas** (§7): inline `$...$` and block `$$...$$` LaTeX delimiters correctly paired.
10. **Quizzes & surveys** (§10, §10b): classic quiz syntax (`[(X)]` single choice, `[[X]]` multiple choice, `[[answer]]` text quiz, `?[...]` open question) **and** survey variants (`[[___]]` text input, single-/multi-choice vector, single-/multi-choice matrix) are correctly formed.
11. **Includes** (§11): `@import`/`@include` reference existing local/external targets and use the correct directive for local vs. external content.
12. **Variables & macros** (§12): `@var` variables are defined (header or comment block) before use and used consistently throughout.
13. **HTML blocks**: no unclosed `<div>` (or other HTML container) blocks.

## Output Format

```
Syntax check: {material path}

1. Metadata header — ✅/❌ [findings]
2. Heading structure — ✅/❌ [findings, page titles]
3. Code blocks — ✅/❌ [findings, page titles]
4. Alerts — ✅/❌ [findings, page titles]
5. Citations — ✅/❌ [findings, page titles]
6. Animations & TTS — ✅/❌ [findings, page titles]
7. Media (alt text, encoded targets, image size) — ✅/❌ [findings, page titles]
8. Diagrams — ✅/❌ [findings, page titles]
9. Formulas — ✅/❌ [findings, page titles]
10. Quizzes & surveys — ✅/❌ [findings, page titles]
11. Includes — ✅/❌ [findings, page titles]
12. Variables & macros — ✅/❌ [findings, page titles]
13. HTML blocks — ✅/❌ [findings, page titles]

Result: PASS / FAIL (N issues)
```

## Relation to other tasks

| Task | How it uses `validate-syntax` |
|---|---|
| `validate-course.md` | Calls it for every material file in session and course mode; folds the findings into `#### Validation Report` |
| `quick-fix.md` | Calls it scoped to the changed area during mini-validation |
| `build-session.md` | Calls it (via `validate-course`) inside the content loop's mechanical gate |
| `coauthor-materials.md` | May call it optionally during drafting as a self-check |

Do not duplicate the checklist above inside any of these tasks — reference this file instead.
