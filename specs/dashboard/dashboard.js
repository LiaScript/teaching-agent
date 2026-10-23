/* LiaScript Dashboard prototype. Plain JavaScript; no build or dependencies. */
(function (global) {
  "use strict";
  if (global.LiaDashboard) return;

  const states = Object.freeze({
    planned: "○", current: "●", draft: "◐", review: "◐", revision: "↻", done: "✓", optional: "+"
  });
  const TEXT = {
    de: {
      "state.planned": "Noch offen", "state.current": "In Arbeit", "state.draft": "Entwurf liegt vor",
      "state.review": "Zur Durchsicht", "state.revision": "Korrektur nötig", "state.done": "Abgeschlossen", "state.optional": "Bei Bedarf",
      // Derived, not a state of the data: a unit still "planned" with at least one required step done.
      "state.started": "Angefangen",
      // Derived as well: a check step ("review") behind an earlier required step that is still open.
      "state.waiting": step => `Wartet auf: ${step}`,
      view: "Ansehen", eyebrow: "Kursplan", next: "Als Nächstes:", why: "Warum?",
      // Names its subject: unitsTitle is the nominative plural ("Fertige Lerneinheiten"); unitLabel.many may be dative.
      progress: (unitsTitle = "Einheiten") => `Fertige ${unitsTitle}`,
      progressEmpty: (units = "Einheiten") => `Der Fortschritt wird sichtbar, sobald ${units} angelegt sind.`,
      progressPlan: (units = "Einheiten") => `Die ${units} sind erst vorläufig geplant. Der Fortschritt erscheint, sobald die Planung feststeht.`,
      // Before any material exists: one sentence instead of a bar at zero; gender-neutral for any unit word.
      progressStart: (unit = "Einheit", first = "1") => `Noch nichts fertig – das Material beginnt mit ${unit} ${first}.`,
      // Work has begun, nothing is finished: the running unit and its required steps instead of a bar at zero.
      progressStarted: (unit = "Einheit", first = "1", done = 0, total = 0) => `Noch nichts fertig – ${unit} ${first} ist in Arbeit (${done} von ${total} ${total === 1 ? "Schritt" : "Schritten"}).`,
      unitWords: { one: "Einheit", many: "Einheiten" },
      // Verb follows the finished units ("1 von 6 Einheiten ist"); u.many is the dative plural after "von".
      progressText: (done, total, u = TEXT.de.unitWords) => `${done} von ${total} ${total === 1 ? u.one : u.many} ${done === 1 || total === 1 ? "ist" : "sind"} abgeschlossen`,
      units: "Einheiten", unitsHint: "Einheit auswählen, um den Arbeitsstand zu sehen.",
      unitsEmpty: (units = "Einheiten") => `Noch keine ${units} angelegt.`, unitsEmptyNext: "Die Einheiten entstehen nach Rahmen, Lernzielen und Didaktik.",
      course: "Gesamter Kurs", courseSummary: "Überblick über die Kursplanung",
      showProcess: "Prozess ansehen", steps: (done, total) => `${done} von ${total} ${total === 1 ? "Schritt" : "Schritten"}`,
      courseSteps: (done, total) => `${done} von ${total} ${total === 1 ? "Planungsschritt" : "Planungsschritten"}`,
      // Partial value while the material is produced: required unit steps done / all required unit steps.
      courseStepsMaterial: (done, total) => `Material: ${done} von ${total} ${total === 1 ? "Schritt" : "Schritten"}`,
      processEyebrow: "Schritt für Schritt", processTitle: "Arbeitsstand", result: "Liegt vor:", nextStep: "Nächster Schritt:",
      processEmpty: "Hier sind noch keine Arbeitsschritte eingetragen.",
      courseProcessEmpty: "Für den Kurs sind noch keine Arbeitsschritte eingetragen.", plan: "Planung ansehen",
      // First line of a unit card (units[].usable), from the report's line "usable with learners now".
      "usable.yes": "Mit den Lernenden nutzbar: ja", "usable.limited": "Mit den Lernenden nutzbar: ja, mit Einschränkungen",
      "usable.no": "Mit den Lernenden nutzbar: noch nicht", usableMissing: what => `es fehlt noch: ${what}`,
      // Progress line while no unit is fully checked, but one is already usable.
      checkedNone: "Fertig geprüft: noch keine", usableUnits: units => `Schon nutzbar: ${units}`, usableLimitedShort: "mit Einschränkungen",
      // Button of a unit with material (units[].view): the material as the learners see it.
      viewMaterial: "So sehen es die Lernenden",
      decide: "Noch zu entscheiden", prepare: "Vor dem Einsatz vorbereiten", how: "So geht's:", more: "Mehr dazu",
      // Tag of an open point found by a unit's check (decisions[].source).
      fromCheck: "aus der Prüfung", fromCheckOn: date => `aus der Prüfung vom ${date}`,
      internal: n => `${n} technische ${n === 1 ? "Notiz" : "Notizen"} des Assistenten`,
      preview: "Vorläufige Planung", explore: "Weitere Möglichkeiten", sections: "Planungsbereiche",
      error: "Die Übersicht konnte nicht angezeigt werden."
    },
    en: {
      "state.planned": "Not started", "state.current": "In progress", "state.draft": "Draft ready",
      "state.review": "In review", "state.revision": "Correction needed", "state.done": "Done", "state.optional": "Optional",
      "state.started": "Started", "state.waiting": step => `Waiting for: ${step}`,
      view: "Open", eyebrow: "Course plan", next: "Next:", why: "Why?",
      progress: (unitsTitle = "units") => `${unitsTitle.charAt(0).toUpperCase()}${unitsTitle.slice(1)} finished`,
      progressEmpty: (units = "units") => `Progress appears as soon as ${units.toLowerCase()} exist.`,
      progressPlan: (units = "units") => `The ${units.toLowerCase()} are only provisionally planned. Progress appears once the plan is settled.`,
      progressStart: (unit = "unit", first = "1") => `Nothing finished yet – the material starts with ${unit} ${first}.`,
      progressStarted: (unit = "unit", first = "1", done = 0, total = 0) => `Nothing finished yet – ${unit} ${first} is in progress (${done} of ${total} ${total === 1 ? "step" : "steps"}).`,
      unitWords: { one: "unit", many: "units" },
      progressText: (done, total, u = TEXT.en.unitWords) => `${done} of ${total} ${total === 1 ? u.one : u.many} ${done === 1 || total === 1 ? "is" : "are"} done`,
      units: "Units", unitsHint: "Select one to see its progress.",
      unitsEmpty: (units = "units") => `No ${units.toLowerCase()} yet.`, unitsEmptyNext: "Units are created after the frame, the objectives and the didactics.",
      course: "Whole course", courseSummary: "Overview of the course planning",
      showProcess: "Show process", steps: (done, total) => `${done} of ${total} ${total === 1 ? "step" : "steps"}`,
      courseSteps: (done, total) => `${done} of ${total} planning ${total === 1 ? "step" : "steps"}`,
      courseStepsMaterial: (done, total) => `Material: ${done} of ${total} ${total === 1 ? "step" : "steps"}`,
      processEyebrow: "Step by step", processTitle: "Current state", result: "Ready:", nextStep: "Next step:",
      processEmpty: "No work steps recorded here yet.",
      courseProcessEmpty: "No work steps recorded for the course yet.", plan: "See planning",
      "usable.yes": "Usable with learners: yes", "usable.limited": "Usable with learners: yes, with limits",
      "usable.no": "Usable with learners: not yet", usableMissing: what => `still missing: ${what}`,
      checkedNone: "Fully checked: none yet", usableUnits: units => `Usable now: ${units}`, usableLimitedShort: "with limits",
      viewMaterial: "How learners see it",
      decide: "To decide", prepare: "Prepare before use", how: "How:", more: "More about this",
      fromCheck: "from the check", fromCheckOn: date => `from the check on ${date}`,
      internal: n => `${n} technical ${n === 1 ? "note" : "notes"} of the assistant`,
      preview: "Provisional plan", explore: "More options", sections: "Planning sections",
      error: "The overview could not be displayed."
    }
  };
  // Placeholders a label may use, in the order of the arguments of t(). Counted labels
  // may also be {one, many}, chosen by the first number.
  const ARGS = { progressText: ["done", "total"], steps: ["done", "total"], courseSteps: ["done", "total"], courseStepsMaterial: ["done", "total"],
    internal: ["n"], progressStart: ["unit", "first"], progressStarted: ["unit", "first", "done", "total"],
    fromCheckOn: ["date"], "state.waiting": ["step"], usableMissing: ["what"], usableUnits: ["units"] };
  const COUNTED = ["progressText", "steps", "courseSteps", "courseStepsMaterial", "internal"];
  const PLACEHOLDERS = { ...ARGS, progressText: ["done", "total", "unit"] };
  let lang = "en";
  let labels = {};
  function useLanguage(input) {
    const wanted = String(input?.lang || global.document?.documentElement?.lang || "en").slice(0, 2).toLowerCase();
    lang = Object.hasOwn(TEXT, wanted) ? wanted : "en";
    labels = input?.labels && typeof input.labels === "object" && !Array.isArray(input.labels) ? input.labels : {};
  }
  function fill(key, label, args) {
    const [count, total, unitLabel] = args;
    // Step counts name their noun after the total ("1 of 3 steps"); the progress line's verb follows the finished units.
    const by = ["steps", "courseSteps", "courseStepsMaterial"].includes(key) ? total : count;
    const template = typeof label === "string" ? label : label[by === 1 ? "one" : "many"];
    const values = Object.fromEntries(ARGS[key].map((name, index) => [name, args[index]]));
    if (key === "progressText") {
      const words = unitLabel?.one && unitLabel?.many ? unitLabel : TEXT[lang].unitWords ?? TEXT.en.unitWords;
      values.unit = total === 1 ? words.one : words.many;
    }
    return template.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(values, name) ? values[name] : match);
  }
  function t(key, ...args) {
    if (Object.hasOwn(labels, key) && validLabel(key, labels[key])) {
      return Object.hasOwn(ARGS, key) ? fill(key, labels[key], args) : labels[key];
    }
    const value = TEXT[lang][key] ?? TEXT.en[key];
    return typeof value === "function" ? value(...args) : value;
  }
  function validLabel(key, value) {
    if (typeof value === "string") return value.trim() !== "";
    return COUNTED.includes(key) && typeof value?.one === "string" && typeof value?.many === "string";
  }
  // Own labels for the fixed texts, so that every course language can be shown.
  function labelsData(input) {
    if (input == null) return {};
    if (typeof input !== "object" || Array.isArray(input)) throw new Error("labels must be an object of texts.");
    Object.entries(input).forEach(([key, value]) => {
      if (key === "unitWords" || !Object.hasOwn(TEXT.en, key)) throw new Error(`Unknown label: ${key}`);
      if (!validLabel(key, value)) {
        throw new Error(COUNTED.includes(key)
          ? `Label ${key} must be a text or {one, many}.` : `Label ${key} must be a text.`);
      }
      const texts = typeof value === "string" ? [value] : [value.one, value.many];
      texts.forEach(text => (text.match(/\{[^}]*\}/g) ?? []).forEach(placeholder => {
        if (!(PLACEHOLDERS[key] ?? []).includes(placeholder.slice(1, -1))) {
          throw new Error(`Label ${key} uses the unknown placeholder ${placeholder}.`);
        }
      }));
    });
    return input;
  }
  const views = new Map();
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);

  function parseInput(value) {
    let source = String(value).trim();
    // Protected macro arguments can retain their fence delimiters when chained.
    while (source.startsWith("```") && source.endsWith("```")) {
      source = source.slice(3, -3).trim();
    }
    return JSON.parse(source);
  }

  function state(value = "planned") {
    value = String(value).trim();
    if (!Object.hasOwn(states, value)) throw new Error(`Unknown state: ${value}`);
    return value;
  }

  function href(value) {
    const url = String(value ?? "").trim();
    if (!url || /[\u0000-\u0020]/.test(url) || url.startsWith("//")) {
      throw new Error("The action link is missing or invalid.");
    }
    const scheme = /^([a-z][a-z\d+.-]*):/i.exec(url);
    if (scheme && !["http", "https", "agent"].includes(scheme[1].toLowerCase())) {
      throw new Error("This link format is not supported.");
    }
    return url;
  }

  function actionData(input) {
    if (!input || typeof input !== "object") return null;
    const result = { ...input, href: href(input.href), command: String(input.command ?? "").trim() };
    if (result.href.startsWith("agent:") && !String(result.command ?? "").startsWith(":")) {
      throw new Error("An agent: link also needs a readable command.");
    }
    return result;
  }

  function resolveLink(value) {
    // LiaScript opens the course URL after '?'; HTML output has no Markdown link resolver.
    if (!global.location || value.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(value)) return value;
    try {
      const source = decodeURIComponent(global.location.search.slice(1));
      const target = new URL(value, source);
      if (/\.(md|markdown)$/i.test(target.pathname)) {
        const chapter = target.hash;
        target.hash = "";
        return `${global.location.pathname}?${target.href}${chapter}`;
      }
      return target.href;
    } catch { return value; }
  }

  function processData(input = {}) {
    if (Array.isArray(input)) input = { steps: input };
    if (!input || typeof input !== "object" || !Array.isArray(input.steps ?? [])) {
      throw new Error("The process needs a list of steps.");
    }
    return {
      ...input,
      steps: (input.steps ?? []).map(step => {
        if (!step || typeof step !== "object" || !step.title) {
          throw new Error("Every process step needs a title.");
        }
        return { ...step, state: state(step.state) };
      })
    };
  }

  // Selection value of the "whole course" entry: shows the global process.
  const COURSE = "";

  const decisionKinds = ["decide", "prepare", "internal"];

  // Where an open point comes from: {"check": n, "date": "2026-10-23"} marks a point found by the
  // check of unit n. ids: the unit ids of the view (the unit must exist); null for a single component.
  function sourceData(value, ids) {
    if (value == null) return undefined;
    if (typeof value !== "object" || Array.isArray(value)) throw new Error('source of an open point must be an object like {"check": 1}.');
    Object.keys(value).forEach(key => { if (!["check", "date"].includes(key)) throw new Error(`Unknown source field: ${key}`); });
    const check = String(value.check ?? "").trim();
    if (!check) throw new Error("source needs check: the number of the unit whose check found the point.");
    if (ids && !ids.has(check)) throw new Error(`source.check ${check} is no unit of this overview.`);
    if (value.date != null && (typeof value.date !== "string" || !value.date.trim())) throw new Error("source.date must be a text, e.g. 2026-10-23.");
    return { ...value, check };
  }

  function decisionsData(input, ids = null) {
    if (input == null) return [];
    if (!Array.isArray(input)) throw new Error("decisions must be a list.");
    return input.map(item => {
      const entry = typeof item === "string" ? { title: item } : { ...item };
      if (!entry.title) throw new Error("An open point needs a title.");
      entry.kind = entry.kind ?? "decide";
      if (!decisionKinds.includes(entry.kind)) throw new Error(`Unknown kind of open point: ${entry.kind}`);
      if (entry.source != null) entry.source = sourceData(entry.source, ids);
      // Check the link now: a broken one would otherwise only fail when the whole view renders.
      return entry.href == null ? entry : actionData(entry);
    });
  }

  // Usable with learners now (the report's mandatory line): yes · limited (yes, with limits) · no (not yet).
  // missing: what is still missing, as short noun phrases ("1 photo", "short re-check"); required unless yes.
  const usableStates = Object.freeze({ yes: "✓", limited: "◐", no: "○" });
  function usableData(value) {
    if (value == null) return undefined;
    if (typeof value !== "object" || Array.isArray(value)) throw new Error('usable must be an object like {"state": "limited", "missing": ["1 photo"]}.');
    Object.keys(value).forEach(key => { if (!["state", "missing"].includes(key)) throw new Error(`Unknown usable field: ${key}`); });
    if (!Object.hasOwn(usableStates, value.state)) throw new Error(`Unknown usable state: ${value.state} (yes, limited or no).`);
    if (value.missing != null && !Array.isArray(value.missing)) throw new Error("usable.missing must be a list of short texts.");
    const missing = (value.missing ?? []).map(item => String(item ?? "").trim()).filter(Boolean);
    if (value.state === "yes" && missing.length) throw new Error('usable "yes" lists nothing missing – use "limited".');
    if (value.state !== "yes" && !missing.length) throw new Error(`usable "${value.state}" needs missing: what is still missing.`);
    return { state: value.state, missing };
  }

  function planData(input) {
    if (input == null) return null;
    if (!Array.isArray(input.rows)) throw new Error("The provisional plan needs a list `rows`.");
    input.rows.forEach(row => { if (!row.label || !row.text) throw new Error("Every plan row needs label and text."); });
    return input;
  }

  function buildModel(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new Error("Dashboard data must be an object.");
    }
    if (!Array.isArray(input.units ?? [])) throw new Error("units must be a list.");
    // Text fields of the wrong type would pass here and break the page while rendering.
    const text = (value, name) => { if (value != null && typeof value !== "string") throw new Error(`${name} must be text, not ${Array.isArray(value) ? "a list" : typeof value}.`); };
    ["title", "eyebrow", "unitsTitle", "progressTitle", "decisionsTitle", "prepareTitle", "exploreTitle", "courseLabel", "emptyUnits", "footer"].forEach(name => text(input[name], name));
    if (input.unitLabel != null && (typeof input.unitLabel !== "object" || ["one", "many"].some(form => typeof input.unitLabel[form] !== "string"))) {
      throw new Error('unitLabel must be {"one": text, "many": text}.');
    }
    const ids = new Set();
    const units = (input.units ?? []).map((unit, index) => {
      const id = String(unit.id ?? index + 1);
      if (ids.has(id)) throw new Error(`Duplicate unit id: ${id}`);
      ids.add(id);
      if (!unit.title) throw new Error("A unit needs a title.");
      ["title", "statusLabel", "summary"].forEach(name => text(unit[name], `unit ${id}: ${name}`));
      return { ...unit, id, state: state(unit.state), process: processData(unit.process), ...(unit.href == null ? {} : { href: actionData({ href: unit.href }).href }),
        usable: usableData(unit.usable), ...(unit.view == null ? {} : { view: actionData({ icon: "👁", ...unit.view }) }) };
    });
    const globalProcess = processData(input.process);
    const selected = input.selected == null
      ? units.find(unit => unit.state === "current")?.id ?? units[0]?.id ?? null
      : String(input.selected);
    const courseSelected = selected === COURSE && globalProcess.steps.length > 0;
    if (selected !== null && !courseSelected && !ids.has(selected)) throw new Error("The selected unit does not exist.");
    const completed = units.filter(unit => unit.state === "done").length;
    return {
      ...input,
      units, selected, completed, total: units.length,
      percent: units.length ? Math.round(100 * completed / units.length) : 0,
      process: globalProcess,
      next: actionData(input.next),
      explore: (input.explore ?? []).map(actionData),
      links: (input.links ?? []).map(actionData),
      decisions: decisionsData(input.decisions, ids),
      plan: planData(input.plan),
      labels: labelsData(input.labels)
    };
  }

  function status(value, label) {
    const key = state(value);
    return `<span class="dashboard-status dashboard-status-${key}"><span aria-hidden="true">${states[key]}</span> ${escape(label || t(`state.${key}`))}</span>`;
  }

  function actionLink(input, viewId, primary = false) {
    const item = actionData(input);
    if (!item) return "";
    const select = viewId && item.selectUnit != null
      ? ` data-dashboard-select="${escape(item.selectUnit)}"` : "";
    const icon = item.icon || (item.href.startsWith("agent:") ? "▶️" : "");
    const text = escape(item.label || item.title || t("view"));
    const label = icon ? `<span class="dashboard-button-label"><span class="dashboard-button-icon" aria-hidden="true">${escape(icon)}</span> ${text}</span>` : text;
    return `<span class="dashboard-action-link"><a class="dashboard-button${primary ? " dashboard-button-primary" : ""}" href="${escape(resolveLink(item.href))}"${select}>${label} <span aria-hidden="true">→</span></a>${item.command ? ` <code class="dashboard-command">${escape(item.command)}</code>` : ""}</span>`;
  }

  function hero(input, viewId) {
    const next = actionData(input.next);
    return `<header class="dashboard-hero">
      <p class="dashboard-eyebrow">${escape(input.eyebrow || t("eyebrow"))}</p>
      <h2>${escape(input.title)}</h2>
      ${input.context ? `<p class="dashboard-context">${escape(input.context)}</p>` : ""}
      ${input.subtitle ? `<p class="dashboard-intro">${escape(input.subtitle)}</p>` : ""}
      ${input.notice ? `<p class="dashboard-notice">${escape(input.notice)}</p>` : ""}
      ${next ? `<div class="dashboard-next"><p><strong>${escape(t("next"))}</strong> ${escape(next.title || next.label)}</p>${next.why ? `<p class="dashboard-why"><strong>${escape(t("why"))}</strong> ${escape(next.why)}</p>` : ""}${actionLink(next, viewId, true)}</div>` : ""}
    </header>`;
  }

  // The units that learners can already use, though not fully checked: "unit 2 (with limits), unit 3".
  function usableList(items, unitLabel) {
    const word = unitLabel?.one || (TEXT[lang].unitWords ?? TEXT.en.unitWords).one;
    return items.map(item => `${word} ${item.id}${item.usable.state === "limited" ? ` (${t("usableLimitedShort")})` : ""}`).join(", ");
  }

  // start: while no unit is finished, one sentence replaces a bar at zero. An id (or {first}): nothing
  // has begun, the material starts with that unit; {first, done, total}: that unit is in progress.
  // usable: units not done whose usable state is yes or limited; while no unit is done they replace the
  // discouraging "nothing finished yet" (usable → open points → process steps), else a second line follows.
  function progress(completed, total, label = t("progress"), unitLabel, unitsTitle, planned = false, start = null, usable = []) {
    if (!Number.isInteger(total) || !Number.isInteger(completed) || completed < 0 || total < completed) {
      throw new Error("Progress needs valid values: done / total.");
    }
    const usableText = total && usable.length ? t("usableUnits", usableList(usable, unitLabel)) : "";
    if (total && start != null) {
      const word = unitLabel?.one || (TEXT[lang].unitWords ?? TEXT.en.unitWords).one;
      const running = typeof start === "object" ? start : { first: start };
      const text = usableText ? `${t("checkedNone")} · ${usableText}`
        : running.total
        ? t("progressStarted", word, String(running.first), running.done, running.total)
        : t("progressStart", word, String(running.first));
      return `<section class="dashboard-progress"><div><h3>${escape(label)}</h3><p>${escape(text)}</p></div></section>`;
    }
    // A provisional plan already lists the units: do not claim that none exist yet.
    if (!total) return `<section class="dashboard-progress"><h3>${escape(label)}</h3><p>${escape(t(planned ? "progressPlan" : "progressEmpty", unitsTitle || t("units")))}</p></section>`;
    const text = escape(unitLabel?.one && unitLabel?.many ? t("progressText", completed, total, unitLabel) : t("progressText", completed, total));
    return `<section class="dashboard-progress"><div><h3>${escape(label)}</h3><p>${text}</p>${usableText ? `<p class="dashboard-progress-usable">${escape(usableText)}</p>` : ""}</div><progress value="${completed}" max="${total}" aria-label="${text}"></progress></section>`;
  }

  function card(input) {
    return `<section class="dashboard-card"><h3>${escape(input.title)}</h3><p>${escape(input.body)}</p></section>`;
  }

  function action(input) {
    return `<article class="dashboard-action"><h4>${escape(input.title)}</h4><p>${escape(input.description)}</p>${actionLink(input)}</article>`;
  }

  // Optional steps (e.g. publishing) are offers, not work still due: counters leave them out.
  const counted = steps => (steps ?? []).filter(step => step.state !== "optional");
  const doneCount = steps => steps.filter(step => step.state === "done").length;

  // The chip of a unit: its own statusLabel, else "started" for a unit still "planned" whose
  // required steps have begun (so it never reads "Not started · 1 of 3 steps"), else the state text.
  function unitStatusLabel(input) {
    if (input.statusLabel) return input.statusLabel;
    return input.state === "planned" && doneCount(counted(input.process?.steps)) > 0 ? t("state.started") : undefined;
  }

  // The chip of a process step: its own statusLabel, else "waiting for {step}" for a check step
  // ("review") behind an earlier required step that is still open, else the state text.
  function stepStatusLabel(step, steps) {
    if (step.statusLabel) return step.statusLabel;
    if (step.state !== "review") return undefined;
    const open = steps.slice(0, steps.indexOf(step)).find(item => !["done", "optional"].includes(item.state));
    return open ? t("state.waiting", open.title) : undefined;
  }

  // "Usable with learners: yes, with limits – still missing: 1 photo, short re-check".
  function usableText(value) {
    return `${t(`usable.${value.state}`)}${value.missing.length ? ` – ${t("usableMissing", value.missing.join(", "))}` : ""}`;
  }

  function usableLine(value) {
    return value ? `<span class="dashboard-usable dashboard-usable-${value.state}"><span aria-hidden="true">${usableStates[value.state]}</span> ${escape(usableText(value))}</span>` : "";
  }

  // The material as the learners see it (units[].view): a button of its own, never hidden in the plan link.
  function viewLink(input) {
    return input?.view ? actionLink({ ...input.view, label: input.view.label || t("viewMaterial") }) : "";
  }

  // Card order = ranking of the three measures: usable with learners (from the check report) →
  // open points (the status chip) → process steps (the counter).
  function unit(input, selected = false, viewId) {
    const steps = counted(input.process?.steps);
    const stepsDone = doneCount(steps);
    const label = unitStatusLabel(input);
    const usable = usableData(input.usable);
    const stepText = steps.length ? `<span class="dashboard-unit-steps">${escape(t("steps", stepsDone, steps.length))}</span>` : "";
    const content = `<span class="dashboard-unit-number" aria-hidden="true">${escape(input.id)}</span><span class="dashboard-unit-content"><strong>${escape(input.title)}</strong>${usableLine(usable)}${status(input.state, label)}${stepText}${input.summary ? `<span class="dashboard-unit-summary">${escape(input.summary)}</span>` : ""}</span>`;
    const view = input.view ? `<span class="dashboard-unit-view">${viewLink(input)}</span>` : "";
    if (!viewId) return `<li class="dashboard-unit-item"><article class="dashboard-unit">${content}</article>${view}</li>`;
    return `<li class="dashboard-unit-item"><button class="dashboard-unit${selected ? " dashboard-unit-selected" : ""}" type="button" data-dashboard-select="${escape(input.id)}"${selected ? ' aria-current="true"' : ""} aria-label="${escape(input.title)}: ${usable ? `${escape(usableText(usable))}; ` : ""}${escape(label || t(`state.${state(input.state)}`))}; ${escape(t("showProcess"))}">${content}</button>${view}</li>`;
  }

  function courseEntry(input, viewId) {
    if (!viewId || !input.process?.steps?.length) return "";
    const steps = counted(input.process.steps);
    const selected = input.selected === COURSE;
    const stepsDone = doneCount(steps);
    // The course step that produces the material runs for weeks: while a course step is current and
    // unit steps are done, a partial value from the units keeps the counter moving (no extra data).
    const material = (input.units ?? []).flatMap(item => counted(item.process?.steps));
    const materialDone = doneCount(material);
    const partial = steps.some(step => step.state === "current") && materialDone > 0
      ? ` · ${t("courseStepsMaterial", materialDone, material.length)}` : "";
    return `<div class="dashboard-course-entry"><button class="dashboard-unit dashboard-course${selected ? " dashboard-unit-selected" : ""}" type="button" data-dashboard-select="${COURSE}"${selected ? ' aria-current="true"' : ""} aria-label="${escape(input.courseLabel || t("course"))}; ${escape(t("showProcess"))}"><span class="dashboard-unit-number" aria-hidden="true">⌂</span><span class="dashboard-unit-content"><strong>${escape(input.courseLabel || t("course"))}</strong><span class="dashboard-unit-steps">${escape(t("courseSteps", stepsDone, steps.length) + partial)}</span><span class="dashboard-unit-summary">${escape(t("courseSummary"))}</span></span></button></div>`;
  }

  function units(input, viewId) {
    const items = input.units ?? [];
    return `<section class="dashboard-units"><h3>${escape(input.unitsTitle || t("units"))}</h3>${items.length ? `<p class="dashboard-hint">${escape(t("unitsHint"))}</p>${courseEntry(input, viewId)}<ol class="dashboard-unit-list">${items.map(item => unit(item, item.id === input.selected, viewId)).join("")}</ol>` : (input.plan ? plan(input.plan) : `<div class="dashboard-empty"><p>${escape(input.emptyUnits || t("unitsEmpty", input.unitsTitle || t("units")))}</p><p>${escape(t("unitsEmptyNext"))}</p></div>`)}</section>`;
  }

  // unit: the selected unit, so that a unit without steps still shows its state and summary;
  // course: the empty panel belongs to the whole course, not to a unit.
  function emptyProcess(unit, course) {
    if (!unit) return `<p class="dashboard-empty">${escape(t(course ? "courseProcessEmpty" : "processEmpty"))}</p>`;
    return `<div class="dashboard-process-fallback">${status(unit.state, unitStatusLabel(unit))}${unit.summary ? `<p class="dashboard-process-summary">${escape(unit.summary)}</p>` : ""}<p class="dashboard-empty">${escape(t("processEmpty"))}</p></div>`;
  }

  function process(input, unit = null, course = false) {
    const data = processData(input);
    const steps = data.steps;
    const usable = unit?.usable ? `<p class="dashboard-process-usable">${usableLine(unit.usable)}</p>` : "";
    return `<section class="dashboard-process" aria-live="polite"><p class="dashboard-eyebrow">${escape(data.eyebrow || t("processEyebrow"))}</p><h3>${escape(data.title || t("processTitle"))}</h3>${usable}${data.description ? `<p class="dashboard-process-description">${escape(data.description)}</p>` : ""}${data.steps.length ? `<ol class="dashboard-step-list">${data.steps.map(step => `<li class="dashboard-step dashboard-step-${step.state}"${step.state === "current" ? ' aria-current="step"' : ""}><span class="dashboard-step-marker" aria-hidden="true">${states[step.state]}</span><div><div class="dashboard-step-heading"><h4>${escape(step.title)}</h4>${status(step.state, stepStatusLabel(step, steps))}</div>${step.result ? `<p class="dashboard-result"><strong>${escape(t("result"))}</strong> ${escape(step.result)}</p>` : ""}${step.why ? `<p class="dashboard-step-why">${escape(step.why)}</p>` : ""}${step.next ? `<p class="dashboard-step-next"><strong>${escape(t("nextStep"))}</strong> ${escape(step.next)}</p>` : ""}</div></li>`).join("")}</ol>` : emptyProcess(unit, course)}${data.note ? `<p class="dashboard-process-note">${escape(data.note)}</p>` : ""}${input.href || unit?.view ? `<p class="dashboard-process-link">${viewLink(unit)}${input.href ? actionLink({ label: t("plan"), href: input.href }) : ""}</p>` : ""}</section>`;
  }

  // Only agent: links start an action and become buttons; any other link just opens a
  // section or page. Its text names the destination, never the open question itself.
  function decisionLink(item) {
    if (item.href.startsWith("agent:")) return actionLink({ ...item, title: null });
    return `<a class="dashboard-decision-link" href="${escape(resolveLink(item.href))}">${escape(item.label || t("more"))} <span aria-hidden="true">→</span></a>`;
  }

  // An ISO date reads as the course language writes it (de: 23.10.2026); any other text stays as given.
  function formatDate(value) {
    const iso = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return iso && lang === "de" ? `${iso[3]}.${iso[2]}.${iso[1]}` : String(value).trim();
  }

  const sourceText = source => source.date ? t("fromCheckOn", formatDate(source.date)) : t("fromCheck");

  function decisionItem(item) {
    return `<li><strong>${escape(item.title)}</strong>${item.source ? ` <span class="dashboard-decision-source">${escape(sourceText(item.source))}</span>` : ""}${item.why ? ` <span class="dashboard-decision-why">${escape(item.why)}</span>` : ""}${item.how ? `<span class="dashboard-decision-how"><strong>${escape(t("how"))}</strong> ${escape(item.how)}</span>` : ""}${item.href ? ` ${decisionLink(item)}` : ""}</li>`;
  }

  function decisions(items, label = t("decide"), prepareLabel = t("prepare")) {
    if (!items.length) return "";
    const group = kind => items.filter(item => item.kind === kind);
    const block = (list, title, css) => list.length ? `<section class="dashboard-decisions ${css}"><h3>${escape(title)}</h3><ul>${list.map(decisionItem).join("")}</ul></section>` : "";
    const internal = group("internal");
    return `${block(group("decide"), label, "dashboard-decisions-decide")}${block(group("prepare"), prepareLabel, "dashboard-decisions-prepare")}${internal.length ? `<details class="dashboard-internal"><summary>${escape(t("internal", internal.length))}</summary><ul>${internal.map(decisionItem).join("")}</ul></details>` : ""}`;
  }

  function plan(input) {
    if (!input) return "";
    return `<section class="dashboard-plan"><h4>${escape(input.title || t("preview"))}</h4>${input.note ? `<p class="dashboard-plan-note">${escape(input.note)}</p>` : ""}<dl>${input.rows.map(row => `<div><dt>${escape(row.label)}</dt><dd>${escape(row.text)}</dd></div>`).join("")}</dl></section>`;
  }

  function explore(items, label = t("explore")) {
    if (!items.length) return "";
    return `<details class="dashboard-explore"><summary>${escape(label)}</summary><div class="dashboard-explore-grid">${items.map(action).join("")}</div></details>`;
  }

  function viewContent(model, viewId) {
    const selected = model.units.find(item => item.id === model.selected);
    const selectedProcess = selected
      ? { ...selected.process, title: selected.process.title || selected.title, href: selected.href }
      : model.process;
    // The bar appears only once a unit is finished. Before that one sentence: the first unit that has
    // begun (state beyond "planned" or a required step beyond "planned") with its required steps, or,
    // while nothing has begun, the unit the material starts with.
    const running = model.units.find(item => item.state !== "planned" || counted(item.process.steps).some(step => step.state !== "planned"));
    const runningSteps = counted(running?.process.steps);
    const start = model.completed > 0 ? null
      : running ? { first: running.id, done: doneCount(runningSteps), total: runningSteps.length }
      : model.units[0] ? { first: model.units[0].id } : null;
    const progressTitle = model.progressTitle || t("progress", model.unitsTitle || (lang === "en" ? model.unitLabel?.many : undefined));
    const usable = model.units.filter(item => item.state !== "done" && ["yes", "limited"].includes(item.usable?.state));
    return `${hero(model, viewId)}${decisions(model.decisions, model.decisionsTitle || undefined, model.prepareTitle || undefined)}${progress(model.completed, model.total, progressTitle, model.unitLabel, model.unitsTitle, Boolean(model.plan), start, usable)}<div class="dashboard-workspace">${units(model, viewId)}${process(selectedProcess, selected ?? null, !selected)}</div>${explore(model.explore, model.exploreTitle)}${model.links.length ? `<nav class="dashboard-links" aria-label="${escape(t("sections"))}">${model.links.map(item => actionLink(item, viewId)).join("")}</nav>` : ""}${model.footer ? `<p class="dashboard-footer">${escape(model.footer)}</p>` : ""}`;
  }

  function view(id, input) {
    useLanguage(input);
    const model = buildModel(input);
    model.lang = lang;
    views.set(String(id), model);
    return `<article id="${escape(id)}" class="lia-dashboard" data-dashboard-view="${escape(id)}">${viewContent(model, id)}</article>`;
  }

  function renderComponent(component, id, input) {
    useLanguage(input);
    const renderers = {
      Hero: () => hero(input),
      Progress: () => progress(Number(input.completed), Number(input.total), input.label),
      Card: () => card(input),
      Action: () => action(actionData(input)),
      Status: () => status(input.state, input.label),
      Unit: () => `<ol class="dashboard-unit-list">${unit({ ...input, state: state(input.state), ...(input.view == null ? {} : { view: actionData({ icon: "👁", ...input.view }) }) })}</ol>`,
      Units: () => units(buildModel(Array.isArray(input) ? { units: input } : input)),
      Process: () => process(input),
      Decisions: () => decisions(decisionsData(Array.isArray(input) ? input : input.items), input.label || undefined, input.prepareLabel || undefined),
      Plan: () => plan(planData(input)),
      Explore: () => explore(Array.isArray(input) ? input.map(actionData) : (input.items ?? []).map(actionData), input.label),
      View: () => view(id, input)
    };
    try {
      if (!renderers[component]) throw new Error("Unknown dashboard component.");
      const html = renderers[component]();
      return component === "View" ? html : `<div class="lia-dashboard dashboard-component">${html}</div>`;
    } catch (error) {
      return `<div class="lia-dashboard dashboard-error" role="alert"><strong>${escape(t("error"))}</strong><p>${escape(error.message)}</p></div>`;
    }
  }

  // The visible group and state texts in the course language, exactly as the view prints them, with
  // the number of entries per group (and how many come from a check). validate-journal.mjs prints
  // them, so an agent names a group or a state as the overview does. lang: the page language
  // (header `language:`) when the data has no `lang`.
  function visibleTexts(input, pageLang) {
    useLanguage({ ...input, lang: input?.lang || pageLang });
    const model = buildModel(input);
    const group = kind => model.decisions.filter(item => item.kind === kind);
    const groups = [["decide", model.decisionsTitle || t("decide")], ["prepare", model.prepareTitle || t("prepare")], ["internal", t("internal", group("internal").length)]]
      .map(([kind, title]) => ({ kind, title, count: group(kind).length, fromCheck: group(kind).filter(item => item.source).length }));
    const chips = [
      ...model.units.map(item => unitStatusLabel(item) || t(`state.${item.state}`)),
      ...[model.process, ...model.units.map(item => item.process)].flatMap(data => data.steps.map(step => stepStatusLabel(step, data.steps) || t(`state.${step.state}`)))
    ];
    const usable = model.units.filter(item => item.usable).map(item => ({ id: item.id, state: item.usable.state, text: usableText(item.usable) }));
    return { lang, groups, states: [...new Set(chips)], usable, fromCheck: t("fromCheck"), viewMaterial: t("viewMaterial"), plan: t("plan") };
  }

  if (global.document) {
    global.document.addEventListener("click", event => {
      const control = event.target.closest?.("[data-dashboard-select]");
      const root = control?.closest("[data-dashboard-view]");
      const id = root?.dataset.dashboardView;
      const model = views.get(id);
      const selected = control?.dataset.dashboardSelect;
      const isCourse = selected === COURSE && model?.process.steps.length > 0;
      if (!isCourse && !model?.units.some(item => item.id === selected)) return;
      event.preventDefault();
      model.selected = selected;
      useLanguage(model);
      root.innerHTML = viewContent(model, id);
      Array.from(root.querySelectorAll("button[data-dashboard-select]"))
        .find(button => button.dataset.dashboardSelect === selected)?.focus({ preventScroll: true });
    });
  }

  global.LiaDashboard = Object.freeze({
    buildModel, renderComponent, states, status, progress, hero, card,
    action, unit, units, process, explore, decisions, plan, view, parseInput, visibleTexts
  });
  if (global.document) global.document.dispatchEvent(new CustomEvent("lia-dashboard-ready"));
})(globalThis);
