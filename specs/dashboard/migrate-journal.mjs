// Brings a journal written with an older template to the current layout – representation only, never content.
// Run from the course project root: node specs/dashboard/migrate-journal.mjs [--check] [journal.md]
//
// - An unfilled section that still shows {{…}} skeleton lines gets the body of the current empty template
//   (templates/journal.md: action line, authoring note, one-line note), translated with the course's language
//   pack (templates/i18n/<code>.json); its heading line stays as it is. A section that mixes filled lines with
//   {{…}} lines is left alone and named: fill or remove those lines by hand.
// - The title placeholder becomes the neutral title; the Dashboard footer loses its date placeholder.
// - A check report heading "#### Validation Report …" becomes "#### {report word} – {unit word} {n}" with
//   <section data-key="validation-report"> directly below it (templates/session-validation.yaml).
//
// --check lists the changes and writes nothing. Exit 0: written (or nothing to do); exit 2: something is left
// to fix by hand – everything else is written.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { countWrite } from "./write-count.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const check = args.includes("--check");
const file = args.find(arg => arg !== "--check") ?? "journal.md";
const target = resolve(file);
if (!/\.md$/i.test(target) || !target.startsWith(resolve(process.cwd()) + "/") || !existsSync(target)) {
  console.error(`refused: ${file} – only an existing .md file inside the project folder`);
  console.log("Exit code: 2");
  process.exit(2);
}

const source = readFileSync(target, "utf8");
const language = (source.match(/^language:\s*(\w+)/m)?.[1] ?? "en").slice(0, 2).toLowerCase();
const packFile = join(here, "..", "templates", "i18n", `${language}.json`);
const pack = language !== "en" && existsSync(packFile) ? JSON.parse(readFileSync(packFile, "utf8")) : null;
const translations = new Map(pack?.replace ?? []);
const translate = line => translations.get(line) ?? line;
const template = readFileSync(join(here, "..", "templates", "journal.md"), "utf8").split("\n");

const lines = source.split("\n");
const changes = [];
const leftovers = [];
const untranslated = language !== "en" && !pack;

