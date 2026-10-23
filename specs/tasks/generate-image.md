# Task: generate-image

## Purpose

Executes saved image prompts stored in `journal.md` → `## Sessions` → `#### Images` blocks — with the agent's own image tool if it has one, otherwise via ChatGPT in the browser — in two modes:

- **Single mode** (`:generate-image {slug}`) — execute one specific image entry directly
- **Batch mode** (`:generate-image` without argument) — show mode selection, then process all pending prompts

To generate and save prompts first, use `:create-image`.

Which way is used is decided in Phase 0. Only the browser route needs the **chrome-devtools MCP server** and Chrome with remote debugging.

## Inputs

- **Single mode:** the `<section>` whose heading is `#### {slug}`, found in any session's `#### Images` block in `journal.md` → `## Sessions`
- **Batch mode:** all `<section>` image entries across every session's `#### Images` block (skips entries whose `__Status:__` is `generated` or whose file at `__File:__` already exists). Older journals use `__Datei:__` and `__Alt-Text:__` for the same fields — read them, and write `__File:__` / `__Alt text:__` when an entry is updated.
- The agent's own image tool, or Chrome DevTools MCP availability (checked in Phase 0)
- Course language from `journal.md` → `## Course Context` (safety-net: appended to prompt if no language instruction is already present)
- Rule sheets, read completely with this task (`data/agent-links.md` → Chat Conduct → Rule sheets): `data/chat-dialog.md`, `data/journal-links.md`

## Output

- Downloaded images saved to the exact path already recorded in that entry's `__File:__` field (written by `:create-image`, mode-resolved per `data/file-structure-modes.md` — do not re-derive independently)
- Confirmation per image; batch summary at the end

**Called from `:build-session` Step 3:** its single terminal confirmation covers all images of that run; skip the per-image and Start / Cancel confirmations below. Run only for the slugs it passes.

## Phase 0: Choose the route

Decide by the tools the running agent actually has — never by its name:

