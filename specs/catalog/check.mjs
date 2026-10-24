import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./catalog.js";

const catalog = globalThis.LiaCatalog;

const valid = (over = {}) => ({ id: "python-turtle", name: "Skulpt", description: "Python with turtle graphics.",
  import: "https://raw.githubusercontent.com/LiaTemplates/Skulpt/0.0.1/README.md", repo: "https://github.com/LiaTemplates/Skulpt",
  demo: "https://liascript.github.io/course/?https://raw.githubusercontent.com/LiaTemplates/Skulpt/master/README.md",
  subjects: ["programming", "python"], audiences: ["primary"], macros: ["@Skulpt.eval"], status: "checked", checked: "2026-10-23", ...over });

test("a valid shared entry passes and gets the default icon and its source", () => {
  const { entries, problems } = catalog.normalize({ version: 1, templates: [valid()] }, "shared");
  assert.deepEqual(problems, []);
  assert.equal(entries[0].icon, "🧩");
  assert.equal(entries[0].source, "shared");
});

test("invalid entries drop out one by one with a problem naming them", () => {
  const { entries, problems } = catalog.normalize({ version: 1, templates: [
    valid({ id: "Bad ID" }), valid({ id: "js", demo: "javascript:alert(1)" }), valid({ id: "aud", audiences: ["kids"] }),
    valid({ id: "mac", macros: ["Skulpt.eval"] }), valid({ id: "ok" })
  ] }, "shared");
  assert.deepEqual(entries.map(e => e.id), ["ok"]);
  assert.equal(problems.length, 4);
  assert.match(problems.join("\n"), /js/);
});

test("the shared list only holds checked entries with a date", () => {
  assert.equal(catalog.normalize({ version: 1, templates: [valid({ status: "found" })] }, "shared").entries.length, 0);
  assert.equal(catalog.normalize({ version: 1, templates: [valid({ checked: "" })] }, "shared").entries.length, 0);
});

test("a local entry can never appear as checked", () => {
  const { entries, problems } = catalog.normalize({ version: 1, templates: [valid()] }, "local");
  assert.equal(entries[0].status, "found");
  assert.equal(problems.length, 1);
});

test("on an id clash the shared entry wins and the local one is reported", () => {
  const shared = catalog.normalize({ version: 1, templates: [valid()] }, "shared");
  const local = catalog.normalize({ version: 1, templates: [valid({ status: "own", name: "Mine" }), valid({ id: "sql-own", status: "own" })] }, "local");
  const merged = catalog.merge(shared, local);
  assert.deepEqual(merged.entries.map(e => [e.id, e.source]), [["python-turtle", "shared"], ["sql-own", "local"]]);
  assert.match(merged.problems.join("\n"), /python-turtle/);
});

const ownLocal = (over = {}) => {
  const entry = valid({ id: "turtle-maze", status: "own", import: "./lia-templates/turtle-maze/README.md", ...over });
  delete entry.checked;
  for (const field of ["repo", "demo"]) if (!(field in over)) delete entry[field];
  return entry;
};

test("an own template that stays in the project is accepted with its relative import, without repo and demo", () => {
  const { entries, problems } = catalog.normalize({ version: 1, templates: [ownLocal()] }, "local");
  assert.deepEqual(problems, []);
  assert.equal(entries[0].import, "./lia-templates/turtle-maze/README.md");
  assert.equal(entries[0].status, "own");
  const linked = catalog.normalize({ version: 1, templates: [ownLocal({ repo: "https://github.com/x/turtle-maze", demo: "javascript:alert(1)" })] }, "local");
  assert.equal(linked.entries.length, 0, "repo and demo, when present, must still be https");
});

