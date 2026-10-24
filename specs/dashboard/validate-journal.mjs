// Checks the Dashboard data block in journal.md: valid JSON, valid model, and
// whether likely contradictions between sections are listed under `decisions`.
// "Warnings:" lists likely contradictions that do not change the exit code.
// Run from the course project root: node specs/dashboard/validate-journal.mjs [file]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "./dashboard.js";
import { unencodedUrls, describeUrl, analyseMaterial } from "./check-material.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const candidates = ["journal.md", resolve(here, "..", "journal.md"), resolve(here, "..", "..", "journal.md")];
const file = process.argv[2] ?? candidates.find(path => existsSync(path)) ?? "journal.md";
if (!existsSync(file)) {
  console.error(`No journal found (${file}) – run from the course project root or name the file: node specs/dashboard/validate-journal.mjs <journal.md>`);
  console.log("Exit code: 2");
  process.exit(2);
}
const source = readFileSync(file, "utf8");
const language = (source.match(/^language:\s*(\w+)/m)?.[1] ?? "en").slice(0, 2).toLowerCase();

const short = (text, length = 60) => text.length > length ? `${text.slice(0, length - 1)}…` : text;

// Language packs (templates/i18n/*.json): the empty-journal lines, the current state words (`terms`) and
// their outdated forms (`outdatedTerms`: [pattern, term key]).
const packs = (() => {
  const dir = resolve(here, "..", "templates", "i18n");
  try {
    return readdirSync(dir).filter(item => item.endsWith(".json")).map(item => JSON.parse(readFileSync(join(dir, item), "utf8")));
  } catch { return []; }
})();
// The current state words in English (templates/session-validation.yaml → outcome_words); the pack of
// the course language overrides them. A warning recommends only these, never a report's own wording.
const englishTerms = {
  skeleton: "planning sketch",
  passedMissing: "passed – still missing: {what}",
  recheckShort: "{n} point(s) changed since – short re-check open",
  correctionOpen: "correction needed: {open} of {n} points open",
  usableYes: "yes", usableLimited: "yes, with limits: {what}", usableNo: "not yet: {why}"
};
const englishOutdated = [["still follows", "passedMissing"], ["(?<!\\p{L})revised(?!\\p{L})", "recheckShort"],
  ["(?<!short )re-check open", "recheckShort"], ["correction needed \\(\\d+\\)(?=.*changed since)", "correctionOpen"], ["skeleton ✅", "skeleton"]];
const coursePack = packs.find(pack => String(pack.language ?? "").slice(0, 2).toLowerCase() === language);
const terms = { ...englishTerms, ...(coursePack?.terms ?? {}) };
const outdatedPatterns = [...englishOutdated, ...packs.flatMap(pack => pack.outdatedTerms ?? [])]
  .map(([pattern, term]) => ({ pattern: new RegExp(pattern, "iu"), term }));
const dateInParens = /\s*\((?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{1,2}\/\d{1,2}\/\d{4})\)/g;
// Outdated state wordings in a text: the " – " part that holds each, and the current term for it.
function outdatedIn(text) {
  const plain = String(text ?? "").replace(dateInParens, "");
  const parts = plain.split(/\s+[–-]\s+|;\s*/);
  const found = [];
  for (const { pattern, term } of outdatedPatterns) {
    const hit = plain.match(pattern);
    if (!hit) continue;
    const part = parts.find(item => pattern.test(item)) ?? hit[0];
    if (!found.some(item => item.part === part)) found.push({ part, term: terms[term] ?? englishTerms[term] });
  }
  return found;
}
const staleText = found => `uses outdated wording (${found.map(item => `"${item.part}"`).join(", ")}) – never copy it; the current wording is ${[...new Set(found.map(item => `"${item.term}"`))].join(", ")}`;
// The report's line "usable with learners now": its value → yes | limited | no (English or any pack).
const prefixOf = term => String(term ?? "").split(/[:{]/)[0].trim().toLowerCase();
const usablePrefixes = Object.fromEntries([["no", "usableNo"], ["limited", "usableLimited"], ["yes", "usableYes"]].map(([state, key]) =>
  [state, [englishTerms[key], ...packs.map(pack => pack.terms?.[key])].map(prefixOf).filter(Boolean)]));
function usableState(value) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["no", "limited", "yes"].find(state => usablePrefixes[state].some(prefix => text.startsWith(prefix))) ?? null;
}

