// Writes the Dashboard data block of journal.md in one step: reads a JSON draft,
// checks it with the Dashboard library, replaces the whole ```json @Dashboard.View
// block (one file write = one preview reload) and runs validate-journal.mjs.
// Run from the course project root:
//   node specs/dashboard/write-dashboard.mjs <draft.json> [journal.md]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import "./dashboard.js";

const here = dirname(fileURLToPath(import.meta.url));
const [draftFile, journalArg] = process.argv.slice(2);
if (!draftFile || !existsSync(draftFile)) {
  console.error("Usage: node specs/dashboard/write-dashboard.mjs <draft.json> [journal.md]");
  console.log("Exit code: 1");
  process.exit(1);
}
const journal = journalArg ?? ["journal.md", resolve(here, "..", "..", "journal.md")].find(path => existsSync(path));

let data;
try {
  data = JSON.parse(readFileSync(draftFile, "utf8"));
  globalThis.LiaDashboard.buildModel(data);
} catch (error) {
  console.error(`Draft rejected, journal unchanged: ${error.message}`);
  console.log("Exit code: 1");
  process.exit(1);
}

const source = readFileSync(journal, "utf8");
const block = /```json @Dashboard\.View\n[\s\S]*?\n```/;
if (!block.test(source)) {
  console.error("No ```json @Dashboard.View block found under ## Dashboard, journal unchanged.");
  console.log("Exit code: 1");
  process.exit(1);
}
const next = source.replace(block, () => "```json @Dashboard.View\n" + JSON.stringify(data, null, 2) + "\n```");
if (next === source) console.log("Dashboard unchanged.");
else { writeFileSync(journal, next); console.log(`Dashboard written to ${journal}.`); }

const check = spawnSync(process.execPath, [resolve(here, "validate-journal.mjs"), journal], { encoding: "utf8" });
process.stdout.write(check.stdout);
process.stderr.write(check.stderr);
process.exit(check.status ?? 1);
