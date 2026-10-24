import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
    decisions: [{ title: "A", kind: "decide", how: "B", label: "Gliederung erstellen", href: "agent:teaching/create-outline", command: ":create-outline" }],
    explore: [{ icon: "💬", title: "Fragen", description: "D", label: "Hilfe", href: "agent:teaching/help", command: ":help" }],
    links: [{ label: "Lernziele", href: "#outline" }] });
  assert.match(html, /dashboard-button-primary"[^>]*><span class="dashboard-button-label"><span class="dashboard-button-icon" aria-hidden="true">🔍<\/span> Prüfen/);
  assert.match(html, /<span class="dashboard-button-icon" aria-hidden="true">▶️<\/span> Gliederung erstellen/);
  assert.match(html, /<span class="dashboard-button-icon" aria-hidden="true">💬<\/span> Hilfe/);
  assert.match(html, /<h4>Fragen<\/h4>/);
  assert.doesNotMatch(html, /dashboard-button-icon[^<]*<\/span> Lernziele/);
});

test("unit cards count finished process steps", () => {
  const html = dashboard.renderComponent("View", "s", { lang: "de", title: "X", units: [{ id: 1, title: "Stunde 1", state: "current", process: { steps: [{ title: "A", state: "done" }, { title: "B", state: "current" }, { title: "C", state: "planned" }] } }] });
  assert.match(html, /1 von 3 Schritten/);
});

