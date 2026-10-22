// Regression check for the specs: key rules found in tandem tests must not get
// lost when specs are ported or rewritten. Run from the project root:
//   node --test specs/check-specs.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const specs = dirname(fileURLToPath(import.meta.url));
const read = path => readFileSync(join(specs, path), "utf8");

// File → sentences that must stay (one key phrase per rule).
const required = {
  "tasks/init-course.md": ["also for \"mixed\"", "is not saved", "English stay only keys that tasks read", "For a single lesson do not ask", "only if the instructor has named the number of units", "builds LiaScript courses only — never ask for a platform", "Accessibility is not asked", "follow the course language in terminal mode too", "the only write allowed before the save confirmation", "Reuse what is known", "No unfounded recommendations", "two short questions in the instructor's own terms", "file structure as a **teacher question**", "Audience override", "only what the instructor answered"],
  "tasks/scaffold-course.md": ["Teaching style and difficulty level are not asked", "run the \"Self-check before saving\"", "Guiding figure / instructor persona", "No agenda — decided with the course frame", "8b. Set `language:`", "Draft before saving", "never compute a middle value", "grounding question", "step 10 does"],
  "tasks/create-outline.md": ["Start from the instructor's goal", "Repeat this time check after every revision"],
  "tasks/create-didactics.md": ["in its short form", "do **not** ask the instructor", "`layout` of `templates/course-didactics.yaml`", "merge, never overwrite", "data-from=\"didactics\""],
  "tasks/create-agenda.md": ["unless the learners work in fixed time slots", "Net working time per time slot", "Clean up Session Type slugs before writing them", "Self-check before the summary", "If later: stop here", "do not ask about methods"],
  "tasks/create-session-skeleton.md": ["also in the terminal", "data-key", "Show the new unit", "can be solved with the material the learners get"],
  "tasks/coauthor-materials.md": ["not for a single lesson", "**Course-wide decisions**", "never present it as checked", "Fact check before showing", "New rule → re-check", "Material ✅ means the document exists", "do not run `:promote-session` first", "never before it —"],
  "tasks/validate-course.md": ["heading stands outside; everything below it is wrapped", "Items only the instructor can resolve are not in scope", "With **PASS with concerns**", "Chat summary", "result_rules", "`[advisory]` items such as the duration flag are not in scope", "Never offer \"publish anyway\"", "in both directions", "A session PASS must not hide"],
  "checklists/course-quality-checklist.md": ["`[advisory]` = computed mechanically", "[advisory] Estimated duration"],
  "data/file-structure-modes.md": ["Umlauts and ß are transliterated", "Title slide (single-file, first unit)", "`narrator:` a voice for that language", "3. **Images:**"],
  "tasks/create-image.md": ["`<!--- image: {image-slug} --->`", "`prompt-only`", "no visual identity yet", "Mark the spot in the material"],
  "data/skills.md": ["workflow versions"],
  "data/duration-heuristic.md": ["the middle of the estimated range", "Count a teacher-led phase once"],
  "agents/learner-agent.yaml": ["other sections only when a command names them"],
  "data/session-types.md": ["never equal the default unit words", "Objectives and duration of a session", "Never leave a check without objectives"],
  "tasks/update-dashboard.md": ["never another check of the same state", "`review-{unit}-{n}`", "starts with `published` (an English key, never translated)", "States are exclusive", "The last step, publishing", "This task writes only:", "the start of every heading stays unchanged", "punctuation kept", "#3.-why-do-leaves-fall?", "write-dashboard.mjs", "Sign of life first", "Exactly one definition of \"finished\""],
  "tasks/quick-fix.md": ["without one, say so in the dated line", "does not reopen a check", "Change path after a check", "Called from `:build-session`"],
  "tasks/generate-image.md": ["add the image `![{alt text}]({path})` below the prompt", "replace the marker", "never by its name", "Only once the file exists"],
  "tasks/build-session.md": ["do not refresh the dashboard themselves", "prompt-only mode", "every factual statement that could not be verified", "one that makes the unit unusable for that persona", "only the named `#### Persona:` entry", "Repeat c–d", "never 1a or 1b", "ask **once in the terminal**"],
  "tasks/create-project.md": ["never the assistant's own files", "1b. Only once the gate is open", "the contact address was not saved either", "never `.cache/`", "**Version:**", "**Contact address:**", "Read the repository before anything changes", "Show the plan, then confirm in the terminal"],
  "tasks/update-project.md": ["Show the plan, then confirm in the terminal"],
  "tasks/configure-agent.md": ["Nothing is written before it", "the entry is theirs from then on"],
  "tasks/create-learner-persona.md": ["Show the complete persona exactly as it will be saved"],
  "tasks/validate-syntax.md": ["checked only by the publishing gate", "Findings returned to a caller never contain line numbers", "is never ❌ for it"],
  "tasks/try-as-learner.md": ["find_teacher", "a computer program plays this role", "Fallback", "Preview required"],
  "data/agent-links.md": ["checked ✅ → 👁 `preview`", "check failed → `coauthor-materials?number={n}`", "`agent` (`:configure-agent`) is one of", "`slide` is a positive integer", "never material or anything the instructor wrote", "Language before the frame", "Lost or unseen messages", "One way to start", "Reuse what is known", "Say how you checked", "Tables in the chat", "Typed answers", "Changing another section", "Temporary companion", "Learner view", "reply_to", "reload_pending", "browser_lang"],
  "data/liascript-cheat-sheet.md": ["A pair of `$` starts math everywhere outside code", "**The comment goes directly above the first answer line, not above the question.**", "**Matrix Quiz (graded, for matching tasks)**", "data-text-solved", "Each `#`, `##` and `###` heading **always starts a new slide**", "data-solution-button=\"false\""],
  "templates/course-context.yaml": ["layout:", "Target Group"],
  "templates/course-outline.yaml": ["__Session Overview:__", "layout:"],
  "templates/course-didactics.yaml": ["layout:"],
  "templates/course-agenda.yaml": ["layout:", "Time Budget"],
  "templates/session-skeleton.yaml": ["data-key=\"summary\"", "<details>", "a visible status list", "so list and table never disagree", "check failed – revision needed", "revised – check open", "passed with concerns – your decision needed", "never\n        relative to another optional block"],
  "templates/session-material.yaml": ["heading_levels:", "its parts are `###`"],
  "templates/session-validation.yaml": ["also in units created later", "could not be verified", "the heading stays outside", "counts as accepted in every unit", "passed with concerns – your decision needed", "so it never blocks Done", "Validation Report – ", "Never move an item between", "Accepted concerns", "never a blanket", "**Method Consistency:**", "**Duration (advisory):**", "**Reference Check:**", "**Templates:**"],
  "templates/journal.md": ["* __Session Overview:__", "* __Time Budget:__", "\"title\": \"Publish\"", "* __Didactic Framework:__", "copied from Course Context", "journal-start", "Target Group", "## Publishing"],
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

test("templates and tasks agree on fields: agent subsections, agenda summary, delivery format, check scripts", () => {
  const agents = read("templates/agents.yaml");
  for (const id of ["coauthor", "teaching-agent", "artist-agent", "development-agent", "learner-personas"]) {
    assert.match(agents, new RegExp(`- id: ${id}\\n`), `templates/agents.yaml has no own section ${id}`);
  }
  assert.ok(!/learning objectives?, summary/i.test(read("tasks/create-agenda.md") + read("tasks/validate-course.md") + read("checklists/course-quality-checklist.md")), "the agenda asks for a summary it has no place for");
  assert.ok(!read("tasks/create-didactics.md").includes("Set the delivery format"), "create-didactics sets a delivery format without a field");
  assert.ok(!read("dashboard/check-material.mjs").includes('"/usr/bin/chromium"'), "check-material.mjs hard-codes the browser path");
  assert.match(read("data/duration-heuristic.md"), /For a single-lesson/, "reading pace for a single-lesson is undefined");
});

test("no task reads objectives or duration only from the agenda, and ### is a slide", () => {
  for (const file of ["tasks/validate-course.md", "tasks/coauthor-materials.md", "data/duration-heuristic.md", "checklists/course-quality-checklist.md", "tasks/build-session.md", "tasks/review-as-persona.md"]) {
    assert.ok(!/(objectives?|duration)[^\n]{0,40}(from|in) `journal\.md` → `## Agenda`/i.test(read(file)) && !/`## Agenda` to get the learning objectives/.test(read(file)), `${file} reads objectives or duration only from the agenda`);
  }
  assert.ok(!read("data/liascript-cheat-sheet.md").includes("does not start a new slide"), "the cheat sheet says ### stays on the slide again");
});

test("cheat sheet quiz examples put the attribute comment above the options and hints unindented", () => {
  const sheet = read("data/liascript-cheat-sheet.md");
  for (const block of sheet.match(/```lia\n[\s\S]*?```/g) ?? []) {
    const lines = block.split("\n");
    lines.forEach((line, i) => {
      if (/^<!-- data-(hint-button|max-trials|solution-button|text-)/.test(line)) {
        assert.match(lines[i + 1] ?? "", /^(- )?\[/, `quiz comment not directly above the options:\n${block}`);
      }
      assert.ok(!/^\s+\[\[\?\]\]/.test(line), `indented hint:\n${block}`);
    });
  }
  assert.ok(!sheet.includes("cannot be changed per quiz"), "the cheat sheet says feedback texts are fixed again");
});

test("skills are detected by their installed names; old names only as aliases", () => {
  const files = ["data/skills.md", "agents/teaching-agent.yaml", "agents/development-agent.yaml", "tasks/create-project.md", "tasks/update-project.md", "tasks/manage-templates.md"];
  for (const file of files) {
    for (const old of ["exporter-workflow", "template-development"]) {
      const lines = read(file).split("\n").filter(line => line.includes(old) && !/older name/.test(line));
      assert.deepEqual(lines, [], `${file} still detects the old skill name ${old}`);
    }
  }
  assert.match(read("data/skills.md"), /`liascript-exporter`/);
});

test("authoring notes in the journal template are <!--- … ---> so LiaScript ignores them", () => {
  const journal = read("templates/journal.md");
  const plain = [...journal.matchAll(/<!--(?!-)([\s\S]*?)-->/g)].slice(1)
    .map(match => match[1].trim()).filter(body => !/^(class|data-[\w-]+)=/.test(body));
  assert.deepEqual(plain.map(body => body.slice(0, 60)), []);
  assert.ok(!read("data/agent-links.md").includes("materials/03-"), "agent-links shows a zero-padded folder number again");
});

test("the course is always LiaScript: no platform or accessibility question, no accessibility field", () => {
  for (const file of ["tasks/init-course.md", "tasks/scaffold-course.md", "templates/course-context.yaml", "templates/journal.md"]) {
    assert.ok(!/Accessibility: (\[|\{\{)?required/.test(read(file)), `${file} asks for or stores accessibility again`);
  }
});

test("one unit word (no lectures-called), no early build link, cp only for the empty journal", () => {
  for (const file of ["tasks/init-course.md", "templates/course-context.yaml", "templates/journal.md", "data/session-types.md", "tasks/create-didactics.md", "checklists/course-quality-checklist.md"]) {
    assert.ok(!read(file).includes("lectures-called"), `${file} still uses lectures-called`);
  }
  assert.ok(!read("templates/session-skeleton.yaml").includes("agent:teaching/build-session"), "the skeleton offers build-session before an approved unit");
  assert.match(read("agents/teaching-agent.yaml"), /`cp specs\/templates\/journal\.md journal\.md`/);
});

test("leftovers of the first test round stay fixed", () => {
  assert.ok(!read("tasks/init-course.md").includes("Until step 7 is saved"), "init-course names the wrong save step");
  for (const file of ["tasks/init-course.md", "tasks/scaffold-course.md"]) {
    assert.match(read(file), /read_chat`? when the preview is connected/, `${file} requires read_chat in the terminal`);
  }
  const agent = read("agents/teaching-agent.yaml");
  for (const data of ["session-types.md", "didactic-methods.md", "duration-heuristic.md", "file-structure-modes.md"]) {
    assert.ok(agent.includes(`    - ${data}`), `teaching-agent.yaml dependencies miss ${data}`);
  }
  const artistLines = read("templates/journal.md").split("\n").filter(line => line.includes("](agent:artist/"));
  assert.deepEqual(artistLines.filter(line => /(?<!→ )`:create-(visuals|logo)`/.test(line)), [], "an action line shows an Artist command without :agent artist");
  assert.match(read("tasks/validate-course.md"), /- Mode: course/);
});

test("the required-elements key is English; the German Erforderlich is only read in older journals", () => {
  const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? (name === "node_modules" ? [] : walk(path)) : [path];
  });
  const hits = walk(specs).filter(path => /\.(md|ya?ml)$/.test(path) && !path.endsWith("example-project.yaml"))
    .flatMap(path => readFileSync(path, "utf8").split("\n").map(line => [path, line]))
    .filter(([, line]) => line.includes("Erforderlich") && !/older journals use `Erforderlich:`/.test(line));
  assert.deepEqual(hits.map(([path, line]) => `${path.slice(specs.length + 1)}: ${line.trim().slice(0, 80)}`), []);
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

function checkJournal(text, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "journal-"));
  const file = join(dir, "journal.md");
  writeFileSync(file, text);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  const run = spawnSync(process.execPath, [join(specs, "dashboard", "validate-journal.mjs"), file], { encoding: "utf8" });
  return { status: run.status, output: run.stdout + run.stderr };
}

// A small journal with two units, an agenda and a session with a validation report.
function journal({ agenda, outcome = "**Outcome:** passed (2026-10-19)", units = 2, context = "", didactics = "", decisions } = {}) {
  const data = { title: "X", ...(decisions ? { decisions } : {}), units: Array.from({ length: units }, (_, i) => ({ id: String(i + 1), title: `U${i + 1}`, state: "planned", ...(i === 0 ? { href: "#1.-intro" } : {}) })) };
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

test("open points never repeat the dashboard's group names", () => {
  for (const title of ["Vor dem Einsatz vorbereiten: Kopfhörer", "Prepare before use: headphones"]) {
    const run = checkJournal(journal({ decisions: [{ title, kind: "prepare", how: "x" }] }));
    assert.equal(run.status, 2, run.output);
    assert.match(run.output, /repeats the group name/);
  }
});

test("the journal check tells line references from content that mentions rows", () => {
  const content = checkJournal(journal({ outcome: "**Outcome:** passed (2026-10-19)\n\n**What works:**\n\n- The exercise sums Zeile 6 of the table" }));
  assert.equal(content.status, 0, content.output);
  for (const cited of ["- Missing alt text (Zeile 12)", "- Missing alt text in line 12", "- Missing alt text, Z. 12"]) {
    const run = checkJournal(journal({ outcome: `**Outcome:** passed (2026-10-19)\n\n**Still missing:**\n\n${cited}` }));
    assert.equal(run.status, 2, `${cited}: ${run.output}`);
  }
});

test("the Done check finds the column also when the header is translated", () => {
  const table = "| # | Titre | Type | Squelette | Matériel | Fait | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | module | ✅ | ✅ | ✅ | |";
  const failed = journal().replace("## Sessions\n\n", `## Sessions\n\n${table}\n\n`).replace("__Result:__ PASS", "__Result:__ FAIL");
  const run = checkJournal(failed, { "materials/1-intro/README.md": "# Intro" });
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /without a passed check/);
});

test("Material ✅ needs the material document, and a done unit needs Done ✅", () => {
  const table = done => `| # | Title | Type | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | module | ✅ | ✅ | ${done} | |`;
  const context = "* __File Structure:__\n  1. Mode: multi-file";
  const base = done => journal({ context }).replace("## Sessions\n\n", `## Sessions\n\n${table(done)}\n\n`);
  const missing = checkJournal(base("❌"));
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /material document .*missing/);
  assert.equal(checkJournal(base("❌"), { "materials/1-intro/README.md": "# Intro" }).status, 0);
  const single = journal({ context: "* __File Structure:__\n  1. Mode: single-file" }).replace("## Sessions\n\n", `## Sessions\n\n${table("❌")}\n\n`);
  assert.equal(checkJournal(single).status, 2);
  assert.equal(checkJournal(single, { "README.md": "# X\n\n## 1. Intro" }).status, 0);
  const doneUnit = base("❌").replace('"state":"planned"', '"state":"done"');
  const run = checkJournal(doneUnit, { "materials/1-intro/README.md": "# Intro" });
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /dashboard shows unit 1 as done/);
});

test("the journal check reads plain table labels, single-file chapters, the start link and the course summary", () => {
  const layout = mode => `* __File Structure:__\n  1. Mode: ${mode}\n\n| Item | Decided |\n|---|---|\n| Aufbau | ein Kurs mit Kapiteln |`;
  const hint = checkJournal(journal({ context: layout("multi-file") }));
  assert.equal(hint.status, 2, hint.output);
  assert.match(hint.output, /\[file-structure\]/);
  const table = "| # | Title | Type | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|\n| 1 | Intro | module | ✅ | ✅ | ❌ | |";
  const single = journal({ context: "* __File Structure:__\n  1. Mode: single-file" }).replace("## Sessions\n\n", `## Sessions\n\n${table}\n\n`);
  assert.equal(checkJournal(single, { "README.md": "# X\n\n## Something else" }).status, 2);
  assert.equal(checkJournal(single, { "README.md": "# X\n\n## Stunde: Intro" }).status, 0);
  const start = journal().replace("# X", "# X\n\n<!-- class=\"journal-start\" -->\n[Open the overview →](#no-such-heading)");
  const run = checkJournal(start);
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /#no-such-heading/);
  const summary = journal() + "\n\n## Validation\n\n### Latest Validation Summary\n\nDate: 2026-10-22\nResult: PASS\n";
  const missing = checkJournal(summary);
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /Latest Validation Summary/);
  assert.equal(checkJournal(journal() + "\n\n## Validation\n\n### Latest Validation Summary\n\nDate: 2026-10-22\nMode: course\nResult: PASS\n").status, 0);
});

test("the validation report heading stands outside its <section>", () => {
  const inside = journal().replace("#### Validation Report – Rapport de validation", "<section>\n\n#### Validation Report – Rapport de validation").replace("</details>", "</details>\n\n</section>");
  const run = checkJournal(inside);
  assert.equal(run.status, 2, run.output);
  assert.match(run.output, /heading inside <section>/);
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
  const context = "* __Terminology:__\n  1. sessions-called: Modul";
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