function section(key) {
  const match = source.match(new RegExp(`^## ${key}\\b[^\\n]*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return match ? match[1] : "";
}

// A unit's check report: a #### heading that starts with "Validation Report" (older journals), or any
// #### heading directly followed by <section data-key="validation-report"> (heading only in the course
// language). markReports() prefixes the second form, so every check below finds both.
const reportKey = /^<section\s+data-key=["']validation-report["'][^>]*>/;
function reportHeadings(text) {
  const lines = text.split("\n");
  let unit = "";
  const found = [];
  lines.forEach((line, index) => {
    unit = line.match(/^### (\d+)\. /)?.[1] ?? unit;
    const heading = line.match(/^#### (.+?)\s*$/);
    const after = lines.slice(index + 1).find(item => item.trim())?.trim() ?? "";
    if (heading && (/^Validation Report\b/.test(heading[1]) || reportKey.test(after))) found.push({ index, title: heading[1], unit });
  });
  return found;
}
function markReports(text) {
  const lines = text.split("\n");
  for (const { index, title } of reportHeadings(text)) if (!/^Validation Report\b/.test(title)) lines[index] = `#### Validation Report ${title}`;
  return lines.join("\n");
}

// Heuristic hints. Every hint must appear in the Dashboard under `decisions`
// with the same `key` (or `{key}-{topic}`), or be resolved in the source sections.
// Older journals used German keys; they are accepted as aliases.
const aliases = { "file-structure": ["dateistruktur"], provisional: ["vorgemerkt"], preparation: ["vorbereitung"], slug: [], "type-name": [], "template-brief": [] };

// ## Templates (templates/course-templates.yaml; the heading may carry a translated suffix): the selection line
// `__Template selection:__` before <section> (missing = open), adopted entries with `__Catalog id:__ {id}` and
// briefs `### {id} (in development)` of templates still being developed. A wrong selection is a problem; a brief
// that is not complete yet is a hint (key template-brief), so the overview lists it instead of blocking the write.
const templateId = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const briefStates = ["brief", "in development", "ready to test"];
const briefFields = ["State", "Learners do", "Feedback", "Learning objective", "Audience", "Used in", "Acceptance", "Why not existing"];
function fieldsOf(block) {
  const fields = {};
  let name = null;
  for (const line of block.split("\n")) {
    const field = line.match(/^\s*[*-]\s+__([^_\n]+):__[ \t]*(.*)$/);
    if (field) fields[name = field[1].trim()] = field[2].trim();
    else if (name && line.trim()) fields[name] = `${fields[name]}\n${line.trim()}`.trim();
  }
  return fields;
}
function checkTemplates() {
  const text = section("Templates").replace(/<!--[\s\S]*?-->/g, "");
  const found = { problems: [], hints: [], briefs: [] };
  const entries = text.split(/^(?=### )/m).slice(1).map(block => ({ heading: block.match(/^### (.+?)\s*$/m)?.[1] ?? "", fields: fieldsOf(block.split(/^<\/section>/m)[0]) }));
  const briefs = entries.filter(entry => / \(in development\)$/.test(entry.heading)).map(entry => ({ ...entry, id: entry.heading.replace(/ \(in development\)$/, "") }));
  const selection = text.split(/^<section\b/m)[0].match(/^\s*[*-]\s+__Template selection:__[ \t]*(.*)$/m)?.[1].trim() ?? "open";
  const ids = selection.match(/^done – (.+)$/)?.[1].split(",").map(id => id.trim());
  if (selection !== "open" && selection !== "done – none needed" && !(ids && ids.every(id => templateId.test(id)))) {
    found.problems.push(`## Templates: __Template selection:__ "${short(selection)}" is none of "open", "done – none needed", "done – {id}, {id}" (ids in lower case with "-", as in the catalog)`);
  } else if (ids && selection !== "done – none needed") {
    const catalogIds = entries.map(entry => (entry.fields["Catalog id"] ?? "").replace(/`/g, "").trim());
    for (const id of ids.filter(id => !catalogIds.includes(id) && !briefs.some(brief => brief.id === id))) {
      found.problems.push(`## Templates: the template selection names "${id}", but ## Templates has no entry with __Catalog id:__ ${id} and no brief "### ${id} (in development)" – adopt it with :manage-templates ${id} or write its brief (:suggest-templates); if it was removed, take ${id} out of the selection line (no id left: "done – none needed", or "open" while an activity is undecided)`);
    }
  }
  found.briefs = briefs.map(brief => ({ id: brief.id, state: brief.fields.State, usedIn: brief.fields["Used in"] ?? "" }));
  const projectDir = dirname(resolve(file));
  for (const brief of briefs) {
    const name = `brief "${brief.heading}"`;
    if (!templateId.test(brief.id)) found.hints.push({ key: "template-brief", text: `${name}: the heading names no id (lower case with "-", e.g. "### turtle-maze (in development)")` });
    const lacking = briefFields.filter(field => !brief.fields[field]);
    if (lacking.length) found.hints.push({ key: "template-brief", text: `${name} lacks ${lacking.map(field => `__${field}:__`).join(", ")}` });
    const state = brief.fields.State;
    if (state && !briefStates.includes(state)) found.hints.push({ key: "template-brief", text: `${name}: __State:__ "${short(state, 30)}" is none of ${briefStates.map(item => `"${item}"`).join(", ")}` });
    if (state === "ready to test" && !brief.fields.Folder) found.hints.push({ key: "template-brief", text: `${name} is ready to test, but __Folder:__ is empty` });
    else if (state === "ready to test" && !existsSync(join(projectDir, "lia-templates", brief.id, "README.md"))) found.hints.push({ key: "template-brief", text: `${name} is ready to test, but lia-templates/${brief.id}/README.md does not exist next to the journal` });
  }
  return found;
}
const templateFindings = checkTemplates();

function findHints() {
  const hints = [];
  const context = section("Course Context");
  const outline = section("Outline");
  const didactics = section("Didactics");
  const mode = context.match(/Mode:\s*(single-file|multi-file)/)?.[1];
  const layoutRow = context.match(/\|\s*(?:\*\*)?(Aufbau|Structure|Layout)(?:\*\*)?\s*\|([^|\n]*)\|/)?.[2] ?? "";
  if (mode === "multi-file" && /Kapitel|chapter/i.test(layoutRow) && !/eigene[nr]? (Link|Datei)|own (link|file)/i.test(layoutRow)) {
    hints.push({ key: "file-structure", text: "Course Context describes chapters in one course, but File Structure is multi-file" });
  }
  if (mode === "single-file" && /eigene[nr]? (Link|Datei)|own (link|file)/i.test(layoutRow)) {
    hints.push({ key: "file-structure", text: "Course Context describes one link/file per unit, but File Structure is single-file" });
  }
  // Saved objectives: under the key comment data-key="learning-goals" (label in the course language) or, in older
  // journals, under the English label "Learning Objectives".
  const goalsMarker = /data-key=["']learning-goals["']|Learning Objectives/;
  const objectivesSaved = goalsMarker.test(outline) && /\n\s*1\.\s+\S/.test(outline.split(goalsMarker)[1]?.split(/<!--\s*data-key=|\n\s*[*-] __/)[0] ?? "");
  if (/vorgemerkt|provisional/i.test(context) && objectivesSaved) {
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
  hints.push(...templateFindings.hints);
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
// The group and state texts exactly as the overview shows them, in the course language: name a group
// or a state with these words (and count the same set the group shows).
const shownTexts = globalThis.LiaDashboard.visibleTexts(JSON.parse(match[1]), language);
const shownGroups = shownTexts.groups.filter(group => group.count);
if (shownGroups.length) console.log(`Groups (as shown): ${shownGroups.map(group => group.kind === "internal" ? `"${group.title}"` : `"${group.title}" ${group.count}${group.fromCheck ? ` (${group.fromCheck} ${shownTexts.fromCheck})` : ""}`).join(" · ")}`);
if (shownTexts.states.length) console.log(`States (as shown): ${shownTexts.states.map(text => `"${text}"`).join(" · ")}`);
if (shownTexts.usable.length) console.log(`Usable (as shown): ${shownTexts.usable.map(item => `${item.id} "${item.text}"`).join(" · ")}`);

const problems = [...templateFindings.problems];
if (!String(model.title ?? "").trim()) problems.push("Dashboard has no title – write the course title (or \"New course\", translated) into title; without it the page shows an empty heading");
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
// A link of an open point needs its own text: the question is never the link text.
model.decisions.filter(item => item.href && !String(item.label ?? "").trim()).forEach(item =>
  problems.push(`"${item.title}": href without label – the label names the destination (e.g. "See outline"), not the question`));
// Exactly one button carries the icon of the next step; agent: buttons without an icon show ▶️.
const iconOf = item => item?.icon || (String(item?.href ?? "").startsWith("agent:") ? "▶️" : "");
const nextIcon = iconOf(model.next);
if (nextIcon) model.explore.filter(item => iconOf(item) === nextIcon).forEach(item =>
  problems.push(`explore "${item.title || item.label}": icon ${nextIcon} is the icon of the next step – optional actions use ➕ or the icon of their agent`));
// The library puts its own label ("Ready:") before a result; a status word of its own doubles it.
[{ title: "", process: model.process }, ...model.units].forEach(unit => unit.process.steps.forEach(step => {
  const word = String(step.result ?? "").match(/^\s*(Gespeichert|Erledigt|Fertig|Abgeschlossen|Liegt vor|Saved|Done|Finished|Completed|Ready)\s*:/i)?.[1];
  if (word) problems.push(`process step "${unit.title ? `${unit.title} → ` : ""}${step.title}": result starts with "${word}:" – the dashboard adds its own label; state only what exists`);
}));
const sessionsText = markReports(section("Sessions"));
const sessionHeadings = [...sessionsText.matchAll(/^### (\d+)\. /gm)].map(match => match[1]);
model.units.filter(unit => sessionHeadings.includes(unit.id) && !unit.href).forEach(unit =>
  problems.push(`unit ${unit.id} has a skeleton but no href to its subsection in ## Sessions – patch units[${unit.id}].href, its statusLabel and first process step in the overview cache and run write-dashboard.mjs in the same save as the skeleton (tasks/build-session.md step 0), not only at the end of a run`));
if (/^#{5}\s/m.test(sessionsText.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g, ""))) problems.push("level-5 heading (#####) in ## Sessions – every heading becomes its own slide; use bold labels (or wrap the block in <section>)");
if (/<section\b[^>]*>\s*\n\s*#### Validation Report/.test(sessionsText)) problems.push("#### Validation Report heading inside <section> – the heading stays outside, everything below it goes into <section>");
for (const report of sessionsText.split(/^(?=#### Validation Report)/m).slice(1)) {
  const body = report.split(/^#{1,4} (?!Validation Report)/m)[0];
  const visible = body.split("<details>")[0];
  // The outcome label is translated into the course language: check for a bold label, not for a word.
  if (!/\*\*[^*\n]+:\*\*/.test(visible) || !/<details>/.test(body)) problems.push("validation report without visible summary (**Outcome:**) or without <details> – use templates/session-validation.yaml");
  // A row of a spreadsheet ("Zeile 6") is content; a reference to a line of the material is not.
  if (/\((?:Z\.|Zeilen?|[Ll]ines?)\s*\d+[^)]*\)|\b(?:Z\.|[Ll]ines?)\s*\d/.test(body)) problems.push("validation report cites line numbers – use page titles of the material");
}
if (/^#### Images\s*\n+_Filled by/m.test(source)) problems.push("empty \"#### Images\" block with a placeholder note – create it only when an image exists");
const sessions = sessionsText;
const header = sessions.match(/^\|\s*#\s*\|(.*)\|\s*$/m)?.[1].split("|").map(cell => cell.trim()) ?? [];
// The overview table ends with … Material | Done | Notes; find the columns by name, else by that position.
const column = (name, fromEnd) => header.indexOf(name) >= 0 ? header.indexOf(name) : header.length - fromEnd;
const projectDir = dirname(resolve(file));
const fileMode = section("Course Context").match(/Mode:\s*(single-file|multi-file)/)?.[1];
// single-file: the unit is a ## chapter of README.md whose heading contains the unit title
const readme = () => existsSync(join(projectDir, "README.md")) ? readFileSync(join(projectDir, "README.md"), "utf8") : "";
const materialExists = (number, title) => fileMode === "single-file"
  ? readme().split("\n").some(line => line.startsWith("## ") && (!title || line.toLowerCase().includes(title.toLowerCase())))
  : existsSync(join(projectDir, "materials")) && readdirSync(join(projectDir, "materials")).some(name => name.startsWith(`${number}-`) && existsSync(join(projectDir, "materials", name, "README.md")));
const doneRows = new Set();
const materialRows = new Set();
const notesCells = new Map();
for (const row of sessions.matchAll(/^\|\s*(\d+)\s*\|(.*)\|\s*$/gm)) {
  const cells = row[2].split("|").map(cell => cell.trim());
  if (header.length < 6) continue;
  const done = cells[column("Done", 2)];
  if (header.length >= 6) notesCells.set(row[1], cells[column("Notes", 1)] ?? "");
  if (done?.includes("✅")) doneRows.add(row[1]);
  if (cells[column("Material", 3)]?.includes("✅")) materialRows.add(row[1]);
  if (fileMode && cells[column("Material", 3)]?.includes("✅") && !materialExists(row[1], cells[header.indexOf("Title") >= 0 ? header.indexOf("Title") : 0])) problems.push(`unit ${row[1]}: "Material ✅" but the material document is missing (${fileMode === "single-file" ? "README.md" : `materials/${row[1]}-…/README.md`})`);
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
// Comments first: an authoring comment may quote a literal <section …> tag.
const headingBody = source.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, "")
  .replace(/<!--[\s\S]*?-->/g, "").replace(/<section\b[^>]*>[\s\S]*?<\/section>/g, "");
const anchorOf = text => "#" + text.trim().toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean).join("-");
const anchors = new Set([...headingBody.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => anchorOf(match[1])));
// Headings inside a <section> block become no slide: their anchor also opens slide 1.
const sectionAnchors = new Set([...source.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "")
  .matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].flatMap(block => [...block[0].matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => anchorOf(match[1]))));
const insideSection = "points to a heading inside a <section> block – LiaScript makes no slide of it and opens slide 1; link the enclosing ## heading and name the subsection in the text";
const hrefs = [];
(function walk(value) {
  if (Array.isArray(value)) value.forEach(walk);
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => key === "href" && typeof item === "string" ? hrefs.push(item) : walk(item));
})(JSON.parse(source.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)?.[1] ?? "{}"));
for (const href of hrefs.filter(item => item.startsWith("#"))) {
  if (/^#\d+$/.test(href)) problems.push(`link ${href} is a bare slide number – use the heading anchor (it moves when slides are added)`);
  else if (!anchors.has(decodeURIComponent(href).toLowerCase()) && sectionAnchors.has(decodeURIComponent(href).toLowerCase())) problems.push(`link ${href} ${insideSection}`);
  else if (!anchors.has(decodeURIComponent(href).toLowerCase())) problems.push(`link ${href} matches no heading – LiaScript opens slide 1 instead (anchor = full heading text, lower case, spaces → "-", punctuation kept)`);
}
// The start link below the title and the course summary are written by tasks, not by the dashboard.
const startLinks = source.split(/<!-- class="journal-start" -->/)[1]?.trimStart().split("\n\n")[0] ?? "";
for (const [, link] of startLinks.matchAll(/\]\((#[^)\s]+)\)/g)) {
  if (!anchors.has(decodeURIComponent(link).toLowerCase())) problems.push(`start link ${link} matches no heading – use the full heading anchor`);
}
const summary = section("Validation").split(/^### Latest Validation Summary[^\n]*\n/m)[1]?.split(/^#{1,3} /m)[0].replace(/<!--[\s\S]*?-->/g, "") ?? "";
if (/\b(Date|Result):/.test(summary) && !(/\bMode:\s*\S/.test(summary) && /\bResult:\s*\S/.test(summary))) problems.push("Latest Validation Summary needs the key lines Mode: and Result: (read by the publishing gate)");
// Template placeholders ({{…}}) must never be visible in the title or the Dashboard.
// Journals written with the template before fe18ee1 still show {{…}} skeletons: migrate-journal.mjs moves them
// to the current layout (representation only). LiaScript in inline code (`{{1}}`, `{{|>}}`) is no placeholder.
const migrateHint = "older journal layout – run `node specs/dashboard/migrate-journal.mjs` (representation only; `--check` lists the changes first)";
const title = headingBody.match(/^# (.+)$/m)?.[1] ?? "";
if (title.includes("{{")) problems.push(`course title "${title}" is a template placeholder – use a neutral title in the course language ("New course", translated); ${migrateHint}`);
let placeholderSection = "";
const visiblePlaceholders = source.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "")
  .split("\n").map(line => ({ line: line.replace(/`[^`\n]*`/g, ""), section: (placeholderSection = /^## /.test(line) ? line.slice(3).split(/\s+–\s+/)[0] : placeholderSection) }))
  .filter(({ line }) => line.includes("{{") && !line.startsWith("# "));
if (visiblePlaceholders.length) problems.push(`${visiblePlaceholders.length} visible template placeholder line(s) ({{…}}) in ${[...new Set(visiblePlaceholders.map(item => item.section || "the header"))].join(", ")}, e.g. "${visiblePlaceholders[0].line.trim().slice(0, 80)}" – an unfilled section shows only its one-line note; ${migrateHint}; in a section filled by hand, fill or remove the line`);
(function walkTexts(value, path) {
  if (Array.isArray(value)) value.forEach((item, index) => walkTexts(item, `${path}[${index}]`));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => walkTexts(item, path ? `${path}.${key}` : key));
  else if (typeof value === "string" && value.includes("{{")) problems.push(`Dashboard ${path} shows a template placeholder: "${value}"${path === "footer" && value.includes("{{YYYY-MM-DD}}") ? ` – ${migrateHint}` : ""}`);
})(JSON.parse(source.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)?.[1] ?? "{}"), "");
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
// The No. cell is plain digits; "1." and the escaped "1\." are accepted as well.
function agendaUnitRows(agenda) {
  const visible = agenda.replace(/<details>[\s\S]*?<\/details>/g, "");
  const [, marked] = visible.split(/<!--\s*data-type="none"\s*-->/);
  let lines = (marked ? marked.trimStart() : visible.replace(/<!--[\s\S]*?-->/g, "")).split("\n");
  if (marked) {
    const end = lines.findIndex(line => !/^\s*\|/.test(line));
    if (end !== -1) lines = lines.slice(0, end);
  }
  // Data rows: table lines that are neither the separator nor the header line above it.
  const separator = line => /^\s*\|[\s:|-]+\|\s*$/.test(line) && line.includes("-");
  const data = lines.filter((line, index) => /^\s*\|/.test(line) && !separator(line) && !separator(lines[index + 1] ?? "") && !line.includes("{{"));
  return { rows: data.filter(line => /^\s*\|\s*\d+\\?\.?\s*\|/.test(line)).length, tableRows: data.length };
}
model.units.filter(unit => unit.state === "done" && header.length >= 6 && !doneRows.has(unit.id)).forEach(unit =>
  problems.push(`the dashboard shows unit ${unit.id} as done, but its Done column is not ✅`));
const { rows: agendaRows, tableRows: agendaTableRows } = agendaUnitRows(section("Agenda"));
if (agendaTableRows && !agendaRows) problems.push("agenda table found, but no numbered rows recognised (No. must be plain digits, e.g. \"| 1 |\")");
// With a required agenda, units are created only after it: the Sessions action line offers create-agenda first.
const sessionsActions = section("Sessions").split(/<!-- class="journal-actions" -->/)[1]?.trimStart().split("\n")[0] ?? "";
if (/Agenda required:\s*yes/.test(section("Course Context")) && !agendaTableRows && /agent:teaching\/create-session/.test(sessionsActions)) problems.push("the Sessions action line offers create-session before the required agenda exists – offer create-agenda first");
if (agendaRows && model.total !== agendaRows) problems.push(`the agenda has ${agendaRows} rows, the dashboard shows ${model.total} units`);
// Every unit gets the same material steps from the start (templates/project-dashboard.yaml → units.process).
const withSteps = model.units.filter(unit => unit.process.steps.length);
const withoutSteps = model.units.filter(unit => !unit.process.steps.length);
if (withSteps.length && withoutSteps.length) problems.push(`unit${withoutSteps.length === 1 ? "" : "s"} ${withoutSteps.map(unit => unit.id).join(", ")} without process.steps while unit ${withSteps[0].id} has them – every unit gets the same material steps from the start; not-started units have all steps planned`);
// The empty-state note under ## Sessions ("… created after the didactics …") is outdated once the agenda plans units.
// Its wording comes from templates/journal.md or a language pack (unit word may be replaced): match its tail loosely.
const packTails = packs.flatMap(pack => pack.unitLines ?? [])
  .filter(line => line.startsWith("_") && line.includes("–")).map(line => line.split("–").slice(1).join("–").replace(/[_\s]+/g, " ").trim().toLowerCase());
const notes = section("Sessions").replace(/<!--[\s\S]*?-->/g, "").split("\n").filter(line => line.startsWith("_"));
const staleNote = notes.find(line => /after the didactics|nach der Didaktik/i.test(line)
  || packTails.some(tail => line.replace(/[_\s]+/g, " ").toLowerCase().includes(tail)));
if (agendaRows && staleNote) problems.push(`## Sessions still shows the empty-state note "${staleNote.trim().slice(0, 80)}" although ## Agenda plans ${agendaRows} units – the note says instead that the units are planned in the agenda and are created one after another, starting with the first`);
// Warnings: likely contradictions the instructor reads, printed without changing the exit code.
const warnings = [];
// A unit with its subsection has begun; "planned" without its own statusLabel reads as not started.
model.units.filter(unit => unit.href && unit.state === "planned" && !String(unit.statusLabel ?? "").trim()).forEach(unit =>
  warnings.push(`unit ${unit.id} has its subsection (href) but state "planned" and no statusLabel – set the state that matches its work (e.g. current) or a statusLabel`));
// The note "… created one after another, starting with unit 1" is outdated once that unit has its ### subsection.
// The unit is the number named after "starting with" in the same sentence, else the first unit.
const startNote = notes.find(line => /beginnend mit|starting with/i.test(line));
const startUnit = startNote?.match(/(?:beginnend mit|starting with)[^.\d]*(\d+)/i)?.[1] ?? String(model.units[0]?.id ?? "1");
if (startNote && sessionHeadings.includes(startUnit)) warnings.push(`## Sessions note "${startNote.trim().slice(0, 80)}" says the units are created starting with unit ${startUnit}, but "### ${startUnit}." already exists – update the note to the current state`);
// Template step (tasks/update-dashboard.md → Rules → Template step): once every open brief is ready to test,
// its result says so, not "in development"; and :suggest-templates never takes next from an agenda that is
// saved or a unit being worked on (existing journals without the selection line count as open).
const openBriefs = templateFindings.briefs;
if (openBriefs.length && openBriefs.every(brief => brief.state === "ready to test")) {
  model.process?.steps?.filter(step => /\bin (development|Entwicklung)\b/i.test(String(step.result ?? ""))).forEach(step =>
    warnings.push(`the template step says "${short(step.result, 60)}", but every open brief is ready to test (${openBriefs.map(brief => brief.id).join(", ")}) – write "ready to test" (German "bereit zum Ausprobieren")`));
}
if (/^agent:teaching\/suggest-templates\b/.test(String(model.next?.href ?? ""))) {
  const working = model.units.find(unit => ["current", "draft", "review", "revision"].includes(unit.state));
  if (working) warnings.push(`next suggests templates although unit ${working.id} is being worked on – next stays with the unit, :suggest-templates goes into explore (icon ➕)`);
  else if (agendaTableRows) warnings.push("next suggests templates although the agenda is saved – next stays with the agenda and the units, :suggest-templates goes into explore (icon ➕)");
}
// A brief takes next from a unit being worked on only when its __Used in:__ names that unit:
// by number ("Einheit 1, 3"), by range ("units 2–4", "2-4") or all of them ("alle Einheiten", "all units").
const briefNext = String(model.next?.href ?? "").match(/^agent:(development\/develop-template\?id|teaching\/manage-templates\?name)=([a-z0-9-]+)/);
const nextBrief = briefNext && openBriefs.find(brief => brief.id === briefNext[2]);
if (nextBrief) {
  const working = model.units.find(unit => ["current", "draft", "review", "revision"].includes(unit.state));
  const names = id => /\b(all|alle|allen)\b/i.test(nextBrief.usedIn)
    || [...nextBrief.usedIn.matchAll(/(\d+)\s*[–-]\s*(\d+)/g)].some(([, from, to]) => Number(id) >= Number(from) && Number(id) <= Number(to))
    || new RegExp(`(^|\\D)${String(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\D|$)`).test(nextBrief.usedIn);
  const command = briefNext[1].startsWith("development") ? ":develop-template" : ":manage-templates";
  if (working && !names(working.id)) warnings.push(`next is the brief "${nextBrief.id}" although unit ${working.id} is being worked on and its __Used in:__ does not name it – next stays with the unit, ${command} ${nextBrief.id} goes into explore (icon ➕)`);
}
// The next step of a unit (agent: link with number=n) names that unit's current step: the course
// step is shown by the process bar, and a second label for the same command reads as a new task.
const nextUnit = model.units.find(unit => unit.id === String(model.next?.href ?? "").match(/^agent:[^?]*\?(?:[^#]*&)?number=(\d+)/)?.[1]);
const openStep = nextUnit?.process.steps.find(step => ["current", "draft", "review", "revision"].includes(step.state))
  ?? nextUnit?.process.steps.find(step => !["done", "optional"].includes(step.state));
if (openStep) {
  const lower = text => String(text ?? "").toLowerCase();
  if (model.next.title && !lower(model.next.title).includes(lower(openStep.title))) warnings.push(`next.title "${model.next.title}" is not the current step of unit ${nextUnit.id} ("${openStep.title}") – the next step of a unit is titled with that step; the course step shows in the process bar`);
  const words = lower(openStep.title).split(/[^\p{L}\d]+/u).filter(word => word.length >= 4);
  if (model.next.label && words.length && !words.some(word => lower(model.next.label).includes(word.slice(0, 5)))) warnings.push(`next.label "${model.next.label}" does not name the step "${openStep.title}" – the label is that step as an action; other work in the unit gets its own step`);
}
// "Finished/ready" is reserved for a unit whose check passed (tasks/update-dashboard.md).
const finishedWord = /(?<!\b(?:nicht|noch nicht|not|not yet|kein|keine)\s)\b(finished|ready|completed?|done|fertig(?:gestellt)?|abgeschlossen|erledigt)\b/i;
const unitBlock = id => sessions.split(new RegExp(`^### ${id}\\. `, "m"))[1]?.split(/^### /m)[0] ?? "";
// Passed means PASS without a deferred item (⏳) – "finished" waits for those too.
const passed = id => /#### Validation Report[\s\S]*?__Result:__\s*PASS(?!\s*with)/.test(unitBlock(id)) && !/⏳/.test(unitBlock(id).split(/^#### Validation Report/m)[1] ?? "");
const statusLines = new Map([...sessions.replace(/<!--[\s\S]*?-->/g, "").replace(/<details>[\s\S]*?<\/details>/g, "").split(/^### /m)[0]
  .matchAll(/^(\d+)\.\s+(.+)$/gm)].map(match => [match[1], match[2].trim()]));
// `{n}. {title} – {status}`: the status is what follows the unit title (of the overview or of its ### heading),
// else what follows the first dash – status words contain dashes themselves.
const headingTitles = new Map([...sessions.matchAll(/^### (\d+)\.\s+(.+?)\s*$/gm)].map(match => [match[1], match[2]]));
const statusOf = unit => {
  const line = statusLines.get(unit.id) ?? "";
  const title = [unit.title, headingTitles.get(String(unit.id))].find(item => item && line.startsWith(item));
  const rest = title ? line.slice(title.length) : line.replace(/^.*?\s(?=[–-]\s)/, "");
  return rest.match(/^\s*[–-]\s+(.+)$/)?.[1] ?? "";
};
model.units.forEach(unit => {
  if (passed(unit.id)) return;
  for (const [where, text] of [["statusLabel", unit.statusLabel], ["status line", statusOf(unit)]]) {
    const word = String(text ?? "").match(finishedWord)?.[1];
    if (word) warnings.push(`unit ${unit.id}: ${where} "${short(text)}" says "${word}", but the unit has no passed check without open ⏳ items (Validation Report with "Result: PASS") – name what exists, e.g. "material written · check open"`);
  }
});
// Material ✅ and approved by the instructor: the material step stays done. A done step returns to an
// earlier state only through a check result (FAIL or concerns); further work gets its own step.
const approved = /(?<!\b(?:nicht|noch nicht|not|not yet)\s)\b(freigegeben|bestätigt|approved|confirmed)\b/i;
model.units.filter(unit => materialRows.has(unit.id)).forEach(unit => {
  const step = unit.process.steps.find(item => /materi/i.test(item.title));
  const report = unitBlock(unit.id).split(/^(?=#### Validation Report)/m)[1] ?? "";
  if (!step || step.state === "done" || /__Result:__\s*(?!PASS\s*$)\S/m.test(report)) return;
  const texts = [unit.summary, step.result, unitBlock(unit.id).split(/^#### /m)[0]].map(text => String(text ?? "")).join("\n");
  if (approved.test(texts)) warnings.push(`unit ${unit.id}: material ✅ and approved, but its material step "${step.title}" is "${step.state}" – keep it done and add a step for the remaining work (e.g. inserting images)`);
});
// Links and images: LiaScript cuts a target or a bare URL at the first unencoded "(" (and at a space).
const sourceLines = source.split("\n");
const blankOut = text => text.replace(/[^\n]/g, " ");
const visibleJournal = source.replace(/```[\s\S]*?```/g, blankOut).replace(/<!--[\s\S]*?-->/g, blankOut);
const headingAbove = line => sourceLines.slice(0, line).reverse().find(item => /^#{1,6}\s/.test(item))?.replace(/^#+\s*/, "") ?? "";
for (const item of unencodedUrls(visibleJournal)) problems.push(`line ${item.line} (${short(headingAbove(item.line), 40)}): ${describeUrl(item)}`);
// Image entries (tasks/create-image.md): the fields each status needs, and the match with the material.
const imageEntries = [...sessions.matchAll(/<section(?![^>]*validation-report)\b[^>]*>([\s\S]*?)<\/section>/g)].map(block => {
  const fields = Object.fromEntries([...block[1].matchAll(/^\s*[*-]\s+__([^_\n]+):__[ \t]*(.*)$/gm)].map(field => [field[1].trim().toLowerCase(), field[2].trim()]));
  const candidates = block[1].split(/__Candidates:__/)[1]?.split(/^\s*[*-]\s+__/m)[0].split("\n").filter(line => /^\s+(?:\d+\.|[-*])\s+\S/.test(line)).length ?? 0;
  const unit = sessions.slice(0, block.index).match(/^### (\d+)\. /gm)?.at(-1)?.match(/\d+/)[0] ?? "";
  return { slug: block[1].match(/^#### (.+)$/m)?.[1].trim() ?? "", unit, fields, candidates, status: (fields.status ?? "").split(/\s/)[0].toLowerCase() };
}).filter(entry => entry.fields.status);
const needs = entry => ({
  inserted: ["file", "alt text", ...(/free-photo/i.test(entry.fields.source ?? "") ? ["author", "license", "page"] : [])],
  generated: ["file"]
}[entry.status] ?? []);
for (const entry of imageEntries) {
  const lacking = needs(entry).filter(name => !entry.fields[name]);
  const label = name => `__${name[0].toUpperCase()}${name.slice(1)}:__`;
  if (lacking.length) problems.push(`image entry "${entry.slug}" (unit ${entry.unit}) is ${entry.status} but has no ${lacking.map(label).join(", ")} – an inserted photo needs File, Alt text, Author, License and Page (tasks/create-image.md)`);
  if (entry.status === "candidate" && !entry.candidates) problems.push(`image entry "${entry.slug}" (unit ${entry.unit}) is candidate but lists no candidates under __Candidates:__`);
}
// The material shows every inserted image, and one placeholder per open entry. single-file: one
// document for all units; multi-file: materials/{n}-…/README.md per unit.
const loose = text => { try { return decodeURI(text); } catch { return text; } };
const materialText = unit => {
  if (fileMode === "single-file") return readme();
  const dir = join(projectDir, "materials");
  const name = existsSync(dir) ? readdirSync(dir).find(item => item.startsWith(`${unit}-`) && existsSync(join(dir, item, "README.md"))) : null;
  return name ? readFileSync(join(dir, name, "README.md"), "utf8") : "";
};
const groups = new Map();
imageEntries.forEach(entry => {
  const key = fileMode === "single-file" ? "README.md" : entry.unit;
  groups.set(key, [...(groups.get(key) ?? []), entry]);
});
for (const [key, entries] of fileMode ? groups : []) {
  const text = materialText(entries[0].unit);
  if (!text) continue;
  const where = fileMode === "single-file" ? "README.md" : `the material of unit ${key}`;
  for (const entry of entries.filter(item => ["inserted", "generated"].includes(item.status) && item.fields.file)) {
    const target = loose(entry.fields.file.replace(/^\[[^\]]*\]\((.*)\)$/, "$1"));
    if (!loose(text).includes(target) && !(!/^\w+:/.test(target) && loose(text).includes(target.split("/").at(-1)))) warnings.push(`image entry "${entry.slug}" (unit ${entry.unit}) is ${entry.status}, but ${where} does not show its file ${short(entry.fields.file, 80)}`);
  }
  // A photo from a free collection needs its credit line (author, licence, file page) in the material's credits chapter.
  for (const entry of entries.filter(item => item.status === "inserted" && /free-photo/i.test(item.fields.source ?? "") && item.fields.page)) {
    const page = loose(entry.fields.page.replace(/^\[[^\]]*\]\((.*)\)$/, "$1"));
    if (!loose(text).includes(page)) warnings.push(`image entry "${entry.slug}" (unit ${entry.unit}) is an inserted free photo, but ${where} has no credit line for it (its file page ${short(entry.fields.page, 80)}) – add it to the image credits chapter (tasks/create-image.md → Free photos step 6)`);
  }
  const open = entries.filter(item => ["wanted", "candidate", "selected", "prompt-ready"].includes(item.status)).length;
  const placeholders = analyseMaterial(text).markers.length;
  if (open !== placeholders) warnings.push(`${where}: ${open} open image entr${open === 1 ? "y" : "ies"} (wanted, candidate, selected, prompt-ready) but ${placeholders} image placeholder${placeholders === 1 ? "" : "s"} – every open entry has one placeholder, an inserted image none`);
}
// Anchors in action lines: a heading inside <section> or no heading at all opens slide 1.
sourceLines.forEach((line, index) => {
  const marked = /^<!--\s*class="journal-actions"\s*-->/.test(sourceLines.slice(0, index).reverse().find(item => item.trim()) ?? "");
  if (!marked && !/^\[.*\]\(agent:/.test(line)) return;
  for (const [, link] of line.matchAll(/\]\((#[^)\s]+)\)/g)) {
    const anchor = decodeURIComponent(link).toLowerCase();
    if (anchors.has(anchor)) continue;
    warnings.push(`action line link ${link} ${sectionAnchors.has(anchor) ? insideSection : "matches no heading – LiaScript opens slide 1 instead"}`);
  }
});
// Check reports (R8-D2): one heading per report, so that its anchor is unique, and an open point
// found by a check (source: {"check": n}) links the report of unit n, not the unit.
const reports = reportHeadings(section("Sessions")).map(report => ({ ...report, anchor: anchorOf(report.title) }));
const byAnchor = new Map();
reports.forEach(report => byAnchor.set(report.anchor, [...(byAnchor.get(report.anchor) ?? []), report]));
for (const [, same] of byAnchor) if (same.length > 1) problems.push(`check report heading "#### ${same[0].title}" appears ${same.length} times (units ${same.map(report => report.unit || "?").join(", ")}) – its anchor is ambiguous; give every unit's report its own heading (e.g. with the unit number)${/^Validation Report\b/.test(same[0].title) ? `; ${migrateHint}` : ""}`);
const reportAnchors = new Set(reports.map(report => report.anchor));
const linkOf = item => decodeURIComponent(String(item.href ?? "")).toLowerCase();
model.decisions.filter(item => item.source).forEach(item => {
  const own = reports.filter(report => report.unit === item.source.check);
  if (!own.length) problems.push(`open point "${item.title}": source.check ${item.source.check}, but unit ${item.source.check} has no check report in ## Sessions`);
  else if (String(item.href ?? "").startsWith("#") && !own.some(report => report.anchor === linkOf(item))) problems.push(`open point "${item.title}" comes from the check of unit ${item.source.check} but links ${item.href} – link its report heading ${own[0].anchor}`);
});
model.decisions.filter(item => !item.source && String(item.href ?? "").startsWith("#") && /bericht|report/i.test(item.label ?? "") && !reportAnchors.has(linkOf(item))).forEach(item =>
  warnings.push(`open point "${item.title}": label "${item.label}" names a report, but ${item.href} is no check report heading${reports.length ? ` (${reports.map(report => report.anchor).join(", ")})` : ""} – link the report and set source: {"check": n}`));
// An open point that links a check report comes from that check: without source the overview counts
// it as not from the check (R9-D3).
model.decisions.filter(item => !item.source && reports.some(report => report.anchor === linkOf(item))).forEach(item => {
  const report = reports.find(entry => entry.anchor === linkOf(item));
  warnings.push(`open point "${item.title}" links the check report of unit ${report.unit || "?"} but has no source – set source: {"check": ${report.unit || "n"}} so the overview counts it as found by the check`);
});
// Changes after a check (R9-D3): the outcome line's "{n} … changed since", the dated lines of the block
// "Changed after the check" and the unit's Notes cell name the same number (tasks/quick-fix.md).
const sessionLines = section("Sessions").split("\n");
const datedLine = /^\s*[-*]\s+(?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{1,2}\/\d{1,2}\/\d{4})\s+·/;
for (const report of reports) {
  const rest = sessionLines.slice(report.index + 1);
  const end = rest.findIndex(line => /^#{1,4}\s/.test(line));
  const visible = (end >= 0 ? rest.slice(0, end) : rest).join("\n").split("<details>")[0];
  const outcome = visible.split("\n").find(line => /^\*\*[^*\n]+:\*\*/.test(line.trim())) ?? "";
  const changed = outcome.match(/\)\s+[–-]\s+((\d+)\s[^–\n]*?)\s+[–-]\s+\S/);
  const said = changed ? Number(changed[2]) : 0;
  const lines = visible.split("\n").filter(line => datedLine.test(line)).length;
  if ((said || lines) && said !== lines) warnings.push(`unit ${report.unit || "?"}: the report's outcome line says ${changed ? `"${changed[1]}"` : "no change since the check"}, but its block "Changed after the check" has ${lines} dated line${lines === 1 ? "" : "s"} – one dated line per change, the same number in the outcome line`);
  const notes = notesCells.get(report.unit);
  if (changed && notes != null && !notes.toLowerCase().includes(changed[1].toLowerCase())) warnings.push(`unit ${report.unit}: the report says "${changed[1]}", but the Notes cell does not ("${short(notes, 70)}") – write the state with the same words: "{outcome} – ${changed[1]} – ${String(terms.recheckShort).split(/\s+–\s+/).slice(1).join(" – ")}"`);
  // One wording per state (R10-D5): the unit's status line and statusLabel carry the report's outcome words
  // and its "{n} … changed since"; a unit with Done ✅ shows "checked ✅" instead.
  const bare = outcome.replace(/^\s*\*\*[^*\n]+:\*\*\s*/, "");
  const dated = bare.search(/\s*\((?:\d{4}-\d{2}-\d{2}|\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|\d{1,2}\/\d{1,2}\/\d{4})\)/);
  const word = (dated >= 0 ? bare.slice(0, dated) : changed ? bare.slice(0, bare.indexOf(changed[1])).replace(/[\s–-]+$/, "") : bare).trim();
  const unit = model.units.find(item => String(item.id) === report.unit);
  // Usable with learners now (R11-S1): the report's second bold line; the unit's `usable` (first line of
  // its card) carries the same answer.
  const usableLine = visible.split("\n").map(line => line.trim()).filter(line => /^\*\*[^*\n]+:\*\*\s*\S/.test(line))[1] ?? "";
  const reported = usableState(usableLine.replace(/^\*\*[^*\n]+:\*\*\s*/, ""));
  if (!reported) warnings.push(`unit ${report.unit || "?"}: the check report has no line "usable with learners now" right below its outcome (or its value is none of ${[terms.usableYes, terms.usableLimited, terms.usableNo].map(term => `"${term}"`).join(", ")}) – the line is mandatory (templates/session-validation.yaml → outcome_words)`);
  if (unit && !unit.usable) warnings.push(`unit ${report.unit} has a check report but no usable – write units[${report.unit}].usable {"state": ${reported ? `"${reported}"` : "yes|limited|no"}${reported && reported !== "yes" ? ', "missing": [what is still missing]' : ""}} from the report's line "${short(usableLine || "usable with learners now", 70)}"; it is the first line of the unit's card`);
  else if (unit && reported && unit.usable.state !== reported) warnings.push(`unit ${report.unit}: usable is "${unit.usable.state}", but the report says "${short(usableLine, 70)}" (${reported}) – usable follows the report`);
  // Outdated wording (R11-D1): recommend the current terms, never the report's old words.
  const staleOutcome = outdatedIn(bare);
  if (staleOutcome.length) {
    warnings.push(`unit ${report.unit}: the report's outcome "${short(bare.replace(dateInParens, ""), 70)}" ${staleText(staleOutcome)} – write it in report, status line, statusLabel and Notes cell (language pack → terms, templates/session-validation.yaml → outcome_words)`);
    continue;
  }
  if (!word || !unit || doneRows.has(report.unit)) continue;
  const recheckTail = String(terms.recheckShort).split(/\s+–\s+/).slice(1).join(" – ");
  const expected = `${word}${changed ? ` – ${changed[1]}${recheckTail ? ` – ${recheckTail}` : ""}` : ""}`;
  for (const [where, text] of [["status line", statusLines.has(report.unit) ? statusOf(unit) : null], ["statusLabel", unit.statusLabel]]) {
    if (text == null || !String(text).trim()) continue;
    const lower = String(text).toLowerCase();
    if (!lower.includes(word.toLowerCase()) || (changed && !lower.includes(changed[1].toLowerCase()))) warnings.push(`unit ${report.unit}: ${where} "${short(String(text), 70)}" does not carry the report's outcome "${expected}" – one wording per state: write "${expected}" (plus other open state such as the image count) in status line, statusLabel and Notes cell`);
  }
}
// Outdated wording outside the report (R11-D1): status line, statusLabel and Notes cell.
model.units.forEach(unit => {
  for (const [where, text] of [["status line", statusLines.has(unit.id) ? statusOf(unit) : null], ["statusLabel", unit.statusLabel], ["Notes cell", notesCells.get(unit.id)]]) {
    const stale = outdatedIn(text);
    if (stale.length) warnings.push(`unit ${unit.id}: ${where} "${short(String(text), 70)}" ${staleText(stale)}`);
  }
});
// How the learners see it (R11-S2): every unit with material has its own view button on the overview and a
// preview link in its action line – the planning link leads to the plan, not to the material.
model.units.filter(unit => materialRows.has(unit.id) && !unit.view).forEach(unit =>
  warnings.push(`unit ${unit.id} has material (Material ✅) but no view – add units[${unit.id}].view {"href": "agent:teaching/preview?file=${unit.id}", "command": ":preview ${unit.id}"}, shown as "${shownTexts.viewMaterial}"; the planning link alone does not lead to the material`));
for (const id of materialRows) {
  const action = unitBlock(id).split(/<!--\s*class="journal-actions"\s*-->/)[1]?.trimStart().split("\n")[0] ?? "";
  if (action && !/\]\(agent:[\w-]+\/preview\b/.test(action)) warnings.push(`unit ${id}: its action line has no 👁 preview link – a unit with material shows how the learners see it next to its main action, not only inside the technical details`);
}
const rawData = JSON.parse(match[1]);
if (rawData.labels && Object.hasOwn(rawData.labels, "plan") && ["de", "en"].includes(shownTexts.lang)) {
  const builtIn = globalThis.LiaDashboard.visibleTexts({ ...rawData, labels: {} }, language).plan;
  warnings.push(`labels.plan "${short(String(rawData.labels.plan), 40)}" renames the planning link – it is always "${builtIn}"; remove labels.plan`);
}
// A numbered item that starts with a date ("1. 23.10.2026: …") renders as "1.23.10. 2026" (R11-S4).
const datedItems = new Map();
visibleJournal.split("\n").forEach((line, index) => {
  if (!/^\s*\d+\.\s+(?:\d{1,2}\.\s?\d{1,2}\.\s?\d{2,4}|\d{4}-\d{2}-\d{2})/.test(line)) return;
  const heading = headingAbove(index);
  datedItems.set(heading, [...(datedItems.get(heading) ?? []), index + 1]);
});
for (const [heading, lines] of datedItems) warnings.push(`${lines.length} numbered item${lines.length === 1 ? " starts" : "s start"} with a date (line ${lines.join(", ")} under "${short(heading, 40)}") – it renders as "1.23.10. 2026"; write "- **{date}:** …" (templates/session-skeleton.yaml → decisions)`);
// Counts in the texts of the overview (R8-D3): a number of points counts the same set wherever it
// appears – the group named in the same sentence, the points from a check, or a whole group.
const numberWords = { zwei: 2, beide: 2, beiden: 2, drei: 3, vier: 4, "fünf": 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, "zwölf": 12,
  two: 2, both: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const countPattern = new RegExp(`(?<![\\p{L}\\d])(\\d+|${Object.keys(numberWords).join("|")})\\s+(?:[\\p{L}-]+\\s+){0,2}?(Punkte?n?|Entscheidungen|Vorbereitungen|points?|decisions|items|preparations|to-dos)(?![\\p{L}])`, "giu");
const countOf = word => /^\d+$/.test(word) ? Number(word) : numberWords[word.toLowerCase()];
const groupCounts = shownTexts.groups.filter(group => group.kind !== "internal");
const fromCheckCount = groupCounts.reduce((sum, group) => sum + group.fromCheck, 0);
const countTexts = [["subtitle", model.subtitle], ["notice", model.notice], ["next.title", model.next?.title], ["next.why", model.next?.why],
  ...model.units.flatMap(unit => [[`unit ${unit.id} summary`, unit.summary], [`unit ${unit.id} statusLabel`, unit.statusLabel]]),
  ...[{ title: "", process: model.process }, ...model.units].flatMap(unit => unit.process.steps.flatMap(step => ["result", "why", "next"].map(key => [`step "${unit.title ? `${unit.title} → ` : ""}${step.title}" ${key}`, step[key]])))]
  .filter(([, text]) => typeof text === "string" && text.trim());
for (const [where, text] of countTexts) {
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    for (const found of sentence.matchAll(countPattern)) {
      // "n point(s) changed since" counts fixes after a check, not open points.
      if (/^\s*(?:seither|seitdem|since)\b/i.test(sentence.slice(found.index + found[0].length))) continue;
      // "{open} of {n} points open" counts the points of a check report, not open points of the overview.
      if (/\d+\s+(?:von|of)\s*$/i.test(sentence.slice(0, found.index))) continue;
      const said = countOf(found[1]);
      const named = groupCounts.find(group => sentence.toLowerCase().includes(group.title.toLowerCase()));
      const fromCheck = fromCheckCount && /prüfung|geprüft|check|review/i.test(sentence);
      const allowed = named ? [named.count] : fromCheck ? [fromCheckCount] : [...groupCounts.map(group => group.count), groupCounts.reduce((sum, group) => sum + group.count, 0), fromCheckCount].filter(Boolean);
      if (allowed.includes(said)) continue;
      const lists = named ? `"${named.title}" lists ${named.count}` : fromCheck ? `${fromCheckCount} open point${fromCheckCount === 1 ? " comes" : "s come"} from a check (source)` : `the groups list ${groupCounts.filter(group => group.count).map(group => `"${group.title}" ${group.count}${group.fromCheck ? ` (${group.fromCheck} ${shownTexts.fromCheck})` : ""}`).join(", ") || "no open points"}`;
      warnings.push(`${where} says "${found[0]}", but ${lists} – name the points by their titles, or count the same set the group shows`);
    }
  }
}
if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach(warning => console.log(`- ${warning}`));
}
if (problems.length) {
  console.error("ERRORS:");
  problems.forEach(problem => console.error(`- ${problem}`));
  console.log("Exit code: 2 (fix and run again)");
  process.exit(2);
}
console.log("Exit code: 0");
