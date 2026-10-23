# Task: preview

## Purpose

Shows a course file in the LiaScript DevServer preview — a session's material,
the root `README.md`, or `journal.md` itself. Used by the `👁` links in the
Dashboard, in the session action lines and in the chat offers of every agent
(see `data/agent-links.md`).

## Command

`:preview {file?} {slide?}`

## Inputs

- `file` (optional) — path relative to the project root, e.g.
  `materials/3-first-words/README.md`. Default: `journal.md`.
- `slide` (optional) — 1-based slide number, as in `#n` of the preview URL.
- A session number is also accepted as `file` (e.g. `3`): resolve it to the
  session's material document via `journal.md` → `## Course Context` →
  `__File Structure:__` (see `data/file-structure-modes.md`). In single-file
  mode this is root `README.md` plus the slide of the session's `##` chapter.

## Steps

1. Resolve `file` (and `slide`) as described above. The path must stay inside
   the project root and end in `.md`; otherwise stop and say why.
2. If the file does not exist yet, say so and offer the command that creates it
   (`:coauthor-materials {number}`; once a unit has been worked out together and
   approved, also `:build-session {number}`) — as an `agent:` link in the chat
   when the MCP gate is open.
3. **MCP gate open** (`liascript` tools available, see `data/agent-links.md`):
   - Call `get_state`. If a browser is connected, use it; otherwise follow the
     server's instructions for opening the preview.
   - Call `goto` with `file` and, if given, `slide`.
   - **Back to the journal** (no `file`): when `get_state.title` shows the overview
     (the Dashboard or the course title of slide 1), say only "Here is the
     overview again." (translated), without a link; offer the anchor link only
     when the target cannot be confirmed and is not the overview
     (`data/chat-wording.md` → Point, don't describe).
   - Otherwise post one chat line with a link back, named after the active agent:
     `[👁 Back to the journal](agent:{active agent}/preview) `:preview``
     (e.g. `agent:artist/preview` while the Artist works).
4. **MCP gate closed:** tell the instructor how to open the file:
   `liadev --live -i {file}` (LiaScript DevServer), or the VS Code LiaScript
   preview. Do not start a server yourself.

## Rules

- Read-only: never modify files.
- Never open files outside the project root.
- Navigation command of every agent (`data/agent-links.md` → URI Convention):
  it runs in the active persona and never switches the agent; a task that is
  running (e.g. between two image batches) continues afterwards.
