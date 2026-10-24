# Task: open-chat

## Purpose

Opens the chat of the LiaScript DevServer preview so the instructor can talk to
the agent in the browser: opens the preview if no browser is connected, connects
this session to the browser (roster, events, saved chat) and posts one short
greeting with the next step. Used when the instructor asks for the chat or
works in the terminal and wants to move to the browser.

## Command

`:open-chat`

## Inputs

- `journal.md` → header `language:`, `## Course Context`, the Dashboard `next`
  (read with the file-reading tool).
- `data/agent-links.md` (core: MCP gate, Agent Roster, Chat Offers) and
  `data/chat-wording.md`, read once per session as the re-read rule says.

## Steps

1. **MCP gate closed** (the `liascript` tools `get_state`, `goto` and `chat` are
   not available, `data/agent-links.md` → MCP Gate): say in the terminal that
   the chat needs the LiaScript DevServer with `--mcp` and how to connect it
   (`data/agent-links.md` → MCP Gate → Setup for the instructor). Do not start
   a server yourself. Stop.
2. **Browser:** call `get_state`. If no browser is connected (`connected: false`),
   open the preview in the instructor's own browser: call `goto` with
   `file: journal.md` — without a connected browser it opens the instructor's
   default browser. Do not open it in a browser-automation window instead: the
   instructor would not see it as their browser. Then call `get_state` again; if
   `connected` is still `false`, give `get_state.url` in the terminal as the link
   to open, and stop. An explicit `:open-chat` is the instructor's request, so
   this also applies after a `connection` event with `connected: false`.
3. **Connect this session** — only the parts of the start order of
   `CLAUDE.md` → Agent Links that have not run in this session yet: `set_agent`
   with the roster (`data/agent-links.md` → Agent Roster), the event
   subscription, `read_chat`. An open message or form in `read_chat` is answered
   first; then skip step 4.
4. **Greeting:** post one `chat` message, signed by the active agent, in the
   course language: one sentence that the chat is open, plus exactly the
   Dashboard's next action as the one way to start (`data/chat-wording.md` →
   First contact, One way to start). A `chat` message also unfolds a collapsed
   chat; `get_state.chat` only says that a chat exists, not that it is unfolded.
5. Say in the terminal in one line that the chat is open in the browser.

## Rules

- Navigation and connection only: never writes `journal.md` or material files.
- Command of every agent, like `preview`: it runs in the active persona and
  never switches the agent (`data/agent-links.md` → URI Convention).
- Never start a second event subscription; never open a second preview tab
  when a browser is connected (`get_state.connected`).