// Sections: a "## " heading up to the next one. The key is the English heading without a translated suffix.
const keyOf = heading => heading.replace(/^## /, "").split(/\s+–\s+/)[0].trim();
function sectionsOf(all) {
  const starts = all.map((line, index) => /^## /.test(line) ? index : -1).filter(index => index >= 0);
  return starts.map((start, i) => ({ key: keyOf(all[start]), start, end: starts[i + 1] ?? all.length }));
}

// Visible lines of a section body: no comments, no code blocks, no inline code.
function visibleLines(body) {
  return body.join("\n").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "").split("\n")
    .map(line => line.replace(/`[^`\n]*`/g, ""));
}
// Lines that belong to an unfilled skeleton besides the {{…}} lines: actions, notes, labels, table heads, HTML.
function isStructural(line, index, all) {
  const text = line.trim();
  if (!text || text === "---") return true;
  if (/\]\(agent:/.test(text)) return true;
  if (/^_.*_$/.test(text)) return true;
  if (/^[*-] __[^_]+:__\s*(\(.*\))?$/.test(text)) return true;
  if (/^<\/?(details|summary|section)\b[^>]*>(.*<\/summary>)?$/.test(text)) return true;
  if (/^\|[\s|:-]+\|$/.test(text)) return true;
  const next = all.slice(index + 1).find(item => item.trim());
  return /^\|.*\|$/.test(text) && /^\s*\|[\s|:-]+\|\s*$/.test(next ?? "");
}

// 1. Unfilled skeleton sections → the current template body.
const templateSections = sectionsOf(template);
const replacements = [];
for (const section of sectionsOf(lines)) {
  if (section.key === "Dashboard") continue;
  const visible = visibleLines(lines.slice(section.start + 1, section.end));
  const placeholders = visible.filter(line => line.includes("{{"));
  if (!placeholders.length) continue;
  const filled = visible.filter((line, index, all) => !line.includes("{{") && !isStructural(line, index, all));
  const current = templateSections.find(item => item.key === section.key);
  if (filled.length || !current) {
    leftovers.push(`${section.key}: ${placeholders.length} line(s) with {{…}} ${filled.length ? "next to filled lines" : "in a section the current template does not have"} – fix by hand: fill or remove them (e.g. "${placeholders[0].trim().slice(0, 60)}")`);
    continue;
  }
  const body = template.slice(current.start + 1, current.end).map(translate);
  replacements.push({ ...section, body });
  changes.push(`${section.key}: unfilled skeleton (${placeholders.length} {{…}} lines) → the current one-line note`);
}
for (const { start, end, body } of replacements.sort((a, b) => b.start - a.start)) lines.splice(start + 1, end - start - 1, ...body);

// 2. Title and Dashboard footer placeholders.
const titleIndex = lines.findIndex(line => /^# /.test(line));
if (titleIndex >= 0 && lines[titleIndex].includes("{{")) {
  lines[titleIndex] = translate("# New course");
  changes.push(`title → "${lines[titleIndex].slice(2)}"`);
}
lines.forEach((line, index) => {
  if (/^\s*"footer":/.test(line) && /\{\{YYYY-MM-DD\}\}\s*·\s*/.test(line)) {
    lines[index] = line.replace(/\{\{YYYY-MM-DD\}\}\s*·\s*/, "");
    changes.push("Dashboard footer: date placeholder removed");
  }
});

// 3. Check reports with the older heading "#### Validation Report …".
const reportWord = pack?.terms?.validationReport ?? "Validation report";
const terminology = lines.map(line => line.match(/^\s*(?:\d+\.\s*)?sessions-called:\s*(.+?)\s*$/)?.[1]).find(Boolean);
// "unit (Einheit)": the word in brackets is the course-language word.
const named = terminology?.match(/\(([^()]+)\)\s*$/)?.[1].trim() ?? terminology;
const unitWord = named && !/[{|[]/.test(named) ? named : (pack?.unitWord?.one ?? "Unit");
const sessions = sectionsOf(lines).find(section => section.key === "Sessions");
if (sessions) {
  let unit = "";
  for (let index = sessions.start + 1; index < sessions.end; index++) {
    unit = lines[index].match(/^### (\d+)\. /)?.[1] ?? unit;
    if (!/^#### Validation Report\b/.test(lines[index])) continue;
    if (!unit) { leftovers.push(`"${lines[index]}" stands outside a unit – fix by hand`); continue; }
    const heading = `#### ${reportWord} – ${unitWord} ${unit}`;
    const old = lines[index];
    // Older layout: the heading stood inside its <section>. Move it out; the section's end stays.
    const before = lines.slice(0, index).findLastIndex(line => line.trim());
    if (before > sessions.start && /^<section\s*>$/.test(lines[before].trim())) {
      lines.splice(before, index - before + 1, old, "", "<section>");
      sessions.end += 3 - (index - before + 1);
      index = before;
    }
    lines[index] = heading;
    const first = lines.findIndex((line, at) => at > index && line.trim());
    if (/^<section\s+data-key=["']validation-report["']\s*>$/.test(lines[first]?.trim())) {
      // already keyed
    } else if (/^<section\s*>$/.test(lines[first]?.trim() ?? "")) {
      lines[first] = '<section data-key="validation-report">';
    } else {
      let end = lines.findIndex((line, at) => at > index && /^(#{2,4} |---\s*$)/.test(line));
      if (end < 0 || end > sessions.end) end = sessions.end;
      const content = lines.slice(index + 1, end);
      while (content.length && !content[0].trim()) content.shift();
      while (content.length && !content.at(-1).trim()) content.pop();
      const wrapped = ["", '<section data-key="validation-report">', "", ...content, "", "</section>", ""];
      lines.splice(index + 1, end - index - 1, ...wrapped);
      sessions.end += wrapped.length - (end - index - 1);
    }
    changes.push(`unit ${unit}: "${old.slice(5)}" → "${heading.slice(5)}" with <section data-key="validation-report">`);
  }
}

if (!changes.length && !leftovers.length) {
  console.log("Nothing to migrate: the journal already has the current layout.");
  process.exit(0);
}
if (changes.length) console.log(`${check ? "Would change" : "Changed"} (representation only):\n${changes.map(item => `- ${item}`).join("\n")}`);
if (untranslated && replacements.length) console.log(`No language pack for "${language}": the migrated lines are English – translate them into the course language.`);
if (changes.length && !check) {
  writeFileSync(target, lines.join("\n"));
  const budget = countWrite(process.cwd(), "migrate-journal", file);
  if (budget) console.log(budget);
}
if (leftovers.length) {
  console.log(`Left for you:\n${leftovers.map(item => `- ${item}`).join("\n")}`);
  console.log("Exit code: 2");
  process.exit(2);
}
console.log(check ? "Nothing written (--check)." : "Next: node specs/dashboard/validate-journal.mjs");
