/* LiaScript template catalog: validate, merge and filter the template lists. Plain JavaScript; no build or dependencies. */
(function (global) {
  "use strict";
  if (global.LiaCatalog) return;

  const AUDIENCES = Object.freeze(["primary", "secondary", "vocational", "higher-education", "adult"]);
  const STATUSES = ["checked", "found", "own"];
  const SHARED_STATES = ["not-offered", "offered", "declined", "pull-request"];
  const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const DEFAULT_ICON = "🧩";

  const isText = value => typeof value === "string" && value.trim() !== "";
  const isList = value => Array.isArray(value) && value.length > 0;

  function isHttps(value) {
    if (!isText(value)) return false;
    try { return new URL(value).protocol === "https:"; } catch (error) { return false; }
  }

  function isRealDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  // Returns { entry } or { error } for one raw item; "source" decides the status rules.
  function check(raw, source) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "is not an object" };
    if (typeof raw.id !== "string" || !KEBAB.test(raw.id)) return { error: "has an invalid id (lowercase letters, digits and single hyphens)" };
    if (!isText(raw.name)) return { error: "has no name" };
    if (!isText(raw.description)) return { error: "has no description" };
    // An own template that stays in the project (local list only) imports ./lia-templates/{id}/README.md;
    // its repo and demo are optional then, but https when present. Everything else is https-only.
    const inProject = source === "local" && raw.status === "own" && raw.import === `./lia-templates/${raw.id}/README.md`;
    for (const field of ["import", "repo", "demo"]) {
      if (inProject && (field === "import" || raw[field] === undefined)) continue;
      if (!isHttps(raw[field])) return { error: `needs an https URL in "${field}"` };
    }
    if (!isList(raw.subjects) || !raw.subjects.every(s => typeof s === "string" && KEBAB.test(s))) {
      return { error: 'needs a non-empty "subjects" list of lowercase kebab-case words' };
    }
    if (!isList(raw.audiences) || !raw.audiences.every(a => AUDIENCES.includes(a))) {
      return { error: `needs a non-empty "audiences" list from: ${AUDIENCES.join(", ")}` };
    }
    if (!Array.isArray(raw.macros) || !raw.macros.every(m => typeof m === "string" && m.startsWith("@") && m.length > 1)) {
      return { error: 'needs a "macros" list of strings starting with "@"' };
    }
    if (!STATUSES.includes(raw.status)) return { error: `has an unknown status (${STATUSES.join(", ")})` };
    if (raw.icon !== undefined && !isText(raw.icon)) return { error: 'has an invalid "icon"' };
    if (raw.note !== undefined && typeof raw.note !== "string") return { error: 'has an invalid "note"' };
    if (raw.shared !== undefined && !SHARED_STATES.includes(raw.shared)) return { error: `has an unknown "shared" value (${SHARED_STATES.join(", ")})` };

    let warning = "";
    let status = raw.status;
    if (source === "shared") {
      if (status !== "checked") return { error: 'in the shared list must have status "checked"' };
      if (!isRealDate(raw.checked)) return { error: 'in the shared list needs a "checked" date (YYYY-MM-DD)' };
    } else if (status === "checked") {
      status = "found";
      warning = 'has status "checked", which only the shared list may hold; treated as "found"';
    }

    const entry = {
      ...raw,
      icon: raw.icon === undefined ? DEFAULT_ICON : raw.icon,
      subjects: [...raw.subjects],
      audiences: [...raw.audiences],
      macros: [...raw.macros],
      status,
      source
    };
    if (status !== "checked") delete entry.checked;
    return { entry, warning };
  }

  function normalize(list, source) {
    const entries = [];
    const problems = [];
    if (!list || typeof list !== "object" || Array.isArray(list) || !Array.isArray(list.templates)) {
      return { entries, problems: [`The ${source} template list has no "templates" array.`] };
    }
    const seen = new Set();
    list.templates.forEach((raw, index) => {
      const label = raw && typeof raw.id === "string" && raw.id ? `"${raw.id}"` : `#${index + 1}`;
      const result = check(raw, source);
      if (result.error) {
        problems.push(`Template ${label} (${source} list, position ${index + 1}) ${result.error}.`);
        return;
      }
      if (seen.has(result.entry.id)) {
        problems.push(`Template "${result.entry.id}" (${source} list, position ${index + 1}) appears twice; the later one is ignored.`);
        return;
      }
      seen.add(result.entry.id);
      if (result.warning) problems.push(`Template "${result.entry.id}" (${source} list, position ${index + 1}) ${result.warning}.`);
      entries.push(result.entry);
    });
    return { entries, problems };
  }

  function merge(shared, local) {
    const entries = [...shared.entries];
    const problems = [...shared.problems, ...local.problems];
    const taken = new Set(entries.map(e => e.id));
    for (const entry of local.entries) {
      if (taken.has(entry.id)) {
        problems.push(`Local template "${entry.id}" uses the id of a shared template and is ignored.`);
        continue;
      }
      taken.add(entry.id);
      entries.push(entry);
    }
    return { entries, problems };
  }

  function filter(entries, criteria = {}) {
    const query = (criteria.query || "").trim().toLowerCase();
    return entries.filter(entry => {
      if (query) {
        const haystack = [entry.id, entry.name, entry.description, ...entry.macros, ...entry.subjects].join("\n").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (criteria.subject && !entry.subjects.includes(criteria.subject)) return false;
      if (criteria.audience && !entry.audiences.includes(criteria.audience)) return false;
      if (criteria.status && entry.status !== criteria.status) return false;
      return true;
    });
  }

  const TEXT = {
    de: {
      search: "Vorlagen durchsuchen", subject: "Fach", audience: "Zielgruppe", status: "Status", all: "Alle",
      "status.checked": "✓ geprüft", "status.found": "neu gefunden, nicht geprüft", "status.own": "nur dieses Projekt",
      try: "Ausprobieren", adopt: "In meinen Kurs übernehmen",
      count: (n, total) => `${n} von ${total} Vorlagen`, empty: "Keine Vorlage passt zu dieser Suche.",
      problems: "Datenhinweise (auf Englisch)", error: "Der Katalog konnte nicht geladen werden.",
      "audience.primary": "Grundschule", "audience.secondary": "Sekundarstufe", "audience.vocational": "Berufsbildung",
      "audience.higher-education": "Hochschule", "audience.adult": "Erwachsenenbildung"
    },
    en: {
      search: "Search templates", subject: "Subject", audience: "Audience", status: "Status", all: "All",
      "status.checked": "✓ checked", "status.found": "newly found, not checked", "status.own": "this project only",
      try: "Try it", adopt: "Add to my course",
      count: (n, total) => `${n} of ${total} templates`, empty: "No template matches this search.",
      problems: "Data notes", error: "The catalog could not be loaded.",
      "audience.primary": "Primary school", "audience.secondary": "Secondary school", "audience.vocational": "Vocational training",
      "audience.higher-education": "Higher education", "audience.adult": "Adult education"
    }
  };

  const views = new Map();

  function useLanguage(lang) {
    const raw = lang || (typeof navigator !== "undefined" && navigator.language) || "";
    const code = String(raw).slice(0, 2).toLowerCase();
    return code === "de" ? "de" : "en";
  }

  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);

  const translator = lang => (key, ...args) => {
    const value = TEXT[lang][key];
    return typeof value === "function" ? value(...args) : value;
  };

  function card(entry, t) {
    const tags = [
      ...entry.subjects.map(s => `<li class="catalog-tag">${escape(s)}</li>`),
      ...entry.audiences.map(a => `<li class="catalog-tag catalog-tag-audience">${escape(t(`audience.${a}`))}</li>`)
    ].join("");
    return `<li class="catalog-card"><article>
      <h3><span class="catalog-icon" aria-hidden="true">${escape(entry.icon)}</span> ${escape(entry.name)}</h3>
      <p><span class="catalog-status catalog-status-${escape(entry.status)}">${escape(t(`status.${entry.status}`))}</span></p>
      <p class="catalog-description">${escape(entry.description)}</p>
      <ul class="catalog-tags">${tags}</ul>
      ${entry.note ? `<p class="catalog-note">${escape(entry.note)}</p>` : ""}
      <p class="catalog-macros">${entry.macros.map(m => `<code>${escape(m)}</code>`).join(" ")}</p>
      <p class="catalog-actions">${entry.demo ? `<a class="catalog-button" href="${escape(entry.demo)}" target="_blank" rel="noopener"><span aria-hidden="true">👁</span> ${escape(t("try"))}</a>
      ` : ""}<a class="catalog-button catalog-button-primary" href="agent:teaching/manage-templates?name=${encodeURIComponent(entry.id)}"><span aria-hidden="true">▶️</span> ${escape(t("adopt"))}</a>
      <code class="catalog-command">:manage-templates ${escape(entry.id)}</code></p>
    </article></li>`;
  }

  function results(entries, shown, t) {
    const list = shown.length
      ? `<ul class="catalog-grid">${shown.map(e => card(e, t)).join("")}</ul>`
      : `<p class="catalog-empty">${escape(t("empty"))}</p>`;
    return `<p class="catalog-count" aria-live="polite">${escape(t("count", shown.length, entries.length))}</p>${list}`;
  }

  function select(name, label, values, t) {
    const options = values.map(([value, text]) => `<option value="${escape(value)}">${escape(text)}</option>`).join("");
    return `<label class="catalog-field">${escape(label)}<select data-catalog-filter="${name}"><option value="">${escape(t("all"))}</option>${options}</select></label>`;
  }

  function render(id, model) {
    const lang = useLanguage(model && model.lang);
    const t = translator(lang);
    const entries = (model && model.entries) || [];
    const problems = (model && model.problems) || [];
    views.set(id, { entries, lang });
    const head = `<article class="lia-catalog" data-catalog-view="${escape(id)}">`;
    if (model && model.error) return `${head}<p class="catalog-error" role="alert">${escape(t("error"))}</p></article>`;

    const unique = list => [...new Set(list)].sort();
    const subjects = unique(entries.flatMap(e => e.subjects)).map(s => [s, s]);
    const audiences = AUDIENCES.filter(a => entries.some(e => e.audiences.includes(a))).map(a => [a, t(`audience.${a}`)]);
    const statuses = STATUSES.filter(s => entries.some(e => e.status === s)).map(s => [s, t(`status.${s}`)]);
    const notes = problems.length
      ? `<details class="catalog-problems"><summary>${escape(t("problems"))}</summary><ul>${problems.map(p => `<li>${escape(p)}</li>`).join("")}</ul></details>`
      : "";
    return `${head}<div class="catalog-filters">
      <label class="catalog-field catalog-field-search">${escape(t("search"))}<input type="search" data-catalog-filter="query" autocomplete="off"></label>
      ${select("subject", t("subject"), subjects, t)}${select("audience", t("audience"), audiences, t)}${select("status", t("status"), statuses, t)}
    </div><div data-catalog-results>${results(entries, entries, t)}</div>${notes}</article>`;
  }

  if (typeof document !== "undefined") {
    const update = event => {
      const target = event.target;
      if (!target || !target.closest) return;
      const field = target.closest("[data-catalog-filter]");
      const root = field && field.closest("[data-catalog-view]");
      const view = root && views.get(root.getAttribute("data-catalog-view"));
      if (!view) return;
      const criteria = {};
      root.querySelectorAll("[data-catalog-filter]").forEach(el => { criteria[el.getAttribute("data-catalog-filter")] = el.value; });
      const box = root.querySelector("[data-catalog-results]");
      if (box) box.innerHTML = results(view.entries, filter(view.entries, criteria), translator(view.lang));
    };
    document.addEventListener("input", update);
    document.addEventListener("change", update);
  }

  // The course URL is the search part of the page address (without the slide hash), or null.
  function courseUrl(search = global.location && global.location.search) {
    const text = String(search || "").split("#")[0].replace(/^\?/, "");
    if (!text) return null;
    try { return decodeURIComponent(text); } catch (error) { return text; }
  }

  // Loads the shared list (required) and the project list (optional) relative to the course URL.
  async function load(course, fetchFn = global.fetch) {
    const failed = error => ({ entries: [], problems: [], error });
    let sharedUrl;
    let localUrl;
    try {
      sharedUrl = new URL("templates.json", course);
      localUrl = new URL("../../templates.local.json", course);
    } catch (error) { return failed(`Invalid course URL: ${course}`); }

    let shared;
    try {
      const response = await fetchFn(sharedUrl);
      if (!response.ok) return failed(`The shared template list could not be loaded (HTTP ${response.status}).`);
      shared = normalize(await response.json(), "shared");
    } catch (error) { return failed(`The shared template list could not be loaded: ${error.message}`); }

    let local = { entries: [], problems: [] };
    let response = null;
    try { response = await fetchFn(localUrl); } catch (error) { response = null; }
    if (response && response.ok) {
      try { local = normalize(await response.json(), "local"); } catch (error) {
        local = { entries: [], problems: [`templates.local.json: ${error.message}`] };
      }
    }
    return merge(shared, local);
  }

  global.LiaCatalog = Object.freeze({ AUDIENCES, normalize, merge, filter, render, useLanguage, courseUrl, load });
  if (typeof document !== "undefined" && typeof CustomEvent !== "undefined") document.dispatchEvent(new CustomEvent("lia-catalog-ready"));
})(typeof globalThis !== "undefined" ? globalThis : this);
