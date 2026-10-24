import { test } from "node:test";
import assert from "node:assert/strict";
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
  assert.match(catalog.render("c5", { entries: [], problems: [], error: "404", lang: "en" }), /The catalog could not be loaded/);
});

test("filter options come from the tags that exist", () => {
  const model = catalog.normalize({ version: 1, templates: [valid()] }, "shared");
  const html = catalog.render("c6", { ...model, lang: "en" });
  assert.match(html, /<option value="python">/);
  assert.doesNotMatch(html, /<option value="sql">/);
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