test("a relative import is only for own local entries whose path names their own id", () => {
  const reject = (templates, source = "local") => catalog.normalize({ version: 1, templates }, source).entries.length;
  assert.equal(reject([ownLocal({ status: "found" })]), 0, "a found entry with a relative import");
  assert.equal(reject([ownLocal({ import: "./lia-templates/other-id/README.md" })]), 0, "a mismatched id in the path");
  assert.equal(reject([ownLocal({ import: "../lia-templates/turtle-maze/README.md" })]), 0, "another relative form");
  assert.equal(reject([ownLocal({ import: "javascript:alert(1)" })]), 0, "a javascript: import");
  assert.equal(reject([ownLocal({ status: "checked" })]), 0, "a local checked entry is treated as found");
  assert.equal(reject([{ ...ownLocal(), status: "checked", checked: "2026-10-23" }], "shared"), 0, "the shared list stays https-only");
  assert.equal(reject([valid({ status: "found", demo: undefined })]), 0, "a found entry still needs its demo");
  assert.equal(reject([ownLocal()], "other"), 0, "only the local list may hold a relative import (fail closed)");
  assert.equal(reject([ownLocal()], null), 0, "a list without a source stays https-only");
});

test("a card without a demo has no 👁 button", () => {
  const html = catalog.render("c-own", { ...catalog.normalize({ version: 1, templates: [ownLocal()] }, "local"), lang: "en" });
  assert.doesNotMatch(html, /👁/);
  assert.match(html, /agent:teaching\/manage-templates\?name=turtle-maze/);
  assert.match(catalog.render("c-demo", { ...catalog.normalize({ version: 1, templates: [valid()] }, "shared"), lang: "en" }), /👁/);
});

test("a list without a templates array is one problem, not a crash", () => {
  assert.deepEqual(catalog.normalize({ version: 1 }, "local").entries, []);
  assert.equal(catalog.normalize("nonsense", "local").problems.length, 1);
});

test("filter matches text case-insensitively and combines tag filters", () => {
  const { entries } = catalog.normalize({ version: 1, templates: [valid(),
    valid({ id: "alasql", name: "AlaSQL", description: "SQL in the browser.", subjects: ["databases", "sql"], audiences: ["secondary"], macros: ["@AlaSQL.eval"] })] }, "shared");
  assert.deepEqual(catalog.filter(entries, { query: "TURTLE" }).map(e => e.id), ["python-turtle"]);
  assert.deepEqual(catalog.filter(entries, { query: "@alasql" }).map(e => e.id), ["alasql"]);
  assert.deepEqual(catalog.filter(entries, { subject: "sql", audience: "primary" }), []);
  assert.equal(catalog.filter(entries, {}).length, 2);
});

test("normalize never mutates its input and the global is frozen", () => {
  const input = { version: 1, templates: [valid({ status: "checked" })] };
  const before = JSON.stringify(input);
  catalog.normalize(input, "local");
  assert.equal(JSON.stringify(input), before);
  assert.ok(Object.isFrozen(catalog));
  assert.deepEqual(catalog.AUDIENCES, ["primary", "secondary", "vocational", "higher-education", "adult"]);
});

test("cards show status, both buttons and the readable command", () => {
  const model = catalog.merge(catalog.normalize({ version: 1, templates: [valid()] }, "shared"), { entries: [], problems: [] });
  const html = catalog.render("c1", { ...model, lang: "de" });
  assert.match(html, /✓ geprüft/);
  assert.match(html, /href="agent:teaching\/manage-templates\?name=python-turtle"/);
  assert.match(html, /<code[^>]*>:manage-templates python-turtle<\/code>/);
  assert.match(html, /target="_blank" rel="noopener"/);
  assert.match(html, /Grundschule/);
});

test("German page texts say Vorlage, never Template", () => {
  const model = catalog.merge(catalog.normalize({ version: 1, templates: [valid()] }, "shared"), { entries: [], problems: [] });
  const html = catalog.render("c1de", { ...model, lang: "de" });
  assert.match(html, /Vorlagen durchsuchen/);
  assert.match(html, /1 von 1 Vorlagen/);
  assert.match(catalog.render("c1empty", { entries: [], problems: [], lang: "de" }), /Keine Vorlage passt zu dieser Suche\./);
  const visible = html.replace(/<[^>]*>/g, " ");
  assert.doesNotMatch(visible, /\bTemplates?\b/, "the German UI says Vorlage");
});

