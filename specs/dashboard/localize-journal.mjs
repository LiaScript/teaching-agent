// Applies a language switch to journal.md in ONE write, so the live preview
// reloads once instead of once per heading.
// Run from the course project root:
//   node specs/dashboard/localize-journal.mjs <map.json> [journal.md]
//   node specs/dashboard/localize-journal.mjs --lang <code> [journal.md]
//
// --lang uses the language pack specs/templates/i18n/<code>.json, made for the
// EMPTY template: its line map plus the Dashboard JSON of the empty state go in
// the same single write ({date} in the footer becomes today's date). If the
// journal is no longer the empty template, a line does not match and nothing is
// written — then write your own map.
//
// map.json: { "language": "de", "replace": [["## Outline", "## Outline – Gliederung"], …] }
// - "language" sets the `language:` line of the header (optional).
// - Each pair replaces whole lines: the first item must equal one line of the
//   file exactly (trailing spaces ignored). Every pair must match exactly one
//   line — or at least one with a third item "all" (["  none", "  keine", "all"]) —
//   otherwise nothing is written (exit 2), so a stale map never half-applies.
// In map mode the Dashboard JSON block is not touched; write it afterwards with write-dashboard.mjs.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const pack = args[0] === "--lang" ? args[1] : null;
const mapFile = pack ? resolve(dirname(fileURLToPath(import.meta.url)), "..", "templates", "i18n", `${pack}.json`) : args[0];
const file = (pack ? args[2] : args[1]) ?? "journal.md";
if (!mapFile || (pack && !existsSync(mapFile))) {
  console.error(pack ? `no language pack for "${pack}" – write your own map (.cache/localize.json)` : "usage: node specs/dashboard/localize-journal.mjs <map.json> | --lang <code> [journal.md]");
  process.exit(1);
}
// Only Markdown files inside the project folder (the current working directory).
const target = resolve(file);
if (!/\.md$/i.test(target) || !(target === resolve(process.cwd(), file) && target.startsWith(resolve(process.cwd()) + "/")) || !existsSync(target)) {
  console.error(`refused: ${file} – only an existing .md file inside the project folder`);
  console.log("Exit code: 2");
  process.exit(2);
}
const map = JSON.parse(readFileSync(mapFile, "utf8"));
const lines = readFileSync(file, "utf8").split("\n");
const problems = [];
const dashboard = (() => {
  const start = lines.findIndex(line => line.startsWith("```json @Dashboard.View"));
  const end = start < 0 ? -1 : lines.findIndex((line, index) => index > start && line.startsWith("```"));
  return index => start >= 0 && index >= start && index <= end;
})();

if (map.language) {
  const index = lines.findIndex(line => /^language:\s*\S+/.test(line));
  if (index < 0) problems.push("no `language:` line in the header");
  else lines[index] = `language: ${map.language}`;
}
for (const [from, to, all] of map.replace ?? []) {
  if (typeof from !== "string" || typeof to !== "string" || from.includes("\n") || to.includes("\n")) {
    problems.push(`pair ${JSON.stringify([from, to])}: both items must be single lines`);
    continue;
  }
  const hits = lines.map((line, index) => line.trimEnd() === from.trimEnd() ? index : -1).filter(index => index >= 0);
  if (all === "all" ? hits.length < 1 : hits.length !== 1) problems.push(`"${from}" matches ${hits.length} lines (needs ${all === "all" ? "at least" : "exactly"} 1)`);
  else if (hits.some(dashboard)) problems.push(`"${from}" is inside the Dashboard block – use write-dashboard.mjs`);
  else hits.forEach(index => { lines[index] = to; });
}
let dashboardLines = null;
if (map.dashboard) {
  const date = new Date().toLocaleDateString(map.language ?? "en");
  const json = JSON.stringify(map.dashboard, null, 2).replace(/\{date\}/g, date);
  dashboardLines = json.split("\n");
}
if (problems.length) {
  console.error("Nothing written:");
  if (pack) console.error(`- the journal is no longer the empty template (${problems.length} lines differ) – write your own map (.cache/localize.json)`);
  problems.slice(0, pack ? 3 : problems.length).forEach(problem => console.error(`- ${problem}`));
  console.log("Exit code: 2 (fix the map and run again)");
  process.exit(2);
}
if (dashboardLines) {
  const start = lines.findIndex(line => line.startsWith("```json @Dashboard.View"));
  const end = lines.findIndex((line, index) => index > start && line.startsWith("```"));
  if (start < 0 || end < 0) {
    console.error("Nothing written:\n- no ```json @Dashboard.View block");
    console.log("Exit code: 2 (fix the map and run again)");
    process.exit(2);
  }
  lines.splice(start + 1, end - start - 1, ...dashboardLines);
}
writeFileSync(file, lines.join("\n"));
console.log(`OK: ${map.replace?.length ?? 0} lines replaced${map.language ? `, language: ${map.language}` : ""}${dashboardLines ? ", Dashboard replaced" : ""} in one write`);
if (map.labels) console.log(`Roster labels: ${JSON.stringify(map.labels)}`);
console.log("Exit code: 0");
