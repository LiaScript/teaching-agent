# Task: create-image

## Purpose

Generates a detailed image prompt for course materials based on a user description, aligned with the visual style guide.
Creates professional, actionable prompts for AI image generators that maintain visual consistency with the course identity.
It is also the **image step of a unit**: it works through the image spots `:coauthor-materials` recorded as `wanted` entries — prompts for `generated`, a bounded search in free photo collections for `free-photo` (see "Free photos" below), and a request for the file for `own`.

## Command

`:create-image {number?} {description?}` — `{number}` identifies the target session; `{description}` is what should be visualized.

- If `{number}` is omitted and exactly **one** session exists in `journal.md` → `## Sessions`, use that session without asking.
- If `{number}` is omitted and **multiple** sessions exist, ask which session the image belongs to (numbered list).
- **Without `{description}`** (the unit's image step, e.g. `agent:artist/create-image?number=3`): work through every **open** entry of that session's `#### Images` block (`__Status:__` `wanted`, `candidate`, `selected` or `prompt-ready`), grouped by `__Source:__` — `generated` → steps 1–13 per entry (the entry's description is the user description); `free-photo` → "Free photos"; `own` → ask the instructor for the file, then insert it as in "Free photos" step 6. An entry that is already `prompt-ready` has its prompt: run `tasks/generate-image.md {image-slug}` for it (single mode, its own confirmations); without an image route (its Phase 0 "Neither"), show its prompt and offer, in one form, `own` (the instructor supplies the picture) or "without a picture" ("Free photos" step 7) — the entry stays open until one of them is done. If no open entry exists, ask what should be visualized.
  If the unit's material has image markers (visible placeholders or `<!--- image: … --->` comments) without a matching `#### Images` entry — material written before image spots existed — first create one `wanted` entry per marker (page title and role from the material, description from the marker or the chat, never the answer term) and show them as one list; then work through them. These entries may be saved together with the first batch's save confirmation instead of a separate save. In the same material write, rewrite every remaining old marker to the current form (`<!--- image: {image-slug} — {description} --->` + visible marker, step 12) so that "Free photos" step 6 finds it by its slug.
  Candidates from an earlier search (a cache file, an earlier sitting) count only after the look and licence check of this run (Free photos step 3), and are recorded with their origin ("from an earlier search", translated).

## Inputs

- User description: what should be visualized (provided as command parameter)
- Target session: `{number}` → the matching `### {number}. {title}` subsection in `journal.md` → `## Sessions`
- Image style guidelines from `journal.md` → `## Visual Identity` (`__Course Image Generation Guidelines:__` bullet)
- Website color palette from `journal.md` → `## Visual Identity` (`__Website Color Palette:__` bullet)
- Course context from `journal.md` → `## Outline` (`__Abstract:__` bullet) (for thematic alignment)
- Course language from `journal.md` → `## Course Context` (Language field — for in-image text language)
- File Structure mode from `journal.md` → `## Course Context` → `__File Structure:__` (see `data/file-structure-modes.md`) — determines the asset path saved in `__File:__` below
- Specs to re-read completely for the image step (Handling step 5 of `data/agent-links.md` counts them as named templates): `templates/session-skeleton.yaml` (entry order, status words, summary rule) and `data/file-structure-modes.md` → "Creating the material document" (markers, credits chapter)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/chat-checks.md`, `data/journal-links.md`

## Output

- A detailed image prompt (displayed as formatted text)
- Always saved as a `<section>` entry inside the target session's `#### Images` block in `journal.md` → `## Sessions` → `### {number}. {title}` (the `#### Images` block is created automatically if it does not exist)

## Steps

0. If `## Visual Identity` has no image guidelines yet: use a neutral style that fits the target group and the course language, say so in one line, note `style: neutral – no visual identity yet` in the prompt entry, and offer `:create-visuals` once. Never stop `:build-session` for this.
1. Receive user description of what should be visualized.
2. Read image style guidelines from `journal.md` → `## Visual Identity` (`__Course Image Generation Guidelines:__` bullet).
3. Read color palette from `journal.md` → `## Visual Identity` (`__Website Color Palette:__` bullet).
4. Read course theme from `journal.md` → `## Outline` (`__Abstract:__` bullet) for context.
5. Read course language from `journal.md` → `## Course Context` (Language field, e.g., `de`, `en`). If `journal.md` → `## Course Context` is unavailable, infer the language from the user's description as fallback.
6. Analyze user description and extract:
   - Main subject/concept
   - Required elements or details
   - Intended use (diagram, illustration, header, etc.)
7. Combine user description with style guide parameters:
   - Visual style (photorealistic, illustrated, flat, etc.)
   - Color scheme (using palette from style guide)
   - Composition approach
   - Lighting and mood
   - Educational context
   - **In-image text language:** if the image may contain any visible text (labels, headings, titles, UI elements, captions), explicitly specify in the prompt that all such text must be in the course language (e.g., `"All text visible in the image must be written in German."`)
8. Generate a detailed, actionable prompt.
9. Include accessibility considerations (alt text suggestion).
10. Present the prompt in a clear format.
11. Derive an `{image-slug}` from the description (kebab-case), unique across all units of the journal — if it is taken, append the unit number (`title-image-2`): in single-file mode all units share `assets/images/`, and `:generate-image {slug}` looks the slug up in every unit.
12. Save into the target session's `#### Images` block — always, without asking:
    - Locate the `### {number}. {title}` subsection in `journal.md` → `## Sessions`.
    - If it has no `#### Images` block, create one after the References field and after the validation report if one exists (before `#### Persona Reviews` if present; `templates/session-skeleton.yaml` → `section_layout.entry_order`).
    - Append a new `<section>` entry using the **Journal Entry Format** below. If a `<section>` with the same `#### {image-slug}` already exists (e.g. a `wanted` spot), replace it, keep its `__Place:__` line and set `__Source:__` to the source used now (e.g. `generated` after "none of them"); its marker in the material stays as it is.
    - Confirm: "Prompt saved: `journal.md` → `## Sessions` → `### {number}. {title}` → `#### Images` → `{image-slug}`"
    - **Mark the spot in the material** (only with an image route, see `tasks/generate-image.md` Phase 0; without one — e.g. called by `:build-session` without an image tool or browser — set `__Status:__ prompt-only` and place no marker; **if a marker is already in the material** (a spot `:coauthor-materials` recorded), the status is `prompt-ready` instead, never `prompt-only`: learners see "Image follows", so the entry stays open and the image step with it — the instructor generates it elsewhere, supplies it (`own`) or decides "without a picture" ("Free photos" step 7)): if the session's material document exists, put a visible marker where the image belongs — only `> 🖼️ _{"Image follows", translated}_`, never the alt text or description — with `<!--- image: {image-slug} — {description} --->` (an authoring note: LiaScript ignores `<!--- … --->`, while a plain `<!-- … -->` would be read as attributes or narration) on the line above it — so learners never see a broken image and the marker never gives away an answer. Inside a quiz option use the inline form `🖼️ _{"Image follows", translated}_` plus a neutral distinguishing word ("picture 1", "picture 2", translated) — such a question is not solvable until the image is in (`tasks/coauthor-materials.md` step 6). If the document does not exist yet, the task that creates it places the marker (`data/file-structure-modes.md` → "Creating the material document").
13. Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

## Output Format

The image prompt should follow this structure:

```
Image Prompt: [Brief Title]
============================

Description: [User's original description]
Context: [Course theme alignment]
Intended Use: [Diagram/Illustration/Header/etc.]

Visual Parameters:
- Style: [from style guide]
- Color scheme: [specific colors from palette]
- Composition: [layout approach]
- Lighting: [lighting style]
- Mood: [atmosphere]
- In-image text language: [language from `journal.md` → `## Course Context`, e.g., "German" / "English"]

Complete Prompt:
"[Full detailed prompt ready for image generator. If the image contains visible text, end with: 'All text visible in the image (labels, headings, UI elements) must be written in [language].']" 

Accessibility:
Alt text suggestion: "[Descriptive alt text for the image]"

Technical Specifications:
- Aspect ratio: [16:9/4:3/1:1/custom]
- Format: PNG/JPG/SVG
- Usage: [Slide/Handout/Web/etc.]
```

## Journal Entry Format

Each image is stored as one `<section>` inside the session's `#### Images` block. The image is embedded only once it exists (status `generated`) — before that an `![…]` line would show a broken image.

The `{image-slug}` here (derived from the image description) is independent of the session's own folder slug — do not confuse the two (see `data/file-structure-modes.md`).

Resolve `{path}` from `journal.md` → `## Course Context` → `__File Structure:__`:
- **single-file:** `assets/images/{image-slug}.png`
- **multi-file:** `materials/{number}-{slug}/assets/images/{image-slug}.png` (this session's own folder)

```markdown
#### Images

<section>

#### {image-slug}

* __File:__ {path}
* __Status:__ prompt-ready
* __Alt text:__ {descriptive alt text}
* __Prompt:__
  "{full detailed prompt ready for image generator}"

{{only once the image exists (status `generated`): ![{alt text}]({path}) — never for `prompt-ready` / `prompt-only`, it would show a broken image}}

</section>
```

- `__Status:__` starts as `prompt-ready` (a marker is in the material — placed now or already there) or `prompt-only` (no image route when created and no marker in the material: nothing waits for it, never a deferral); `:generate-image` flips it to `generated` after saving the PNG.
- One `<section>` per image; multiple images stack under the same `#### Images` block.
- `:generate-image` saves to the exact `{path}` recorded here — it does not re-derive the path independently.

**Image spots (`wanted`)** — written by `:coauthor-materials` with its save confirmation, before any image exists:

```markdown
<section>

#### {image-slug}

* __Status:__ wanted
* __Source:__ free-photo | generated | own
* __Place:__ {page title} – {role, e.g. "option 2 of the self-check"}
* __Description:__ {what is visible — never the answer term}
* __Search terms:__ {terms for a photo collection, usually English}

</section>
```

Status flow per source — `generated`: `wanted` → `prompt-ready` / `prompt-only` → `generated` (this task, then `:generate-image`); `free-photo`: `wanted` → `candidate` → `selected` → `inserted` ("Free photos" below); `own`: `wanted` → `inserted` once the instructor's file is in. An entry is **open** while its status is `wanted`, `candidate`, `selected` or `prompt-ready`; open entries make the unit's image step (`tasks/update-dashboard.md` step 4).

- **To-dos for one image** (e.g. "replace with a smaller crop", "check on the target device") go as `* __To do:__ …` into that entry and into the `next` of the unit's image step — never into the unit's summary (`templates/session-skeleton.yaml` → summary).
- **Compact once inserted:** an `inserted` entry keeps only `__Status:__`, `__Source:__`, `__Place:__`, `__File:__`, `__Alt text:__`, `__Author:__`, `__License:__`, `__Page:__` (and an open `__To do:__`) — drop `__Description:__`, `__Search terms:__` and `__Candidates:__`. Exception: a photo the agent chose itself in `:build-session` keeps its other looked-at candidates under `__Candidates:__` until the instructor has seen the unit, so it can be swapped without a new search. All `inserted` entries of a unit stand together at the end of its `#### Images` block inside one `<details><summary>{n} images inserted</summary>` (translated); open entries stay above it, in full.
- **Link targets** in `__File:__`, `__Page:__` and `__Candidates:__` are percent-encoded like every Markdown link target (`data/liascript-cheat-sheet.md` → Link targets): `(` → `%28`, `)` → `%29`, space → `%20`; a page is written as `[label](encoded URL)`, never as a bare URL.

## Free photos

For entries with `__Source:__ free-photo`. Bounded, in the foreground, and the instructor chooses — inside `:build-session` the instructor decides once at the start whether the agent chooses (the instructor can swap later) or only collects candidates (`tasks/build-session.md` → Before the start, step 1b); then step 5 is replaced by that choice.

1. **Announce honestly:** about 1 minute per spot (each candidate is looked at and its licence read from its own file data). With more than 5 spots work in batches of up to 5 — first the images that tasks and self-checks depend on — and name the batch and its time ("5 pictures for the tasks first, about 5 minutes", translated). Send a status per spot; when the announced time is over, a status with a new estimate.
2. **Run it yourself, in the foreground:** never hand the search to a background agent the instructor waits for, and never end the turn while it runs (`data/agent-links.md` → Never end a turn on a promise).
3. **Search** free collections with the entry's search terms — Wikimedia Commons first: `fetch-thumb.mjs` and the insert of step 6 work with Commons only; a candidate from another collection (e.g. Openverse) is looked at with the environment's own fetch route or marked `(not looked at)`. Per spot at most **3 candidates**. Only licences that allow use in a public course: public domain, CC0, CC BY, CC BY-SA (never NC or ND unless the instructor decides so).
   - **Look at every candidate before you show it:** run `node specs/dashboard/fetch-thumb.mjs <file page URL | file name>` (on its own; it stores a thumbnail of at most 500 px in `.cache/thumbs/` and prints author, licence, licence URL and the encoded direct file URL), then open the thumbnail with the file-reading tool. Another route of the environment that stores the image locally (a fetch tool, then the file-reading tool) is fine too; a thumbnail URL with a non-standard width fails (Wikimedia: only standard widths such as 330 or 500).
   - **Check what the spot needs:** the subject is large enough and easy to find for the target group, it shows what the description says, and nothing in it contradicts the material or gives away the answer of a question.
   - **Licence from the file data:** take author and licence **verbatim** from the script output or from the candidate's own file page — never from a search summary, never from a summarizing fetch prompt.
   - **If a candidate cannot be looked at:** say so before the first batch in one line ("I could not look at the photos myself", translated), label every unseen candidate `(not looked at)` in the chat and in `__Candidates:__`, and show 2–3 candidates per spot instead of one. Never claim or imply that you looked at a photo you did not open (`data/chat-checks.md` → Say how you checked).
   - No suitable candidate after about 2 minutes: mark the spot "none found" and move on.
   - **Texts match the chosen photo:** after choosing, re-read the page's texts, the question and its hints against the photo — every colour, number, position or detail they name is what the photo shows (its alt text); change the sentence, not the facts, in the same write as the insert.
4. **Record** the candidates in the entry (`__Status:__ candidate`, one line each under `__Candidates:__`: `[title](encoded file page) – author – licence`, plus `(not looked at)` or the origin of an earlier search where it applies) — written after the instructor's go in the chat (tier "confirm in chat"), once per batch.
5. **Let the instructor choose** in the chat: show the candidates of a spot as images (with author and licence; image targets percent-encoded, `data/liascript-cheat-sheet.md` → Link targets) and ask with a form per spot, at most 4 spots per form; "none of them" offers `generated` or `own` for that spot. A chosen candidate → `__Status:__ selected`.
6. **Insert:** `__File:__` = the encoded direct file URL (from the script output or the file page) with a **standard thumbnail width** of the collection (no download — the course loads the photo from the collection; if the instructor wants local copies, the instructor saves them into the asset folder of `data/file-structure-modes.md` and `__File:__` becomes that path). Wikimedia: `…/Special:FilePath/{encoded file name}?width=330` for answer options and small pictures, `?width=500` for page photos — other widths are rounded up to a large file or rejected. Add `__Alt text:__` (what is visible, never the answer term), `__Author:__`, `__License:__` (with link) and `__Page:__` (`[label](encoded file page)`) to the entry, replace the marker `<!--- image: {image-slug} … --->` + `> 🖼️ _…_` in the material with `![{alt text}]({file})`, and add the credit to the material's credits chapter ("Image credits", translated: one line per image — what it shows, author, licence with link, file page), a back-matter chapter that stays last, at the heading level of the material's units (`##`; `data/file-structure-modes.md` → "Creating the material document"). Then `__Status:__ inserted`. All inserts of one batch go into one write per file (`data/chat-dialog.md` → Changing another section): **one replacement map** for every marker, credit line and changed sentence of the material (`node specs/dashboard/localize-journal.mjs <map.json> <material file>`), and one write for the image entries and status line of the journal — never one edit per marker. In the map, each marker is **one block pair** — its slug comment and the visible line below it, `["<!--- image: {image-slug} — {description} --->\n> 🖼️ _…_", "![{alt text}]({file})…"]` — because the visible line alone repeats at every spot; a marker inside a quiz option is its option line. Credits: when the credits chapter exists, one pair that replaces its last credit line by that line plus the new ones; when it does not exist yet, `"append"` with the chapter heading (at the heading level of the material's chapters) and its lines. Announce "one write" only when the route really gives it.
   - **Encode every link target** (material, journal, chat): `(` → `%28`, `)` → `%29`, space → `%20` — LiaScript cuts a target at the first unencoded `(` (`data/liascript-cheat-sheet.md` → Link targets).
   - **Display size:** images that are answer options of one question get a display limit directly after the image, `![{alt text}]({file})<!-- style="max-height: 30vh" -->` (for wide images also `width: 30%`), so that the question and all its image options fit one screen of the target device; a page photo gets `<!-- style="max-height: 50vh" -->` when it would push the text off the screen (`data/liascript-cheat-sheet.md` §5).
   - **Credit lines never reveal an answer:** the credit line of an image used in a question names its place and what is visible — the same text as its alt text ("picture 3 of the self-check: a leaf with jagged edges", translated) — never the answer term. The credits chapter can be reached by paging on.
   - **Status line:** in the same journal write, rewrite the unit's status line and its Notes cell (`templates/session-skeleton.yaml` → `section_layout.overview`): "material written · images {n} of {m}" while entries are still open, "material written · check open" once none is open.
7. Spots marked "none found" stay `wanted` with `* __To do:__ none found ({date}) — decide: generated, own or without a picture` (translated) in their entry, so the next run does not search again from the start, and are listed in the completion message with the offer `generated` or `own`. **A spot left without image:** no learner text may refer to a picture that is not there ("look at the photo") — offer the text change together with the decision (`generated`, `own`, or "without a picture: the sentence becomes …", translated); a question that depends on the picture stays unsolvable until it is in.
8. **Finish:** run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml`; when no image entry of the unit is open any more, offer the Dashboard's `next` (the unit's check) — the Artist hands back for it (`agents/artist-agent.yaml` → suggest_back_to_teaching_when).

## Special Features

- Suggests diagram alternatives (Mermaid, ASCII art) if appropriate
- Alt texts, descriptions, captions and credit lines of an image used in a question never name the answer term — describe what is visible
- Offers multiple prompt variations for different styles
- Can generate prompts for image series (maintaining consistency)
- Considers educational context and pedagogical goals

## Usage

This task is invoked when:
- Running a unit's image step: the `wanted` entries recorded by `:coauthor-materials` (without `{description}`)
- Creating images for lecture materials (`:coauthor-materials` suggests the Artist-Agent; it never searches images itself)
- Designing diagrams or illustrations
- Generating visual aids for specific concepts
- Creating consistent imagery across sessions