test("texts from the data are escaped; English is the fallback language", () => {
  const model = catalog.normalize({ version: 1, templates: [valid({ name: '<img src=x onerror="alert(1)">', note: "<b>x</b>" })] }, "shared");
  const html = catalog.render("c2", { ...model, lang: "fr" });
  assert.doesNotMatch(html, /<img|<b>/);
  assert.match(html, /&lt;img/);
  assert.match(html, /Add to my course/);
});

test("data notes appear only when there are problems; an error replaces the grid", () => {
  assert.doesNotMatch(catalog.render("c3", { entries: [], problems: [], lang: "en" }), /Data notes/);
  assert.match(catalog.render("c4", { entries: [], problems: ["x"], lang: "en" }), /Data notes/);
  assert.match(catalog.render("c4de", { entries: [], problems: ["x"], lang: "de" }), /Datenhinweise \(auf Englisch\)/, "the notes stay in the data language");
  assert.match(catalog.render("c5", { entries: [], problems: [], error: "404", lang: "en" }), /The catalog could not be loaded/);
});

test("filter options come from the tags that exist", () => {
  const model = catalog.normalize({ version: 1, templates: [valid()] }, "shared");
  const html = catalog.render("c6", { ...model, lang: "en" });
  assert.match(html, /<option value="python">/);
  assert.doesNotMatch(html, /<option value="sql">/);
});

test("the page follows LiaScript's light/dark setting, sizes cards in em and wraps long words", () => {
  const css = readFileSync(new URL("./catalog.css", import.meta.url), "utf8");
  // LiaScript keeps its own setting (html.lia-variant-dark / -light), independent of the system: dark colors
  // only with the system setting would put light labels on LiaScript's white page, and the reverse.
  assert.match(css, /html\.lia-variant-dark \.lia-catalog\s*\{[^}]*--catalog-bg:\s*#17211d/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)\s*\{\s*html:not\(\.lia-variant-light\):not\(\.lia-variant-dark\) \.lia-catalog/);
  assert.match(css, /html\.lia-variant-dark \.lia-catalog \.catalog-button-primary/);
  // LiaScript sets the root font size to 10px: 16rem cards are 160px wide, five in a row.
  assert.doesNotMatch(css, /\d+(\.\d+)?rem/, "rem is 10px in LiaScript – use em");
  assert.match(css, /\.lia-catalog \.catalog-card article \{[^}]*overflow-wrap: anywhere/);
  // The dark colors stand twice (LiaScript setting, system setting): both blocks must stay identical.
  const declarations = block => block.split(";").map(item => item.trim()).filter(Boolean).sort();
  const byVariant = css.match(/html\.lia-variant-dark \.lia-catalog \{([^}]*)\}/)[1];
  const bySystem = css.match(/html:not\(\.lia-variant-light\):not\(\.lia-variant-dark\) \.lia-catalog \{([^}]*)\}/)[1];
  assert.equal(declarations(byVariant).length, 11);
  assert.deepEqual(declarations(bySystem), declarations(byVariant), "keep both dark blocks identical");
  const button = selector => css.match(new RegExp(`${selector} \\.lia-catalog \\.catalog-button-primary \\{([^}]*)\\}`))[1].trim();
  assert.equal(button("html:not\\(\\.lia-variant-light\\):not\\(\\.lia-variant-dark\\)"), button("html\\.lia-variant-dark"));
});

const stub = routes => async url => {
  const hit = routes[String(url)];
  if (hit === undefined) return { ok: false, status: 404, json: async () => { throw new Error("404"); } };
  return { ok: true, status: 200, json: async () => (typeof hit === "string" ? JSON.parse(hit) : hit) };
};
const base = "http://example.org/specs/catalog/README.md";

test("the course URL comes from the search part, without the slide hash", () => {
  assert.equal(catalog.courseUrl("?" + encodeURIComponent(base) + "#3"), base);
  assert.equal(catalog.courseUrl(""), null);
});

test("both lists load relative to the course; a missing local list is silent", async () => {
  const model = await catalog.load(base, stub({ "http://example.org/specs/catalog/templates.json": { version: 1, templates: [valid()] } }));
  assert.equal(model.entries.length, 1);
  assert.deepEqual(model.problems, []);
});

