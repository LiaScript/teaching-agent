// Read-only search for agents without a search tool: prints every matching line as
// `file:line: text`. Never writes anything and reads only inside the current folder.
// Run from the course project root:
//   node specs/dashboard/find.mjs [-i] <pattern> [file|folder ...]
// <pattern> is a JavaScript regular expression; -i (first argument) ignores case.
// Default file: journal.md. A folder is searched recursively (.md, .yaml, .json, .mjs;
// node_modules and .git are skipped, symbolic links inside a folder are not followed).
// At most 200 hits. Exit code 0: hits found, 1: no hit, 2: invalid call or refused path.
import { readFileSync, readdirSync, statSync, realpathSync, existsSync } from "node:fs";
import { resolve, relative, isAbsolute, extname, join, sep } from "node:path";

const LIMIT = 200;
const WIDTH = 300;
const TYPES = new Set([".md", ".yaml", ".json", ".mjs"]);
const SKIP = new Set(["node_modules", ".git"]);

function fail(message) {
  console.error(message);
  console.log("Exit code: 2");
  process.exit(2);
}

const args = process.argv.slice(2);
const ignoreCase = args[0] === "-i";
if (ignoreCase) args.shift();
const [pattern, ...targets] = args;
if (!pattern) fail("Usage: node specs/dashboard/find.mjs [-i] <pattern> [file|folder ...]");
let regex;
try {
  regex = new RegExp(pattern, ignoreCase ? "i" : "");
} catch (error) {
  fail(`Invalid pattern: ${error.message}`);
}

const root = realpathSync(process.cwd());
const inside = path => {
  const rel = relative(root, path);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
};

const files = new Set();
function collect(target) {
  const full = resolve(root, target);
  // Check the path before looking at it: nothing outside the current folder is read or reported.
  if (!inside(full)) fail(`Refused: ${target} is outside the current folder`);
  if (!existsSync(full)) fail(`Not found: ${target}`);
  if (!inside(realpathSync(full))) fail(`Refused: ${target} points outside the current folder`);
  if (!statSync(full).isDirectory()) { files.add(full); return; }
  (function walk(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(folder, entry.name);
      if (entry.isDirectory() && !SKIP.has(entry.name)) walk(path);
      else if (entry.isFile() && TYPES.has(extname(entry.name))) files.add(path);
    }
  })(full);
}
(targets.length ? targets : ["journal.md"]).forEach(collect);

// Long lines (e.g. JSON) are cut around the match.
function excerpt(line, index) {
  if (line.length <= WIDTH) return line;
  const start = Math.max(0, Math.min(index - 100, line.length - WIDTH));
  return `${start > 0 ? "…" : ""}${line.slice(start, start + WIDTH)}${start + WIDTH < line.length ? "…" : ""}`;
}

let hits = 0;
let more = false;
search: for (const file of files) {
  const name = relative(root, file).split(sep).join("/");
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const match = regex.exec(lines[index]);
    if (!match) continue;
    if (hits === LIMIT) { more = true; break search; }
    hits++;
    console.log(`${name}:${index + 1}: ${excerpt(lines[index], match.index)}`);
  }
}
if (more) console.log(`More than ${LIMIT} hits – only the first ${LIMIT} are shown; narrow the pattern or the path.`);
if (!hits) console.log(`No match for /${pattern}/${ignoreCase ? "i" : ""} in ${files.size} file${files.size === 1 ? "" : "s"}.`);
console.log(`Exit code: ${hits ? 0 : 1}`);
process.exit(hits ? 0 : 1);
