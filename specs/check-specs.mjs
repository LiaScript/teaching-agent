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
  "tasks/init-course.md": ["the only write allowed before the save confirmation", "Reuse what is known", "No unfounded recommendations", "two short questions in the instructor's own terms", "file structure as a **teacher question**", "Audience override", "only what the instructor answered"],
  "tasks/scaffold-course.md": ["Draft before saving", "never compute a middle value", "grounding question", "step 10 does"],
  "tasks/create-outline.md": ["Start from the instructor's goal", "Repeat this time check after every revision"],
  "tasks/create-didactics.md": ["do **not** ask the instructor", "`layout` of `templates/course-didactics.yaml`", "merge, never overwrite", "data-from=\"didactics\""],
  "tasks/create-agenda.md": ["Net working time per time slot", "Clean up Session Type slugs before writing them", "Self-check before the summary", "If later: stop here", "do not ask about methods"],
  "tasks/create-session-skeleton.md": ["data-key", "Show the new unit", "can be solved with the material the learners get"],
  "tasks/coauthor-materials.md": ["Fact check before showing", "New rule → re-check", "Material ✅ means the document exists", "do not run `:promote-session` first", "never before it —"],
  "tasks/validate-course.md": ["Chat summary", "result_rules", "`[advisory]` items such as the duration flag are not in scope", "Never offer \"publish anyway\"", "in both directions", "A session PASS must not hide"],
  "checklists/course-quality-checklist.md": ["`[advisory]` = computed mechanically", "[advisory] Estimated duration"],
  "tasks/update-dashboard.md": ["This task writes only:", "the start of every heading stays unchanged", "punctuation kept", "#3.-why-do-leaves-fall?", "write-dashboard.mjs", "Sign of life first", "Exactly one definition of \"finished\""],
  "tasks/quick-fix.md": ["Change path after a check", "Called from `:build-session`"],
  "tasks/generate-image.md": ["never by its name", "Only once the file exists"],
  "tasks/build-session.md": ["Repeat c–d", "never 1a or 1b", "ask **once in the terminal**"],
  "tasks/create-project.md": ["Read the repository before anything changes", "Show the plan, then confirm in the terminal"],
  "tasks/update-project.md": ["Show the plan, then confirm in the terminal"],
  "tasks/configure-agent.md": ["Nothing is written before it", "the entry is theirs from then on"],
  "tasks/create-learner-persona.md": ["Show the complete persona exactly as it will be saved"],
  "tasks/validate-syntax.md": ["Findings returned to a caller never contain line numbers", "is never ❌ for it"],
  "tasks/try-as-learner.md": ["find_teacher", "a computer program plays this role", "Fallback", "Preview required"],
  "data/agent-links.md": ["never material or anything the instructor wrote", "Language before the frame", "Lost or unseen messages", "One way to start", "Reuse what is known", "Say how you checked", "Tables in the chat", "Typed answers", "Changing another section", "Temporary companion", "Learner view", "reply_to", "reload_pending", "browser_lang"],
  "data/liascript-cheat-sheet.md": ["data-solution-button=\"false\""],
  "templates/course-context.yaml": ["layout:", "Target Group"],
  "templates/course-outline.yaml": ["layout:"],
  "templates/course-didactics.yaml": ["layout:"],
  "templates/course-agenda.yaml": ["layout:", "Time Budget"],
  "templates/session-skeleton.yaml": ["data-key=\"summary\"", "<details>", "a visible status list", "so list and table never disagree", "never\n        relative to another optional block"],
  "templates/session-material.yaml": ["heading_levels:", "its parts are `###`"],
  "templates/session-validation.yaml": ["Validation Report – ", "Never move an item between", "Accepted concerns", "never a blanket", "**Method Consistency:**", "**Duration (advisory):**", "**Reference Check:**", "**Templates:**"],
  "templates/journal.md": ["journal-start", "Target Group", "## Publishing"],
  "workflows/course-development.yaml": [":try-as-learner", "offer :try-as-learner once (only with the preview / MCP gate open)", "change path", "One way to start", "write-dashboard.mjs"],
  "agents/teaching-agent.yaml": [":try-as-learner", "once (only when the MCP gate is open; it runs in the preview)", "starts with `## Outline`", "read a task file **completely**"],
};

