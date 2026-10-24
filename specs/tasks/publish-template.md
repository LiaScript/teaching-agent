# Task: publish-template

## Purpose

Publishes an own, already adopted LiaScript template (`__Source:__ lia-templates/{id}/` in
`journal.md` → `## Templates`) as its own GitHub repository, so other projects and the community can use
it: the folder `lia-templates/{id}/` stays in the course project and becomes a nested git repository of
its own (ignored by the course repository), gets the topic `liascript-template` and a version tag, and the
course imports it from that tag. Later changes are published as new tags. Optionally the entry is offered
to the shared template list of the Teaching-Agent.

Use this task when:
- An own template was adopted (`:manage-templates {id}`, `__Source:__ lia-templates/{id}/`) and the instructor wants to share it or use it in several projects
- A published own template (`__Source:__ {repo-url}@{tag}`) changed and needs a new version (step 6)

## Inputs

- `id` (required command parameter): the `__Catalog id:__` of the adopted entry under `## Templates`
- `journal.md` → `## Templates` → only the entry with `__Catalog id:__ {id}` (its `__Source:__`, `__Import:__`, `__Header entry:__`) and the `import:` lines of the main metadata header (the Dashboard write at the end reads the selection line and all briefs — update-dashboard reads them as derived state)
- `journal.md` → `## Course Context` (language, subject, target group, `__File Structure:__`)
- `lia-templates/{id}/` (its `README.md` header: `version:`, macros)
- The files that import the template, found with `node specs/dashboard/find.mjs <pattern> journal.md materials` (in single-file mode `… journal.md README.md`): for the first publication the pattern `"lia-templates/{id}/README.md"` (the local import); once published (`__Source:__ https://github.com/{owner}/{repo}@{tag}`) the pattern `"raw.githubusercontent.com/{owner}/{repo}/"` with owner and repository taken from `__Source:__` — every import then names the old tag's URL, never the local path
- `templates.local.json` in the project root (created if missing) and the course project's `.gitignore`
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- `lia-templates/{id}/`: its own git repository with a remote on GitHub, the topic `liascript-template` and a version tag; documentation in English unless the template is very course-specific
- `import:` lines switched to `https://raw.githubusercontent.com/{owner}/{repo}/{tag}/README.md` in the journal header, in `## Templates` and in **every** material that imports the template; `__Source:__ https://github.com/{owner}/{repo}@{tag}`
- `templates.local.json`: the entry `{id}` (`status: "own"`) switched from the local import to the https import plus `repo` and `demo`
- Course `.gitignore`: `lia-templates/{id}/`
- Optional: a prepared pull request to the Teaching-Agent repository for the shared list
- `journal.md` → `## Dashboard` updated

## Steps

0. **Which template.** Read the entry with `__Catalog id:__ {id}` and act by its `__Source:__`:
   - `lia-templates/{id}/`: first publication — continue with step 1.
   - `https://github.com/{owner}/{repo}@{tag}`: already published — go to step 6.
   - `catalog` or `found`, or no entry: not an own template — say so and end here.
   - Only a brief `### {id} (in development)`: not adopted yet — say that `:develop-template {id}` and the
     Teaching-Agent's `:manage-templates {id}` come first, and end here.
1. **Explain, then let the instructor decide.** In plain words (course language): what an own repository
   brings — the template can be used in several projects, others find it through the topic
   `liascript-template`, every published change gets its own version, so a course keeps working while the
   template develops further — and what it needs: a GitHub account, a logged-in `gh`, and that the template
   becomes public. 🎛️ "Publish as its own repository" / "Keep it in this project" (translated).
   The instructor decides — never publish on your own initiative. "Keep it in this project": write nothing;
   the folder is committed with the course (`tasks/create-project.md`, `tasks/update-project.md`), end here.
