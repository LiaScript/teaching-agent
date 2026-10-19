// Renders a course material in the LiaScript DevServer and reports what learners see:
// slides, quizzes, read-aloud buttons, missing images and real errors.
// Run from the course project root: node <path>/dashboard/check-material.mjs [README.md]
import { spawn } from "node:child_process";
import { readdir, access } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = process.cwd(); // run from the course project root
const file = process.argv[2] ?? "README.md";
const port = 3041;
const origin = `http://127.0.0.1:${port}`;

async function playwright() {
  if (process.env.PLAYWRIGHT_MODULE_PATH) return require(process.env.PLAYWRIGHT_MODULE_PATH);
  const cache = resolve(homedir(), ".npm/_npx");
  for (const folder of await readdir(cache)) {
    const module = resolve(cache, folder, "node_modules/playwright");
    try { await access(resolve(module, "package.json")); return require(module); } catch {}
  }
  throw new Error("No installed Playwright found. Set PLAYWRIGHT_MODULE_PATH.");
}

const server = spawn("liadev", ["--input", file, "--hostname", "127.0.0.1", "--port", String(port)], { cwd: root, stdio: "ignore" });
let browser;
try {
  const { chromium } = await playwright();
  await new Promise(done => setTimeout(done, 3500));
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const missing = new Set();
  const errors = [];
  page.on("response", response => {
    if (response.status() === 404 && /\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(response.url())) missing.add(decodeURIComponent(response.url().replace(origin + "/", "")));
  });
  page.on("console", message => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/404|Failed to load resource|fetchError/.test(text)) return;
    errors.push(text.slice(0, 160));
  });
  page.on("pageerror", error => { if (!/fetchError/.test(error.message)) errors.push(String(error.message).slice(0, 160)); });

  await page.goto(`${origin}/liascript/index.html?${origin}/${file}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  const slides = await page.evaluate(() => Array.from(document.querySelectorAll("a.lia-toc__link")).map(a => a.innerText.trim()).filter(Boolean));
  const titles = slides.filter(title => title !== "skip navigation");
  const counts = { quizzes: 0, tts: 0 };
  for (let index = 1; index <= titles.length; index++) {
    await page.evaluate(n => { location.hash = `#${n}`; }, index);
    await page.waitForTimeout(700);
    const slide = await page.evaluate(() => {
      const visible = element => !element.closest("nav, header, aside, .lia-toc");
      return {
        quizzes: Array.from(document.querySelectorAll(".lia-quiz")).filter(visible).length,
        tts: Array.from(document.querySelectorAll("button[title='Play']")).filter(visible).length
      };
    });
    counts.quizzes += slide.quizzes;
    counts.tts += slide.tts;
  }
  console.log(`Material: ${file}`);
  console.log(`Slides: ${titles.length} (${titles.slice(0, 12).join(" · ")}${titles.length > 12 ? " …" : ""})`);
  console.log(`Quizzes: ${counts.quizzes} · Read-aloud buttons: ${counts.tts}`);
  console.log(`Missing images: ${missing.size}${missing.size ? ` (${[...missing].slice(0, 6).join(", ")}${missing.size > 6 ? " …" : ""})` : ""}`);
  console.log(`Errors (without missing images and the known interpreter error fetchError): ${errors.length}`);
  [...new Set(errors)].slice(0, 5).forEach(error => console.log(`- ${error}`));
  console.log(`Exit code: ${errors.length ? 1 : 0}`);
  process.exitCode = errors.length ? 1 : 0;
} finally {
  await browser?.close();
  server.kill();
}