for (const [file, phrases] of Object.entries(required)) {
  test(`${file} keeps its key rules`, () => {
    assert.ok(existsSync(join(specs, file)), `${file} is missing`);
    const text = read(file);
    for (const phrase of phrases) assert.ok(text.includes(phrase), `${file} lost: "${phrase}"`);
  });
}

test("material paths use the title slug, never the session type", () => {
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const hits = walk(specs).filter(path => /\.(md|ya?ml)$/.test(path))
    .flatMap(path => readFileSync(path, "utf8").split("\n").map(line => [path, line]))
    .filter(([, line]) => /\{\{?number\}?\}-\{\{?type\}?\}/.test(line) && !/legacy/.test(line));
  assert.deepEqual(hits.map(([path, line]) => `${path.slice(specs.length + 1)}: ${line.trim()}`), []);
});

test("the workflow quick reference lists every agent command with its signature", () => {
  const generic = new Set([":agent", ":help", ":exit", ":list-agents"]);
  const workflow = read("workflows/course-development.yaml");
  for (const agent of ["teaching", "artist", "learner", "development"]) {
    const keys = [...read(`agents/${agent}-agent.yaml`).matchAll(/^\s{2}(:[\w-]+[^:\n]*):/gm)].map(match => match[1].trim())
      .filter(key => !generic.has(key.split(" ")[0]));
    const list = workflow.split(`${agent}_agent_commands:`)[1]?.split(/\n\s*\n/)[0] ?? "";
    const listed = [...list.matchAll(/^\s*- (:.+)$/gm)].map(match => match[1].trim());
    assert.deepEqual(keys.filter(key => !listed.includes(key)), [], `${agent}: missing in quick_reference`);
    assert.deepEqual(listed.filter(key => !keys.includes(key) && !generic.has(key.split(" ")[0])), [], `${agent}: unknown in quick_reference`);
  }
});

test("Artist tasks that write journal.md refresh the dashboard and are listed as its triggers", () => {
  const triggers = read("tasks/update-dashboard.md").split("## Automatic Trigger")[1]?.split("\n## ")[0] ?? "";
  for (const task of ["create-visuals", "create-logo", "create-image", "generate-image"]) {
    assert.ok(read(`tasks/${task}.md`).includes("tasks/update-dashboard.md"), `${task} does not run update-dashboard`);
    assert.ok(triggers.includes(`:${task}`), `${task} is missing in the update-dashboard trigger list`);
  }
});

test("the workflow matches the dashboard path: work out together first, build-session after one approved unit", () => {
  const workflow = read("workflows/course-development.yaml");
  assert.ok(!workflow.includes('":create-session", ":promote-session"'), "a course path still promotes before co-authoring");
  assert.ok(!/dependencies: \[create_didactics, create_visuals\]/.test(workflow), "the agenda depends on the optional visual identity again");
  assert.match(workflow, /- command: :build-session \{number\}/, "build-session is missing in the session development sequence");
  assert.match(workflow, /Creates the material document at the first Save/, "coauthor-materials no longer creates the material in the workflow");
});

test("session methods are chosen by the agent, never asked for per session", () => {
  const methods = read("data/didactic-methods.md");
  for (const old of ["confirms or changes it", "confirms, edits, or opts out", "default pre-selected"]) {
    assert.ok(!methods.includes(old), `data/didactic-methods.md still says "${old}"`);
  }
  assert.ok(!/Ask per session/i.test(read("tasks/create-agenda.md")), "create-agenda asks per session again");
});

