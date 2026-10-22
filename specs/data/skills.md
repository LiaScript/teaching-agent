# LiaScript Skills

The [LiaScript skills](https://github.com/LiaScript/skills) are optional
[Agent Skills](https://agentskills.io) that add deep, maintained knowledge to
single steps of this workflow. The agents **use a skill only if it is already
installed** — locally in the project or globally for the user. They never
install a skill themselves and never assume one is present.

## Detection

Detect once on activation and remember the result for the session. A skill
counts as available if **either** holds:

1. **The agent runtime lists it** as an available skill (e.g. Claude Code's
   skill list; a plugin may prefix the name, such as `liascript:liascript-syntax`
   — match on the part after the last `:`). Invoke it the runtime's way (Claude
   Code: the Skill tool).
2. **A `SKILL.md` exists** in one of these folders (`<name>` = skill name):
   - project: `.claude/skills/<name>/`, `.agents/skills/<name>/`,
     `.github/skills/<name>/`, `.cursor/skills/<name>/`, `.windsurf/skills/<name>/`,
     `.roo/skills/<name>/`
   - user: `~/.claude/skills/<name>/`, `~/.agents/skills/<name>/`,
     `~/.copilot/skills/<name>/`

   Then read that `SKILL.md` and the reference files it points to, as the step
   needs them (they are written for progressive loading — do not read all of
   them up front).

Only check for file existence, with the agent's file-search or file-reading tool
(glob) — not with shell commands (`ls`), see the shell rule in `CLAUDE.md` → Agent
Links; never download, clone, or run `npx skills`. In a web chat without file access, nothing is detectable: treat
all skills as unavailable.

If nothing is found, the step runs exactly as before with the built-in specs.
Mention a missing skill at most once per session, and only when it would clearly
help the current step — as a hint with the install command
(`npx skills add LiaScript/skills --skill <name>`), never as a requirement, and
never run it.

## Where the Workflow Uses Them

| Skill | Agent | Task / step | Use |
|---|---|---|---|
| `liascript-syntax` | Teaching | `promote-session`, `coauthor-materials`, `quick-fix` | Authoring reference for every LiaScript construct (quizzes, surveys, effects, TTS, code execution, charts, presentation pattern), in addition to `data/liascript-cheat-sheet.md` |
| `liascript-syntax` | Teaching | `validate-syntax`, `validate-course` | Second reference for constructs the cheat sheet does not cover and for unclear findings |
| `reference-checker` | Teaching | `validate-course` (session and course mode), `coauthor-materials` when sources are added, `save-notes` for research notes | Verify the `References` / sources of a session; requires web access |
| `liascript-templates` (older name: `template-development`) | Teaching | `manage-templates` | When the instructor needs a macro or template that does not exist yet (own template, JS library integration) |
| `creativity` | Teaching | `create-outline`, `scaffold`, `coauthor-materials` (narrative courses) | Optional exploratory ideation (Emergent Creativity Protocol) before the structured step — only on the instructor's request |
| `liascript-theming` | Artist | `create-visuals` | Turn the website palette and typography into a tested LiaScript theme header (`link:` + `@style` + `@custom`), or apply a bundled design by name |
| `liascript-exporter` (older name: `exporter-workflow`) | Development | `create-project`, `update-project` | `project.yaml`, GitHub Actions, `liaex` exports (PDF, SCORM, ePub, …), in addition to `data/liascript-workflows.md` |
| `oersi-metadata` | Development | `create-project`, `update-project` | Optional `metadata.yml` to publish the course as OER on OERSI |

## Precedence

Skills add knowledge; the workflow keeps control:

- `journal.md` structure, section ownership, formatting rules, validation report
  format, publishing gate, file structure modes, and the confirmation rules of
  every task always win over a skill's own procedure or output format.
- Use a skill's knowledge inside the task step that calls it. Write results
  where the **task** says, not where the skill would put them (e.g. a theme
  block goes into `journal.md` → `## Visual Identity`, a reference check into
  the session's `#### Validation Report`).
- If a skill contradicts `data/liascript-cheat-sheet.md` on LiaScript syntax,
  follow the skill (it is maintained alongside LiaScript) and note the conflict
  once to the instructor.
- Skills that would act on their own — run multi-agent ideation, generate
  files, call the web — run only inside a step that the instructor started and,
  where the task says so, after confirmation.
- Say which skill a step used, in one line (e.g. "Syntax checked with
  `liascript-syntax`.").