test("the local list is read from the project root", async () => {
  const model = await catalog.load(base, stub({
    "http://example.org/specs/catalog/templates.json": { version: 1, templates: [valid()] },
    "http://example.org/templates.local.json": { version: 1, templates: [valid({ id: "own-quiz", status: "own" })] }
  }));
  assert.deepEqual(model.entries.map(e => e.id), ["python-turtle", "own-quiz"]);
});

test("a broken local list is a data note; a missing shared list is an error", async () => {
  const broken = await catalog.load(base, stub({ "http://example.org/specs/catalog/templates.json": { version: 1, templates: [valid()] },
    "http://example.org/templates.local.json": "{ not json" }));
  assert.equal(broken.entries.length, 1);
  assert.match(broken.problems.join("\n"), /templates\.local\.json/);
  const missing = await catalog.load(base, stub({}));
  assert.ok(missing.error);
  assert.deepEqual(missing.entries, []);
});

test("the shared catalog is valid, checked, unique and covers the minimum subjects", () => {
  const list = JSON.parse(readFileSync(new URL("./templates.json", import.meta.url), "utf8"));
  const { entries, problems } = catalog.normalize(list, "shared");
  assert.deepEqual(problems, []);
  assert.equal(entries.length, list.templates.length);
  assert.equal(new Set(entries.map(e => e.id)).size, entries.length);
  for (const subject of ["python", "sql", "chemistry"]) {
    assert.ok(entries.some(e => e.subjects.includes(subject)), `no checked template for ${subject}`);
  }
  for (const e of entries) assert.match(e.import, /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/README\.md$/, e.id);
});

const { searchTemplates } = await import("./search.mjs");
const repoItem = (over = {}) => ({ html_url: "https://github.com/Example/Chem", name: "Chem", description: "Chemistry.",
  full_name: "Example/Chem", default_branch: "main", stargazers_count: 7, pushed_at: "2026-01-02T03:04:05Z", ...over });
const searchStub = (status, body, seen = []) => async (url, options) => {
  seen.push({ url: String(url), options });
  if (body instanceof Error) throw body;
  return { ok: status >= 200 && status < 300, status, json: async () => body };
};

test("search hits are mapped, with the README URL built from full_name and default branch", async () => {
  const { hits, error } = await searchTemplates({ query: "chem", fetchFn: searchStub(200, { items: [repoItem()] }) });
  assert.equal(error, undefined);
  assert.deepEqual(hits, [{ repo: "https://github.com/Example/Chem", name: "Chem", description: "Chemistry.",
    readme: "https://raw.githubusercontent.com/Example/Chem/main/README.md", stars: 7, pushed: "2026-01-02T03:04:05Z" }]);
});

test("a known repo drops out, with a trailing slash and in other case too", async () => {
  const items = [repoItem(), repoItem({ html_url: "https://github.com/Example/Other", full_name: "Example/Other" })];
  const { hits } = await searchTemplates({ fetchFn: searchStub(200, { items }), known: ["HTTPS://github.com/example/chem/"] });
  assert.deepEqual(hits.map(h => h.repo), ["https://github.com/Example/Other"]);
});

test("HTTP 403 is a rate limit note with no hits", async () => {
  const result = await searchTemplates({ fetchFn: searchStub(403, {}) });
  assert.match(result.error, /rate limit/i);
  assert.deepEqual(result.hits, []);
});

test("a network error is an error with no hits", async () => {
  const result = await searchTemplates({ fetchFn: searchStub(0, new Error("offline")) });
  assert.match(result.error, /offline/);
  assert.deepEqual(result.hits, []);
});

test("the query is URL-encoded in the request", async () => {
  const seen = [];
  await searchTemplates({ query: "a b&c", fetchFn: searchStub(200, { items: [] }, seen) });
  assert.match(seen[0].url, /^https:\/\/api\.github\.com\/search\/repositories\?q=topic:liascript-template\+a%20b%26c&per_page=50$/);
  assert.equal(seen[0].options.headers.Accept, "application/vnd.github+json");
});