test("reports inside sessions and the course summary use bold labels, not ##### headings", () => {
  for (const file of ["tasks/review-as-persona.md", "tasks/validate-course.md", "templates/session-validation.yaml"]) {
    const headings = read(file).split("\n").filter(line => /^\s*#{5,6}\s/.test(line));
    assert.deepEqual(headings, [], `${file} writes ##### headings`);
  }
});

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
function journal({ agenda, outcome = "**Outcome:** passed (2026-10-19)", units = 2, context = "", didactics = "" } = {}) {
  const data = { title: "X", units: Array.from({ length: units }, (_, i) => ({ id: String(i + 1), title: `U${i + 1}`, state: "planned", ...(i === 0 ? { href: "#1.-intro" } : {}) })) };
  return ["<!--\nlanguage: fr\n-->", "# X", "## Course Context", context, "## Didactics", didactics,
    "## Dashboard", "```json @Dashboard.View", JSON.stringify(data), "```",
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

test("Done ✅ needs a passed check without open ⏳ items", () => {
  const table = "| # | Title | Type | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | modul | ✅ | ✅ | ✅ | |";
  const done = text => text.replace("## Sessions\n\n", `## Sessions\n\n${table}\n\n`);
  const clean = checkJournal(done(journal()));
  assert.equal(clean.status, 0, clean.output);
  const pending = checkJournal(done(journal({ outcome: "**Outcome:** passed – image follows\n\n**Still missing:**\n\n- ⏳ Header image – in the image step" })));
  assert.equal(pending.status, 2, pending.output);
  assert.match(pending.output, /unit 1: "Done ✅" while ⏳ items are still open/);
});

test("a type's display name must not repeat the unit word; its slug may", () => {
  const context = "* __Terminology:__\n  1. sessions-called: Einheit\n  2. lectures-called: Modul";
  const types = (...names) => "* __Session Types:__\n" + names.map(([name, slug], i) => `  ${i + 1}. __${name}__ (slug: \`${slug}\`) — x`).join("\n");
  const slugOnly = checkJournal(journal({ context, didactics: types(["Lernmodul", "modul"], ["Selbstcheck", "selbstcheck"]) }));
  assert.equal(slugOnly.status, 0, slugOnly.output);
  const shown = checkJournal(journal({ context, didactics: types(["Modul", "lernmodul"], ["Selbstcheck", "selbstcheck"]) }));
  assert.equal(shown.status, 2, shown.output);
  assert.match(shown.output, /\[type-name\].*Modul/);
  const single = checkJournal(journal({ context, didactics: types(["Modul", "modul"]) }));
  assert.equal(single.status, 0, single.output);
});

test("session commands identify a unit by its number; the type is never a parameter", () => {
  const keys = ["teaching", "artist", "learner", "development"].flatMap(agent =>
    [...read(`agents/${agent}-agent.yaml`).matchAll(/^\s{2}(:[\w-]+[^:\n]*):/gm)].map(match => match[1]));
  assert.deepEqual(keys.filter(key => /\{type\??\}/.test(key) && !key.startsWith(":save-notes")), []);
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const files = [...walk(specs).filter(path => /\.(md|ya?ml)$/.test(path)), join(specs, "..", "README.md")];
  const hits = files.flatMap(path => readFileSync(path, "utf8").split("\n").map(line => [path, line]))
    .filter(([, line]) => /[?&]type=|\{\{?number\}?\} \{\{?type\}?\}|\{n\} \{type\}|<number> <type>|\[number\] \[type\]|`:create-session \d+ [a-z]+`/.test(line));
  assert.deepEqual(hits.map(([path, line]) => `${path.slice(specs.length + 1)}: ${line.trim().slice(0, 100)}`), []);
});

test("the journal check finds the visible outcome in any course language", () => {
  const ok = checkJournal(journal({ outcome: "**Résultat :** réussi (2026-10-19)" }));
  assert.equal(ok.status, 0, ok.output);
  const missing = checkJournal(journal({ outcome: "réussi (2026-10-19)" }));
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /without visible summary/);
});
