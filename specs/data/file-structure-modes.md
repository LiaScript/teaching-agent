# File Structure Modes

> Read this before resolving any material or asset path. Referenced by `:init-course`, `:scaffold`, `:create-session`, `:promote-session`, `:coauthor-materials`, `:quick-fix`, `:validate-course`, `:create-project`, `:update-project`, `:analyze-existing`, `:review-as-persona`, `:create-image`, and `:generate-image`.

Every course runs in exactly one **File Structure** mode, recorded in `journal.md` → `## Course Context` → `__File Structure:__`. Tasks that read or write a material or asset path must resolve it from the active mode below — never hardcode a path shape inline.

## single-file

The entire course is one LiaScript document.

- Course content: `/README.md` (project root). Every session/unit is a `##` chapter inside this one file — not a separate file.
- If a unit's title equals the course title (typical for a single lesson), give the chapter its own title (e.g. "Lesson: …", translated) — two equal headings share one anchor, and links would jump to the wrong one.
- Assets: `/assets/images/`, `/assets/videos/`, etc. — project root, shared across the whole course.
- No `materials/` folder is created.
- Typical for: `single-lesson`, or any course the instructor explicitly wants as one file.

## multi-file

Each session/unit is its own LiaScript document in its own folder.

- Course content: `materials/{number}-{slug}/README.md` — one folder per session.
- Assets: `materials/{number}-{slug}/assets/images/`, `materials/{number}-{slug}/assets/videos/`, etc. — scoped to that session, not shared with others.
- `{slug}` is a kebab-case slug derived from the session title: lowercase, strip punctuation, spaces → hyphens, keep the first ~5 words if the title is long (e.g. "Are You in Scope? Essential vs. Important Entities" → `are-you-in-scope-essential-vs-important`). Umlauts and ß are transliterated (ä→ae, ö→oe, ü→ue, ß→ss); only punctuation is dropped, no filler words; keep the first ~5 words.
- **Compute the slug once**, when the material path is first recorded — in the technical table of `## Agenda` if an agenda exists, otherwise when the material document is first created. Every later task reuses the recorded path. If the session title changes afterward, do not silently rename the folder — flag the mismatch and ask before renaming, since links and assets may reference the existing path.
- Typical for: `lecture-series`, `self-paced`, `workshop`, or any course with multiple sessions.

## Creating the material document

The same rules apply to every task that creates a session's material document — `:promote-session` (generated material) and `:coauthor-materials` (material worked out in the dialog):

1. **Path:** reuse the path recorded in the technical table of `## Agenda` if there is one; otherwise derive it as above (multi-file: `materials/{number}-{slug}/README.md`, the `assets/` subfolder only on demand; single-file: the `##` chapter for this session inside root `/README.md`, chapters in session-number order; back-matter chapters (image credits, glossary) stay last — a new unit chapter is inserted before them).
2. **Metadata header** (multi-file: the new file's own header; single-file: the shared root `README.md` header, each line only if not already present): `author:` from `## Course Context` → Conventions → Author, `email:` from Conventions → Contact if set, `version: 0.1.0` for a new document, `language:` from the course language, `narrator:` a voice for that language (e.g. `Deutsch Female`, `UK English Female`), the `__LiaScript Theme:__` block from `## Visual Identity` if present, and one `import: {url}` line per macro template from `## Templates` the material uses. **Local templates** (`./lia-templates/{id}/README.md` in `## Templates` and the journal header) are imported relative to the material: multi-file `materials/{n}-{slug}/README.md` → `import: ../../lia-templates/{id}/README.md`; single-file root `README.md` → `import: ./lia-templates/{id}/README.md`. A brief `### {id} (in development)` has no import yet — nothing is copied for it.
3. **Images:** for every entry in the session's `#### Images` block, put the neutral marker of `tasks/create-image.md` step 12 (open entries: `wanted`, `candidate`, `selected`, `prompt-ready`) or the image itself (`generated`, `inserted`) at the place it belongs; entries with status `prompt-only` get nothing. Image credits go into the back-matter chapter of `tasks/create-image.md` → Free photos; learners can page on to it, so the credit line of an image used in a question repeats its alt text (what is visible) and never names the answer. Old markers without a slug are rewritten to the current form in the same write (`tasks/create-image.md` → Command).
4. **Title slide (single-file, first unit):** under the `#` course title, a short introduction for the learners — 2–3 sentences: what it is about, what they will be able to do, how to start — in the learners' address and readable aloud; never an empty slide. The unit's own `##` chapter slide then starts the lesson: what we do today, in a few steps — not a second introduction.
5. **Overview:** set Material ✅ for the session and rewrite its status line in the same write (`templates/session-skeleton.yaml` → `section_layout.overview`).

## Default by course type

| Course type | Default mode |
|---|---|
| single-lesson | single-file |
| lecture-series | multi-file |
| self-paced | multi-file |
| workshop | multi-file |
| improve-existing | detected from the existing project (see `:analyze-existing`) |

`:init-course` and `:scaffold` ask the file structure as a teacher question (`tasks/init-course.md` step 6); this default is the proposed answer. It can be changed any time by editing `journal.md` → `## Course Context` → `__File Structure:__`. Structural tasks re-read the field on every run — changing the field alone does not migrate already-existing files (see "Changing mode later").

## Resolving paths

| Task | single-file target | multi-file target |
|---|---|---|
| `:promote-session`, `:coauthor-materials`, `:quick-fix`, `:validate-course` (session mode) | the `##` chapter matching this session inside root `/README.md` | `materials/{number}-{slug}/README.md` |
| `:create-image` / `:generate-image` asset path | `assets/images/{image-slug}.png` (or `/videos/`) | `materials/{number}-{slug}/assets/images/{image-slug}.png` (or `/videos/`) |
| `:create-project` / `:update-project` | **not applicable** — see "Publishing" below | generates `project.yaml` with one `collection:` entry per `materials/{number}-{slug}/README.md` |
| `:analyze-existing` scan | root `README.md` with multiple `##` chapters, no `materials/` folder | `materials/*/README.md` folders |

Note: the **session-folder slug** (`{slug}` above, from the session title) and an **image slug** (from an image's description, used only for the filename) are independent — do not conflate them. A session folder never needs to be renamed when a new image is added to it.

## Publishing

Publishing looks fundamentally different in each mode — this is not just a path difference, it changes which commands even apply.

**single-file:** `:create-project` and `:update-project` run only their single-file branch — no `project.yaml`, no GitHub Actions workflow, no GitHub Pages step. The single `README.md` plus its `assets/` are pushed to GitHub via `:manage-git`, and the viewer link points to the raw file:

```
https://liascript.github.io/course/?https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md
```

(This URL pattern is a stable LiaScript convention — recommend the instructor spot-check it against https://liascript.github.io if anything about it looks off.) Never set up GitHub Pages for single-file mode, even as a convenience — a raw-content link is the whole point of this mode being lightweight.

**multi-file:** `:create-project` / `:update-project` apply as specced elsewhere — `project.yaml` aggregates every session's `README.md` as its own card, exported via the LiaScript `project` format and deployed to GitHub Pages (see `tasks/create-project.md`, `tasks/update-project.md`, and `data/liascript-workflows.md` Section 4).

## Changing mode later

Switching modes on an existing course (splitting one file into many, or merging many into one) is a structural migration, not an automatic effect of editing the field. If the instructor asks to switch:
1. Confirm the new mode and the consequences (file moves/merges) before touching anything.
2. Move, split, or merge the material files and their assets accordingly.
3. Update `journal.md` → `## Course Context` → `__File Structure:__` and any path references in `## Agenda` / `## Sessions` to match.