2. **Plan, then confirm in the terminal** (tier "confirm in terminal", `data/agent-links.md`; from the
   preview chat post a chat note that the confirmation waits in the terminal). Ask first: the GitHub
   owner (own account or an organisation), the repository name (default `{id}`) and the visibility —
   learners' browsers load the import from the repository, so only a **public** repository works as an
   import source; with "private" say so and end here without changes. Then show the plan:
   - the documentation of `lia-templates/{id}/README.md` in English (header `language: en`), unless the
     template is very course-specific — then it stays in the course language; say which, as part of the plan
   - the tag `{tag}` = the `version:` of the README header (set to `0.1.0` if it has none)
   - the commands, each on its own, in this order: `gh auth status` (not logged in: stop — `gh auth login`
     is the instructor's own step), `git -C lia-templates/{id} init`, `git -C lia-templates/{id} add -A`,
     `git -C lia-templates/{id} commit -m "{message}"`,
     `gh repo create {owner}/{repo} --public --source lia-templates/{id} --remote origin --push`,
     `gh repo edit {owner}/{repo} --add-topic liascript-template`, `git -C lia-templates/{id} tag {tag}`,
     `git -C lia-templates/{id} push origin {tag}` (flags as in the `gh` and git documentation — recommend
     a spot check with `gh repo create --help` once)
   - the course `.gitignore` gets `lia-templates/{id}/`; if the course repository already tracks the
     folder, the next course commit (`:manage-git`) removes it from the index with
     `git rm -r --cached lia-templates/{id}`
   - the import changes of step 3 (every file and line, old → new) and the `templates.local.json` entry of
     step 4
   Cancel: nothing is written or run.
3. **Publish and switch the imports.** On confirmation, in this order: (1) the README edits of the plan —
   documentation in English, `version:` set — with the file-edit tool; (2) then the commands of step 2,
   each on its own, starting with `gh auth status` and `git init`, so that `git add` / `git commit` already
   carry the edited README; on any error stop, report it and change nothing in the journal or the
   materials. Once the tag is pushed,
   switch every import of the template to `https://raw.githubusercontent.com/{owner}/{repo}/{tag}/README.md`:
   the journal header (`import: ./lia-templates/{id}/README.md`), the entry in `## Templates`
   (`__Import:__`, `__Header entry:__`, and `__Source:__ https://github.com/{owner}/{repo}@{tag}`) and in
   **every** material that imports it (multi-file `../../lia-templates/{id}/README.md`, single-file the root
   `README.md` with `./lia-templates/{id}/README.md`). One write per file
   (`node specs/dashboard/localize-journal.mjs <map.json> [<file>]`, `data/chat-dialog.md` → Changing another
   section); then `node specs/dashboard/validate-journal.mjs` and
   `node specs/dashboard/check-material.mjs <material file>` for each changed material (the macros must
   still render from the new import). Add `lia-templates/{id}/` to the course `.gitignore`.
4. **Project list.** Switch the entry `{id}` in `templates.local.json` — written by `:develop-template` with
   the local import `./lia-templates/{id}/README.md` — with the file-edit tool: `import` becomes the raw URL
   of step 3, and it gets `repo` (`https://github.com/{owner}/{repo}`), `demo`
   (`https://liascript.github.io/course/?{import}`) and `shared: "not-offered"`; `status` stays `"own"`.
   If the entry is missing, create it (and the file as `{ "version": 1, "templates": [ … ] }`) with `id`,
   `name`, `description` (English), `subjects` and `audiences` (from `## Course Context`), `macros` (from the
   README) and the fields above. Never `status: "checked"` in `templates.local.json`.
5. **Shared list?** Ask whether the entry may be offered to the shared list of the Teaching-Agent: 🎛️ "Yes,
   offer it" / "No" (translated). "No" → `shared: "declined"`. "Yes" → prepare a pull request to the
   Teaching-Agent repository (`https://github.com/LiaScript/teaching-agent`) with its **own** terminal
   confirmation: show the entry for the shared list — the project entry without `shared`, with
   `status: "checked"` and `checked` = the date of the author's own check (`node specs/dashboard/now.mjs`),
   so that the shared list's check passes — and the pull request text, which asks the maintainers to
   re-verify the import, the macros and the demo against the template's README before merging; then the
   commands, each on its own: `gh repo fork LiaScript/teaching-agent --clone=false`,
   `gh repo clone {user}/teaching-agent .cache/catalog-pr`, a branch `add-template-{id}` there, the entry
   added to `.cache/catalog-pr/specs/catalog/templates.json`, commit, push,
   `gh pr create --repo LiaScript/teaching-agent --head {user}:add-template-{id}`, and afterwards (also
   after an error) `rm -r .cache/catalog-pr` — the clone is never left in the course project. Before the
   clone, the course `.gitignore` gets `.cache/` if it lacks it, so the clone can never become a gitlink of
   the course repository (part of this plan). Pull request opened →
   `shared: "pull-request"`; confirmed but not opened (cancelled, error) → `shared: "offered"`. `checked`
   exists only in the pull request's entry — the project entry in `templates.local.json` stays
   `status: "own"` — and this project's own `specs/catalog/templates.json` is never written.
6. **Later changes.** With `__Source:__ https://github.com/{owner}/{repo}@{tag}` the template is developed
   further in `lia-templates/{id}/` (its own repository) and tried in the course preview. Publishing a
   change: plan and confirm in the terminal as in step 2 — raise `version:` in the README, then
   `git -C lia-templates/{id} add -A`, `git -C lia-templates/{id} commit -m "{message}"`,
   `git -C lia-templates/{id} push`, `git -C lia-templates/{id} tag {new tag}`,
   `git -C lia-templates/{id} push origin {new tag}` — and switch every import as in step 3 (header,
   `## Templates` with `__Source:__`, **every** material) plus `import` and `demo` in `templates.local.json`
   to the new tag. Find the files by the old tag's URL, not by the local path:
   `node specs/dashboard/find.mjs "raw.githubusercontent.com/{owner}/{repo}/" journal.md materials`
   (owner and repository from `__Source:__`; single-file `… journal.md README.md`) — every hit with the old
   `{tag}` becomes `{new tag}`. The decision of step 1 is not asked again.
   No submodule, no subtree, and no clone of the template outside the project.
7. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` →
   `## Dashboard` in place. **Finish:** a short summary (repository, tag, which files import the new URL,
   the shared-list state) and 1–3 next steps — `:update-project` to publish the course with the new
   imports, or `agent:teaching/switch`.

## Notes

- This task writes only: the files and the git repository in `lia-templates/{id}/` (documentation, `version:`), the `import:` lines of the journal header, of the entry in `## Templates` (`__Import:__`, `__Header entry:__`) and of the materials, the entry's `__Source:__`, the entry `{id}` in `templates.local.json` (`import`, `repo`, `demo`, `shared`), the course `.gitignore` (`lia-templates/{id}/`, `.cache/`), the temporary clone in `.cache/catalog-pr/` of step 5 (removed after the pull request), and `journal.md` → `## Dashboard` (through `tasks/update-dashboard.md`).
- Every git and `gh` command runs only after the confirmation in the terminal, each on its own, inside the project.
- Never write to `specs/catalog/templates.json` of this project; it is replaced on every update of the Teaching-Agent.
