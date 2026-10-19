import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
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

test("links of open points and units are checked with the data, not only when rendering", () => {
  assert.throws(() => dashboard.buildModel({ decisions: [{ title: "A", how: "B", href: "agent:teaching/create-outline" }] }), /readable command/);
  assert.throws(() => dashboard.buildModel({ decisions: [{ title: "A", how: "B", href: "javascript:alert(1)" }] }), /not supported/);
  assert.throws(() => dashboard.buildModel({ units: [{ id: 1, title: "A", href: "javascript:alert(1)" }] }), /not supported/);
  assert.doesNotThrow(() => dashboard.buildModel({ units: [{ id: 1, title: "A", href: "#1.-a" }],
    decisions: [{ title: "A", how: "B", href: "agent:teaching/create-outline", command: ":create-outline" }, { title: "C", how: "D" }] }));
});

test("open decisions and the provisional plan render and validate", () => {
  const model = dashboard.buildModel({ title: "X", decisions: ["Ein Link oder mehrere?", { title: "Zeitbedarf", why: "Rahmen sagt 4 Stunden" }], plan: { note: "vorläufig", rows: [{ label: "Stunde 1", text: "Wolkenarten" }] } });
  assert.equal(model.decisions.length, 2);
  const html = dashboard.renderComponent("View", "t", { lang: "de", title: "X", decisions: ["A"], plan: { rows: [{ label: "Stunde 1", text: "Wolkenarten" }] } });
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
  assert.match(html, /<details class="dashboard-internal"><summary>1 technische Notiz/);
  assert.throws(() => dashboard.buildModel({ decisions: [{ title: "A", kind: "irgendwas" }] }));
});

test("a selected unit links to its plan in the process panel", () => {
  const html = dashboard.renderComponent("View", "u", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "current", href: "#1.-stunde-1" }] });
  assert.match(html, /href="#1\.-stunde-1"[^>]*>Planung ansehen/);
});

