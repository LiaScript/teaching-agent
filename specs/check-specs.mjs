// Regression check for the specs: key rules found in tandem tests must not get
// lost when specs are ported or rewritten. Run from the project root:
//   node --test specs/check-specs.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const specs = dirname(fileURLToPath(import.meta.url));
const read = path => readFileSync(join(specs, path), "utf8");

// File → sentences that must stay (one key phrase per rule).
const required = {
  "tasks/init-course.md": ["Reuse what is known", "No unfounded recommendations", "two short questions in the instructor's own terms", "file structure as a **teacher question**", "Audience override", "only what the instructor answered"],
  "tasks/scaffold-course.md": ["Draft before saving", "never compute a middle value"],
  "tasks/create-outline.md": ["Start from the instructor's goal", "Repeat this time check after every revision"],
  "tasks/create-didactics.md": ["do **not** ask the instructor", "`layout` of `templates/course-didactics.yaml`"],
  "tasks/create-agenda.md": ["Net working time per time slot", "Clean up Session Type slugs before writing them", "Self-check before the summary"],
  "tasks/create-session-skeleton.md": ["data-key", "Show the new unit", "can be solved with the material the learners get"],
  "tasks/coauthor-materials.md": ["Fact check before showing", "New rule → re-check"],
  "tasks/validate-course.md": ["Chat summary", "result_rules"],
  "tasks/update-dashboard.md": ["punctuation kept", "#3.-why-do-leaves-fall?", "write-dashboard.mjs", "Sign of life first", "Exactly one definition of \"finished\""],
  "tasks/quick-fix.md": ["Change path after a check"],
  "tasks/validate-syntax.md": ["Findings returned to a caller never contain line numbers"],
  "tasks/try-as-learner.md": ["find_teacher", "a computer program plays this role", "Fallback"],
  "data/agent-links.md": ["Language before the frame", "Lost or unseen messages", "One way to start", "Reuse what is known", "Say how you checked", "Tables in the chat", "Typed answers", "Changing another section", "Temporary companion", "Learner view", "reply_to", "reload_pending", "browser_lang"],
  "data/liascript-cheat-sheet.md": ["data-solution-button=\"false\""],
  "templates/course-context.yaml": ["layout:", "Target Group"],
  "templates/course-outline.yaml": ["layout:"],
  "templates/course-didactics.yaml": ["layout:"],
  "templates/course-agenda.yaml": ["layout:", "Time Budget"],
  "templates/session-skeleton.yaml": ["data-key=\"summary\"", "<details>"],
  "templates/session-validation.yaml": ["Validation Report – ", "Never move an item between"],
  "templates/journal.md": ["journal-start", "Target Group"],
  "workflows/course-development.yaml": [":try-as-learner", "change path", "One way to start", "write-dashboard.mjs"],
  "agents/teaching-agent.yaml": [":try-as-learner", "starts with `## Outline`", "read a task file **completely**"],
};

for (const [file, phrases] of Object.entries(required)) {
  test(`${file} keeps its key rules`, () => {
    assert.ok(existsSync(join(specs, file)), `${file} is missing`);
    const text = read(file);
    for (const phrase of phrases) assert.ok(text.includes(phrase), `${file} lost: "${phrase}"`);
  });
}

test("no persona or scenario data from tandem tests in the specs", () => {
  const words = /\b(biene\w*|bienenvolk|sabine|jonas|frida|summi|krüger)\b/i;
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const hits = walk(specs).filter(path => /\.(md|ya?ml|mjs|js|json)$/.test(path) && !path.endsWith("check-specs.mjs"))
    .filter(path => words.test(readFileSync(path, "utf8")));
  assert.deepEqual(hits.map(path => path.slice(specs.length + 1)), []);
});

function checkJournal(text) {
  const dir = mkdtempSync(join(tmpdir(), "journal-"));
  const file = join(dir, "journal.md");
  writeFileSync(file, text);
  const run = spawnSync(process.execPath, [join(specs, "dashboard", "validate-journal.mjs"), file], { encoding: "utf8" });
  return { status: run.status, output: run.stdout + run.stderr };
}

// A small journal with two units, an agenda and a session with a validation report.
function journal({ agenda, outcome = "**Outcome:** passed (2026-10-19)", units = 2 } = {}) {
  const data = { title: "X", units: Array.from({ length: units }, (_, i) => ({ id: String(i + 1), title: `U${i + 1}`, state: "planned", ...(i === 0 ? { href: "#1.-intro" } : {}) })) };
  return ["<!--\nlanguage: fr\n-->", "# X", "## Dashboard", "```json @Dashboard.View", JSON.stringify(data), "```",
    "## Agenda", agenda ?? [
      "__Time Budget – Budget :__", "", "| 1 | 90 min − 10 min = 80 min |", "", "<!-- data-type=\"none\" -->",
      "  | No. | Titre | Durée |", "  |---|---|---|", ...Array.from({ length: units }, (_, i) => `  | ${i + 1} | U${i + 1} | 45 min |`), "",
      "<details><summary>Réglages techniques</summary>", "", "| No. | type | material |", "|---|---|---|",
      ...Array.from({ length: units }, (_, i) => `| ${i + 1} | module | materials/${i + 1}-module/README.md |`), "", "</details>"].join("\n"),
    "## Sessions", "### 1. Intro", "#### Validation Report – Rapport de validation", outcome, "",
    "<details><summary>Rapport technique</summary>", "", "__Result:__ PASS", "", "</details>"].join("\n\n");
}

test("the empty journal template passes the journal check", () => {
  const run = checkJournal(read("templates/journal.md"));
  assert.equal(run.status, 0, run.output);
});

test("the journal check counts only the visible units table of the agenda", () => {
  const ok = checkJournal(journal());
  assert.equal(ok.status, 0, ok.output);
  const fewer = checkJournal(journal({ units: 3 }).replace("  | 3 | U3 | 45 min |\n", ""));
  assert.equal(fewer.status, 2, fewer.output);
  assert.match(fewer.output, /the agenda has 2 rows, the dashboard shows 3 units/);
});

test("the journal check finds the visible outcome in any course language", () => {
  const ok = checkJournal(journal({ outcome: "**Résultat :** réussi (2026-10-19)" }));
  assert.equal(ok.status, 0, ok.output);
  const missing = checkJournal(journal({ outcome: "réussi (2026-10-19)" }));
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /without visible summary/);
});
