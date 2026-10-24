# Chat Rules: Naming a Check

Part of the agent rules of `data/agent-links.md` (Chat Conduct → Rule sheets). They apply whenever the dialog
runs in the preview chat, and wherever a task names them also in the terminal. Write in the course language
(`## Course Context` → Language). Read completely by the check and correction tasks (their Inputs name this sheet).

- **Say how you checked:** never write "checked" or "tested" without the kind
  of check: *read in the documentation* (a page you opened), *search result
  only* (a search summary — never "looked up"), *rendered without errors* (a check
  script), *looked at* (an image opened with the file-reading tool — never for
  a photo known only from its title or file data), *read as an extract* (a
  fetch tool that returns a quoted or summarized excerpt of a page — counts as
  a source, but is named so, never "read myself"), or *tried with answers*. A reference is listed only if its page itself
  was opened (in full, or as a named extract); a search summary is never a source. The rendered check is
  `node specs/dashboard/check-material.mjs <material file> [--viewport WxH]` (on its own;
  `--viewport` with the window size of the learners' device when the target group names one, e.g.
  a tablet upright `--viewport 768x1024`; it prints slides, quizzes, read-aloud buttons, missing images
  and errors) — if it cannot start, say so in one line. Claims about what learners see (buttons,
  feedback, solutions) count as *tried* only after a check that clicks.
  **Layout and devices:** a claim about what fits a screen or how a page looks
  on a device names the measured window from the check script's viewport
  report ("measured at 810×1080 portrait", translated). Without such a
  measurement say that it is not measured, ask the instructor to look at it on
  the learners' device, and add a preparation item. The check script opens a
  desktop browser window at the listed sizes — never call it "like a tablet"
  or name a device it did not run on. A missing warning is no proof that
  something fits; never promise a fit before the change is measured.
  Statements about where learners' data goes depend on the publishing path
  (web page: stays in the browser; learning-platform package: results may go
  to the platform) — name the path, never state one as universal.

## Offering the Rendered Check (Playwright)

The wording of this section is canonical; tasks that run `check-material.mjs` point here.

- **When:** only if the script prints "Rendered check not possible" with the reason
  "no installed Playwright found" or "Playwright has no browser of its own" — not for
  every exit code 2 (a system Chrome/Chromium makes the check run without any install).
- **Offer once per conversation** (tier confirm in terminal, also when the dialog runs in
  the preview chat — post a chat note that the confirmation waits in the terminal):
  `npm i -D playwright`, then `npx playwright install chromium` (about 150 MB). Without a
  `package.json` run `npm init -y` first; add `node_modules/` to the `.gitignore`.
- **Never run** a step with `sudo` or `--with-deps` — only name it.
- **Declined** (or no shell): do not ask again in this conversation; say in one line what
  was checked instead, as before.
- **`build-session`** runs on its own, so it asks once in the terminal **before** the run.
