import { test } from "node:test";
import assert from "node:assert/strict";
import "./dashboard.js";

const dashboard = globalThis.LiaDashboard;

test("macro-protected data preserves commas, quotes, and literal code fences", () => {
  const source = { title: 'Text, "Zitat", ```Code``` und ${keinCode}' };
  const json = JSON.stringify(source);
  assert.deepEqual(dashboard.parseInput("``` " + "```" + json + "``` ```"), source);
});

test("the same unit states determine totals and selection; drafts are unfinished", () => {
  const source = { completed: 99, total: 99, units: [
    { id: 1, title: "A", state: "done" },
    { id: 2, title: "B", state: "draft" },
    { id: 3, title: "C", state: "current" },
    { id: 4, title: "D", state: "review" }
  ] };
  const before = JSON.stringify(source);
  const model = dashboard.buildModel(source);
  assert.equal(model.completed, 1);
  assert.equal(model.total, 4);
  assert.equal(model.percent, 25);
  assert.equal(model.selected, "3");
  assert.equal(JSON.stringify(source), before);
});

test("an unstarted project has no fake unit or invalid progress bar", () => {
  const model = dashboard.buildModel({ title: "Neues Vorhaben" });
  assert.equal(model.selected, null);
  assert.equal(model.total, 0);
  assert.doesNotMatch(dashboard.progress(0, 0), /<progress/);
});

test("unknown states and conflicting IDs fail instead of manufacturing progress", () => {
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", state: "almost-done" }] }));
  assert.throws(() => dashboard.buildModel({ units: [{ id: 1, title: "A" }, { id: 1, title: "B" }] }));
  assert.throws(() => dashboard.buildModel({ units: [{ id: 1, title: "A" }], selected: 2 }));
  assert.throws(() => dashboard.progress(4, 2));
});

test("texts remain text and command links retain their readable fallback", () => {
  const html = dashboard.view("test", {
    title: '<img src=x onerror="alert(1)">',
    next: { label: "Weiter", href: "agent:teaching/help", command: ":help" }
  });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  assert.match(html, /href="agent:teaching\/help"/);
  assert.match(html, /<code[^>]*>:help<\/code>/);
  assert.throws(() => dashboard.buildModel({ next: { href: "javascript:alert(1)" } }));
  assert.throws(() => dashboard.buildModel({ next: { href: "agent:teaching/help" } }));
});

test("open decisions and the provisional plan render and validate", () => {
  const model = dashboard.buildModel({ title: "X", decisions: ["Ein Link oder mehrere?", { title: "Zeitbedarf", why: "Rahmen sagt 4 Stunden" }], plan: { note: "vorläufig", rows: [{ label: "Stunde 1", text: "Bienenvolk" }] } });
  assert.equal(model.decisions.length, 2);
  const html = dashboard.renderComponent("View", "t", { lang: "de", title: "X", decisions: ["A"], plan: { rows: [{ label: "Stunde 1", text: "Bienenvolk" }] } });
  assert.match(html, /Noch zu entscheiden/);
  assert.match(html, /Stunde 1/);
  assert.throws(() => dashboard.buildModel({ plan: { rows: [{ label: "Stunde 1" }] } }));
  assert.throws(() => dashboard.buildModel({ decisions: "kein Array" }));
});

test("open points are grouped by role; internal notes stay collapsed", () => {
  const html = dashboard.renderComponent("View", "k", { lang: "de", title: "X", decisions: [
    { title: "Ein Link oder mehrere?", kind: "decide", how: "Im Chat beantworten" },
    { title: "Kopfhörer-Verteiler besorgen", kind: "prepare", how: "Im Elektromarkt, ca. 10 €" },
    { title: "Kennung module doppelt", kind: "internal" }
  ] });
  assert.match(html, /Noch zu entscheiden/);
  assert.match(html, /Vor dem Einsatz vorbereiten/);
  assert.match(html, /<details class="dashboard-internal"><summary>Für Profis: 1 interne Notiz/);
  assert.throws(() => dashboard.buildModel({ decisions: [{ title: "A", kind: "irgendwas" }] }));
});

test("a selected unit links to its plan in the process panel", () => {
  const html = dashboard.renderComponent("View", "u", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "current", href: "#1.-stunde-1" }] });
  assert.match(html, /href="#1\.-stunde-1"[^>]*>Bauplan ansehen/);
});

test("unit cards count finished process steps", () => {
  const html = dashboard.renderComponent("View", "s", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "current", process: { steps: [{ title: "A", state: "done" }, { title: "B", state: "current" }, { title: "C", state: "planned" }] } }] });
  assert.match(html, /1 von 3 Schritten/);
});

test("texts follow the course language; English is the fallback", () => {
  assert.match(dashboard.renderComponent("View", "de1", { lang: "de", title: "X" }), /Fortschritt/);
  assert.match(dashboard.renderComponent("View", "en1", { lang: "en", title: "X" }), /Progress/);
  assert.match(dashboard.renderComponent("View", "xx1", { lang: "fr", title: "X" }), /Progress/);
});
