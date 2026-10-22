// Checks the Dashboard data block in journal.md: valid JSON, valid model, and
// whether likely contradictions between sections are listed under `decisions`.
// Run from the course project root: node specs/dashboard/validate-journal.mjs [file]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "./dashboard.js";

const here = dirname(fileURLToPath(import.meta.url));
const candidates = ["journal.md", resolve(here, "..", "journal.md"), resolve(here, "..", "..", "journal.md")];
const file = process.argv[2] ?? candidates.find(path => existsSync(path)) ?? "journal.md";
const source = readFileSync(file, "utf8");
const language = (source.match(/^language:\s*(\w+)/m)?.[1] ?? "en").slice(0, 2).toLowerCase();

function section(key) {
  const match = source.match(new RegExp(`^## ${key}\\b[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return match ? match[1] : "";
}

// Heuristic hints. Every hint must appear in the Dashboard under `decisions`
// with the same `key` (or `{key}-{topic}`), or be resolved in the source sections.
// Older journals used German keys; they are accepted as aliases.
const aliases = { "file-structure": ["dateistruktur"], provisional: ["vorgemerkt"], preparation: ["vorbereitung"], slug: [], "type-name": [] };

function findHints() {
  const hints = [];
  const context = section("Course Context");
  const outline = section("Outline");
  const didactics = section("Didactics");
  const mode = context.match(/Mode:\s*(single-file|multi-file)/)?.[1];
  const layoutRow = context.match(/\|\s*\*\*(Aufbau|Structure|Layout)\*\*\s*\|([^|\n]*)\|/)?.[2] ?? "";
  if (mode === "multi-file" && /Kapitel|chapter/i.test(layoutRow) && !/eigene[nr]? (Link|Datei)|own (link|file)/i.test(layoutRow)) {
    hints.push({ key: "file-structure", text: "Course Context describes chapters in one course, but File Structure is multi-file" });
  }
  if (mode === "single-file" && /eigene[nr]? (Link|Datei)|own (link|file)/i.test(layoutRow)) {
    hints.push({ key: "file-structure", text: "Course Context describes one link/file per unit, but File Structure is single-file" });
  }
  if (/vorgemerkt|provisional/i.test(context) && /Learning Objectives/.test(outline) && /\n\s*1\.\s+\S/.test(outline.split(/Learning Objectives/)[1] ?? "")) {
    hints.push({ key: "provisional", text: "Course Context still contains provisional entries although the learning objectives are saved" });
  }
  const slugs = [...didactics.matchAll(/slug:\s*`([^`]+)`/g)].map(match => match[1]);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length) hints.push({ key: "slug", text: `Duplicate Session Type slug: ${[...new Set(duplicates)].join(", ")}` });
  // Slugs only appear in technical details; what the instructor sees is the display name. With
  // several types, a display name equal to a terminology word reads as "Modul 3 · Kind: Modul".
  const terms = [...context.matchAll(/(?:sessions|lectures)-called:\s*([\p{L}\w-]+)/gu)].map(match => match[1].toLowerCase());
  const names = [...didactics.matchAll(/__([^_\n]+)__\s*\(slug:/g)].map(match => match[1].trim());
  const shown = names.length > 1 ? names.filter(name => terms.includes(name.toLowerCase())) : [];
  if (shown.length) hints.push({ key: "type-name", text: `Session Type display name equals a terminology word: ${shown.join(", ")}` });
  const sources = [context, didactics, section("Agenda")].join("\n");
  if (/Hinweis für die Lehrkraft|besorgen|vorbereiten:|note for the instructor|to prepare:|instructor must prepare/i.test(sources)) {
    hints.push({ key: "preparation", kind: "prepare", text: "A section records a preparation task for the instructor" });
  }
  return hints;
}

const internalWords = language === "de"
  ? /\b(Kennung|Kurzwort|Slug|slug|Journal|Template|Session|Outline|Didactics|Persona)\b/
  : /\b(slug|Slug|journal\.md)\b/;

const match = source.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/);
if (!match) { console.error(`${file}: no "json @Dashboard.View" block found.`); process.exit(1); }
let model;
try {
  model = globalThis.LiaDashboard.buildModel(JSON.parse(match[1]));
} catch (error) {
  console.error(`${file}: invalid Dashboard data – ${error.message}`);
  process.exit(1);
}
const next = model.next ? (model.next.title || model.next.label) : "–";
console.log(`OK: ${model.total} units, ${model.completed} done, next step: ${next}, open points: ${model.decisions.length}`);

const problems = [];
const hints = findHints();
if (hints.length) {
  console.log("Hints:");
  hints.forEach(hint => console.log(`- [${hint.key}] ${hint.text}`));
}
const keyList = model.decisions.map(item => item.key).filter(Boolean);
keyList.filter((key, index) => keyList.indexOf(key) !== index).forEach(key =>
  problems.push(`key "${key}" is duplicated – give every item its own key, e.g. "${key}-topic"`));
const covered = hint => [hint.key, ...aliases[hint.key]].some(name =>
  keyList.some(key => key === name || key.startsWith(`${name}-`)));
hints.filter(hint => !covered(hint)).forEach(hint =>
  problems.push(`hint "${hint.key}" is missing in decisions (add an item with key: "${hint.key}" or resolve it in the source section)`));
model.decisions.filter(item => item.kind !== "internal").forEach(item => {
  if (!item.how) problems.push(`"${item.title}": field how is missing`);
  if (/^(Vor dem Einsatz vorbereiten|Vorbereitung|Noch zu entscheiden|Entscheidung|Prepare before use|Preparation|To decide|Decision)\s*:/i.test(item.title)) problems.push(`"${item.title}": title repeats the group name`);
  if (internalWords.test(`${item.title} ${item.why ?? ""} ${item.how ?? ""}`)) problems.push(`"${item.title}": internal term in an item for the instructor – mark it kind "internal" or rephrase`);
});
const sessionHeadings = [...section("Sessions").matchAll(/^### (\d+)\. /gm)].map(match => match[1]);
model.units.filter(unit => sessionHeadings.includes(unit.id) && !unit.href).forEach(unit =>
  problems.push(`unit ${unit.id} has a skeleton but no href to its subsection in ## Sessions`));
if (/^#{5}\s/m.test(section("Sessions").replace(/<section>[\s\S]*?<\/section>/g, ""))) problems.push("level-5 heading (#####) in ## Sessions – every heading becomes its own slide; use bold labels (or wrap the block in <section>)");
for (const report of section("Sessions").split(/^(?=#### Validation Report)/m).slice(1)) {
  const body = report.split(/^#{1,4} (?!Validation Report)/m)[0];
  const visible = body.split("<details>")[0];
  // The outcome label is translated into the course language: check for a bold label, not for a word.
  if (!/\*\*[^*\n]+:\*\*/.test(visible) || !/<details>/.test(body)) problems.push("validation report without visible summary (**Outcome:**) or without <details> – use templates/session-validation.yaml");
  // A row of a spreadsheet ("Zeile 6") is content; a reference to a line of the material is not.
  if (/\((?:Z\.|Zeilen?|[Ll]ines?)\s*\d+[^)]*\)|\b(?:Z\.|[Ll]ines?)\s*\d/.test(body)) problems.push("validation report cites line numbers – use page titles of the material");
}
if (/^#### Images\s*\n+_Filled by/m.test(source)) problems.push("empty \"#### Images\" block with a placeholder note – create it only when an image exists");
const sessions = section("Sessions");
const header = sessions.match(/^\|\s*#\s*\|(.*)\|\s*$/m)?.[1].split("|").map(cell => cell.trim()) ?? [];
// The overview table ends with … Material | Done | Notes; find the columns by name, else by that position.
const column = (name, fromEnd) => header.indexOf(name) >= 0 ? header.indexOf(name) : header.length - fromEnd;
const projectDir = dirname(resolve(file));
const fileMode = section("Course Context").match(/Mode:\s*(single-file|multi-file)/)?.[1];
const materialExists = number => fileMode === "single-file"
  ? existsSync(join(projectDir, "README.md"))
  : existsSync(join(projectDir, "materials")) && readdirSync(join(projectDir, "materials")).some(name => name.startsWith(`${number}-`) && existsSync(join(projectDir, "materials", name, "README.md")));
const doneRows = new Set();
for (const row of sessions.matchAll(/^\|\s*(\d+)\s*\|(.*)\|\s*$/gm)) {
  const cells = row[2].split("|").map(cell => cell.trim());
  if (header.length < 6) continue;
  const done = cells[column("Done", 2)];
  if (done?.includes("✅")) doneRows.add(row[1]);
  if (fileMode && cells[column("Material", 3)]?.includes("✅") && !materialExists(row[1])) problems.push(`unit ${row[1]}: "Material ✅" but the material document is missing (${fileMode === "single-file" ? "README.md" : `materials/${row[1]}-…/README.md`})`);
  if (done && done.includes("✅")) {
    const block = sessions.split(new RegExp(`^### ${row[1]}\\. `, "m"))[1]?.split(/^### \d+\. /m)[0] ?? "";
    if (!/#### Validation Report[\s\S]*?__Result:__\s*PASS(?!\s*with)/.test(block)) problems.push(`unit ${row[1]}: "Done ✅" without a passed check (Validation Report with "Result: PASS" – not "with concerns" – is missing)`);
    const report = block.split(/^(?=#### Validation Report)/m)[1]?.split(/^#### (?!Validation Report)/m)[0] ?? "";
    if (report.includes("⏳")) problems.push(`unit ${row[1]}: "Done ✅" while ⏳ items are still open in its Validation Report – Done follows only once nothing is deferred`);
  }
}
// Anchors: LiaScript builds a slide anchor from the full heading text – lower
// case, "-" and spaces collapse to single "-", punctuation (".", "?", "–") stays.
// An unknown anchor silently opens slide 1; a bare slide number (#10) breaks as
// soon as a slide is added above it.
const headingBody = source.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, "")
  .replace(/<section>[\s\S]*?<\/section>/g, "").replace(/<!--[\s\S]*?-->/g, "");
const anchorOf = text => "#" + text.trim().toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean).join("-");
const anchors = new Set([...headingBody.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => anchorOf(match[1])));
const hrefs = [];
(function walk(value) {
  if (Array.isArray(value)) value.forEach(walk);
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => key === "href" && typeof item === "string" ? hrefs.push(item) : walk(item));
})(JSON.parse(source.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)?.[1] ?? "{}"));
for (const href of hrefs.filter(item => item.startsWith("#"))) {
  if (/^#\d+$/.test(href)) problems.push(`link ${href} is a bare slide number – use the heading anchor (it moves when slides are added)`);
  else if (!anchors.has(decodeURIComponent(href).toLowerCase())) problems.push(`link ${href} matches no heading – LiaScript opens slide 1 instead (anchor = full heading text, lower case, spaces → "-", punctuation kept)`);
}
// Visible commands must not show raw placeholders like {description}.
for (const href of hrefs) if (/\{[a-z_-]+\??\}/i.test(href)) problems.push(`link ${href} contains a raw placeholder – pass the value or omit the parameter`);
(function walkCommands(value) {
  if (Array.isArray(value)) value.forEach(walkCommands);
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => key === "command" && typeof item === "string" ? (/\{[a-z_-]+\??\}/i.test(item) && problems.push(`command "${item}" shows a raw placeholder – use the value or a translated hint like <what?>`)) : walkCommands(item));
})(JSON.parse(source.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)?.[1] ?? "{}"));
for (const line of source.split("\n").filter(line => /class="journal-actions"/.test(line) || /^\[.*\]\(agent:/.test(line))) {
  for (const code of line.matchAll(/`(:[^`]*)`/g)) if (/\{[a-z_-]+\??\}/i.test(code[1])) problems.push(`action line shows a raw placeholder: ${code[1]}`);
}
// Count the units table only: the table after `<!-- data-type="none" -->` (templates/course-agenda.yaml),
// never the technical table in <details> or a time budget table; placeholder rows ({{…}}) do not count.
function agendaUnitRows(agenda) {
  const visible = agenda.replace(/<details>[\s\S]*?<\/details>/g, "");
  const [, marked] = visible.split(/<!--\s*data-type="none"\s*-->/);
  let lines = (marked ? marked.trimStart() : visible.replace(/<!--[\s\S]*?-->/g, "")).split("\n");
  if (marked) {
    const end = lines.findIndex(line => !/^\s*\|/.test(line));
    if (end !== -1) lines = lines.slice(0, end);
  }
  return lines.filter(line => /^\s*\|\s*\d+\s*\|/.test(line) && !line.includes("{{")).length;
}
model.units.filter(unit => unit.state === "done" && header.length >= 6 && !doneRows.has(unit.id)).forEach(unit =>
  problems.push(`the dashboard shows unit ${unit.id} as done, but its Done column is not ✅`));
const agendaRows = agendaUnitRows(section("Agenda"));
if (agendaRows && model.total !== agendaRows) problems.push(`the agenda has ${agendaRows} rows, the dashboard shows ${model.total} units`);
if (problems.length) {
  console.error("ERRORS:");
  problems.forEach(problem => console.error(`- ${problem}`));
  console.log("Exit code: 2 (fix and run again)");
  process.exit(2);
}
console.log("Exit code: 0");
