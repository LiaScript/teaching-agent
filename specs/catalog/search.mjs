// Online search for LiaScript templates that are not yet in the catalog: asks GitHub for repositories
// with the topic `liascript-template` and leaves out every repository the catalog already lists.
// Run from the course project root:
//   node specs/catalog/search.mjs [query]
// Reads specs/catalog/templates.json next to this script and templates.local.json in the current folder
// (if present) to know the listed repositories. Uses GITHUB_TOKEN from the environment when set.
// Prints {"hits": [...]} as JSON; each hit has repo, name, description, readme, stars, pushed.
// Exit code 0: search done (also with 0 hits), 2: online search not possible (network, rate limit,
// other HTTP error); a single line says why and that suggestions come from the catalog only.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "./catalog.js";

const API = "https://api.github.com/search/repositories";
const key = repo => String(repo || "").replace(/\/+$/, "").toLowerCase();

export async function searchTemplates({ query = "", fetchFn = fetch, known = [] } = {}) {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const url = `${API}?q=topic:liascript-template${query ? "+" + encodeURIComponent(query) : ""}&per_page=50`;
  let body;
  try {
    const response = await fetchFn(url, { headers });
    if (response.status === 403 || response.status === 429) return { hits: [], error: `GitHub rate limit reached (HTTP ${response.status})` };
    if (!response.ok) return { hits: [], error: `GitHub answered HTTP ${response.status}` };
    body = await response.json();
  } catch (error) {
    return { hits: [], error: error.message || String(error) };
  }
  const listed = new Set(known.map(key));
  const hits = (Array.isArray(body && body.items) ? body.items : [])
    .filter(item => item && item.html_url && !listed.has(key(item.html_url)))
    .map(item => ({
      repo: item.html_url,
      name: item.name,
      description: item.description,
      readme: `https://raw.githubusercontent.com/${item.full_name}/${item.default_branch}/README.md`,
      stars: item.stargazers_count,
      pushed: item.pushed_at
    }));
  return { hits };
}

function knownRepos() {
  const catalog = globalThis.LiaCatalog;
  const files = [[new URL("./templates.json", import.meta.url), "shared"], [resolve(process.cwd(), "templates.local.json"), "local"]];
  const repos = [];
  for (const [file, kind] of files) {
    if (!existsSync(file)) continue;
    try {
      repos.push(...catalog.normalize(JSON.parse(readFileSync(file, "utf8")), kind).entries.map(e => e.repo));
    } catch { /* a broken list only means fewer known repositories */ }
  }
  return repos;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await searchTemplates({ query: process.argv.slice(2).join(" ").trim(), known: knownRepos() });
  if (result.error) {
    console.log(`Online search not possible: ${result.error}. Suggestions come from the catalog only.`);
    process.exit(2);
  }
  console.log(JSON.stringify({ hits: result.hits }, null, 2));
}
