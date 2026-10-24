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
    for (const field of ["import", "repo", "demo"]) {
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

  global.LiaCatalog = Object.freeze({ AUDIENCES, normalize, merge, filter });
})(typeof globalThis !== "undefined" ? globalThis : this);