test("a course entry returns from a unit to the global process", () => {
  const data = { lang: "de", title: "X", process: { title: "Kursplanung", steps: [{ title: "Lernziele", state: "done" }] },
    units: [{ id: 1, title: "Stunde 1", state: "current", process: { steps: [{ title: "Material", state: "current" }] } }] };
  const html = dashboard.renderComponent("View", "c", data);
  assert.match(html, /data-dashboard-select=""[^>]*>.*Gesamter Kurs/s);
  assert.match(html, /<h3>Stunde 1<\/h3>/);
  const course = dashboard.renderComponent("View", "c2", { ...data, selected: "" });
  assert.match(course, /dashboard-unit-selected" type="button" data-dashboard-select=""/);
  assert.match(course, /<h3>Kursplanung<\/h3>/);
  const withoutGlobal = dashboard.renderComponent("View", "c3", { ...data, process: undefined });
  assert.doesNotMatch(withoutGlobal, /Gesamter Kurs/);
});

test("action buttons show their icon; agent: links default to ▶️", () => {
  const html = dashboard.renderComponent("View", "i", { lang: "de", title: "X",
    next: { label: "Prüfen", href: "agent:teaching/validate-course", command: ":validate-course", icon: "🔍" },
    decisions: [{ title: "A", kind: "decide", how: "B", label: "Überarbeiten", href: "agent:teaching/create-outline", command: ":create-outline" }],
    explore: [{ icon: "💬", title: "Fragen", description: "D", label: "Hilfe", href: "agent:teaching/help", command: ":help" }],
    links: [{ label: "Lernziele", href: "#outline" }] });
  assert.match(html, /dashboard-button-primary"[^>]*><span class="dashboard-button-label"><span class="dashboard-button-icon" aria-hidden="true">🔍<\/span> Prüfen/);
  assert.match(html, /<span class="dashboard-button-icon" aria-hidden="true">▶️<\/span> Überarbeiten/);
  assert.match(html, /<span class="dashboard-button-icon" aria-hidden="true">💬<\/span> Hilfe/);
  assert.match(html, /<h4>Fragen<\/h4>/);
  assert.doesNotMatch(html, /dashboard-button-icon[^<]*<\/span> Lernziele/);
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

test("labels translate the fixed texts for any course language", () => {
  const html = dashboard.renderComponent("View", "fr1", { lang: "fr", title: "X",
    labels: { progress: "Progression", unitsHint: "Choisissez une unité.", "state.done": "Terminé",
      progressText: { one: "{done} sur {total} {unit} est terminé", many: "{done} sur {total} {unit} sont terminés" },
      steps: "{done} sur {total} étapes" },
    unitLabel: { one: "module", many: "modules" },
    units: [{ id: "1", title: "A", state: "done" }, { id: "2", title: "B", state: "current", process: { steps: [{ title: "S", state: "done" }] } }] });
  assert.match(html, /<h3>Progression<\/h3>/);
  assert.match(html, /Choisissez une unité\./);
  assert.match(html, /Terminé/);
  assert.match(html, /1 sur 2 modules est terminé/);
  assert.match(html, /1 sur 1 étapes/);
  assert.match(html, /Course plan/, "keys without a label keep the built-in fallback");
});

test("labels are checked: unknown keys, wrong shapes and placeholders fail", () => {
  assert.throws(() => dashboard.buildModel({ labels: "Progression" }), /labels/);
  assert.throws(() => dashboard.buildModel({ labels: { progres: "Progression" } }), /progres/);
  assert.throws(() => dashboard.buildModel({ labels: { progress: { one: "a", many: "b" } } }), /progress/);
  assert.throws(() => dashboard.buildModel({ labels: { steps: { one: "{done}" } } }), /steps/);
  assert.throws(() => dashboard.buildModel({ labels: { steps: "{fait} sur {total}" } }), /\{fait\}/);
  assert.doesNotThrow(() => dashboard.buildModel({ labels: { internal: { one: "{n} note", many: "{n} notes" } } }));
});

test("labels survive switching the selected unit", () => {
  const listeners = [];
  const root = { dataset: { dashboardView: "fr2" }, innerHTML: "", querySelectorAll: () => [] };
  const page = { CustomEvent: class {}, document: { addEventListener: (type, fn) => listeners.push(fn), dispatchEvent: () => {}, documentElement: {} } };
  vm.runInNewContext(readFileSync(new URL("./dashboard.js", import.meta.url), "utf8"), page);
  page.LiaDashboard.renderComponent("View", "fr2", { lang: "fr", title: "X", labels: { result: "Disponible :" },
    units: [{ id: "1", title: "A", state: "current" }, { id: "2", title: "B", state: "planned", process: { steps: [{ title: "S", state: "done", result: "R" }] } }] });
  const control = { dataset: { dashboardSelect: "2" }, closest: () => root };
  listeners.forEach(fn => fn({ target: { closest: () => control }, preventDefault() {} }));
  assert.match(root.innerHTML, /Disponible :/);
});

test("counts agree in number: the verb follows the finished units, the noun the total", () => {
  const units = (done, total) => Array.from({ length: total }, (_, i) => ({ id: String(i + 1), title: "A", state: i < done ? "done" : "planned" }));
  const de = (done, total) => dashboard.renderComponent("View", `de-${done}-${total}`, { lang: "de", title: "X", units: units(done, total) });
  const en = (done, total) => dashboard.renderComponent("View", `en-${done}-${total}`, { lang: "en", title: "X", units: units(done, total) });
  assert.match(de(1, 6), /1 von 6 Einheiten ist abgeschlossen/);
  assert.match(de(2, 6), /2 von 6 Einheiten sind abgeschlossen/);
  assert.match(de(0, 6), /0 von 6 Einheiten sind abgeschlossen/);
  assert.match(de(1, 1), /1 von 1 Einheit ist abgeschlossen/);
  assert.match(en(1, 6), /1 of 6 units is done/);
  assert.match(en(2, 6), /2 of 6 units are done/);
  const step = lang => dashboard.renderComponent("View", `s-${lang}`, { lang, title: "X", units: [{ id: "1", title: "A", state: "current", process: { steps: [{ title: "S", state: "done" }] } }] });
  assert.match(step("de"), /1 von 1 Schritt</);
  assert.match(step("en"), /1 of 1 step</);
});

test("unit label follows the course terminology", () => {
  const html = dashboard.renderComponent("View", "u", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Modulen" }, units: [{ id: "1", title: "A", state: "done" }, { id: "2", title: "B", state: "planned" }] });
  assert.match(html, /1 von 2 Modulen ist abgeschlossen/);
  const plain = dashboard.renderComponent("View", "v", { lang: "de", title: "X", units: [{ id: "1", title: "A", state: "planned" }] });
  assert.match(plain, /0 von 1 Einheit ist abgeschlossen/);
  const linked = dashboard.renderComponent("View", "w", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Module" }, units: [{ id: "1", title: "A", state: "current", href: "#a" }] });
  assert.match(linked, />Planung ansehen /);
});
