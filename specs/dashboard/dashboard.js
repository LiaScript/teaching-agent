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
      "state.review": "Zur Durchsicht", "state.revision": "Überarbeiten", "state.done": "Abgeschlossen", "state.optional": "Bei Bedarf",
      view: "Ansehen", eyebrow: "Unterrichtsplan", next: "Als Nächstes:", why: "Warum?", progress: "Fortschritt",
      progressEmpty: "Noch keine Einheit angelegt. Der Fortschritt wird sichtbar, sobald Einheiten entstehen.",
      progressText: (done, total, u = { one: "Einheit", many: "Einheiten" }) => `${done} von ${total} ${total === 1 ? `${u.one} ist` : `${u.many} sind`} abgeschlossen`,
      units: "Meine Einheiten", unitsHint: "Antippen, um den Arbeitsstand zu sehen.",
      unitsEmpty: "Noch keine Unterrichtseinheit angelegt.", unitsEmptyNext: "Zuerst stimmen wir die Lernziele und die Lernaktivitäten ab.",
      showProcess: "Prozess ansehen", steps: (done, total) => `${done} von ${total} Schritten`,
      processEyebrow: "So entsteht das Material", processTitle: "Unser Arbeitsstand", result: "Liegt vor:", nextStep: "Nächster Schritt:",
      processEmpty: "Hierfür ist noch kein detaillierter Ablauf eingetragen.", plan: "Planung ansehen",
      decide: "Noch zu entscheiden", prepare: "Vor dem Einsatz vorbereiten", how: "So geht's:",
      internal: n => `Für Profis: ${n} interne ${n === 1 ? "Notiz" : "Notizen"} des Assistenten`,
      preview: "Vorläufige Planung", explore: "Weitere Möglichkeiten", sections: "Planungsbereiche",
      error: "Die Übersicht konnte nicht angezeigt werden."
    },
    en: {
      "state.planned": "Not started", "state.current": "In progress", "state.draft": "Draft ready",
      "state.review": "In review", "state.revision": "Needs revision", "state.done": "Done", "state.optional": "Optional",
      view: "Open", eyebrow: "Course plan", next: "Next:", why: "Why?", progress: "Progress",
      progressEmpty: "No unit created yet. Progress appears as soon as units exist.",
      progressText: (done, total, u = { one: "unit", many: "units" }) => `${done} of ${total} ${total === 1 ? `${u.one} is` : `${u.many} are`} done`,
      units: "My units", unitsHint: "Select one to see its progress.",
      unitsEmpty: "No unit created yet.", unitsEmptyNext: "First we agree on the learning objectives and activities.",
      showProcess: "show process", steps: (done, total) => `${done} of ${total} steps`,
      processEyebrow: "How the material is made", processTitle: "Where we are", result: "Ready:", nextStep: "Next step:",
      processEmpty: "No detailed process recorded yet.", plan: "Open the plan",
      decide: "To decide", prepare: "Prepare before use", how: "How:",
      internal: n => `For experts: ${n} internal ${n === 1 ? "note" : "notes"} of the assistant`,
      preview: "Provisional plan", explore: "More options", sections: "Planning sections",
      error: "The overview could not be displayed."
    }
  };
  let lang = "en";
  function useLanguage(input) {
    const wanted = String(input?.lang || global.document?.documentElement?.lang || "en").slice(0, 2).toLowerCase();
    lang = Object.hasOwn(TEXT, wanted) ? wanted : "en";
  }
  function t(key, ...args) {
    const value = TEXT[lang][key] ?? TEXT.en[key];
    return typeof value === "function" ? value(...args) : value;
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
      throw new Error("Der Prozess braucht eine Liste von Schritten.");
    }
    return {
      ...input,
      steps: (input.steps ?? []).map(step => {
        if (!step || typeof step !== "object" || !step.title) {
          throw new Error("Jeder Prozessschritt braucht einen Titel.");
        }
        return { ...step, state: state(step.state) };
      })
    };
  }

  const decisionKinds = ["decide", "prepare", "internal"];

  function decisionsData(input) {
    if (input == null) return [];
    if (!Array.isArray(input)) throw new Error("decisions must be a list.");
    return input.map(item => {
      const entry = typeof item === "string" ? { title: item } : { ...item };
      if (!entry.title) throw new Error("An open point needs a title.");
      entry.kind = entry.kind ?? "decide";
      if (!decisionKinds.includes(entry.kind)) throw new Error(`Unknown kind of open point: ${entry.kind}`);
      return entry;
    });
  }

  function planData(input) {
    if (input == null) return null;
    if (!Array.isArray(input.rows)) throw new Error("The provisional plan needs a list rows.");
    input.rows.forEach(row => { if (!row.label || !row.text) throw new Error("Every plan row needs label and text."); });
    return input;
  }

  function buildModel(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new Error("Dashboard data must be an object.");
    }
    if (!Array.isArray(input.units ?? [])) throw new Error("units must be a list.");
    const ids = new Set();
    const units = (input.units ?? []).map((unit, index) => {
      const id = String(unit.id ?? index + 1);
      if (ids.has(id)) throw new Error(`Duplicate unit id: ${id}`);
      ids.add(id);
      if (!unit.title) throw new Error("A unit needs a title.");
      return { ...unit, id, state: state(unit.state), process: processData(unit.process) };
    });
    const selected = input.selected == null
      ? units.find(unit => unit.state === "current")?.id ?? units[0]?.id ?? null
      : String(input.selected);
    if (selected !== null && !ids.has(selected)) throw new Error("The selected unit does not exist.");
    const completed = units.filter(unit => unit.state === "done").length;
    return {
      ...input,
      units, selected, completed, total: units.length,
      percent: units.length ? Math.round(100 * completed / units.length) : 0,
      process: processData(input.process),
      next: actionData(input.next),
      explore: (input.explore ?? []).map(actionData),
      links: (input.links ?? []).map(actionData),
      decisions: decisionsData(input.decisions),
      plan: planData(input.plan)
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
    return `<span class="dashboard-action-link"><a class="dashboard-button${primary ? " dashboard-button-primary" : ""}" href="${escape(resolveLink(item.href))}"${select}>${escape(item.label || item.title || t("view"))} <span aria-hidden="true">→</span></a>${item.command ? ` <code class="dashboard-command">${escape(item.command)}</code>` : ""}</span>`;
  }

  function hero(input, viewId) {
    const next = actionData(input.next);
    return `<header class="dashboard-hero">
      <p class="dashboard-eyebrow">${escape(input.eyebrow || t("eyebrow"))}</p>
      <h2>${escape(input.title)}</h2>
      ${input.context ? `<p class="dashboard-context">${escape(input.context)}</p>` : ""}
      ${input.subtitle ? `<p class="dashboard-intro">${escape(input.subtitle)}</p>` : ""}
      ${input.notice ? `<p class="dashboard-notice">${escape(input.notice)}</p>` : ""}
      ${next ? `<div class="dashboard-next"><p><strong>${t("next")}</strong> ${escape(next.title || next.label)}</p>${next.why ? `<p class="dashboard-why"><strong>${t("why")}</strong> ${escape(next.why)}</p>` : ""}${actionLink(next, viewId, true)}</div>` : ""}
    </header>`;
  }

  function progress(completed, total, label = t("progress"), unitLabel) {
    if (!Number.isInteger(total) || !Number.isInteger(completed) || completed < 0 || total < completed) {
      throw new Error("Progress needs valid values: done / total.");
    }
    if (!total) return `<section class="dashboard-progress"><h3>${escape(label)}</h3><p>${t("progressEmpty")}</p></section>`;
    const text = unitLabel?.one && unitLabel?.many ? t("progressText", completed, total, unitLabel) : t("progressText", completed, total);
    return `<section class="dashboard-progress"><div><h3>${escape(label)}</h3><p>${text}</p></div><progress value="${completed}" max="${total}" aria-label="${text}"></progress></section>`;
  }

  function card(input) {
    return `<section class="dashboard-card"><h3>${escape(input.title)}</h3><p>${escape(input.body)}</p></section>`;
  }

  function action(input) {
    return `<article class="dashboard-action"><h4>${input.icon ? `<span aria-hidden="true">${escape(input.icon)}</span> ` : ""}${escape(input.title)}</h4><p>${escape(input.description)}</p>${actionLink(input)}</article>`;
  }

  function unit(input, selected = false, viewId) {
    const steps = input.process?.steps ?? [];
    const stepsDone = steps.filter(step => step.state === "done").length;
    const stepText = steps.length ? `<span class="dashboard-unit-steps">${t("steps", stepsDone, steps.length)}</span>` : "";
    const content = `<span class="dashboard-unit-number" aria-hidden="true">${escape(input.id)}</span><span class="dashboard-unit-content"><strong>${escape(input.title)}</strong>${status(input.state, input.statusLabel)}${stepText}${input.summary ? `<span class="dashboard-unit-summary">${escape(input.summary)}</span>` : ""}</span>`;
    if (!viewId) return `<li class="dashboard-unit-item"><article class="dashboard-unit">${content}</article></li>`;
    return `<li class="dashboard-unit-item"><button class="dashboard-unit${selected ? " dashboard-unit-selected" : ""}" type="button" data-dashboard-select="${escape(input.id)}"${selected ? ' aria-current="true"' : ""} aria-label="${escape(input.title)}: ${escape(input.statusLabel || t(`state.${state(input.state)}`))}; ${t("showProcess")}">${content}</button></li>`;
  }

  function units(input, viewId) {
    const items = input.units ?? [];
    return `<section class="dashboard-units"><h3>${escape(input.unitsTitle || t("units"))}</h3>${items.length ? `<p class="dashboard-hint">${t("unitsHint")}</p><ol class="dashboard-unit-list">${items.map(item => unit(item, item.id === input.selected, viewId)).join("")}</ol>` : (input.plan ? plan(input.plan) : `<div class="dashboard-empty"><p>${escape(input.emptyUnits || t("unitsEmpty"))}</p><p>${t("unitsEmptyNext")}</p></div>`)}</section>`;
  }

  function process(input) {
    const data = processData(input);
    return `<section class="dashboard-process" aria-live="polite"><p class="dashboard-eyebrow">${escape(data.eyebrow || t("processEyebrow"))}</p><h3>${escape(data.title || t("processTitle"))}</h3>${data.description ? `<p class="dashboard-process-description">${escape(data.description)}</p>` : ""}${data.steps.length ? `<ol class="dashboard-step-list">${data.steps.map(step => `<li class="dashboard-step dashboard-step-${step.state}"${step.state === "current" ? ' aria-current="step"' : ""}><span class="dashboard-step-marker" aria-hidden="true">${states[step.state]}</span><div><div class="dashboard-step-heading"><h4>${escape(step.title)}</h4>${status(step.state, step.statusLabel)}</div>${step.result ? `<p class="dashboard-result"><strong>${t("result")}</strong> ${escape(step.result)}</p>` : ""}${step.why ? `<p class="dashboard-step-why">${escape(step.why)}</p>` : ""}${step.next ? `<p class="dashboard-step-next"><strong>${t("nextStep")}</strong> ${escape(step.next)}</p>` : ""}</div></li>`).join("")}</ol>` : `<p class="dashboard-empty">${t("processEmpty")}</p>`}${data.note ? `<p class="dashboard-process-note">${escape(data.note)}</p>` : ""}${input.href ? `<p class="dashboard-process-link">${actionLink({ label: input.planLabel || t("plan"), href: input.href })}</p>` : ""}</section>`;
  }

  function decisionItem(item) {
    return `<li><strong>${escape(item.title)}</strong>${item.why ? ` <span class="dashboard-decision-why">${escape(item.why)}</span>` : ""}${item.how ? `<span class="dashboard-decision-how"><strong>${t("how")}</strong> ${escape(item.how)}</span>` : ""}${item.href ? ` ${actionLink(item)}` : ""}</li>`;
  }

  function decisions(items, label = t("decide")) {
    if (!items.length) return "";
    const group = kind => items.filter(item => item.kind === kind);
    const block = (list, title, css) => list.length ? `<section class="dashboard-decisions ${css}"><h3>${escape(title)}</h3><ul>${list.map(decisionItem).join("")}</ul></section>` : "";
    const internal = group("internal");
    return `${block(group("decide"), label, "dashboard-decisions-decide")}${block(group("prepare"), t("prepare"), "dashboard-decisions-prepare")}${internal.length ? `<details class="dashboard-internal"><summary>${escape(t("internal", internal.length))}</summary><ul>${internal.map(decisionItem).join("")}</ul></details>` : ""}`;
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
      ? { ...selected.process, title: selected.process.title || selected.title, href: selected.href, planLabel: null }
      : model.process;
    return `${hero(model, viewId)}${decisions(model.decisions, model.decisionsTitle)}${progress(model.completed, model.total, model.progressTitle, model.unitLabel)}<div class="dashboard-workspace">${units(model, viewId)}${process(selectedProcess)}</div>${explore(model.explore, model.exploreTitle)}${model.links.length ? `<nav class="dashboard-links" aria-label="${t("sections")}">${model.links.map(item => actionLink(item, viewId)).join("")}</nav>` : ""}${model.footer ? `<p class="dashboard-footer">${escape(model.footer)}</p>` : ""}`;
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
      Unit: () => `<ol class="dashboard-unit-list">${unit({ ...input, state: state(input.state) })}</ol>`,
      Units: () => units(buildModel(Array.isArray(input) ? { units: input } : input)),
      Process: () => process(input),
      Decisions: () => decisions(decisionsData(Array.isArray(input) ? input : input.items), input.label),
      Plan: () => plan(planData(input)),
      Explore: () => explore(Array.isArray(input) ? input.map(actionData) : (input.items ?? []).map(actionData), input.label),
      View: () => view(id, input)
    };
    try {
      if (!renderers[component]) throw new Error("Unknown dashboard component.");
      const html = renderers[component]();
      return component === "View" ? html : `<div class="lia-dashboard dashboard-component">${html}</div>`;
    } catch (error) {
      return `<div class="lia-dashboard dashboard-error" role="alert"><strong>${t("error")}</strong><p>${escape(error.message)}</p></div>`;
    }
  }

  if (global.document) {
    global.document.addEventListener("click", event => {
      const control = event.target.closest?.("[data-dashboard-select]");
      const root = control?.closest("[data-dashboard-view]");
      const id = root?.dataset.dashboardView;
      const model = views.get(id);
      const selected = control?.dataset.dashboardSelect;
      if (!model?.units.some(item => item.id === selected)) return;
      event.preventDefault();
      model.selected = selected;
      useLanguage({ lang: model.lang });
      root.innerHTML = viewContent(model, id);
      Array.from(root.querySelectorAll("button[data-dashboard-select]"))
        .find(button => button.dataset.dashboardSelect === selected)?.focus({ preventScroll: true });
    });
  }

  global.LiaDashboard = Object.freeze({
    buildModel, renderComponent, states, status, progress, hero, card,
    action, unit, units, process, explore, decisions, plan, view, parseInput
  });
  if (global.document) global.document.dispatchEvent(new CustomEvent("lia-dashboard-ready"));
})(globalThis);