1. **Own image tool** — the agent has a built-in tool that turns a prompt into an image file (e.g. Codex). Use it: no browser, no ChatGPT window. Writes only inside the project, so it needs the normal chat confirmation (tier "confirm in chat" in `data/agent-links.md`; inside `:build-session` its start confirmation covers it). Without a slug, choose the mode as in Phase 1 step 4 (single or sequential batch; the automated batch is browser-only). Continue with Phase 2a/2b, then [Phase 3D](#phase-3d-own-image-tool).
2. **Browser route** — no own image tool, but the chrome-devtools MCP tools are available. Opens an external browser session, so it keeps the terminal confirmation. Continue with Phase 1.
3. **Neither** — explain both options in one short message (an agent with its own image tool, or the browser setup below) and stop. A `prompt-ready` entry stays open (its marker is in the material): show its prompt and offer, in one form, `own` (the instructor supplies the picture) or "without a picture" (`tasks/create-image.md` → Free photos step 7) — never send the instructor back to `:create-image` for it. New prompts without a marker are saved by `:create-image` as `prompt-only`.

Tool names differ per agent: the chrome-devtools tools are e.g. `mcp_chrome-devtools_list_pages` in VS Code and `mcp__…chrome-devtools__list_pages` in Claude Code — match by the tool name ending (`list_pages`, `resize_page`, `navigate_page`, `evaluate_script`).

---

## Phase 1: Browser route — entry point

Setup (once): Chrome with remote debugging, and the chrome-devtools MCP server configured in the agent's MCP settings (VS Code `mcp.json`, Claude Code `.mcp.json` or plugin, Codex `config.toml`):

```bash
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
```

1. The chrome-devtools tools are available (Phase 0, route 2).

2. Check if Chrome is already running with remote debugging by calling `list_pages`.
   - **Fails or returns empty** → start Chrome in the background:
     ```bash
     google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug &
     ```
     Wait ~3 seconds, then retry `list_pages` to confirm connection. Starting Chrome is part of the terminal-confirmed browser route.
     If it still fails: inform the instructor and stop.
   - **Succeeds** → continue.

3. Resize the browser viewport: use `resize_page` → width: 1280, height: 900.
   This ensures stop-button and send-button are rendered (they may be hidden on narrow viewports).

4. Determine mode:
   - **Slug provided** → skip to [Single Mode (Phase 2a)](#phase-2a-single-mode).
   - **No argument** → 🎛️ ask with structured question (single choice):
     - **Single** — enter a slug to execute one prompt
     - **Sequential batch** — process all pending prompts one by one, agent controls each step
     - **Automated batch** — inject a JS loop into the browser, runs fully unattended (browser route only)

---

## Phase 2a: Single Mode

3. Find the `<section>` whose heading is `#### {slug}` inside a `#### Images` block in `journal.md` → `## Sessions`.
4. Extract the `__Prompt:__` value (the quoted string).
5. Execute (Phase 3 → 4 → 5 below), then stop.

---

## Phase 2b: Batch Mode — Collect Queue

3. Scan every session's `#### Images` block in `journal.md` → `## Sessions` for `<section>` image entries.
4. Read the slug and target path per entry from its `#### {image-slug}` heading and `__File:__` field.
5. Skip if already generated:
   - `__Status:__` is `generated`, **or** the file at `__File:__` already exists → mark `⏭ skipped`
   - otherwise (`__Status:__ prompt-ready`, or `prompt-only` now that a route exists, and no file yet) → add to queue; a `prompt-only` entry has no marker in the material — Phase 5b inserts the image at its place and says where
   - entries without a prompt (`wanted`, `candidate`, `selected`, `inserted` — free photos and own photos, `tasks/create-image.md` → Free photos) are never queued
6. Print queue:
   ```
   Batch queue: {N} to process, {M} skipped (already done)
   - fox-samurai  → {__File:__ path from that entry}
   - whale-astronaut → {__File:__ path from that entry}
   ```
7. 🎛️ Confirm: **Start / Cancel**

### Sequential Batch

Process each item using Phase 3 → 4 → 5 in order.
After each image: log result (`✅ done` / `❌ failed`), continue to next.

### Automated Batch

8. Read all pending `<section>` entries, extract their `__Prompt:__` strings. Read course language from `journal.md` → `## Course Context`. For each prompt, if it does not already contain an in-image language instruction, append: `"All text visible in the image (labels, headings, UI elements) must be written in {language}."`
9. Inject the following self-contained JS loop into the browser:

   ```js
   const queue = [
     { slug: 'fox-samurai',     prompt: '...' },
     { slug: 'whale-astronaut', prompt: '...' },
     // one entry per pending prompt
   ];

   async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

   function countReadyContainers() {
     return [...document.querySelectorAll('[class*="group/imagegen-image"]')]
       .filter(d => [...d.children].some(c =>
         c.className.includes('pointer-events-none') && c.className.includes('bottom-0')
       )).length;
   }

   async function waitForGenerationDone(readyBefore, timeout = 150000) {
     const start = Date.now();
     // Phase 1: wait for stop-button to appear
     while (Date.now() - start < 20000) {
       if (document.querySelector('[data-testid="stop-button"]')) break;
       await sleep(500);
     }
     // Phase 2: wait for new ready container (action-bar = image complete)
     while (Date.now() - start < timeout) {
       if (countReadyContainers() > readyBefore) {
         await sleep(1000); // grace period for full-res render
         return true;
       }
       await sleep(1000);
     }
     return false; // timeout
   }

   function getNewImageUrls(urlsBefore) {
     const seen = new Set();
     return [...document.querySelectorAll('img')]
       .map(i => i.src)
       .filter(s => s.includes('chatgpt.com') && s.includes('file_') && !urlsBefore.has(s))
       .filter(s => {
         const id = (s.match(/file_[^&?]+/) || [s])[0];
         return seen.has(id) ? false : (seen.add(id), true);
       });
   }

   async function downloadBlob(url, filename) {
     const blob = await fetch(url).then(r => r.blob());
     const a = document.createElement('a');
     a.href = URL.createObjectURL(blob);
     a.download = filename;
     document.body.appendChild(a); a.click(); document.body.removeChild(a);
     return blob.size;
   }

   async function runBatch() {
     // ChatGPT must already be open — no navigation here (window.location.href kills the script context)
     for (const { slug, prompt } of queue) {
       console.log(`[batch] Starting: ${slug}`);
       const tb = document.getElementById('prompt-textarea');
       tb.focus();
       tb.textContent = prompt;
       tb.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prompt }));
       // poll for send-button (only rendered when textarea has content)
       let sendBtn;
       const deadline = Date.now() + 10000;
       while (Date.now() < deadline) {
         sendBtn = document.querySelector('[data-testid="send-button"]');
         if (sendBtn) break;
         await sleep(200);
       }
       if (!sendBtn) { console.warn(`[batch] ❌ Send button not found: ${slug}`); continue; }
       const readyBefore = countReadyContainers();
       const urlsBefore = new Set([...document.querySelectorAll('img')].map(i => i.src).filter(s => s.includes('file_')));
       sendBtn.click();
       const done = await waitForGenerationDone(readyBefore);
       if (!done) { console.warn(`[batch] ❌ Timeout: ${slug}`); continue; }
       const newUrls = getNewImageUrls(urlsBefore);
       if (!newUrls.length) { console.warn(`[batch] ❌ No image found: ${slug}`); continue; }
       const size = await downloadBlob(newUrls[0], `${slug}.png`); // newUrls[0] = finished image; others are still-loading previews
       console.log(`[batch] ✅ Done: ${slug} (${Math.round(size/1024)} KB)`);
       await sleep(1000);
     }
     console.log('[batch] All done.');
   }

   runBatch();
   ```

10. Monitor browser console for `[batch] ✅ / ❌` logs.
11. After completion, collect results from console output, then move every downloaded `{slug}.png` from the browser's download folder to its `__File:__` path as in Phase 5 and check that it arrived — only then Phase 5b.

---

## Phase 3D: Own image tool

For each queued entry (single or sequential batch):

1. Take the `__Prompt:__` value and apply the same language safety-net as Phase 3 below.
2. Generate the image with the agent's own image tool.
3. Save the result exactly at the `__File:__` path (create the folder if needed; if the tool writes elsewhere, move the file there).
4. Check that the file exists at that path, then continue with Phase 5b. If generation fails, report `❌ failed` and stop (single) or continue (batch).

## Phase 3: Submit to ChatGPT *(browser route, single + sequential batch)*

- **First image only:** Navigate to `https://chatgpt.com/`. For subsequent images in sequential batch, stay on the same page — just insert the next prompt.
- **Language safety-net:** Read course language from `journal.md` → `## Course Context`. If the prompt does not already contain a language instruction for in-image text (i.e., does not mention "text visible in the image"), append to the prompt:
  `"All text visible in the image (labels, headings, UI elements) must be written in {language}."`
- Insert prompt and submit — poll for send-button at 200ms intervals (it only renders when textarea has content):
  ```js
  const tb = document.getElementById('prompt-textarea');
  tb.focus();
  tb.textContent = prompt;
  tb.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prompt }));
  // poll for send-button (only rendered when textarea has content)
  let sendBtn;
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    sendBtn = document.querySelector('[data-testid="send-button"]');
    if (sendBtn) break;
    await sleep(200);
  }
  if (!sendBtn) throw new Error('Send button not found after 10s');
  // Capture state BEFORE submitting (used by Phase 4 + 5)
  const readyBefore = countReadyContainers();
  const urlsBefore = new Set([...document.querySelectorAll('img')].map(i => i.src).filter(s => s.includes('file_')));
  sendBtn.click();
  ```

## Phase 4: Wait for Image *(single + sequential batch)*

- ChatGPT marks a finished image by adding an action-bar (`div.pointer-events-none.bottom-0`) inside the `div.group/imagegen-image` container. Count these ready containers before submitting; wait until the count increases.
  ```js
  function countReadyContainers() {
    return [...document.querySelectorAll('[class*="group/imagegen-image"]')]
      .filter(d => [...d.children].some(c =>
        c.className.includes('pointer-events-none') && c.className.includes('bottom-0')
      )).length;
  }

  async function waitForGenerationDone(readyBefore, timeout = 150000) {
    const start = Date.now();
    // Phase 1: wait for stop-button to appear (confirms generation started)
    while (Date.now() - start < 20000) {
      if (document.querySelector('[data-testid="stop-button"]')) break;
      await sleep(500);
    }
    // Phase 2: wait for a new ready container (action-bar appeared = image complete)
    while (Date.now() - start < timeout) {
      if (countReadyContainers() > readyBefore) {
        await sleep(1000); // grace period for full-res render
        return true;
      }
      await sleep(1000);
    }
    return false;
  }
  ```
  - This is layout-independent: works regardless of viewport size or button visibility.
  - `readyBefore` and `urlsBefore` are captured in Phase 3 immediately before `sendBtn.click()`.
  - After `waitForGenerationDone()` returns `true`, collect new `file_` URLs via `urlsBefore` diff (Phase 5). Filter: `s.includes('chatgpt.com') && s.includes('file_')`. Deduplicate by `file_` ID.
  - **Always use `newUrls[0]`** — the first new URL is the finished full-resolution image. Subsequent new URLs are still-loading preview artefacts.
  - Timeout (150s) → report `❌ failed`, stop (single) or continue (batch).

## Phase 5: Download and Save *(single + sequential batch)*

- Save path: use the exact path already recorded in this entry's `__File:__` field (written by `:create-image`, already resolved for the active File Structure mode — see `data/file-structure-modes.md`). Create the containing folder if it does not exist yet. Only fall back to `~/Downloads/{image-slug}.png` if `__File:__` is missing entirely (inform the instructor).
- Collect new `file_` URLs via `urlsBefore` diff, deduplicated by `file_` ID. Take only **`newUrls[0]`** — the first new URL is the finished image; subsequent URLs are still-loading previews.
- Download as `{image-slug}.png`. The browser saves it in its own download folder, not in the project: move it from there to the path above (part of the terminal-confirmed browser route) and check that it arrived.
- Download via Blob URL:
  ```js
  fetch(newUrls[0]).then(r => r.blob()).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });
  ```
- Confirm: `"✅ {slug}.png saved ({size} KB) → {path}"`

## Phase 5b: Update Journal Entry *(all modes)*

- Only once the file exists at the `__File:__` path: in the `<section>` for `{slug}`, set `__Status:__` to `generated` and add the image `![{alt text}]({path})` below the prompt. If it does not, keep `prompt-ready` and report where the file is.
- In the material, replace the marker `<!--- image: {slug} … --->` (older journals: `<!-- image: {slug} -->`) + `> 🖼️ _…_` with the image `![{alt text}]({path relative to the material document})`. Without a marker (e.g. status `prompt-only`), insert the image at the place it belongs and say where. Only then is the image visible to learners.

---

## Phase 6: Summary *(batch modes only)*

```
Batch complete.
✅  3 images generated and saved to their recorded `__File:__` paths
⏭   1 skipped (already existed)
❌  0 failed
```
If any failures: list slugs, suggest `:generate-image {slug}` to retry individually.

After single or batch mode: Run `tasks/update-dashboard.md` with `templates/project-dashboard.yaml` to update `journal.md` → `## Dashboard` in place.

---

## Relation to :create-image

| Feature                  | `:create-image` | `:generate-image {slug}` | `:generate-image` (batch) |
|--------------------------|-----------------|--------------------------|---------------------------|
| Generate prompt          | ✅              | ❌ (reads saved)          | ❌ (reads saved)           |
| Save prompt to journal   | ✅ always        | ❌                         | ❌                         |
| Set Status → generated   | ❌ (prompt-ready)| ✅                         | ✅                         |
| Generate the image       | ❌              | ✅ own tool or ChatGPT    | ✅ all pending             |
| Download image           | ❌              | ✅                         | ✅                         |
| Save to project folder   | ❌              | ✅                         | ✅                         |
| Requires chrome-devtools | ❌              | browser route only        | browser route only        |
