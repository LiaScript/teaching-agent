// Writes the Dashboard data block of journal.md in one step: reads a JSON draft,
// checks it with the Dashboard library, replaces the whole ```json @Dashboard.View
// block (one file write = one preview reload) and runs validate-journal.mjs.
// After the write it stores `_journalHash` (hash of the block as written) in the draft file: a later run
// with that draft refuses to write when the journal block has changed since ("cache stale"), so small
// changes can be made in the cache with the edit tool instead of a whole new draft
// (tasks/update-dashboard.md step 8). A draft without `_journalHash` is always accepted.
// Run from the course project root:
//   node specs/dashboard/write-dashboard.mjs <draft.json> [journal.md]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import "./dashboard.js";
import { countWrite } from "./write-count.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const [draftFile, journalArg] = process.argv.slice(2);
if (!draftFile || !existsSync(draftFile)) {
  console.error("Usage: node specs/dashboard/write-dashboard.mjs <draft.json> [journal.md]");
  console.log("Exit code: 1");
  process.exit(1);
}
const journal = journalArg ?? ["journal.md", resolve(here, "..", "..", "journal.md")].find(path => existsSync(path));

const blockHash = text => createHash("sha256").update(text).digest("hex").slice(0, 16);

let data;
let cacheHash;
try {
  data = JSON.parse(readFileSync(draftFile, "utf8"));
  if (data && typeof data === "object" && !Array.isArray(data)) ({ _journalHash: cacheHash, ...data } = data);
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
const current = source.match(block)[0].slice("```json @Dashboard.View\n".length, -"\n```".length);
if (cacheHash && cacheHash !== blockHash(current)) {
  console.error(`Cache stale, journal unchanged: the Dashboard block in ${journal} changed since ${draftFile} was last written – rebuild the whole draft from the current journal (tasks/update-dashboard.md step 8).`);
  console.log("Exit code: 1");
  process.exit(1);
}
const json = JSON.stringify(data, null, 2);
const next = source.replace(block, () => "```json @Dashboard.View\n" + json + "\n```");
if (next === source) console.log("Dashboard unchanged.");
else {
  writeFileSync(journal, next);
  console.log(`Dashboard written to ${journal}.`);
  const budget = countWrite(process.cwd(), "write-dashboard", journal);
  if (budget) console.log(budget);
}
// The cache now matches the journal block: next time change only the affected keys in it.
writeFileSync(draftFile, JSON.stringify({ ...data, _journalHash: blockHash(json) }, null, 2) + "\n");
console.log(`Cache ${draftFile} matches the journal block (_journalHash ${blockHash(json)}) – for a small change edit only the affected keys there.`);

const check = spawnSync(process.execPath, [resolve(here, "validate-journal.mjs"), journal], { encoding: "utf8" });
process.stdout.write(check.stdout);
process.stderr.write(check.stderr);
process.exit(check.status ?? 1);