test("texts follow the course language; English is the fallback", () => {
  assert.match(dashboard.renderComponent("View", "de1", { lang: "de", title: "X" }), /<h3>Fertige Einheiten<\/h3>/);
  assert.match(dashboard.renderComponent("View", "en1", { lang: "en", title: "X" }), /<h3>Units finished<\/h3>/);
  assert.match(dashboard.renderComponent("View", "xx1", { lang: "fr", title: "X" }), /<h3>Units finished<\/h3>/);
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

test("texts from the data are escaped everywhere: labels, unit words, unit titles", () => {
  const evil = "<img src=x onerror=alert(1)>";
  const html = dashboard.renderComponent("View", "x1", { lang: "fr", title: "X",
    labels: { next: evil, why: evil, unitsHint: evil, how: evil, result: evil, showProcess: evil, steps: `${evil} {done}/{total}`, progressText: `{done} ${evil} {total} {unit}` },
    unitLabel: { one: evil, many: evil },
    next: { title: "N", why: "W", label: "Go", href: "#x" },
    decisions: [{ title: "D", kind: "decide", how: "H" }],
    units: [{ id: "1", title: "A", state: "done", process: { steps: [{ title: "S", state: "done", result: "R" }] } }, { id: "2", title: "B", state: "planned" }] });
  assert.doesNotMatch(html, /<img/);
  const empty = dashboard.renderComponent("View", "x2", { lang: "de", title: "X", unitsTitle: evil });
  assert.doesNotMatch(empty, /<img/);
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
  // The unit after the finished ones is in progress: a bar at zero only appears once work has begun.
  const units = (done, total) => Array.from({ length: total }, (_, i) => ({ id: String(i + 1), title: "A", state: i < done ? "done" : i === done ? "current" : "planned" }));
  const de = (done, total) => dashboard.renderComponent("View", `de-${done}-${total}`, { lang: "de", title: "X", units: units(done, total) });
  const en = (done, total) => dashboard.renderComponent("View", `en-${done}-${total}`, { lang: "en", title: "X", units: units(done, total) });
  assert.match(de(1, 6), /1 von 6 Einheiten ist abgeschlossen/);
  assert.match(de(2, 6), /2 von 6 Einheiten sind abgeschlossen/);
  assert.doesNotMatch(de(0, 6), /<progress|0 von 6/, "no bar and no count at zero finished units");
  assert.match(de(1, 1), /1 von 1 Einheit ist abgeschlossen/);
  assert.match(en(1, 6), /1 of 6 units is done/);
  assert.match(en(2, 6), /2 of 6 units are done/);
  const step = lang => dashboard.renderComponent("View", `s-${lang}`, { lang, title: "X", units: [{ id: "1", title: "A", state: "current", process: { steps: [{ title: "S", state: "done" }] } }] });
  assert.match(step("de"), /1 von 1 Schritt</);
  assert.match(step("en"), /1 of 1 step</);
});

test("empty states use the course's word for units, and the panel titles are neutral", () => {
  const de = dashboard.renderComponent("View", "e1", { lang: "de", title: "X", unitsTitle: "Kapitel" });
  assert.match(de, /Noch keine Kapitel angelegt\./);
  assert.match(de, /sobald Kapitel angelegt sind/);
  assert.match(de, /<h3>Kapitel<\/h3>/);
  const plain = dashboard.renderComponent("View", "e2", { lang: "de", title: "X", process: { steps: [{ title: "A" }] } });
  assert.match(plain, /<h3>Einheiten<\/h3>/);
  assert.match(plain, /<h3>Arbeitsstand<\/h3>/);
  assert.doesNotMatch(plain, /Meine Einheiten|Unser Arbeitsstand/);
  const en = dashboard.renderComponent("View", "e3", { lang: "en", title: "X", unitsTitle: "Chapters" });
  assert.match(en, /No chapters yet\./);
});

test("unit label follows the course terminology", () => {
  const html = dashboard.renderComponent("View", "u", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Modulen" }, units: [{ id: "1", title: "A", state: "done" }, { id: "2", title: "B", state: "planned" }] });
  assert.match(html, /1 von 2 Modulen ist abgeschlossen/);
  const plain = dashboard.renderComponent("View", "v", { lang: "de", title: "X", units: [{ id: "1", title: "A", state: "done" }] });
  assert.match(plain, /1 von 1 Einheit ist abgeschlossen/);
  const linked = dashboard.renderComponent("View", "w", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Module" }, units: [{ id: "1", title: "A", state: "current", href: "#a" }] });
  assert.match(linked, />Planung ansehen /);
});

test("an anchor in an open point is a plain text link named after its target; agent: links stay buttons", () => {
  const html = dashboard.renderComponent("View", "d1", { lang: "de", title: "X", decisions: [
    { title: "Eine Frage?", kind: "decide", how: "B", href: "#outline" },
    { title: "Zweite Frage?", kind: "decide", how: "B", label: "Gliederung ansehen", href: "#outline" },
    { title: "Dritte Frage?", kind: "decide", how: "B", href: "agent:teaching/create-outline", command: ":create-outline" }
  ] });
  assert.match(html, /<a class="dashboard-decision-link" href="#outline">Mehr dazu /);
  assert.match(html, /<a class="dashboard-decision-link" href="#outline">Gliederung ansehen /);
  assert.doesNotMatch(html, /dashboard-button[^>]*href="#outline"/);
  assert.match(html, /dashboard-button" href="agent:teaching\/create-outline"/);
  assert.doesNotMatch(html, /<\/span> (Eine|Zweite|Dritte) Frage\?/, "the question is never the link or button text");
  assert.match(dashboard.renderComponent("View", "d2", { lang: "en", title: "X", decisions: [{ title: "Q?", how: "B", href: "#a" }] }), />More about this </);
});

test("with a provisional plan and no units, the progress line does not claim that no units exist", () => {
  const plan = { rows: [{ label: "Eine sehr lange Überschrift für die erste Einheit", text: "Inhalt" }] };
  const de = dashboard.renderComponent("View", "p1", { lang: "de", title: "X", unitsTitle: "Kapitel", plan });
  assert.match(de, /Die Kapitel sind erst vorläufig geplant\./);
  assert.doesNotMatch(de, /sobald Kapitel angelegt sind/);
  const en = dashboard.renderComponent("View", "p2", { lang: "en", title: "X", plan });
  assert.match(en, /The units are only provisionally planned\./);
  const own = dashboard.renderComponent("View", "p3", { lang: "fr", title: "X", plan, labels: { progressPlan: "Plan provisoire." } });
  assert.match(own, /Plan provisoire\./);
  const withUnits = dashboard.renderComponent("View", "p4", { lang: "de", title: "X", plan, units: [{ id: "1", title: "A", state: "planned" }] });
  assert.doesNotMatch(withUnits, /vorläufig geplant/);
});

test("a unit without work steps shows its state, its summary and a neutral empty text", () => {
  const data = { lang: "de", title: "X", selected: "2", units: [
    { id: "1", title: "A", state: "current", process: { steps: [{ title: "S", state: "current" }] } },
    { id: "2", title: "B", state: "planned", summary: "25 Minuten, eine Aufgabe." }] };
  const html = dashboard.renderComponent("View", "f1", data);
  const panel = html.split('class="dashboard-process"')[1];
  assert.match(panel, /dashboard-process-fallback"><span class="dashboard-status dashboard-status-planned">/);
  assert.match(panel, /<p class="dashboard-process-summary">25 Minuten, eine Aufgabe\.<\/p>/);
  assert.match(panel, /Hier sind noch keine Arbeitsschritte eingetragen\./);
  assert.doesNotMatch(html, /Ablauf/, "the empty text avoids words of the course plan");
  const en = dashboard.renderComponent("View", "f2", { ...data, lang: "en" });
  assert.match(en, /No work steps recorded here yet\./);
  const own = dashboard.renderComponent("View", "f3", { ...data, lang: "fr", labels: { processEmpty: "Aucune étape." } });
  assert.match(own, /Aucune étape\./);
  const course = dashboard.renderComponent("View", "f4", { lang: "de", title: "X" });
  assert.match(course, /Für den Kurs sind noch keine Arbeitsschritte eingetragen\./);
  assert.doesNotMatch(course, /dashboard-process-fallback/);
});

test("the progress line names its subject; labels and progressTitle still win", () => {
  const units = [{ id: "1", title: "A", state: "done" }, { id: "2", title: "B", state: "planned" }];
  assert.match(dashboard.renderComponent("View", "t1", { lang: "de", title: "X", unitsTitle: "Lerneinheiten", units }), /<h3>Fertige Lerneinheiten<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t2", { lang: "de", title: "X", unitLabel: { one: "Modul", many: "Modulen" }, units }), /<h3>Fertige Einheiten<\/h3>/, "the dative form of unitLabel is never a heading");
  assert.match(dashboard.renderComponent("View", "t3", { lang: "en", title: "X", unitLabel: { one: "chapter", many: "chapters" }, units }), /<h3>Chapters finished<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t4", { lang: "en", title: "X", unitsTitle: "Modules", units }), /<h3>Modules finished<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t5", { lang: "fr", title: "X", labels: { progress: "Progression" }, units }), /<h3>Progression<\/h3>/);
  assert.match(dashboard.renderComponent("View", "t6", { lang: "de", title: "X", progressTitle: "Material", labels: { progress: "P" }, units }), /<h3>Material<\/h3>/);
});

test("the course counter counts planning steps without optional ones", () => {
  const steps = [{ title: "A", state: "done" }, { title: "B", state: "done" }, { title: "C", state: "current" }, { title: "D", state: "optional" }];
  const data = { title: "X", process: { steps }, units: [{ id: "1", title: "U", state: "planned", process: { steps } }] };
  const de = dashboard.renderComponent("View", "k1", { ...data, lang: "de" });
  assert.match(de, /dashboard-course[\s\S]*?2 von 3 Planungsschritten/);
  assert.doesNotMatch(de, /von 4/);
  assert.match(de, /dashboard-unit-number" aria-hidden="true">1[\s\S]*?2 von 3 Schritten/);
  assert.match(dashboard.renderComponent("View", "k2", { ...data, lang: "en" }), /2 of 3 planning steps/);
  const one = dashboard.renderComponent("View", "k3", { lang: "de", title: "X", process: { steps: [{ title: "A", state: "done" }] }, units: [{ id: "1", title: "U", state: "current" }] });
  assert.match(one, /1 von 1 Planungsschritt</);
  const own = dashboard.renderComponent("View", "k4", { ...data, lang: "fr", labels: { courseSteps: { one: "{done} sur {total} étape", many: "{done} sur {total} étapes de planification" } } });
  assert.match(own, /2 sur 3 étapes de planification/);
  assert.throws(() => dashboard.buildModel({ labels: { courseSteps: "{n} étapes" } }), /\{n\}/);
});

test("before any material exists, one sentence replaces the progress bar", () => {
  const planned = [{ id: "1", title: "A", state: "planned", process: { steps: [{ title: "S", state: "planned" }, { title: "P", state: "optional" }] } },
    { id: "2", title: "B", state: "planned", process: { steps: [{ title: "S", state: "planned" }] } }];
  const de = dashboard.renderComponent("View", "b1", { lang: "de", title: "X", unitLabel: { one: "Lerneinheit", many: "Lerneinheiten" }, units: planned });
  assert.match(de, /Noch nichts fertig – das Material beginnt mit Lerneinheit 1\./);
  assert.doesNotMatch(de, /<progress/);
  assert.doesNotMatch(de, /0 von 2/);
  const en = dashboard.renderComponent("View", "b2", { lang: "en", title: "X", unitLabel: { one: "chapter", many: "chapters" }, units: planned });
  assert.match(en, /Nothing finished yet – the material starts with chapter 1\./);
  assert.match(dashboard.renderComponent("View", "b3", { lang: "de", title: "X", units: planned }), /beginnt mit Einheit 1\./);
  const own = dashboard.renderComponent("View", "b4", { lang: "fr", title: "X", units: planned, unitLabel: { one: "module", many: "modules" }, labels: { progressStart: "Rien encore – on commence par {unit} {first}." } });
  assert.match(own, /Rien encore – on commence par module 1\./);
  assert.throws(() => dashboard.buildModel({ labels: { progressStart: "{done}" } }), /\{done\}/);
  // Once a step has begun but no unit is finished, the sentence names the running unit – still no bar at zero.
  const begun = structuredClone(planned);
  begun[0].process.steps[0].state = "current";
  const running = dashboard.renderComponent("View", "b5", { lang: "de", title: "X", units: begun });
  assert.match(running, /Noch nichts fertig – Einheit 1 ist in Arbeit \(0 von 1 Schritt\)\./);
  assert.doesNotMatch(running, /<progress/);
});

test("after the first saved step: no bar at zero, the running unit and its steps instead (R5-D2)", () => {
  const steps = state => [{ title: "Entwurf", state }, { title: "Durchsicht", state: "planned" }, { title: "Prüfung", state: "planned" }, { title: "Teilen", state: "optional" }];
  const units = [{ id: "1", title: "A", state: "planned", process: { steps: steps("done") } },
    { id: "2", title: "B", state: "planned", process: { steps: steps("planned") } },
    { id: "3", title: "C", state: "planned", process: { steps: steps("planned") } },
    { id: "4", title: "D", state: "planned", process: { steps: steps("planned") } }];
  const data = { title: "X", unitLabel: { one: "Lerneinheit", many: "Lerneinheiten" }, units };
  const de = dashboard.renderComponent("View", "r1", { ...data, lang: "de" });
  assert.match(de, /Noch nichts fertig – Lerneinheit 1 ist in Arbeit \(1 von 3 Schritten\)\./);
  assert.doesNotMatch(de, /<progress|0 von 4|beginnt mit/);
  const en = dashboard.renderComponent("View", "r2", { ...data, lang: "en", unitLabel: { one: "chapter", many: "chapters" } });
  assert.match(en, /Nothing finished yet – chapter 1 is in progress \(1 of 3 steps\)\./);
  // A later unit that has begun is named, not the first one.
  const later = structuredClone(units);
  later[0].process.steps[0].state = "planned";
  later[2].process.steps[0].state = "done";
  assert.match(dashboard.renderComponent("View", "r3", { ...data, lang: "de", units: later }), /Lerneinheit 3 ist in Arbeit \(1 von 3 Schritten\)/);
  const own = dashboard.renderComponent("View", "r4", { ...data, lang: "fr", unitLabel: { one: "module", many: "modules" },
    labels: { progressStarted: "Rien de terminé – {unit} {first} est en cours ({done} sur {total} étapes)." } });
  assert.match(own, /Rien de terminé – module 1 est en cours \(1 sur 3 étapes\)\./);
  assert.throws(() => dashboard.buildModel({ labels: { progressStarted: "{n}" } }), /\{n\}/);
  // The bar returns as soon as one unit is finished – also when its count is low.
  const finished = structuredClone(units);
  finished[0].state = "done";
  const bar = dashboard.renderComponent("View", "r5", { ...data, lang: "de", units: finished });
  assert.match(bar, /<progress value="1" max="4"/);
  assert.match(bar, /1 von 4 Lerneinheiten ist abgeschlossen/);
  assert.doesNotMatch(bar, /Noch nichts fertig/);
});

test("a planned unit with a done step shows the derived chip \"started\" (R5-D1)", () => {
  const unit = (extra = {}) => ({ id: "1", title: "A", state: "planned",
    process: { steps: [{ title: "S", state: "done" }, { title: "T", state: "planned" }, { title: "P", state: "optional" }] }, ...extra });
  const chip = html => html.match(/dashboard-unit-list[\s\S]*?dashboard-status dashboard-status-planned"><span aria-hidden="true">○<\/span> ([^<]*)</)?.[1];
  const de = dashboard.renderComponent("View", "st1", { lang: "de", title: "X", units: [unit()] });
  assert.equal(chip(de), "Angefangen");
  assert.match(de, /aria-label="A: Angefangen;/);
  assert.doesNotMatch(de, /Noch offen<\/span><span class="dashboard-unit-steps">1 von 2/);
  assert.equal(chip(dashboard.renderComponent("View", "st2", { lang: "en", title: "X", units: [unit()] })), "Started");
  assert.equal(chip(dashboard.renderComponent("View", "st3", { lang: "de", title: "X", units: [unit({ statusLabel: "Entwurf begonnen" })] })), "Entwurf begonnen", "an own statusLabel wins");
  assert.equal(chip(dashboard.renderComponent("View", "st4", { lang: "fr", title: "X", labels: { "state.started": "Commencé" }, units: [unit()] })), "Commencé");
  // Only required steps count: a done optional step or no done step keeps "not started".
  const optional = unit({ process: { steps: [{ title: "S", state: "planned" }, { title: "P", state: "done" }] } });
  optional.process.steps[1].state = "optional";
  assert.equal(chip(dashboard.renderComponent("View", "st5", { lang: "de", title: "X", units: [optional] })), "Noch offen");
  const current = dashboard.renderComponent("View", "st6", { lang: "de", title: "X", units: [unit({ state: "current" })] });
  assert.match(current, /dashboard-status-current"><span aria-hidden="true">●<\/span> In Arbeit/);
});

test("the course counter adds the material steps while the material is produced (R5-D3)", () => {
  const unitSteps = first => [{ title: "Entwurf", state: first }, { title: "Durchsicht", state: "planned" }, { title: "Prüfung", state: "planned" }, { title: "Teilen", state: "optional" }];
  const course = current => [{ title: "A", state: "done" }, { title: "B", state: "done" }, { title: "C", state: "done" }, { title: "D", state: "done" },
    { title: "Material", state: current }, { title: "Prüfen", state: "planned" }, { title: "Veröffentlichen", state: "optional" }];
  const data = (first, current = "current") => ({ title: "X", process: { steps: course(current) },
    units: [1, 2, 3, 4].map(id => ({ id: String(id), title: `U${id}`, state: "planned", process: { steps: unitSteps(id === 1 ? first : "planned") } })) });
  const counter = html => html.match(/dashboard-course[\s\S]*?dashboard-unit-steps">([^<]*)</)?.[1];
  assert.equal(counter(dashboard.renderComponent("View", "m1", { ...data("done"), lang: "de" })), "4 von 6 Planungsschritten · Material: 1 von 12 Schritten");
  assert.equal(counter(dashboard.renderComponent("View", "m2", { ...data("done"), lang: "en" })), "4 of 6 planning steps · Material: 1 of 12 steps");
  assert.equal(counter(dashboard.renderComponent("View", "m3", { ...data("planned"), lang: "de" })), "4 von 6 Planungsschritten", "no partial value before a unit step is done");
  assert.equal(counter(dashboard.renderComponent("View", "m4", { ...data("done", "done"), lang: "de" })), "5 von 6 Planungsschritten", "no partial value without a current course step");
  const own = dashboard.renderComponent("View", "m5", { ...data("done"), lang: "fr",
    labels: { courseSteps: "{done} sur {total}", courseStepsMaterial: "matériel : {done} sur {total} étapes" } });
  assert.equal(counter(own), "4 sur 6 · matériel : 1 sur 12 étapes");
  assert.throws(() => dashboard.buildModel({ labels: { courseStepsMaterial: "{unit}" } }), /\{unit\}/);
});

// Runs validate-journal.mjs on a minimal journal with the given Dashboard data.
// `sections`: further Markdown sections inserted before ## Dashboard; `files`: further project files {path: text}.
function validate(data, sections = "", files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-check-"));
  const file = join(dir, "journal.md");
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  writeFileSync(file,`<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Outline\n\nText\n\n${sections}## Dashboard\n\n\`\`\`json @Dashboard.View\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`);
  const run = spawnSync(process.execPath, [fileURLToPath(new URL("./validate-journal.mjs", import.meta.url)), file], { encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  return { status: run.status, output: run.stdout + run.stderr };
}
const next = { title: "Weiter", why: "W", label: "Weiter", href: "agent:teaching/create-didactics", command: ":create-didactics" };

test("validate-journal accepts a clean Dashboard", () => {
  const result = validate({ title: "Kurs", next,
    decisions: [{ key: "a", title: "Frage?", how: "B", label: "Gliederung ansehen", href: "#outline" }],
    explore: [{ icon: "💬", title: "Fragen", description: "D", label: "Hilfe", href: "agent:teaching/help", command: ":help" }],
    process: { steps: [{ title: "Rahmen", state: "done", result: "3 Einheiten, ein Link für alles." }] } });
  assert.equal(result.status, 0, result.output);
});

test("validate-journal reports an open point whose link has no label", () => {
  const result = validate({ title: "Kurs", next, decisions: [{ key: "a", title: "Frage?", how: "B", href: "#outline" }] });
  assert.equal(result.status, 2);
  assert.match(result.output, /"Frage\?": href without label/);
});

test("validate-journal reports an explore button with the icon of the next step", () => {
  const explicit = validate({ title: "Kurs", next: { ...next, icon: "▶️" },
    explore: [{ icon: "▶️", title: "Profil", description: "D", label: "Neu", href: "agent:teaching/create-learner-persona", command: ":create-learner-persona" }] });
  assert.equal(explicit.status, 2);
  assert.match(explicit.output, /explore "Profil": icon ▶️ is the icon of the next step/);
  // Without an icon, both agent: buttons show the default ▶️.
  const implicit = validate({ title: "Kurs", next,
    explore: [{ title: "Profil", description: "D", label: "Neu", href: "agent:teaching/create-learner-persona", command: ":create-learner-persona" }] });
  assert.match(implicit.output, /explore "Profil": icon ▶️/);
  const own = validate({ title: "Kurs", next: { ...next, icon: "🔍" },
    explore: [{ icon: "➕", title: "Profil", description: "D", label: "Neu", href: "agent:teaching/create-learner-persona", command: ":create-learner-persona" }] });
  assert.equal(own.status, 0, own.output);
});

test("validate-journal reports a process result that starts with its own status word", () => {
  const result = validate({ title: "Kurs", next,
    process: { steps: [{ title: "Rahmen", state: "done", result: "Gespeichert: 3 Einheiten." }] },
    units: [{ id: 1, title: "Eins", state: "current", process: { steps: [{ title: "Material", state: "done", result: "done: Entwurf liegt vor." }] } }] });
  assert.equal(result.status, 2);
  assert.match(result.output, /process step "Rahmen": result starts with "Gespeichert:"/);
  assert.match(result.output, /process step "Eins → Material": result starts with "done:"/);
  const plain = validate({ title: "Kurs", next, process: { steps: [{ title: "Rahmen", state: "done", result: "Gespeichert ist der Rahmen: 3 Einheiten." }] } });
  assert.equal(plain.status, 0, plain.output);
});

// A minimal agenda with the units table after `<!-- data-type="none" -->`, as in templates/course-agenda.yaml.
const agenda = (cells, required = true) => `## Course Context\n\nAgenda required: ${required ? "yes" : "no"}\n\n## Agenda – Ablaufplan\n\n<!-- data-type="none" -->\n| Nr. | Einheit | Zeit |\n|---|---|---|\n${cells.map((cell, i) => `| ${cell} | Einheit ${i + 1} | 45 Min. |`).join("\n")}\n\n<details><summary>Technik</summary>\n\n| No. | Type |\n|---|---|\n| 1 | \`a\` |\n\n</details>\n\n`;
const sessions = (note, action = "[▶️ Einheit anlegen](agent:teaching/create-session) `:create-session`") => `## Sessions – Einheiten\n\n<!-- class="journal-actions" -->\n${action}\n\n<!--- _Comment lines are not the note – they are created after the didactics._ --->\n\n${note}\n\n`;
const planned = n => Array.from({ length: n }, (_, i) => ({ id: i + 1, title: `E${i + 1}`, state: "planned", process: { steps: [{ title: "Material", state: "planned" }] } }));

test("validate-journal recognises agenda rows numbered 1, 1. or 1\\.", () => {
  for (const cells of [["1", "2"], ["1.", "2."], ["1\\.", "2\\."]]) {
    const result = validate({ title: "Kurs", next, units: planned(2) }, agenda(cells) + sessions("_Die Einheiten stehen im Ablaufplan._"));
    assert.equal(result.status, 0, `${cells}: ${result.output}`);
  }
  const mismatch = validate({ title: "Kurs", next, units: planned(3) }, agenda(["1\\.", "2\\."]));
  assert.match(mismatch.output, /the agenda has 2 rows, the dashboard shows 3 units/);
});

test("validate-journal names an agenda table without numbered rows instead of claiming there is no agenda", () => {
  const result = validate({ title: "Kurs", next, units: planned(2) }, agenda(["I", "II"]) + sessions("_Die Einheiten stehen im Ablaufplan._"));
  assert.equal(result.status, 2);
  assert.match(result.output, /agenda table found, but no numbered rows recognised \(No\. must be plain digits/);
  assert.doesNotMatch(result.output, /before the required agenda exists/);
  const none = validate({ title: "Kurs", next }, "## Course Context\n\nAgenda required: yes\n\n## Agenda\n\n_Noch leer._\n\n" + sessions("_Noch keine Einheiten._"));
  assert.match(none.output, /offers create-session before the required agenda exists/);
  assert.doesNotMatch(none.output, /agenda table found/);
});

test("validate-journal reports units without material steps when another unit has them", () => {
  const units = planned(3);
  delete units[1].process;
  units[2].process = { steps: [] };
  const result = validate({ title: "Kurs", next, units });
  assert.equal(result.status, 2);
  assert.match(result.output, /units 2, 3 without process\.steps while unit 1 has them – every unit gets the same material steps/);
  const noneHas = validate({ title: "Kurs", next, units: [{ id: 1, title: "A", state: "planned" }, { id: 2, title: "B", state: "planned" }] });
  assert.equal(noneHas.status, 0, noneHas.output);
});

test("validate-journal reports the empty-state note under Sessions once the agenda plans units", () => {
  const notes = [
    "_No units yet – they are created after the didactics (and the agenda, if one is planned)._",
    "_Noch keine Einheiten – sie entstehen nach der Didaktik (und dem Ablaufplan, wenn einer geplant ist)._",
    "_Noch keine Kapitel – sie entstehen nach der Didaktik (und dem Ablaufplan, wenn einer geplant ist)._"
  ];
  for (const note of notes) {
    const result = validate({ title: "Kurs", next, units: planned(2) }, agenda(["1", "2"]) + sessions(note));
    assert.equal(result.status, 2, note);
    assert.match(result.output, /## Sessions still shows the empty-state note .* although ## Agenda plans 2 units/);
  }
  const before = validate({ title: "Kurs", next }, agenda([]) + sessions(notes[1], "[▶️ Zuerst den Ablaufplan](agent:teaching/create-agenda) `:create-agenda`"));
  assert.equal(before.status, 0, before.output);
  const updated = validate({ title: "Kurs", next, units: planned(2) }, agenda(["1", "2"]) + sessions("_Die Einheiten sind im Ablaufplan geplant und entstehen nacheinander, beginnend mit der ersten._"));
  assert.equal(updated.status, 0, updated.output);
});

test("validate-journal warns about a started unit still planned and an outdated start note (R5-D4)", () => {
  const units = planned(2);
  units[0].href = "#1.-e1";
  const subsection = "### 1. E1\n\nText\n\n";
  for (const note of ["_Die Einheiten sind im Ablaufplan geplant; sie werden nacheinander angelegt, beginnend mit Einheit 1._",
    "_The units are planned in the schedule; they are created one after another, starting with unit 1._",
    "_Die Einheiten entstehen nacheinander, beginnend mit der ersten._"]) {
    const result = validate({ title: "Kurs", next, units }, sessions(note) + subsection);
    assert.equal(result.status, 0, "warnings never change the exit code");
    assert.match(result.output, /Warnings:\n- unit 1 has its subsection \(href\) but state "planned" and no statusLabel/);
    assert.match(result.output, /## Sessions note ".*" says the units are created starting with unit 1, but "### 1\." already exists/);
    assert.match(result.output, /Exit code: 0/);
  }
  // A note naming a unit without its subsection yet, a statusLabel and a matching state are fine.
  const ok = structuredClone(units);
  ok[0].state = "current";
  const clean = validate({ title: "Kurs", next, units: ok }, sessions("_1 von 2 Einheiten angelegt; die nächste folgt nach dem Material von Einheit 1._") + subsection);
  assert.doesNotMatch(clean.output, /Warnings:/);
  const labelled = structuredClone(units);
  labelled[0].statusLabel = "Planungsskizze liegt vor";
  const later = validate({ title: "Kurs", next, units: labelled }, sessions("_Weiter geht es nacheinander, beginnend mit Einheit 2._") + subsection);
  assert.doesNotMatch(later.output, /Warnings:/);
  // Warnings stand next to errors without replacing them.
  const both = validate({ title: "Kurs", next, units, decisions: [{ key: "a", title: "Frage?", how: "B", href: "#outline" }] }, sessions("_Beginnend mit Einheit 1._") + subsection);
  assert.equal(both.status, 2);
  assert.match(both.output, /Warnings:/);
  assert.match(both.output, /href without label/);
});

test("validate-journal warns about the next step, finished words, a reset material step and anchors into <section> (R6-D4)", () => {
  const steps = state => [{ title: "Einheit planen", state: "done" }, { title: "Material ausarbeiten", state }, { title: "Prüfen", state: "planned" }];
  const unit = { id: 1, title: "E1", state: "current", href: "#1.-e1", view: { href: "agent:teaching/preview?file=1", command: ":preview 1" }, summary: "Text von Ihnen freigegeben; Bilder fehlen.", statusLabel: "Material fertig · Bilder fehlen", process: { steps: steps("current") } };
  const unitNext = { title: "Material erstellen", why: "W", label: "Bilder ansehen", href: "agent:teaching/coauthor-materials?number=1", command: ":coauthor-materials 1" };
  const table = "<details><summary>Technik</summary>\n\n<!-- data-type=\"none\" -->\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | |\n\n</details>\n\n";
  const unitSessions = (status, report = "") => `## Sessions – Einheiten\n\n<!-- class="journal-actions" -->\n[Regeln](#regeln) · [Fehlt](#gibt-es-nicht) · [▶️ Hilfe](agent:teaching/help) \`:help\`\n\n1. E1 – ${status}\n\n${table}### 1. E1\n\n${report}Text\n\n`;
  const agents = "## Agents\n\n<section>\n\n### Regeln\n\nText\n\n</section>\n\n";
  const result = validate({ title: "Kurs", next: unitNext, units: [unit] }, unitSessions("Material fertig · Bilder fehlen") + agents);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /next\.title "Material erstellen" is not the current step of unit 1 \("Material ausarbeiten"\)/);
  assert.match(result.output, /next\.label "Bilder ansehen" does not name the step "Material ausarbeiten"/);
  assert.match(result.output, /unit 1: statusLabel "Material fertig · Bilder fehlen" says "fertig", but the unit has no passed check/);
  assert.match(result.output, /unit 1: status line "Material fertig · Bilder fehlen" says "fertig"/);
  assert.match(result.output, /unit 1: material ✅ and approved, but its material step "Material ausarbeiten" is "current"/);
  assert.match(result.output, /action line link #regeln points to a heading inside a <section> block/);
  assert.match(result.output, /action line link #gibt-es-nicht matches no heading/);
  // Matching next step, plain status words, material not yet approved: no warning.
  const clean = validate({ title: "Kurs", next: { ...unitNext, title: "Material ausarbeiten · E1", label: "Material weiter ausarbeiten" },
    units: [{ ...unit, summary: "Text geschrieben; Bilder fehlen.", statusLabel: "Material geschrieben · Prüfung offen" }] },
    unitSessions("Material noch nicht fertig").replace(" · [Fehlt](#gibt-es-nicht)", "").replace("[Regeln](#regeln) · ", ""));
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  // A passed check allows "fertig"; a check with concerns may send the material step back.
  const report = "#### Validation Report\n\n__Result:__ PASS\n\n";
  const done = validate({ title: "Kurs", next: unitNext, units: [{ ...unit, process: { steps: steps("done") } }] }, unitSessions("Material fertig", report));
  assert.doesNotMatch(done.output, /says "fertig"/);
  const concerns = validate({ title: "Kurs", next: unitNext, units: [unit] }, unitSessions("Überarbeitung", "#### Validation Report\n\n__Result:__ PASS with concerns\n\n"));
  assert.doesNotMatch(concerns.output, /material ✅ and approved/);
  // A Dashboard link into a <section> block is an error with the same explanation.
  const linked = validate({ title: "Kurs", next, links: [{ label: "Regeln", href: "#regeln" }] }, agents);
  assert.equal(linked.status, 2);
  assert.match(linked.output, /link #regeln points to a heading inside a <section> block/);
});

// check-material.mjs: the source part runs without a browser.
const { analyseMaterial, isImageMarker } = await import("./check-material.mjs");
const material = [
  "<!--\nlanguage: de\nnarrator: Deutsch Female\n-->\n\n# Wolken\n",
  "    {{|>}}\nHier lernst du Wolken kennen.\n",
  "<!---\nStellen mit „*📷 Foto folgt*“ werden ersetzt.\n--->\n",
  "## Haufenwolke\n",
  "<!--- image: haufenwolke --->\n> 🖼️ _Bild folgt: Haufenwolke am Sommerhimmel_\n",
  "{|>}{Welche Wolke ist das?}\n",
  "- [( )] {|>}{die Federwolke}\n- [(X)] {|>}{die Haufenwolke}\n- [[?]] Schau dir das Bild noch einmal an.\n",
  "## Federwolke\n",
  "<!--- image: federwolke --->\nHier kommt bald ein Foto.\n",
  "📷 Mach selbst ein Foto vom Himmel.\n",
  "<!--- image: regenwolke --->\n![Regenwolke](regenwolke.png)\n",
  "```\n*📷 Foto folgt*\n```\n",
  "### Selbsttest\n",
  "Welche Wolke bringt Regen?\n",
  "<!-- data-solution-button=\"false\" -->\n- [( )] *📷 Foto folgt*\n- [(X)] *📷 foto folgt*\n- [[?]] Hinweis\n",
  "Was passt zur Federwolke?\n",
  "- [[X]] {|>}{hoch}\n- [[ ]] {|>}{tief}\n"
].join("\n");

test("check-material finds image placeholders by symbol, emphasis and authoring note, not by words", () => {
  assert.ok(isImageMarker("> 🖼️ _Image follows: a cloud at noon_"));
  assert.ok(isImageMarker("**📸 Photo coming soon**"));
  assert.ok(isImageMarker("- [( )] *📷 Foto folgt*"));
  assert.ok(!isImageMarker("📷 Take a photo of the sky."), "an instruction with a camera symbol is no placeholder");
  assert.ok(!isImageMarker("*📷 ![Wolke](wolke.png)*"), "a real image is no placeholder");
  const { markers, slides, quizzes, readAloud } = analyseMaterial(material);
  assert.deepEqual(markers.map(marker => marker.slide), ["Haufenwolke", "Federwolke", "Selbsttest", "Selbsttest"],
    "not in comments or code, not above a real image; an authoring note marks any line below it");
  assert.equal(markers[0].text, "🖼️ Bild folgt: Haufenwolke am Sommerhimmel");
  assert.deepEqual(slides, ["Wolken", "Haufenwolke", "Federwolke", "Selbsttest"]);
  assert.equal(quizzes, 3);
  assert.deepEqual(readAloud, { blocks: 1, inline: 5, inHints: 0 }, "read-aloud is counted from the markup, independent of the course language");
});

test("check-material reports quizzes whose options cannot be told apart, and quizzes that depend on missing images", () => {
  const { problems, warnings } = analyseMaterial(material);
  assert.deepEqual(problems, ['quiz on slide "Selbsttest" ("Welche Wolke bringt Regen?"): options not distinguishable – 2 × "📷 Foto folgt"; learners cannot solve it']);
  assert.equal(warnings.length, 3, warnings.join("\n"));
  assert.match(warnings[0], /^quiz on slide "Haufenwolke" \("Welche Wolke ist das\?"\): follows an image placeholder/);
  assert.match(warnings[1], /^quiz on slide "Selbsttest" \("Welche Wolke bringt Regen\?"\): 2 options are image placeholders/);
  assert.match(warnings[2], /^narrator is set, but 2 of 2 quiz hints \(\[\[\?\]\]\) are not read aloud \(slides: Haufenwolke · Selbsttest\)/);
  const same = analyseMaterial("# A\n\nFrage?\n\n- [[X]] {|>}{Hoch}\n- [[ ]] **hoch**\n- [[ ]] tief\n");
  assert.match(same.problems[0], /options not distinguishable – 2 × "Hoch"/, "markup and case do not make options different");
  assert.deepEqual(analyseMaterial("# A\n\n- [( )] ![a](1.png)\n- [(X)] ![a](2.png)\n").problems, [], "different images are different options");
});

test("check-material without a browser prints the source findings and exits with 2, without a stack trace", () => {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-material-"));
  writeFileSync(join(dir, "README.md"), material);
  const script = fileURLToPath(new URL("./check-material.mjs", import.meta.url));
  const run = args => spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: "utf8", env: { ...process.env, PLAYWRIGHT_MODULE_PATH: join(dir, "no-playwright") } });
  const result = run(["README.md"]);
  const help = run(["--help"]);
  const unknown = run(["--verbose"]);
  const missing = run(["fehlt.md"]);
  rmSync(dir, { recursive: true, force: true });
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 2, output);
  assert.match(output, /Missing images: 4 \(4 placeholders on: Haufenwolke · Federwolke · Selbsttest; files not checked\)/);
  assert.match(output, /Errors \(.*\): 1\n- quiz on slide "Selbsttest"/);
  assert.match(output, /Rendered check not possible: .*CHROMIUM_PATH/);
  assert.match(output, /Rendered check not possible: no installed Playwright found/, "the reason that triggers the install offer (data/chat-checks.md → Offering the Rendered Check)");
  assert.match(output, /Exit code: 2/);
  assert.doesNotMatch(output, /^\s+at /m, "no stack trace");
  assert.equal(help.status, 0);
  assert.match(help.stdout, /^Usage: /);
  assert.equal(unknown.status, 2, "an option is never read as a file name");
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /Not found: fehlt\.md/);
});

// Runs find.mjs inside a small project folder (with a file next to it, outside the project).
function find(args, setup = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-find-"));
  const project = join(dir, "project");
  mkdirSync(join(project, "materials", "1-intro"), { recursive: true });
  mkdirSync(join(project, "node_modules", "lib"), { recursive: true });
  writeFileSync(join(dir, "outside.md"), "Lernziel außerhalb\n");
  writeFileSync(join(project, "journal.md"), "# Kurs\n\n## Outline\n\nLernziel 1: lesen\nlernziel 2: schreiben\n");
  writeFileSync(join(project, "materials", "1-intro", "README.md"), "# Intro\n\nLernziel im Material\n");
  writeFileSync(join(project, "materials", "notes.txt"), "Lernziel in einer Textdatei\n");
  writeFileSync(join(project, "materials", "plan.yaml"), "goal: Lernziel\n");
  writeFileSync(join(project, "node_modules", "lib", "README.md"), "Lernziel in einer Bibliothek\n");
  setup(project, dir);
  const run = spawnSync(process.execPath, [fileURLToPath(new URL("./find.mjs", import.meta.url)), ...args], { cwd: project, encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  return { status: run.status, stdout: run.stdout, output: run.stdout + run.stderr };
}

test("find.mjs searches journal.md by default and prints file:line: text", () => {
  const result = find(["Lernziel"]);
  assert.equal(result.status, 0, result.output);
  assert.equal(result.stdout, "journal.md:5: Lernziel 1: lesen\nExit code: 0\n");
  const caseless = find(["-i", "^lernziel \\d"]);
  assert.match(caseless.stdout, /journal\.md:5: Lernziel 1: lesen\njournal\.md:6: lernziel 2: schreiben\n/);
  const none = find(["Wolke"]);
  assert.equal(none.status, 1);
  assert.match(none.stdout, /No match for \/Wolke\/ in 1 file\.\nExit code: 1/);
});

test("find.mjs searches folders recursively, only text types, without node_modules", () => {
  const result = find(["Lernziel", "."]);
  assert.equal(result.status, 0, result.output);
  assert.match(result.stdout, /^journal\.md:5: /m);
  assert.match(result.stdout, /^materials\/1-intro\/README\.md:3: Lernziel im Material$/m);
  assert.match(result.stdout, /^materials\/plan\.yaml:1: goal: Lernziel$/m);
  assert.doesNotMatch(result.stdout, /notes\.txt|node_modules|außerhalb/);
  const two = find(["Lernziel", "journal.md", "materials/plan.yaml"]);
  assert.match(two.stdout, /journal\.md:5:[\s\S]*materials\/plan\.yaml:1:/);
});

test("find.mjs refuses paths outside the current folder, also through links", () => {
  for (const path of ["../outside.md", "..", "/etc/hostname"]) {
    const result = find(["Lernziel", path]);
    assert.equal(result.status, 2, path);
    assert.match(result.output, /Refused: .* outside the current folder/, path);
    assert.match(result.stdout, /Exit code: 2/, path);
    assert.doesNotMatch(result.output, /außerhalb/);
  }
  const linked = find(["Lernziel", "link.md"], (project, dir) => symlinkSync(join(dir, "outside.md"), join(project, "link.md")));
  assert.equal(linked.status, 2);
  assert.match(linked.output, /Refused: link\.md points outside the current folder/);
  const walked = find(["Lernziel", "."], (project, dir) => symlinkSync(dir, join(project, "up")));
  assert.equal(walked.status, 0);
  assert.doesNotMatch(walked.output, /außerhalb/, "links inside a folder are not followed");
  assert.equal(find(["("]).status, 2, "an invalid pattern is an error, not 'no match'");
  assert.equal(find([]).status, 2);
  assert.match(find(["x", "missing.md"]).output, /Not found: missing\.md/);
});

test("find.mjs stops after 200 hits and says so; long lines are cut around the match", () => {
  const many = find(["Zeile"], project => writeFileSync(join(project, "journal.md"), Array.from({ length: 250 }, (_, i) => `Zeile ${i + 1}`).join("\n")));
  assert.equal(many.status, 0);
  assert.equal(many.stdout.split("\n").filter(line => line.startsWith("journal.md:")).length, 200);
  assert.match(many.stdout, /More than 200 hits – only the first 200 are shown/);
  const long = find(["Treffer"], project => writeFileSync(join(project, "journal.md"), `${"a".repeat(1000)} Treffer ${"b".repeat(1000)}`));
  const line = long.stdout.split("\n")[0];
  assert.match(line, /^journal\.md:1: …a+ Treffer b+…$/);
  assert.ok(line.length < 340, `line too long: ${line.length}`);
});

// Links and images: LiaScript cuts a target at the first unencoded "(" (R7-D1, R7-D2).
const { unencodedUrls, markdownLinks, encodeTarget } = await import("./check-material.mjs");

test("check-material finds link and image targets and bare URLs with unencoded parentheses or spaces", () => {
  const text = [
    "![A](https://example.org/a_(1).jpg?width=330)",
    "![B](https://example.org/b_%281%29.jpg)",
    "[Page](https://example.org/File:c_(2).jpg) and [t](https://example.org/t.png \"a title\")",
    "See https://example.org/File:d_(3).jpg (a bare URL) and (https://example.org/e.jpg).",
    "[space](https://example.org/a b.html) · `[code](x (y).png)` · <img src=\"https://example.org/f_(4).jpg\">"
  ].join("\n");
  const found = unencodedUrls(text);
  assert.deepEqual(found.map(item => [item.line, item.kind, item.url]), [
    [1, "image target", "https://example.org/a_(1).jpg?width=330"],
    [3, "link target", "https://example.org/File:c_(2).jpg"],
    [4, "bare URL", "https://example.org/File:d_(3).jpg"],
    [5, "link target", "https://example.org/a b.html"]
  ], "encoded targets, titles, surrounding parentheses, inline code and HTML attributes are fine");
  assert.equal(found[0].encoded, "https://example.org/a_%281%29.jpg?width=330");
  assert.equal(found[2].encoded, "[…](https://example.org/File:d_%283%29.jpg)");
  assert.equal(encodeTarget("a (b) c"), "a%20%28b%29%20c");
  assert.deepEqual(markdownLinks("- [( )] ![x](a.png)<!-- style=\"max-height: 30vh\" -->").map(link => [link.image, link.target]), [[true, "a.png"]]);
});

test("check-material reports unencoded targets as errors and image options without a size limit as warnings", () => {
  const source = "# A\n\n![x](https://example.org/a_(1).jpg)\n\nWhich one?\n\n- [( )] ![a](https://example.org/1.jpg)\n- [(X)] ![b](https://example.org/2.jpg)<!-- style=\"max-height: 30vh\" -->\n\nAnd now?\n\n- [(X)] ![c](3.png)<!-- style=\"width: 30%\" -->\n- [( )] ![d](4.png)<!-- style=\"max-height: 25vh\" -->\n";
  const { problems, warnings } = analyseMaterial(source);
  assert.deepEqual(problems, ['slide "A", line 3: image target https://example.org/a_(1).jpg contains unencoded "(", ")" – LiaScript cuts it; write https://example.org/a_%281%29.jpg']);
  assert.equal(warnings.length, 1, warnings.join("\n"));
  assert.match(warnings[0], /^quiz on slide "A" \("Which one\?"\): 1 image option without a size limit – put <!-- style="max-height: 30vh" --> directly after each image/);
});

test("validate-journal reports unencoded URLs and incomplete image entries", () => {
  const entry = (slug, lines) => `<section>\n\n#### ${slug}\n\n${lines.join("\n")}\n\n</section>\n\n`;
  const result = validate({ title: "Kurs", next }, `## Sessions\n\n### 1. Eins\n\n#### Images\n\n${entry("bild-1", [
    "* __Status:__ inserted", "* __Source:__ free-photo", "* __File:__ https://example.org/Special:FilePath/a_%281%29.jpg",
    "* __Alt text:__ Ein Bild", "* __Page:__ https://example.org/File:a_(1).jpg"
  ])}${entry("bild-2", ["* __Status:__ candidate", "* __Source:__ free-photo", "* __Candidates:__"])}${entry("bild-3", [
    "* __Status:__ candidate", "* __Source:__ free-photo", "* __Candidates:__", "  1. [File:b.jpg](https://example.org/File:b_(2).jpg) – X – CC BY 4.0"
  ])}`);
  assert.equal(result.status, 2, result.output);
  assert.match(result.output, /line \d+ \(bild-1\): bare URL https:\/\/example\.org\/File:a_\(1\)\.jpg contains unencoded "\(", "\)"/);
  assert.match(result.output, /line \d+ \(bild-3\): link target https:\/\/example\.org\/File:b_\(2\)\.jpg .* write https:\/\/example\.org\/File:b_%282%29\.jpg/);
  assert.match(result.output, /image entry "bild-1" \(unit 1\) is inserted but has no __Author:__, __License:__/);
  assert.match(result.output, /image entry "bild-2" \(unit 1\) is candidate but lists no candidates/);
  assert.doesNotMatch(result.output, /bild-3" \(unit 1\) is candidate/);
});

test("check-material counts hints that are not read aloud only when narrator: is set (R8-D1c)", () => {
  const quiz = "# A\n\nFrage?\n\n- [(X)] {|>}{ja}\n- [( )] {|>}{nein}\n- [[?]] {|>}{Lies noch einmal.}\n- [[?]] Schau genau hin.\n";
  const spoken = analyseMaterial(`<!--\nnarrator: Deutsch Female\n-->\n\n${quiz}`);
  assert.deepEqual(spoken.hints, { total: 2, silent: 1 });
  assert.match(spoken.warnings.join("\n"), /narrator is set, but 1 of 2 quiz hints .* is not read aloud \(slide: A\) – write - \[\[\?\]\] \{\|>\}\{hint text\}/);
  assert.deepEqual(analyseMaterial(quiz).warnings, [], "without a narrator nothing is read aloud");
});

const { fitOnScreen, describeFit, parseViewport, parseArguments, viewportName, defaultViewports } = await import("./check-material.mjs");
const materialChecks = await import("./check-material.mjs");

test("check-material measures question to last option against the visible area, at open and with the question at the top (R8-D1)", () => {
  // Measured once in a 1024×768 window: header 78 px, footer from 710 px; three image options of ~190 px.
  const view = { top: 78, bottom: 710 };
  const options = [{ top: 343, bottom: 555, images: [192] }, { top: 565, bottom: 771, images: [186] }, { top: 781, bottom: 993, images: [192] }];
  const fit = fitOnScreen({ view, question: 301, options });
  assert.deepEqual(fit.open, { visible: 1, fits: false });
  assert.deepEqual(fit.top, { visible: 2, fits: false });
  assert.equal(fit.height, 692);
  assert.equal(fit.available, 632);
  assert.deepEqual(fit.imageMax, { open: 95, top: 170 }, "the summed image heights alone (570 px < 768 px) would claim it fits");
  assert.equal(describeFit(fit, { width: 1024, height: 768 }), "1024×768 landscape: does not fit (at open 1 of 3 options visible; question at the top: 2 of 3 options visible, needs 692 px, has 632 px) – images at most 95 px to fit at open, 170 px with the question at the top (now up to 192 px)");
  // With images of 95 px the quiz fits at open; in a portrait window it fits as it is.
  const small = options.map((option, index) => ({ top: 343 + index * 107, bottom: 343 + index * 107 + 115, images: [95] }));
  assert.equal(describeFit(fitOnScreen({ view, question: 301, options: small }), { width: 1024, height: 768 }), "1024×768 landscape: fits");
  assert.equal(describeFit(fitOnScreen({ view: { top: 56, bottom: 1042 }, question: 280, options: options.map(option => ({ ...option, bottom: option.bottom - 7 })) }), { width: 810, height: 1080 }), "810×1080 portrait: fits");
  // A quiz further down the slide: not judged at open; it fits once scrolled.
  const below = fitOnScreen({ view, question: 900, options: [{ top: 940, bottom: 980 }, { top: 990, bottom: 1030 }] });
  assert.equal(below.open, null);
  assert.equal(describeFit(below, { width: 1080, height: 810 }), "1080×810 landscape: fits");
  // Cut by the footer at open, but fits with the question at the top: information, not "does not fit".
  assert.match(describeFit(fitOnScreen({ view, question: 650, options: [{ top: 690, bottom: 730 }] }), { width: 1024, height: 768 }), /^1024×768 landscape: fits only once scrolled \(at open 0 of 1 options visible; question at the top: fits\)$/);
});

test("check-material takes window sizes from --viewport, else the default list", () => {
  assert.deepEqual(defaultViewports.map(viewportName), ["1024×768 landscape", "810×1080 portrait", "1080×810 landscape"]);
  assert.deepEqual(parseViewport("810x1080"), { width: 810, height: 1080 });
  assert.deepEqual(parseViewport("1280×800"), { width: 1280, height: 800 });
  assert.throws(() => parseViewport("810"), /WIDTHxHEIGHT/);
  assert.throws(() => parseViewport("100x100"), /between 320 and 3840/);
  assert.deepEqual(parseArguments(["README.md"]), { file: "README.md", sizes: [...defaultViewports] });
  assert.deepEqual(parseArguments(["--viewport", "810x1080", "a.md", "--viewport=1280x800"]), { file: "a.md", sizes: [{ width: 810, height: 1080 }, { width: 1280, height: 800 }] });
  assert.throws(() => parseArguments(["--viewport"]), /needs a size/);
  assert.throws(() => parseArguments(["--verbose"]), /Unknown option --verbose/);
  assert.throws(() => parseArguments(["a.md", "b.md"]), /one file only/);
  assert.deepEqual(parseArguments(["-h"]), { help: true });
});

test("check-material serves the project root, so a material in its own folder loads with its relative imports", () => {
  const { devServer, loadFailure } = materialChecks;
  const call = devServer("materials/1-turtle/README.md", 3041);
  assert.deepEqual(call.args.slice(0, 2), ["--input", "."], "--input <file> serves only the file's folder: the material 404s and ../../lia-templates/… is out of reach");
  assert.equal(call.material, "http://127.0.0.1:3041/materials/1-turtle/README.md");
  assert.equal(call.url, "http://127.0.0.1:3041/liascript/index.html?http://127.0.0.1:3041/materials/1-turtle/README.md");
  assert.equal(devServer("./README.md", 3041).material, "http://127.0.0.1:3041/README.md");
  assert.equal(devServer("materials/2 Wolken/README.md", 3041).material, "http://127.0.0.1:3041/materials/2%20Wolken/README.md");
  // LiaScript shows its own error course when the material does not load; that is no rendered check.
  const errorCourse = ["🙈 Ups, something went wrong", "What is LiaScript?", "Get Help?"];
  assert.equal(loadFailure({ status: 200, titles: ["Das Quadrat"] }, "a.md"), null);
  assert.equal(loadFailure({ status: undefined, titles: ["Das Quadrat"] }, "a.md"), null, "a rendered course counts even if its request was not seen");
  assert.equal(loadFailure({ status: 200, titles: ["Kurs", "Something went wrong? Debugging", "Zweite Seite"] }, "a.md"), null, "a slide of the material may name the words of the error course");
  assert.equal(loadFailure({ status: 200, titles: ["Ups, something went wrong", "Lösung"] }, "a.md"), null, "only LiaScript's own error course, with its help slides");
  assert.deepEqual(loadFailure({ status: 404, titles: errorCourse }, "materials/1-turtle/README.md"), { kind: "not-loaded", text: "the LiaScript DevServer did not load materials/1-turtle/README.md (HTTP 404)" });
  assert.deepEqual(loadFailure({ status: undefined, titles: errorCourse }, "a.md"), { kind: "not-loaded", text: "the LiaScript DevServer did not load a.md (LiaScript shows its error page)" });
  assert.deepEqual(loadFailure({ status: undefined, titles: [] }, "a.md"), { kind: "not-loaded", text: "the LiaScript DevServer did not load a.md (no answer)" });
  assert.deepEqual(loadFailure({ status: 200, titles: [] }, "a.md"), { kind: "not-loaded", text: "the LiaScript DevServer loaded a.md, but no slide rendered" }, "never a pass with Slides: 0");
  assert.deepEqual(loadFailure({ status: 200, titles: errorCourse }, "a.md"), { kind: "unreadable", text: "LiaScript could not read a.md: it shows its own error course instead of the material" });
});

test("check-material: a material LiaScript cannot read is an error (exit 1); a check that could not run is exit 2, with the install hint only for Playwright", () => {
  const { notPossible, reportFailure } = materialChecks;
  assert.match(notPossible("no installed Playwright found (npx playwright … installs one)"), /^Rendered check not possible: no installed Playwright found .*\. Install a browser with "npx playwright install chromium"/);
  assert.match(notPossible("Playwright has no browser of its own and no system Chrome/Chromium was found"), /npx playwright install chromium/);
  assert.equal(notPossible("the LiaScript DevServer did not load a.md (HTTP 404)"), "Rendered check not possible: the LiaScript DevServer did not load a.md (HTTP 404).");
  assert.doesNotMatch(notPossible("the LiaScript DevServer (liadev) did not start: ENOENT"), /npx playwright/);
  assert.equal(reportFailure({ kind: "unreadable", text: "x" }).exit, 1);
  assert.equal(reportFailure({ kind: "not-loaded", text: "x" }).exit, 2);
  assert.equal(reportFailure("no installed Playwright found").exit, 2);
  const source = readFileSync(fileURLToPath(new URL("./check-material.mjs", import.meta.url)), "utf8");
  assert.match(source, /Exit code 0: no errors · 1: errors in the material \(also: LiaScript cannot read it\) · 2: invalid call or the rendered check was not possible/);
});

test("check-material starts its DevServer on a free port and stops it when the run is stopped from outside", async () => {
  const { freePort } = materialChecks;
  const { createServer } = await import("node:net");
  const { spawn } = await import("node:child_process");
  const busy = createServer();
  await new Promise(done => busy.listen(0, "127.0.0.1", done));
  const taken = busy.address().port;
  let port;
  try { port = await freePort(); } finally { busy.close(); }
  assert.ok(Number.isInteger(port) && port > 0 && port !== taken);
  const source = readFileSync(fileURLToPath(new URL("./check-material.mjs", import.meta.url)), "utf8");
  assert.match(source, /devServer\(file, await freePort\(\)\)/, "a fixed port reaches a leftover server of another project, which then answers instead");
  // A fake liadev on PATH that stays alive and a Playwright whose browser never starts: the run waits with its
  // server up; stopping the run must stop the server too.
  const dir = mkdtempSync(join(tmpdir(), "dashboard-stop-"));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "liadev"), `#!${process.execPath}\nrequire("node:fs").writeFileSync(${JSON.stringify(join(dir, "pid"))}, String(process.pid) + " " + process.argv.slice(2).join(" "));\nsetInterval(() => {}, 1000);\n`, { mode: 0o755 });
  writeFileSync(join(dir, "playwright.cjs"), "module.exports = { chromium: { launch: () => new Promise(() => {}) } };\n");
  writeFileSync(join(dir, "README.md"), "# A\n\nText.\n");
  const script = fileURLToPath(new URL("./check-material.mjs", import.meta.url));
  const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
  const wait = async (until, ms = 8000) => { for (let t = 0; t < ms && !until(); t += 50) await new Promise(done => setTimeout(done, 50)); return until(); };
  try {
    for (const [signal, code] of [["SIGTERM", 143], ["SIGHUP", 129]]) {
      rmSync(join(dir, "pid"), { force: true });
      const run = spawn(process.execPath, [script, "README.md"], { cwd: dir, stdio: "ignore", env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, PLAYWRIGHT_MODULE_PATH: join(dir, "playwright.cjs"), CHROMIUM_PATH: "" } });
      const exited = new Promise(done => run.on("exit", (status, sig) => done(status ?? sig)));
      assert.ok(await wait(() => { try { return readFileSync(join(dir, "pid"), "utf8").includes("--port"); } catch { return false; } }), "the fake DevServer started");
      const [pid, ...args] = readFileSync(join(dir, "pid"), "utf8").split(" ");
      assert.deepEqual(args.slice(0, 2), ["--input", "."]);
      run.kill(signal);
      assert.equal(await exited, code, `${signal} ends the run with ${code}`);
      const gone = await wait(() => !alive(Number(pid)), 3000);
      if (!gone) process.kill(Number(pid), "SIGKILL");
      assert.ok(gone, `${signal}: the DevServer of the stopped run is still alive`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("open points carry their source; group and state texts are readable and follow labels (R8-D3, R8-D4)", () => {
  const units = [{ id: 1, title: "E1", state: "current", process: { steps: [
    { title: "Material", state: "done" }, { title: "Bilder einfügen", state: "current" }, { title: "Prüfen", state: "review" }] } }];
  const decisions = [
    { title: "Quelle ersetzen?", kind: "decide", how: "B", source: { check: 1, date: "2026-10-23" } },
    { title: "Nachweis kürzen?", kind: "decide", how: "B", source: { check: 1 } },
    { title: "Zeitbedarf?", kind: "decide", how: "B" },
    { title: "Kopfhörer besorgen", kind: "prepare", how: "B" }];
  const html = dashboard.renderComponent("View", "src", { lang: "de", title: "X", units, decisions });
  assert.match(html, /<strong>Quelle ersetzen\?<\/strong> <span class="dashboard-decision-source">aus der Prüfung vom 23\.10\.2026<\/span>/);
  assert.match(html, /<strong>Nachweis kürzen\?<\/strong> <span class="dashboard-decision-source">aus der Prüfung<\/span>/);
  assert.match(html, /Wartet auf: Bilder einfügen/, "a check step behind an open step waits for it");
  assert.doesNotMatch(html, /Zur Durchsicht/);
  assert.match(dashboard.renderComponent("View", "src-en", { lang: "en", title: "X", units, decisions }), /from the check on 2026-10-23/);
  assert.throws(() => dashboard.buildModel({ units, decisions: [{ title: "A", source: { check: 2 } }] }), /source\.check 2 is no unit/);
  assert.throws(() => dashboard.buildModel({ units, decisions: [{ title: "A", source: { unit: 1 } }] }), /Unknown source field: unit/);
  assert.throws(() => dashboard.buildModel({ units, decisions: [{ title: "A", source: "Prüfung" }] }), /must be an object/);
  const texts = dashboard.visibleTexts({ units, decisions }, "de");
  assert.deepEqual(texts.groups.map(group => [group.title, group.count, group.fromCheck]),
    [["Noch zu entscheiden", 3, 2], ["Vor dem Einsatz vorbereiten", 1, 0], ["0 technische Notizen des Assistenten", 0, 0]]);
  assert.deepEqual(texts.states, ["In Arbeit", "Abgeschlossen", "Wartet auf: Bilder einfügen"]);
  // labels.decide / labels.prepare name the groups (update-dashboard writes them); a data field wins.
  const labels = { decide: "Offen", prepare: "Vorbereiten", "state.waiting": "wartet auf {step}", fromCheckOn: "Prüfung {date}" };
  const own = dashboard.visibleTexts({ units, decisions, labels }, "de");
  assert.deepEqual(own.groups.slice(0, 2).map(group => group.title), ["Offen", "Vorbereiten"]);
  assert.ok(own.states.includes("wartet auf Bilder einfügen"));
  const ownHtml = dashboard.renderComponent("View", "src-l", { lang: "de", title: "X", units, decisions, labels });
  assert.match(ownHtml, /<h3>Offen<\/h3>.*<h3>Vorbereiten<\/h3>/s);
  assert.match(ownHtml, /Prüfung 23\.10\.2026/);
  assert.equal(dashboard.visibleTexts({ units, decisions, labels, prepareTitle: "Vorher" }, "de").groups[1].title, "Vorher");
  assert.throws(() => dashboard.buildModel({ labels: { "state.waiting": "wartet {n}" } }), /unknown placeholder \{n\}/);
  assert.match(dashboard.renderComponent("View", "rev", { lang: "de", title: "X", units: [{ id: 1, title: "E1", state: "revision" }] }), /Korrektur nötig/, "a revision does not read like a grade");
});

test("validate-journal prints the visible groups, checks report anchors and the counts in texts (R8-D2, R8-D3)", () => {
  const usable = { state: "no", missing: ["1 Korrektur"] };
  const units = [{ id: 1, title: "E1", state: "current", href: "#1.-e1", usable, process: { steps: [{ title: "Material", state: "current" }] } },
    { id: 2, title: "E2", state: "current", href: "#2.-e2", usable, process: { steps: [{ title: "Material", state: "current" }] } }];
  const report = n => `#### Prüfbericht – Einheit ${n}\n\n<section data-key="validation-report">\n\n**Ergebnis:** Korrektur nötig (1)\n\n**Jetzt mit den Lernenden nutzbar:** noch nicht: 1 Korrektur\n\n<details>\n\n__Result:__ FAIL\n\n</details>\n\n</section>\n\n`;
  const sessionsWith = (first, second) => `## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n${first}### 2. E2\n\nText\n\n${second}`;
  const fromCheck = href => ({ key: "review-1-a", title: "Quelle ersetzen?", how: "B", label: "Zum Prüfbericht", href, source: { check: 1, date: "2026-10-23" } });
  const good = validate({ title: "Kurs", next, units, subtitle: "Zwei Punkte aus der Prüfung entscheiden Sie in Ruhe.",
    decisions: [fromCheck("#prüfbericht-–-einheit-1"), { ...fromCheck("#prüfbericht-–-einheit-1"), key: "review-1-b", title: "Nachweis kürzen?" },
      { key: "c", title: "Zeitbedarf?", how: "B" }, { key: "d", kind: "prepare", title: "Kopfhörer besorgen", how: "B" }] }, sessionsWith(report(1), report(2)));
  assert.equal(good.status, 0, good.output);
  assert.match(good.output, /^Groups \(as shown\): "Noch zu entscheiden" 3 \(2 aus der Prüfung\) · "Vor dem Einsatz vorbereiten" 1$/m);
  assert.match(good.output, /^States \(as shown\): "In Arbeit"$/m);
  assert.doesNotMatch(good.output, /Warnings:/, good.output);
  // Same report heading twice, a point from the check that links the unit, a count that does not match its group.
  const bad = validate({ title: "Kurs", next, units, subtitle: "Die beiden Punkte unter „Noch zu entscheiden“ haben Zeit.",
    decisions: [fromCheck("#1.-e1"), { key: "c", title: "Zeitbedarf?", how: "B" }, { key: "e", title: "Länge?", how: "B" }, { key: "f", title: "Bilder?", how: "B", label: "Zum Prüfbericht", href: "#2.-e2" }] },
    sessionsWith(report(1), report(1)));
  assert.equal(bad.status, 2, bad.output);
  assert.match(bad.output, /check report heading "#### Prüfbericht – Einheit 1" appears 2 times \(units 1, 2\)/);
  assert.match(bad.output, /open point "Quelle ersetzen\?" comes from the check of unit 1 but links #1\.-e1 – link its report heading #prüfbericht-–-einheit-1/);
  assert.match(bad.output, /open point "Bilder\?": label "Zum Prüfbericht" names a report, but #2\.-e2 is no check report heading/);
  assert.match(bad.output, /subtitle says "beiden Punkte", but "Noch zu entscheiden" lists 4/);
  // The keyed report counts like the old heading: "Done ✅" needs its PASS.
  const missing = validate({ title: "Kurs", next, units, decisions: [{ ...fromCheck(), href: undefined, label: undefined, source: { check: 2 } }] }, sessionsWith(report(1), ""));
  assert.match(missing.output, /source\.check 2, but unit 2 has no check report/);
  // The keyed report counts like the old heading: "Done ✅" needs its PASS, ⏳ blocks it, line numbers are reported.
  const table = "<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ✅ | |\n\n</details>\n\n";
  const doneSessions = body => `## Sessions – Einheiten\n\n${table}### 1. E1\n\nText\n\n${body}`;
  const failed = validate({ title: "Kurs", next, units: [{ ...units[0], process: { steps: [{ title: "Material", state: "done" }] } }] }, doneSessions(report(1)));
  assert.match(failed.output, /unit 1: "Done ✅" without a passed check/);
  const passedKeyed = report(1).replace("FAIL", "PASS").replace("**Ergebnis:** Korrektur nötig (1)", "**Ergebnis:** bestanden");
  const passed = validate({ title: "Kurs", next, units: [{ ...units[0], process: { steps: [{ title: "Material", state: "done" }] } }] }, doneSessions(passedKeyed));
  assert.doesNotMatch(passed.output, /without a passed check/, passed.output);
  const deferred = validate({ title: "Kurs", next, units }, doneSessions(passedKeyed.replace("bestanden", "bestanden · ⏳ Fotos (Zeile 12)")));
  assert.match(deferred.output, /"Done ✅" while ⏳ items are still open/);
  assert.match(deferred.output, /validation report cites line numbers/);
  const inside = validate({ title: "Kurs", next, units }, doneSessions(`<section>\n\n${passedKeyed}</section>\n\n`));
  assert.match(inside.output, /Validation Report heading inside <section>/);
});

// fetch-thumb.mjs: only the pure helpers and the refusals run here, without network.
const thumb = await import("./fetch-thumb.mjs");

test("fetch-thumb reads file pages, file names and upload URLs as one Commons title", () => {
  const title = "File:Cumulus Cloud (16545241268).jpg";
  for (const input of [
    "https://commons.wikimedia.org/wiki/File:Cumulus_Cloud_(16545241268).jpg",
    "https://commons.wikimedia.org/wiki/File:Cumulus_Cloud_%2816545241268%29.jpg",
    "https://commons.wikimedia.org/wiki/Datei:Cumulus_Cloud_(16545241268).jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Cumulus_Cloud_%2816545241268%29.jpg?width=330",
    "https://commons.wikimedia.org/w/index.php?title=File:Cumulus_Cloud_(16545241268).jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/69/Cumulus_Cloud_%2816545241268%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Cumulus_Cloud_%2816545241268%29.jpg/330px-Cumulus_Cloud_%2816545241268%29.jpg",
    "File:Cumulus Cloud (16545241268).jpg",
    "Cumulus_Cloud_(16545241268).jpg"
  ]) assert.equal(thumb.parseTitle(input), title, input);
  assert.throws(() => thumb.parseTitle("https://example.org/wiki/File:a.jpg"), /only commons\.wikimedia\.org and upload\.wikimedia\.org/);
  assert.throws(() => thumb.parseTitle("https://commons.wikimedia.org.evil.example/wiki/File:a.jpg"), /not commons\.wikimedia\.org\.evil\.example/);
  assert.throws(() => thumb.parseTitle("File:ohne-endung"), /ends with its type/);
  assert.throws(() => thumb.parseTitle("../../etc/passwd.jpg"), /not a valid file name/);
  assert.throws(() => thumb.parseTitle(""), /no file given/);
});

test("fetch-thumb encodes the Special:FilePath URL so that ?width= can be appended", () => {
  assert.equal(thumb.filePathUrl("File:Cumulus Cloud (16545241268).jpg"), "https://commons.wikimedia.org/wiki/Special:FilePath/Cumulus_Cloud_%2816545241268%29.jpg");
  assert.equal(thumb.filePathUrl("File:Wolke's Form ä!.jpg"), "https://commons.wikimedia.org/wiki/Special:FilePath/Wolke%27s_Form_%C3%A4%21.jpg");
  assert.doesNotMatch(thumb.filePathUrl("File:a (b) c.jpg"), /[() ]/);
  assert.equal(thumb.encodeUrl("https://commons.wikimedia.org/wiki/File:a (1).jpg"), "https://commons.wikimedia.org/wiki/File:a%20%281%29.jpg");
  assert.equal(thumb.uploadUrl("https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/A.jpg/500px-A.jpg?utm_source=x"), "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/A.jpg/500px-A.jpg");
});

test("fetch-thumb strips HTML from author fields and builds safe cache names", () => {
  assert.equal(thumb.stripHtml('<a href="//commons.wikimedia.org/wiki/User:X" title="User:X">Jane&nbsp;Doe</a> &amp; <span>Max&#32;M&#xFC;ller</span><br/>\n (photo)'), "Jane Doe & Max Müller (photo)");
  assert.equal(thumb.stripHtml(undefined), "");
  assert.equal(thumb.safeName("File:Cumulus Cloud (16545241268).jpg"), "Cumulus_Cloud_16545241268");
  assert.equal(thumb.safeName("File:Wolkenhöhe ../../x.JPG"), "Wolkenhohe_.._.._x");
  assert.doesNotMatch(thumb.safeName("File:../../etc/passwd.jpg"), /\//);
});

test("fetch-thumb refuses other hosts and wrong calls with one line and exit code 2, without network", () => {
  const script = fileURLToPath(new URL("./fetch-thumb.mjs", import.meta.url));
  const run = args => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  for (const args of [["https://example.org/File:a.jpg"], ["a.jpg", "--width", "900"], ["a.jpg", "--verbose"], []]) {
    const result = run(args);
    assert.equal(result.status, 2, args.join(" "));
    assert.match(result.stdout, /Exit code: 2/);
    assert.doesNotMatch(result.stdout + result.stderr, /^\s+at /m, "no stack trace");
  }
  assert.match(run(["https://example.org/File:a.jpg"]).stderr, /^fetch-thumb: only commons\.wikimedia\.org and upload\.wikimedia\.org are allowed, not example\.org\n$/);
  assert.match(run(["--help"]).stdout, /^Usage: /);
});

test("check-material counts an image directly above the question into the fit and warns about page photos over 500 px (R9-D1)", () => {
  const view = { top: 78, bottom: 710 };
  const options = [{ top: 880, bottom: 920 }, { top: 930, bottom: 970 }, { top: 980, bottom: 1020 }];
  // Without the image the question alone fits once scrolled; with the photo above it, it never fits.
  assert.equal(describeFit(fitOnScreen({ view, question: 840, options }), { width: 1024, height: 768 }), "1024×768 landscape: fits");
  const withImage = fitOnScreen({ view, question: 840, options, stimulus: { top: 120, height: 700 } });
  assert.equal(withImage.stimulus, true);
  assert.equal(describeFit(withImage, { width: 1024, height: 768 }), "1024×768 landscape: image and question do not fit (at open 0 of 3 options visible; image at the top: 0 of 3 options visible, needs 900 px, has 632 px) – images at most 390 px to fit at open, 432 px with the image at the top (now up to 700 px)");
  const smaller = fitOnScreen({ view, question: 540, options: [{ top: 580, bottom: 620 }, { top: 630, bottom: 670 }, { top: 680, bottom: 720 }], stimulus: { top: 120, height: 400 } });
  assert.equal(describeFit(smaller, { width: 1024, height: 768 }), "1024×768 landscape: image and question fit only once scrolled (at open 2 of 3 options visible; image at the top: fits) – images at most 390 px to fit at open (now up to 400 px)");
  const source = "# A\n\n![big](https://example.org/a.jpg?width=800)\n\n![ok](https://example.org/b.jpg?width=500)\n\n![thumb](https://example.org/thumb/c.jpg/1024px-c.jpg)\n\nWho is it?\n\n- [(X)] ![o](https://example.org/o.jpg?width=800)<!-- style=\"max-height: 30vh\" -->\n- [( )] ![p](https://example.org/p.jpg?width=330)<!-- style=\"max-height: 30vh\" -->\n";
  const warnings = analyseMaterial(source).warnings.filter(warning => /page photo/.test(warning));
  assert.deepEqual(warnings.map(warning => warning.match(/\(([^)]*)\)/)[1]), ["a.jpg?width=800", "1024px-c.jpg"], "options and photos up to 500 px are not page-photo findings");
  assert.match(warnings[0], /^slide "A": page photo wider than 500 px .* – load it at 500 px \(\?width=500\)/);
});

test("validate-journal compares the changes after a check in outcome line, dated lines and Notes cell, and wants the source of a point that links a report (R9-D3)", () => {
  const units = [{ id: 1, title: "E1", state: "revision", href: "#1.-e1", view: { href: "agent:teaching/preview?file=1", command: ":preview 1" }, usable: { state: "limited", missing: ["kurze Nachprüfung"] }, process: { steps: [{ title: "Material", state: "done" }] } }];
  const table = notes => `<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | ${notes} |\n\n</details>\n\n`;
  const report = lines => `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n**Ergebnis:** Korrektur nötig: 1 von 3 Punkten offen (23.10.2026) – 2 Punkte seither geändert – kurze Nachprüfung offen\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: kurze Nachprüfung\n\n**Nach der Prüfung geändert:**\n\n${lines.map(line => `- 23.10.2026 · S1 · ${line} · Kurzprüfung`).join("\n")}\n\n<details>\n\n__Result:__ FAIL\n\n</details>\n\n</section>\n\n`;
  const sessionsOf = (notes, lines) => `## Sessions – Einheiten\n\n${table(notes)}### 1. E1\n\nText\n\n${report(lines)}`;
  const point = { key: "review-1-a", title: "Hinweise vorlesen?", how: "B", label: "Zum Prüfbericht", href: "#prüfbericht-–-einheit-1" };
  const stale = validate({ title: "Kurs", next, units, decisions: [point] }, sessionsOf("Prüfung: Korrektur nötig: 1 von 3 Punkten offen; Fotos verkleinert", ["Fotos verkleinert"]));
  assert.equal(stale.status, 0, "warnings only");
  assert.match(stale.output, /open point "Hinweise vorlesen\?" links the check report of unit 1 but has no source – set source: \{"check": 1\}/);
  assert.match(stale.output, /unit 1: the report's outcome line says "2 Punkte seither geändert", but its block "Changed after the check" has 1 dated line/);
  assert.match(stale.output, /unit 1: the report says "2 Punkte seither geändert", but the Notes cell does not/);
  const clean = validate({ title: "Kurs", next, units, decisions: [{ ...point, source: { check: 1 } }] },
    sessionsOf("Prüfung: Korrektur nötig: 1 von 3 Punkten offen; 2 Punkte seither geändert; kurze Nachprüfung offen", ["Fotos verkleinert", "Hinweis neu"]));
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  assert.match(clean.output, /"Noch zu entscheiden" 1 \(1 aus der Prüfung\)/);
});

test("write-dashboard stores the journal hash in the cache and refuses a stale cache (R9-D2)", () => {
  const dir = mkdtempSync(join(tmpdir(), "dashboard-write-"));
  const journal = join(dir, "journal.md");
  const draft = join(dir, "dashboard.json");
  const blockOf = () => readFileSync(journal, "utf8").match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1];
  writeFileSync(journal, `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Outline\n\nText\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n{"title": "Alt"}\n\`\`\`\n`);
  const run = () => spawnSync(process.execPath, [fileURLToPath(new URL("./write-dashboard.mjs", import.meta.url)), draft, journal], { encoding: "utf8" });
  writeFileSync(draft, JSON.stringify({ title: "Kurs", next }));
  const first = run();
  assert.equal(first.status, 0, first.stdout + first.stderr);
  const cached = JSON.parse(readFileSync(draft, "utf8"));
  assert.match(cached._journalHash, /^[0-9a-f]{16}$/);
  assert.doesNotMatch(blockOf(), /_journalHash/, "the hash stays in the cache, never in the journal");
  assert.match(first.stdout, /matches the journal block/);
  // A small change in the fresh cache is written as it is.
  writeFileSync(draft, JSON.stringify({ ...cached, title: "Kurs neu" }));
  assert.equal(run().status, 0);
  assert.equal(JSON.parse(blockOf()).title, "Kurs neu");
  // The journal block changed since (another write): the cache is refused, the journal stays.
  writeFileSync(journal, readFileSync(journal, "utf8").replace('"Kurs neu"', '"Von anderswo"'));
  writeFileSync(draft, JSON.stringify({ ...JSON.parse(readFileSync(draft, "utf8")), title: "Kurs drei" }));
  const refused = run();
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /Cache stale, journal unchanged/);
  assert.equal(JSON.parse(blockOf()).title, "Von anderswo");
  // A whole new draft (no hash) is always accepted.
  writeFileSync(draft, JSON.stringify({ title: "Neu entworfen", next }));
  assert.equal(run().status, 0);
  assert.equal(JSON.parse(blockOf()).title, "Neu entworfen");
  rmSync(dir, { recursive: true, force: true });
});

test("check-material reports answer options that give the answer away by their surface (R10-D1)", () => {
  const { describePatterns, articles } = materialChecks;
  const source = [
    "<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Kapitel 1\n\n### Seite A\n",
    "Warum fällt das Blatt?\n\n- [( )] Weil es kalt ist.\n- [(X)] Weil der Baum im Herbst Wasser sparen muss.\n- [( )] Weil es Wind gibt.\n",
    "Wozu dient die Rinde?\n\n- [( )] Damit der Baum wächst.\n- [(X)] Sie schützt den Stamm.\n- [( )] Damit der Baum blüht.\n",
    "Was ist grün?\n\n- [( )] Rinde\n- [(X)] Blatt\n- [( )] Wurzel\n",
    "### Seite B\n",
    "Im Herbst verliert der Baum seine bunten Blätter am Ast.\n",
    "Im Herbst verliert der [->[(Baum)|Wind]] seine bunten [->[(Blätter)|Wurzeln]] am Ast.\n",
    "Aus [[(dem Saft)|Den Wurzeln]] wird Zucker.\n",
    "## Kapitel 2\n\nWas fällt im Herbst?\n\n<!-- data-randomize -->\n- [( )] Im Herbst fällt Schnee.\n- [(X)] Im Herbst fällt Laub.\n- [( )] Im Herbst fällt Hagel.\n"
  ].join("\n");
  const { patterns, warnings } = analyseMaterial(source);
  assert.deepEqual(patterns, { single: 4, longest: 1, built: 1, position: 1, cards: 3, repeated: 1 });
  assert.match(warnings.join("\n"), /answer pattern in "Kapitel 1": the correct option is clearly the longest \(at least 20 % longer than every other\) in 1 of 3 single-choice questions – slide "Seite A" \("Warum fällt das Blatt\?"\)/);
  assert.match(warnings.join("\n"), /answer pattern in "Kapitel 1": the correct option is built differently in 1 of 3 .* \("Wozu dient die Rinde\?"\)/);
  assert.match(warnings.join("\n"), /answer pattern in "Kapitel 1": the correct option is option 2 in 3 single-choice questions in a row/);
  assert.match(warnings.join("\n"), /slide "Seite B": gap cards "dem Saft", "Den Wurzeln" start with an article/);
  assert.match(warnings.join("\n"), /slide "Seite B": in a gap only the correct card "dem Saft" starts with a small letter/);
  assert.match(warnings.join("\n"), /slide "Seite B": the gap sentence "Im Herbst verliert der … seine bunten … am Ast\." also stands as its own line/);
  assert.doesNotMatch(warnings.join("\n"), /Kapitel 2/, "same start for all options, and data-randomize: no pattern");
  assert.equal(describePatterns(patterns), "correct option clearly longest in 1 of 4 single-choice questions · built differently in 1 · same position 3+ times in a row: 1 · gap cards with a cue: 3 · repeated gap sentences: 1");
  // Without a known language only the language-neutral checks run; a hidden read-aloud copy is no twin.
  const english = analyseMaterial("<!--\nlanguage: xx\n-->\n\n# A\n\n<!-- style=\"text-indent: -10000px\" -->\nThe tree loses its leaves in autumn.\n\nThe [[(tree)|wind]] loses its [[(leaves)|roots]] in autumn.\n\nPick: [[(the sap)|the roots]]\n");
  assert.deepEqual(english.warnings, []);
  assert.ok(articles.en.includes("the") && articles.de.includes("dem"));
  // Short single-word options and equally long sentences are no pattern.
  assert.deepEqual(analyseMaterial("# A\n\nQ?\n\n- [( )] Ei\n- [(X)] Raupe\n\nQ2?\n\n- [( )] It grows in spring.\n- [(X)] It falls in autumn.\n").warnings, []);
});

test("check-material counts read-aloud texts in hints apart, and says when no image size helps (R10-D2, R10-D3)", () => {
  const quiz = "<!--\nnarrator: Deutsch Female\n-->\n\n# A\n\nFrage?\n\n- [(X)] {|>}{ja}\n- [( )] {|>}{nein}\n- [[?]] {|>}{Lies noch einmal.}\n";
  assert.deepEqual(analyseMaterial(quiz).readAloud, { blocks: 0, inline: 3, inHints: 1 }, "hints are rendered only when opened");
  const view = { top: 78, bottom: 1042 };
  assert.equal(describeFit(fitOnScreen({ view, question: 1000, options: [{ top: 1030, bottom: 1100, images: [] }, { top: 1110, bottom: 1300, images: [200] }] }), { width: 810, height: 1080 }),
    "810×1080 portrait: fits only once scrolled (at open 0 of 2 options visible; question at the top: fits) – at open the question starts too far down: no image size helps there; split the slide or accept scrolling");
  assert.equal(describeFit(fitOnScreen({ view: { top: 78, bottom: 400 }, question: 100, options: [{ top: 130, bottom: 400, images: [] }, { top: 410, bottom: 520, images: [100] }] }), { width: 810, height: 480 }),
    "810×480 landscape: does not fit (at open 1 of 2 options visible; question at the top: 1 of 2 options visible, needs 420 px, has 322 px) – even without images the text needs nearly the whole screen: no image size helps; split the slide");
  assert.doesNotMatch(describeFit(fitOnScreen({ view: { top: 78, bottom: 400 }, question: 100, options: [{ top: 130, bottom: 400, images: [] }, { top: 410, bottom: 520, images: [100] }] }), { width: 810, height: 480 }), /at most 0 px/);
});

test("validate-journal wants the report's outcome words in the unit's status line and statusLabel (R10-D5) and names the cache patch for a missing href (R10-D4)", () => {
  const units = label => [{ id: 1, title: "E1", state: "review", href: "#1.-e1", statusLabel: label, usable: { state: "limited", missing: ["1 Foto"] }, process: { steps: [{ title: "Material", state: "done" }] } }];
  const report = "#### Prüfbericht – Einheit 1\n\n<section data-key=\"validation-report\">\n\n**Ergebnis:** bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: 1 Foto\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n";
  const sessionsOf = status => `## Sessions – Einheiten\n\n1. E1 – ${status}\n\n### 1. E1\n\nText\n\n${report}`;
  const same = "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const clean = validate({ title: "Kurs", next, units: units(same) }, sessionsOf(same));
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  const other = validate({ title: "Kurs", next, units: units("überarbeitet – Prüfung offen") }, sessionsOf("überarbeitet – Prüfung offen"));
  assert.equal(other.status, 0, "warnings only");
  assert.match(other.output, /unit 1: status line "überarbeitet – Prüfung offen" does not carry the report's outcome "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen"/);
  assert.match(other.output, /unit 1: statusLabel "überarbeitet – Prüfung offen" does not carry/);
  const missing = validate({ title: "Kurs", next, units: [{ id: 1, title: "E1", state: "current", process: { steps: [{ title: "Material", state: "planned" }] } }] }, "## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n");
  assert.equal(missing.status, 2, missing.output);
  assert.match(missing.output, /unit 1 has a skeleton but no href .* patch units\[1\]\.href, its statusLabel and first process step in the overview cache and run write-dashboard\.mjs in the same save as the skeleton/);
});

test("a unit card starts with 'usable with learners'; the progress line names usable units instead of 'nothing finished' (R11-S1)", () => {
  const steps = [{ title: "Material", state: "draft" }, { title: "Prüfen", state: "planned" }];
  const data = { lang: "de", title: "X", unitLabel: { one: "Lerneinheit", many: "Lerneinheiten" }, units: [
    { id: 1, title: "A", state: "revision", statusLabel: "Prüfung: Korrektur nötig: 2 von 3 Punkten offen", usable: { state: "no", missing: ["6 Fotos"] }, process: { steps } },
    { id: 2, title: "B", state: "draft", usable: { state: "limited", missing: ["1 Foto", "kurze Nachprüfung"] }, process: { steps } },
    { id: 3, title: "C", state: "planned", process: { steps } }] };
  const html = dashboard.renderComponent("View", "r11a", data);
  const card = html.match(/data-dashboard-select="2"[\s\S]*?<\/button>/)[0];
  assert.ok(card.indexOf("dashboard-usable") < card.indexOf("dashboard-status") && card.indexOf("dashboard-status") < card.indexOf("dashboard-unit-steps"), "usable → open points → steps");
  assert.match(card, /Mit den Lernenden nutzbar: ja, mit Einschränkungen – es fehlt noch: 1 Foto, kurze Nachprüfung/);
  assert.match(card, /aria-label="B: Mit den Lernenden nutzbar: ja, mit Einschränkungen/);
  assert.match(html, /Fertig geprüft: noch keine · Schon nutzbar: Lerneinheit 2 \(mit Einschränkungen\)/);
  assert.doesNotMatch(html, /Noch nichts fertig/);
  assert.match(html, /dashboard-process-usable[\s\S]*?noch nicht – es fehlt noch: 6 Fotos/, "the selected unit's panel repeats the answer first");
  const en = dashboard.renderComponent("View", "r11b", { ...data, lang: "en", unitLabel: undefined });
  assert.match(en, /Usable with learners: yes, with limits – still missing: 1 Foto, kurze Nachprüfung/, "missing comes from the data as written");
  assert.match(en, /Fully checked: none yet · Usable now: unit 2 \(with limits\)/);
  // Once a unit is done the bar stays, and a second line names the usable ones.
  const done = dashboard.renderComponent("View", "r11c", { ...data, units: [{ id: 1, title: "A", state: "done", usable: { state: "yes" } }, data.units[1]] });
  assert.match(done, /<progress[\s\S]*?/);
  assert.match(done, /dashboard-progress-usable">Schon nutzbar: Lerneinheit 2 \(mit Einschränkungen\)/);
  // Without usable the old sentence stays.
  assert.match(dashboard.renderComponent("View", "r11d", { ...data, units: [data.units[2]] }), /Noch nichts fertig/);
  // The data is checked: states, missing, fields.
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "maybe" } }] }), /Unknown usable state/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "limited" } }] }), /needs missing/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "yes", missing: ["x"] } }] }), /use "limited"/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", usable: { state: "yes", why: "x" } }] }), /Unknown usable field/);
  // Any course language: the texts are labels, with {what} and {units}.
  const fr = dashboard.renderComponent("View", "r11e", { ...data, lang: "fr", unitLabel: { one: "unité", many: "unités" }, labels: {
    "usable.limited": "Utilisable : oui, avec limites", usableMissing: "il manque : {what}", checkedNone: "Vérifiées : aucune", usableUnits: "Déjà utilisables : {units}", usableLimitedShort: "avec limites" } });
  assert.match(fr, /Utilisable : oui, avec limites – il manque : 1 Foto, kurze Nachprüfung/);
  assert.match(fr, /Vérifiées : aucune · Déjà utilisables : unité 2 \(avec limites\)/);
  assert.throws(() => dashboard.buildModel({ labels: { usableUnits: "{unit}" } }), /\{unit\}/);
  const shown = dashboard.visibleTexts(data, "de");
  assert.deepEqual(shown.usable.map(item => item.state), ["no", "limited"]);
  assert.equal(shown.viewMaterial, "So sehen es die Lernenden");
});

test("a unit with material has its own button for the learners' view; the planning link is always 'see planning' (R11-S2)", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const data = { lang: "de", title: "X", units: [{ id: 1, title: "A", state: "draft", href: "#1.-a", view }, { id: 2, title: "B", state: "planned", href: "#2.-b" }] };
  const html = dashboard.renderComponent("View", "r11v", data);
  assert.match(html, /<\/button><span class="dashboard-unit-view">[\s\S]*?href="agent:teaching\/preview\?file=1"[\s\S]*?👁<\/span> So sehen es die Lernenden[\s\S]*?:preview 1/, "the button sits below the card, outside the select button");
  assert.match(html, /dashboard-process-link">[\s\S]*?So sehen es die Lernenden[\s\S]*?href="#1\.-a"[^>]*>Planung ansehen/);
  assert.equal((html.match(/dashboard-unit-view/g) ?? []).length, 1, "only units with material get it");
  assert.match(dashboard.renderComponent("View", "r11w", { ...data, lang: "en" }), /How learners see it[\s\S]*?>See planning/);
  assert.match(dashboard.renderComponent("View", "r11x", { ...data, units: [{ ...data.units[0], view: { ...view, label: "So sehen es die Teilnehmenden" } }] }), /So sehen es die Teilnehmenden/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", view: { href: "agent:teaching/preview?file=1" } }] }), /readable command/);
  // planLabel no longer renames the link.
  assert.match(dashboard.renderComponent("View", "r11y", { ...data, units: [{ ...data.units[0], planLabel: "Zu Einheit 1" }] }), />Planung ansehen/);
});

test("validate-journal checks usable, the learners' view, the plan label, outdated wording and dated items (R11-S1, R11-S2, R11-D1, R11-S4)", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const unitOf = extra => [{ id: 1, title: "E1", state: "review", href: "#1.-e1", process: { steps: [{ title: "Material", state: "done" }] }, ...extra }];
  const table = notes => `<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | ${notes} |\n\n</details>\n\n`;
  const report = (outcome, usable) => `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n**Ergebnis:** ${outcome}\n\n**Jetzt mit den Lernenden nutzbar:** ${usable}\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n`;
  const current = "bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const state = "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const action = "[▶️ Bilder einfügen](agent:artist/create-image?number=1) `:agent artist` → `:create-image 1` · [👁 So sehen es die Lernenden](agent:teaching/preview?file=1) `:preview 1`";
  const sessionsOf = ({ status = state, outcome = current, usable = "ja, mit Einschränkungen: 1 Foto", line = action, notes = state, extra = "" } = {}) =>
    `## Sessions – Einheiten\n\n1. E1 – ${status}\n\n${table(notes)}### 1. E1\n\n<!-- class="journal-actions" -->\n${line}\n\nText\n\n${extra}${report(outcome, usable)}`;
  const good = { usable: { state: "limited", missing: ["1 Foto"] }, view, statusLabel: state };
  const clean = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf());
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /Warnings:/, clean.output);
  // R11-S1: usable missing, or saying something else than the report.
  const noUsable = validate({ title: "Kurs", next, units: unitOf({ ...good, usable: undefined }) }, sessionsOf());
  assert.match(noUsable.output, /unit 1 has a check report but no usable – write units\[1\]\.usable \{"state": "limited", "missing": \[what is still missing\]\}/);
  const other = validate({ title: "Kurs", next, units: unitOf({ ...good, usable: { state: "yes" } }) }, sessionsOf({ usable: "noch nicht: 1 Fehler auf der Startseite" }));
  assert.match(other.output, /unit 1: usable is "yes", but the report says .*\(no\) – usable follows the report/);
  // R11-S2: no view, no preview link in the action line, a renamed planning link.
  const hidden = validate({ title: "Kurs", next, units: unitOf({ ...good, view: undefined }), labels: { plan: "Zu Einheit 1" } },
    sessionsOf({ line: action.split(" · ")[0] }));
  assert.equal(hidden.status, 0, "warnings only");
  assert.match(hidden.output, /unit 1 has material \(Material ✅\) but no view – add units\[1\]\.view \{"href": "agent:teaching\/preview\?file=1", "command": ":preview 1"\}, shown as "So sehen es die Lernenden"/);
  assert.match(hidden.output, /unit 1: its action line has no 👁 preview link/);
  assert.match(hidden.output, /labels\.plan "Zu Einheit 1" renames the planning link – it is always "Planung ansehen"/);
  // R11-D1: an outdated report is recognised; the warning recommends the current terms, never the old words.
  const oldOutcome = "bestanden – Bilder einfügen folgt noch (23.10.2026) – 1 Punkt seither geändert – Nachprüfung offen";
  const old = validate({ title: "Kurs", next, units: unitOf({ ...good, statusLabel: "überarbeitet – Prüfung offen" }) },
    sessionsOf({ outcome: oldOutcome, status: "überarbeitet – Prüfung offen", notes: "überarbeitet – Prüfung offen" }));
  assert.equal(old.status, 0, "warnings only");
  assert.match(old.output, /unit 1: the report's outcome .* uses outdated wording \("Bilder einfügen folgt noch", "Nachprüfung offen"\) – never copy it; the current wording is "bestanden – es fehlt noch: \{what\}", "\{n\} Punkt\(e\) seither geändert – kurze Nachprüfung offen"/);
  assert.match(old.output, /unit 1: status line "überarbeitet – Prüfung offen" uses outdated wording \("überarbeitet"\)/);
  assert.match(old.output, /unit 1: statusLabel "überarbeitet – Prüfung offen" uses outdated wording/);
  assert.match(old.output, /unit 1: Notes cell "überarbeitet – Prüfung offen" uses outdated wording/);
  assert.doesNotMatch(old.output, /write "bestanden – Bilder einfügen folgt noch/, "never recommends the outdated outcome");
  const fail = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf({ outcome: "Korrektur nötig (3) (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen" }).replace("__Result:__ PASS", "__Result:__ FAIL"));
  assert.match(fail.output, /uses outdated wording \("Korrektur nötig \(3\)"\) – never copy it; the current wording is "Korrektur nötig: \{open\} von \{n\} Punkten offen"/);
  // "2 of 3 points open" counts the points of the report, not open points of the overview.
  const counted = validate({ title: "Kurs", next, units: unitOf({ ...good, statusLabel: `Korrektur nötig: 2 von 3 Punkten offen` }) }, sessionsOf());
  assert.doesNotMatch(counted.output, /says "3 Punkten"/, counted.output);
  // R11-S4: a numbered item that starts with a date.
  const dated = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf({ extra: "**Entscheidungen:**\n\n1. 23.10.2026: Fotos aus einer freien Sammlung.\n2. 2026-10-24: Kürzer.\n\n" }));
  assert.match(dated.output, /2 numbered items start with a date .* write "- \*\*\{date\}:\*\* …"/);
  const bold = validate({ title: "Kurs", next, units: unitOf(good) }, sessionsOf({ extra: "**Entscheidungen:**\n\n- **23.10.2026:** Fotos aus einer freien Sammlung.\n\n" }));
  assert.doesNotMatch(bold.output, /start with a date/, bold.output);
});

const now = await import("./now.mjs");

test("now.mjs prints UTC, the local time with its offset and the age of a chat timestamp (R9-S9)", () => {
  const lines = now.describeNow(new Date("2026-10-23T09:51:00Z"), now.parseTimestamp("2026-10-23T08:40:00Z"), "Europe/Berlin");
  assert.deepEqual(lines, ["UTC: 2026-10-23T09:51:00Z", "Local (this computer): Fri 2026-10-23 11:51 (UTC+02:00, Europe/Berlin)", "Since 2026-10-23T08:40:00Z: 1 h 11 min (older than about an hour: yes)"]);
  assert.match(now.describeNow(new Date("2026-12-01T12:00:00Z"), null, "America/New_York")[1], /07:00 \(UTC-05:00, America\/New_York\)$/);
  assert.equal(now.parseTimestamp("2026-10-23 08:40").toISOString(), "2026-10-23T08:40:00.000Z", "a timestamp without zone is UTC, as in events");
  assert.equal(now.parseTimestamp("1792745400000").toISOString(), new Date(1792745400000).toISOString());
  assert.equal(now.formatDuration(45 * 1000), "45 s");
  assert.equal(now.formatDuration(12 * 60 * 1000), "12 min");
  assert.equal(now.formatDuration(26 * 3600 * 1000), "1 d 2 h");
  assert.throws(() => now.parseTimestamp("gestern"), /invalid timestamp/);
  const script = fileURLToPath(new URL("./now.mjs", import.meta.url));
  const ok = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /^UTC: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\nLocal \(this computer\): /);
  const bad = spawnSync(process.execPath, [script, "gestern"], { encoding: "utf8" });
  assert.equal(bad.status, 2);
  assert.match(bad.stdout, /Exit code: 2/);
});

// Older journals (R11-D2): journals created before the template change of fe18ee1 still show {{…}}
// skeletons in unfilled sections and the report heading "Validation Report". migrate-journal.mjs moves
// them to the current layout (representation only); the validator points there instead of blocking.
const validatorScript = fileURLToPath(new URL("./validate-journal.mjs", import.meta.url));
const migrateScript = fileURLToPath(new URL("./migrate-journal.mjs", import.meta.url));
const oldJournal = readFileSync(new URL("./fixtures/journal-84484ae.md", import.meta.url), "utf8");
function inProject(text, run) {
  const dir = mkdtempSync(join(tmpdir(), "migrate-check-"));
  writeFileSync(join(dir, "journal.md"), text);
  const script = (path, ...args) => { const result = spawnSync(process.execPath, [path, ...args], { cwd: dir, encoding: "utf8" }); return { status: result.status, output: result.stdout + result.stderr }; };
  try { return run({ validate: () => script(validatorScript), migrate: (...args) => script(migrateScript, ...args), read: () => readFileSync(join(dir, "journal.md"), "utf8") }); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
const visibleOutsideCode = text => text.replace(/^<!--[\s\S]*?-->/, "").replace(/```[\s\S]*?```/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/`[^`\n]*`/g, "");

test("validate-journal does not take LiaScript in inline code ({{1}}, {{|>}}) for a template placeholder", () => {
  const result = validate({ title: "Kurs", next }, "## Sessions\n\n### 1. Eins\n\n- Vorlesen ✅ `{{|>}}` vor Absätzen, Animation `{{1}}`\n\n");
  assert.doesNotMatch(result.output, /template placeholder/, result.output);
});

test("an older journal layout is named as such and points to migrate-journal.mjs", () => {
  inProject(oldJournal, ({ validate }) => {
    const result = validate();
    assert.equal(result.status, 2, result.output);
    assert.match(result.output, /older journal layout/);
    assert.match(result.output, /node specs\/dashboard\/migrate-journal\.mjs/);
  });
});

test("migrate-journal brings the empty journal of 84484ae to the current layout", () => {
  inProject(oldJournal, ({ validate, migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    const text = read();
    assert.doesNotMatch(visibleOutsideCode(text), /\{\{/, "no visible placeholder is left");
    assert.match(text, /^# New course$/m);
    assert.match(text, /^## Course Context\n\n<!-- class="journal-actions" -->\n\[▶️ Start course\]/m);
    assert.match(text, /^_Still empty – filled with “Start course”._$/m);
    assert.match(text, /"footer": "new, empty project"/);
    assert.match(text, /^## Agents$/m, "sections without placeholders stay");
    const after = validate();
    assert.equal(after.status, 0, after.output);
  });
});

test("migrate-journal translates the migrated lines with the course's language pack and keeps translated headings", () => {
  const german = oldJournal.replace(/^language: en$/m, "language: de").replace(/^## Course Context$/m, "## Course Context – Kursrahmen").replace(/^## Outline$/m, "## Outline – Gliederung");
  inProject(german, ({ migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    const text = read();
    assert.match(text, /^# Neuer Kurs$/m);
    assert.match(text, /^## Course Context – Kursrahmen\n\n<!-- class="journal-actions" -->\n\[▶️ Kurs starten\]/m);
    assert.match(text, /^_Noch leer – wird mit „Kurs starten“ ausgefüllt._$/m);
    assert.match(text, /^## Outline – Gliederung$/m);
  });
});

test("migrate-journal --check lists the changes and writes nothing", () => {
  inProject(oldJournal, ({ migrate, read }) => {
    const run = migrate("--check");
    assert.equal(run.status, 0, run.output);
    assert.match(run.output, /Course Context/);
    assert.match(run.output, /Visual Identity/);
    assert.equal(read(), oldJournal);
  });
});

test("migrate-journal leaves a partly filled section alone and names it", () => {
  const partly = oldJournal.replace("  {{name of the lecture or course}}", "  Erste Schritte");
  inProject(partly, ({ migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 2, run.output);
    assert.match(run.output, /Outline.*by hand/);
    assert.match(read(), /^  Erste Schritte$/m);
    assert.match(read(), /^_Still empty – filled with “Start course”._$/m, "the other sections are migrated");
  });
});

test("migrate-journal gives older check reports the current heading with unit word and number, and the section key", () => {
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context – Kursrahmen\n\n* __Terminology:__\n  1. sessions-called: Baustein\n\n## Sessions – Bausteine\n\n### 1. Eins\n\n#### Validation Report – Prüfbericht\n\n__Date:__ 2026-10-06\n\n- Ergebnis: bestanden\n\n### 2. Zwei\n\n#### Validation Report – Prüfbericht\n\n<section>\n\n**Ergebnis:** bestanden\n\n</section>\n\n---\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n{"title": "Kurs"}\n\`\`\`\n`;
  inProject(journal, ({ validate, migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    const text = read();
    assert.match(text, /^#### Prüfbericht – Baustein 1\n\n<section data-key="validation-report">\n\n__Date:__ 2026-10-06\n\n- Ergebnis: bestanden\n\n<\/section>\n\n### 2\. Zwei$/m);
    assert.match(text, /^#### Prüfbericht – Baustein 2\n\n<section data-key="validation-report">\n\n\*\*Ergebnis:\*\* bestanden\n\n<\/section>$/m);
    assert.doesNotMatch(validate().output, /appears 2 times/);
  });
});

test("migrate-journal moves a report heading out of its <section> and reads the unit word from \"unit (Einheit)\"", () => {
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context – Kursrahmen\n\n* __Terminology:__\n  1. sessions-called: unit (Einheit)\n\n## Sessions – Einheiten\n\n### 1. Eins\n\n<section>\n\n#### Validation Report\n\n**Ergebnis:** bestanden\n\n</section>\n\n---\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n{"title": "Kurs"}\n\`\`\`\n`;
  inProject(journal, ({ validate, migrate, read }) => {
    const run = migrate();
    assert.equal(run.status, 0, run.output);
    assert.match(read(), /^### 1\. Eins\n\n#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n\*\*Ergebnis:\*\* bestanden\n\n<\/section>$/m);
    assert.doesNotMatch(validate().output, /heading inside <section>/);
  });
});

test("the old word for the planning sketch ('Skelett ✅', 'skeleton ✅') is outdated wording; a unit title with the word is not", () => {
  const sessions = status => `## Sessions – Einheiten\n\n1. Das Skelett – ${status}\n\n### 1. Das Skelett\n\nText\n\n`;
  const unit = statusLabel => ({ title: "Kurs", next, units: [{ id: 1, title: "Das Skelett", state: "planned", href: "#1.-das-skelett", statusLabel }] });
  const old = validate(unit("Skelett ✅ · Material offen"), sessions("Skelett ✅ · Material offen"));
  assert.match(old.output, /unit 1: status line "Skelett ✅ · Material offen" uses outdated wording .* the current wording is "Planungsskizze"/);
  assert.match(old.output, /unit 1: statusLabel "Skelett ✅ · Material offen" uses outdated wording/);
  const current = validate(unit("Planungsskizze ✅ · Material offen"), sessions("Planungsskizze ✅ · Material offen"));
  assert.doesNotMatch(current.output, /outdated wording/, current.output);
});

// The line replacer (localize-journal.mjs <map.json> <file>): one write for many changes of one file, also
// for the image step – a marker block found by its slug, a replacement of several lines, a new chapter at the end.
const localizeScript = fileURLToPath(new URL("./localize-journal.mjs", import.meta.url));
function replaceIn(text, map) {
  const dir = mkdtempSync(join(tmpdir(), "localize-check-"));
  writeFileSync(join(dir, "README.md"), text);
  writeFileSync(join(dir, "map.json"), JSON.stringify(map));
  const run = spawnSync(process.execPath, [localizeScript, "map.json", "README.md"], { cwd: dir, encoding: "utf8" });
  const after = readFileSync(join(dir, "README.md"), "utf8");
  rmSync(dir, { recursive: true, force: true });
  return { status: run.status, output: run.stdout + run.stderr, after };
}
const markerMaterial = "# Kurs\n\n## Seite 1\n\n<!--- image: blatt — ein Blatt --->\n> 🖼️ _Bild folgt_\n\n## Seite 2\n\n<!--- image: baum — ein Baum --->\n> 🖼️ _Bild folgt_\n\nSieh dir das Foto an.\n";

test("the line replacer replaces a block of lines found by its first line, also when its other lines repeat", () => {
  const run = replaceIn(markerMaterial, { replace: [["<!--- image: blatt — ein Blatt --->\n> 🖼️ _Bild folgt_", "![Ein Blatt](https://example.org/blatt.jpg)"]] });
  assert.equal(run.status, 0, run.output);
  assert.match(run.after, /## Seite 1\n\n!\[Ein Blatt\]\(https:\/\/example\.org\/blatt\.jpg\)\n\n## Seite 2\n\n<!--- image: baum — ein Baum --->\n> 🖼️ _Bild folgt_/);
});

test("the line replacer writes several lines for one and appends a chapter at the end", () => {
  const run = replaceIn(markerMaterial, { replace: [["Sieh dir das Foto an.", "Sieh dir das Foto an.\n\nWas fällt dir auf?"]], append: ["", "## Bildnachweise", "", "- Seite 1: ein Blatt – Autorin – CC BY 4.0"] });
  assert.equal(run.status, 0, run.output);
  assert.match(run.after, /Sieh dir das Foto an\.\n\nWas fällt dir auf\?\n\n## Bildnachweise\n\n- Seite 1: ein Blatt – Autorin – CC BY 4\.0\n$/);
});

test("the line replacer writes nothing when a block does not match exactly once", () => {
  const twice = replaceIn(markerMaterial, { replace: [["<!--- image: blatt — ein Blatt --->", "x"], ["> 🖼️ _Bild folgt_\n\nSieh", "y"]] });
  assert.equal(twice.status, 2, twice.output);
  assert.match(twice.output, /matches 0 blocks/);
  assert.equal(twice.after, markerMaterial, "all or nothing");
});

test("an image placeholder inside a quiz option carries a distinguishing word after it and is still a placeholder", () => {
  assert.ok(isImageMarker("- [( )] 🖼️ _Bild folgt_ Bild 1"));
  assert.ok(isImageMarker("- [[ ]] 🖼️ _Image follows_ picture 2"));
  assert.ok(!isImageMarker("- [( )] 🖼️ ![Bild 1](blatt.jpg)"), "a real image is no placeholder");
  assert.ok(!isImageMarker("📷 _Nimm_ ein Foto vom Himmel auf."), "an instruction is no placeholder");
});

test("the status line is read after the unit title of its heading, and a recommended wording keeps the short re-check", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const outcome = "bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const state = "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen";
  const report = `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report">\n\n**Ergebnis:** ${outcome}\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: 1 Foto\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n`;
  const sessions = status => `## Sessions – Einheiten\n\n1. Erste Schritte – ${status}\n\n<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | Erste Schritte | a | b | ✅ | ✅ | ❌ | ${state} |\n\n</details>\n\n### 1. Erste Schritte\n\n<!-- class="journal-actions" -->\n[▶️ Bilder einfügen](agent:artist/create-image?number=1) \`:agent artist\` → \`:create-image 1\` · [👁 So sehen es die Lernenden](agent:teaching/preview?file=1) \`:preview 1\`\n\nText\n\n${report}`;
  // The overview calls the unit "E1"; the status line uses the heading's title.
  const unit = { id: 1, title: "E1", state: "review", href: "#1.-erste-schritte", view, usable: { state: "limited", missing: ["1 Foto"] }, statusLabel: state, process: { steps: [{ title: "Material", state: "done" }] } };
  const same = validate({ title: "Kurs", next, units: [unit] }, sessions(state));
  assert.doesNotMatch(same.output, /status line .* does not carry/, same.output);
  const short = validate({ title: "Kurs", next, units: [unit] }, sessions("bestanden – es fehlt noch: 1 Foto"));
  assert.match(short.output, /status line "bestanden – es fehlt noch: 1 Foto" does not carry .* write "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen"/);
});

test("own {one, many} labels for steps choose the form by the total, the progress line by the finished units", () => {
  const steps = { one: "{done} sur {total} étape", many: "{done} sur {total} étapes" };
  const data = { lang: "fr", title: "X", labels: { steps, progressText: { one: "{done} sur {total} {unit} est terminée", many: "{done} sur {total} {unit} sont terminées" } },
    unitLabel: { one: "unité", many: "unités" },
    units: [{ id: 1, title: "A", state: "done", process: { steps: [{ title: "a", state: "done" }, { title: "b", state: "planned" }, { title: "c", state: "planned" }] } }, { id: 2, title: "B", state: "planned" }] };
  const html = dashboard.renderComponent("View", "plural1", data);
  assert.match(html, /1 sur 3 étapes/);
  assert.match(html, /1 sur 2 unités est terminée/);
  const one = dashboard.renderComponent("View", "plural2", { ...data, units: [{ ...data.units[0], process: { steps: [{ title: "a", state: "done" }] } }] });
  assert.match(one, /1 sur 1 étape</);
});

test("validate-journal warns when an inserted free photo has no credit line in the material", () => {
  const page = "https://commons.wikimedia.org/wiki/File:Blatt.jpg";
  const file = "https://commons.wikimedia.org/wiki/Special:FilePath/Blatt.jpg?width=330";
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context\n\n* __File Structure:__\n  1. Mode: single-file\n\n## Sessions\n\n### 1. Eins\n\n#### Images\n\n<section>\n\n#### blatt\n\n* __Status:__ inserted\n* __Source:__ free-photo\n* __File:__ ${file}\n* __Alt text:__ Ein Blatt\n* __Author:__ A. Autorin\n* __License:__ [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)\n* __Page:__ [Datei](${page})\n\n</section>\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n${JSON.stringify({ title: "Kurs", next })}\n\`\`\`\n`;
  const run = readme => {
    const dir = mkdtempSync(join(tmpdir(), "credits-check-"));
    writeFileSync(join(dir, "journal.md"), journal);
    writeFileSync(join(dir, "README.md"), readme);
    const result = spawnSync(process.execPath, [validatorScript, join(dir, "journal.md")], { encoding: "utf8" });
    rmSync(dir, { recursive: true, force: true });
    return result.stdout + result.stderr;
  };
  const missing = run(`# Kurs\n\n## Eins\n\n![Ein Blatt](${file})\n`);
  assert.match(missing, /image entry "blatt" \(unit 1\) is an inserted free photo, but README\.md has no credit line for it/);
  const credited = run(`# Kurs\n\n## Eins\n\n![Ein Blatt](${file})\n\n## Bildnachweise\n\n- Seite 1: ein Blatt – A. Autorin – [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) – [Datei](${page})\n`);
  assert.doesNotMatch(credited, /no credit line/, credited);
});

test("text fields of the wrong type fail in buildModel instead of breaking the page (validator green, page red)", () => {
  assert.throws(() => dashboard.buildModel({ unitsTitle: { one: "Kapitel", many: "Kapiteln" } }), /unitsTitle/);
  assert.throws(() => dashboard.buildModel({ unitLabel: { one: 1, many: 2 } }), /unitLabel/);
  assert.throws(() => dashboard.buildModel({ units: [{ title: "A", statusLabel: ["x"] }] }), /statusLabel/);
  assert.doesNotThrow(() => dashboard.buildModel({ unitsTitle: "Kapitel", unitLabel: { one: "Kapitel", many: "Kapiteln" } }));
});

test("the provisional hint also finds learning objectives saved under their data-key in the course language", () => {
  const journal = `<!--\nlanguage: de\n-->\n\n# Kurs\n\n## Course Context\n\n- Zielgruppe: vorgemerkt, noch offen\n\n## Outline\n\n<!-- data-key="learning-goals" -->\n**Lernziele:**\n\n1. Die Kinder benennen drei Teile.\n\n## Dashboard\n\n\`\`\`json @Dashboard.View\n${JSON.stringify({ title: "Kurs", next })}\n\`\`\`\n`;
  inProject(journal, ({ validate }) => assert.match(validate().output, /provisional/));
});

test("a check report without the line 'usable with learners now' is named", () => {
  const report = "#### Prüfbericht – Einheit 1\n\n<section data-key=\"validation-report\">\n\n**Ergebnis:** bestanden\n\nDas passt: alles.\n\n<details>\n\n__Result:__ PASS\n\n</details>\n\n</section>\n\n";
  const result = validate({ title: "Kurs", next, units: [{ id: 1, title: "E1", state: "review", href: "#1.-e1", usable: { state: "yes" } }] }, `## Sessions\n\n### 1. E1\n\nText\n\n${report}`);
  assert.match(result.output, /unit 1: the check report has no line "usable with learners now"/, result.output);
});

test("small validator and script fixes: course-language advice, finished words with ⏳, report keys with more attributes, clean errors", () => {
  const view = { href: "agent:teaching/preview?file=1", command: ":preview 1" };
  const report = (outcome, attrs = "") => `#### Prüfbericht – Einheit 1\n\n<section data-key="validation-report"${attrs}>\n\n**Ergebnis:** ${outcome}\n\n**Jetzt mit den Lernenden nutzbar:** ja, mit Einschränkungen: 1 Foto\n\n**Nach der Prüfung geändert:**\n\n- 23.10.2026 · S1 · Satz gekürzt · Kurzprüfung\n\n<details>\n\n__Result:__ PASS\n\n⏳ 1 Foto\n\n</details>\n\n</section>\n\n`;
  const table = notes => `<details><summary>Technik</summary>\n\n| # | Title | Type | Method | Skeleton | Material | Done | Notes |\n|---|---|---|---|---|---|---|---|\n| 1 | E1 | a | b | ✅ | ✅ | ❌ | ${notes} |\n\n</details>\n\n`;
  const unit = statusLabel => [{ id: 1, title: "E1", state: "current", href: "#1.-e1", view, usable: { state: "limited", missing: ["1 Foto"] }, statusLabel, process: { steps: [{ title: "Material", state: "done" }] } }];
  const outcome = "bestanden – es fehlt noch: 1 Foto (23.10.2026) – 1 Punkt seither geändert – kurze Nachprüfung offen";
  // 1: the Notes cell advice uses the course language's words.
  const notes = validate({ title: "Kurs", next, units: unit("x") }, `## Sessions – Einheiten\n\n${table("anders")}### 1. E1\n\nText\n\n${report(outcome)}`);
  assert.match(notes.output, /the Notes cell does not .* write the state with the same words: "\{outcome\} – 1 Punkt seither geändert – kurze Nachprüfung offen"/);
  // 6: "fertig" for a unit that still waits for something (⏳) is a finished word too early.
  const early = validate({ title: "Kurs", next, units: unit("fertig – bestanden – es fehlt noch: 1 Foto") }, `## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n${report("bestanden – es fehlt noch: 1 Foto")}`);
  assert.match(early.output, /statusLabel "fertig – bestanden – es fehlt noch: 1 Foto" says "fertig", but the unit has no passed check without open ⏳ items/);
  // 8: a report section with a further attribute is still the report.
  const extra = validate({ title: "Kurs", next, units: unit("bestanden – es fehlt noch: 1 Foto") }, `## Sessions – Einheiten\n\n### 1. E1\n\nText\n\n${report("bestanden – es fehlt noch: 1 Foto", ' class="report"')}`);
  assert.doesNotMatch(extra.output, /has no line "usable with learners now"|without a passed check/, extra.output);
  // 2: no journal, or --lang without a code: a message, never a stack trace.
  const dir = mkdtempSync(join(tmpdir(), "nojournal-"));
  const none = spawnSync(process.execPath, [validatorScript], { cwd: dir, encoding: "utf8" });
  const lang = spawnSync(process.execPath, [localizeScript, "--lang"], { cwd: dir, encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  assert.notEqual(none.status, 0);
  assert.doesNotMatch(none.stdout + none.stderr, /^\s+at /m, "no stack trace without a journal");
  assert.doesNotMatch(lang.stdout + lang.stderr, /^\s+at /m, "no stack trace for --lang without a code");
});

test("the single-unit macro shows the learners' view with its eye icon, as the overview does", () => {
  const html = dashboard.renderComponent("Unit", "u1", { title: "A", state: "draft", view: { href: "agent:teaching/preview?file=1", command: ":preview 1" } });
  assert.doesNotMatch(html, /▶️/, html);
});

test("fetch-thumb takes only standard Commons widths and never downloads an original larger than the preview", () => {
  for (const width of [120, 250, 330, 500]) assert.equal(thumb.checkWidth(width), width);
  for (const width of [20, 300, 499, 501, 1.5]) assert.throws(() => thumb.checkWidth(width), /standard width/);
  assert.equal(thumb.previewUrl({ thumburl: "https://upload.wikimedia.org/x/330px-a.jpg", url: "https://upload.wikimedia.org/a.jpg", width: 4000 }, 330), "https://upload.wikimedia.org/x/330px-a.jpg");
  assert.equal(thumb.previewUrl({ url: "https://upload.wikimedia.org/small.png", width: 200 }, 330), "https://upload.wikimedia.org/small.png", "a small original is its own preview");
  assert.throws(() => thumb.previewUrl({ url: "https://upload.wikimedia.org/big.jpg", width: 4000 }, 330), /no preview/);
});

test("the Dashboard of a journal needs a title (without one the page shows an empty heading)", () => {
  const without = validate({ next });
  assert.equal(without.status, 2, without.output);
  assert.match(without.output, /Dashboard has no title/);
  assert.match(validate({ title: "  ", next }).output, /Dashboard has no title/);
  assert.doesNotThrow(() => dashboard.buildModel({}), "the library itself stays open for single components");
});

// Write budget (data/chat-dialog.md → Changing another section: at most 5 writes per save; build-session's
// runs line): the write scripts count their writes in .cache/writes.json and warn from the 6th within 10 minutes.
const writeCount = await import("./write-count.mjs");

test("the write scripts count their writes and warn from the 6th within ten minutes", () => {
  const dir = mkdtempSync(join(tmpdir(), "writes-"));
  try {
    const at = minutes => new Date(Date.UTC(2026, 9, 23, 10, minutes));
    for (let i = 0; i < 5; i++) assert.equal(writeCount.countWrite(dir, "localize-journal", "journal.md", at(i)), null, `write ${i + 1} is within the budget`);
    const sixth = writeCount.countWrite(dir, "write-dashboard", "journal.md", at(5));
    assert.match(sixth, /^Warning: 6th write within 10 minutes \(5 × localize-journal, 1 × write-dashboard\) – every write reloads the preview/);
    assert.equal(writeCount.countWrite(dir, "localize-journal", "journal.md", at(30)), null, "older writes no longer count");
    writeFileSync(join(dir, ".cache", "writes.json"), "kaputt");
    assert.equal(writeCount.countWrite(dir, "localize-journal", "journal.md", at(31)), null, "a broken log starts again");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("the line replacer warns at the 6th write of a project within ten minutes", () => {
  const dir = mkdtempSync(join(tmpdir(), "writes-run-"));
  try {
    writeFileSync(join(dir, "README.md"), "# Kurs\n\nZeile 0\n");
    let output = "";
    for (let i = 0; i < 6; i++) {
      writeFileSync(join(dir, "map.json"), JSON.stringify({ replace: [[`Zeile ${i}`, `Zeile ${i + 1}`]] }));
      const run = spawnSync(process.execPath, [localizeScript, "map.json", "README.md"], { cwd: dir, encoding: "utf8" });
      assert.equal(run.status, 0, run.stdout + run.stderr);
      output = run.stdout;
      if (i < 5) assert.doesNotMatch(output, /Warning: \d+th write/, `run ${i + 1}`);
    }
    assert.match(output, /Warning: 6th write within 10 minutes \(6 × localize-journal\)/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ## Templates (templates/course-templates.yaml): the selection line before <section>, adopted entries with
// `__Catalog id:__`, and briefs `### {id} (in development)` of templates still being developed.
const templatesSection = readFileSync(new URL("./fixtures/templates-section.md", import.meta.url), "utf8");
const briefDecision = { key: "template-brief-turtle-maze", kind: "decide", title: "Eigene Vorlage: Steckbrief ergänzen", how: "Im Abschnitt Vorlagen die fehlenden Angaben nachtragen", label: "Vorlagen ansehen", href: "#templates-–-vorlagen" };

test("validate-journal reads the template selection line: open, done – none needed or done – ids (a)", () => {
  const selection = value => templatesSection.replace("* __Template selection:__ done – python-turtle, turtle-maze", `* __Template selection:__ ${value}`);
  for (const value of ["open", "done – none needed", "done – python-turtle", "done – python-turtle, turtle-maze"]) {
    const result = validate({ title: "Kurs", next }, selection(value));
    assert.equal(result.status, 0, `${value}: ${result.output}`);
  }
  const missing = validate({ title: "Kurs", next }, templatesSection.replace(/^\* __Template selection:__.*\n\n/m, ""));
  assert.equal(missing.status, 0, `no selection line counts as open: ${missing.output}`);
  for (const value of ["offen", "done", "done – ", "done - python-turtle", "done – Python Turtle", "done – python-turtle,"]) {
    const result = validate({ title: "Kurs", next }, selection(value));
    assert.equal(result.status, 2, `${value}: ${result.output}`);
    assert.match(result.output, /__Template selection:__ .* is none of "open", "done – none needed", "done – \{id\}, \{id\}"/, value);
  }
});

test("every id of a done template selection has an entry with its catalog id or a brief in development (b)", () => {
  const unknown = validate({ title: "Kurs", next }, templatesSection.replace("done – python-turtle, turtle-maze", "done – python-turtle, sql-runner"));
  assert.equal(unknown.status, 2, unknown.output);
  assert.match(unknown.output, /template selection names "sql-runner", but ## Templates has no entry with __Catalog id:__ sql-runner and no brief "### sql-runner \(in development\)"/);
  assert.doesNotMatch(unknown.output, /names "python-turtle"/);
  assert.match(unknown.output, /adopt it with :manage-templates sql-runner or write its brief \(:suggest-templates\); if it was removed, take sql-runner out of the selection line \(no id left: "done – none needed", or "open" while an activity is undecided\)/);
  const inCode = validate({ title: "Kurs", next }, templatesSection.replace("* __Catalog id:__ python-turtle", "* __Catalog id:__ `python-turtle`"));
  assert.equal(inCode.status, 0, inCode.output);
  const translated = validate({ title: "Kurs", next }, templatesSection.replace("## Templates – Vorlagen", "## Templates"));
  assert.equal(translated.status, 0, `the heading is matched by its start: ${translated.output}`);
});

test("a brief with a missing field or an unknown state is a hint, listed under decisions as template-brief (c)", () => {
  const clean = validate({ title: "Kurs", next }, templatesSection);
  assert.doesNotMatch(clean.output, /\[template-brief\]/, clean.output);
  const lacking = templatesSection.replace(/^\* __Acceptance:__\n(?:  \d\..*\n)+/m, "* __Acceptance:__\n").replace(/^\* __Audience:__\n.*\n/m, "");
  const hint = validate({ title: "Kurs", next }, lacking);
  assert.equal(hint.status, 2, hint.output);
  assert.match(hint.output, /- \[template-brief\] brief "turtle-maze \(in development\)" lacks __Audience:__, __Acceptance:__/);
  assert.match(hint.output, /hint "template-brief" is missing in decisions/);
  const listed = validate({ title: "Kurs", next, decisions: [briefDecision] }, lacking);
  assert.equal(listed.status, 0, `a hint, never a problem of its own: ${listed.output}`);
  const state = validate({ title: "Kurs", next }, templatesSection.replace("* __State:__ brief", "* __State:__ fertig"));
  assert.match(state.output, /- \[template-brief\] brief "turtle-maze \(in development\)": __State:__ "fertig" is none of "brief", "in development", "ready to test"/);
});

test("an empty ### heading under ## Templates is read without a crash", () => {
  const result = validate({ title: "Kurs", next }, templatesSection.replace("### Python Turtle", "### "));
  assert.doesNotMatch(result.output, /TypeError|^\s+at /m, result.output);
  assert.equal(result.status, 0, `the entry keeps its __Catalog id:__: ${result.output}`);
});

test("a brief ready to test needs __Folder:__ and lia-templates/{id}/README.md next to the journal (d)", () => {
  const ready = templatesSection.replace("* __State:__ brief", "* __State:__ ready to test");
  const noFolder = validate({ title: "Kurs", next }, ready);
  assert.match(noFolder.output, /- \[template-brief\] brief "turtle-maze \(in development\)" is ready to test, but __Folder:__ is empty/);
  const withFolder = ready.replace("* __Folder:__", "* __Folder:__ lia-templates/turtle-maze/");
  const missing = validate({ title: "Kurs", next }, withFolder);
  assert.match(missing.output, /- \[template-brief\] brief "turtle-maze \(in development\)" is ready to test, but lia-templates\/turtle-maze\/README\.md does not exist/);
  const present = validate({ title: "Kurs", next }, withFolder, { "lia-templates/turtle-maze/README.md": "# Turtle maze\n" });
  assert.doesNotMatch(present.output, /\[template-brief\]/, present.output);
  assert.equal(present.status, 0, present.output);
});

test("the template step says ready to test once every open brief is, and never takes next from a unit at work (e)", () => {
  const ready = templatesSection.replace("* __State:__ brief", "* __State:__ ready to test").replace("* __Folder:__", "* __Folder:__ lia-templates/turtle-maze/");
  const files = { "lia-templates/turtle-maze/README.md": "# Turtle maze\n" };
  const step = result => ({ title: "Kurs", next, process: { steps: [{ title: "Vorlagen für Aktivitäten", state: "current", result }] } });
  const stale = validate(step("1 in Entwicklung"), ready, files);
  assert.match(stale.output, /the template step says "1 in Entwicklung", but every open brief is ready to test \(turtle-maze\) – write "ready to test" \(German "bereit zum Ausprobieren"\)/);
  assert.doesNotMatch(validate(step("1 bereit zum Ausprobieren"), ready, files).output, /every open brief is ready to test/);
  assert.doesNotMatch(validate(step("1 in Entwicklung"), templatesSection).output, /every open brief is ready to test/, "a brief still in work is in development");
  const suggest = { title: "Vorlagen für Aktivitäten", why: "W", label: "Vorlagen vorschlagen", href: "agent:teaching/suggest-templates", command: ":suggest-templates" };
  const unit = state => ({ id: "1", title: "E1", state, statusLabel: "Planungsskizze ✅" });
  const taken = validate({ title: "Kurs", next: suggest, units: [unit("current")] }, templatesSection);
  assert.match(taken.output, /next suggests templates although unit 1 is being worked on – next stays with the unit, :suggest-templates goes into explore/);
  assert.doesNotMatch(validate({ title: "Kurs", next: suggest, units: [unit("planned")] }, templatesSection).output, /next suggests templates although/);
  const planned = validate({ title: "Kurs", next: suggest, units: [unit("planned")] }, agenda(["1"]) + templatesSection);
  assert.match(planned.output, /next suggests templates although the agenda is saved – next stays with the agenda and the units, :suggest-templates goes into explore/);
});

test("a brief takes next from a unit at work only when its __Used in:__ names that unit (f)", () => {
  const develop = { title: "Vorlagen für Aktivitäten", why: "W", label: "Vorlage entwickeln", href: "agent:development/develop-template?id=turtle-maze", command: ":develop-template turtle-maze" };
  const unit = (id, state) => ({ id, title: `E${id}`, state, statusLabel: "Planungsskizze ✅" });
  const other = validate({ title: "Kurs", next: develop, units: [unit("1", "current"), unit("2", "planned")] }, templatesSection);
  assert.match(other.output, /next is the brief "turtle-maze" although unit 1 is being worked on and its __Used in:__ does not name it – next stays with the unit, :develop-template turtle-maze goes into explore \(icon ➕\)/);
  assert.doesNotMatch(validate({ title: "Kurs", next: develop, units: [unit("1", "planned"), unit("2", "current")] }, templatesSection).output, /next is the brief/, "unit 2 uses the template");
  assert.doesNotMatch(validate({ title: "Kurs", next: develop, units: [unit("1", "planned")] }, templatesSection).output, /next is the brief/, "no unit at work");
  const ready = templatesSection.replace("* __State:__ brief", "* __State:__ ready to test").replace("* __Folder:__", "* __Folder:__ lia-templates/turtle-maze/");
  const adopt = { ...develop, href: "agent:teaching/manage-templates?name=turtle-maze", command: ":manage-templates turtle-maze" };
  const taken = validate({ title: "Kurs", next: adopt, units: [unit("1", "draft")] }, ready, { "lia-templates/turtle-maze/README.md": "# Turtle maze\n" });
  assert.match(taken.output, /next is the brief "turtle-maze" although unit 1 is being worked on .* :manage-templates turtle-maze goes into explore/);
});

test("__Used in:__ names units by number, by range (2–4, 2-4) or all of them (alle Einheiten, all units)", () => {
  const develop = { title: "Vorlagen für Aktivitäten", why: "W", label: "Vorlage entwickeln", href: "agent:development/develop-template?id=turtle-maze", command: ":develop-template turtle-maze" };
  const at = (usedIn, id) => validate({ title: "Kurs", next: develop, units: [{ id, title: `E${id}`, state: "current", statusLabel: "Planungsskizze ✅" }] },
    templatesSection.replace("* __Used in:__\n  Einheit 2\n", `* __Used in:__\n  ${usedIn}\n`)).output;
  assert.notEqual(templatesSection.replace("* __Used in:__\n  Einheit 2\n", ""), templatesSection, "the fixture names unit 2 under __Used in:__");
  for (const [usedIn, id] of [["Einheit 2–4", "3"], ["units 2-4", "4"], ["Einheiten 2 – 4", "2"], ["Einheit 1, 3", "3"], ["alle Einheiten", "7"], ["all units", "5"], ["in allen Einheiten", "1"]]) {
    assert.doesNotMatch(at(usedIn, id), /next is the brief/, `${usedIn} names unit ${id}`);
  }
  for (const [usedIn, id] of [["Einheit 2–4", "5"], ["units 2-4", "1"], ["Einheit 12", "1"], ["Einheit 1, 3", "2"]]) {
    assert.match(at(usedIn, id), /next is the brief "turtle-maze" although unit \d+ is being worked on/, `${usedIn} does not name unit ${id}`);
  }
});

test("the empty journal has the template step after the didactics and the selection line open, without a finding", () => {
  const template = readFileSync(new URL("../templates/journal.md", import.meta.url), "utf8");
  const steps = JSON.parse(template.match(/```json @Dashboard\.View\n([\s\S]*?)\n```/)[1]).process.steps;
  const at = steps.findIndex(step => step.title === "Didactics");
  assert.equal(steps[at + 1]?.state, "planned", "the step after the didactics is planned");
  assert.doesNotMatch(`${steps[at + 1]?.title} ${steps[at + 1]?.why}`, /\{\{/);
  assert.match(template, /^\* __Template selection:__ open\n\n<section>\n\n### Dashboard$/m, "the selection line is the last line before <section>");
  const dir = mkdtempSync(join(tmpdir(), "empty-templates-"));
  try {
    writeFileSync(join(dir, "journal.md"), template);
    const run = spawnSync(process.execPath, [validatorScript, join(dir, "journal.md")], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.doesNotMatch(run.stdout + run.stderr, /Hints:|Warnings:/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
