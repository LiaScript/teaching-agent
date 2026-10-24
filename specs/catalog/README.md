<!--
author: Teaching-Agent
version: 0.1.0
language: en
mode: Textbook
comment: Curated catalog of LiaScript templates.
script: ./catalog.js
link: ./catalog.css



@Catalog.View
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaCatalog ? Promise.resolve(window.LiaCatalog) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaCatalog); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-catalog-ready", onReady); reject(new Error("The catalog library was not loaded.")); }, 5000);
  document.addEventListener("lia-catalog-ready", onReady, {once: true});
});
runtimeReady.then(async library => {
  const course = library.courseUrl();
  const model = course ? await library.load(course) : { entries: [], problems: [], error: "No course URL." };
  send.lia("HTML: " + library.render("catalog_" + Math.random().toString(36).slice(2), model));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Catalog: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

-->

# Template Catalog

This catalog lists LiaScript templates that fit teaching projects: what each one does, which macros it offers and a demo to try. "Checked" means the import, the macros and the demo were verified against the template's README, with the date of the check.

@Catalog.View

## Adding a template

The shared list `specs/catalog/templates.json` changes only through a pull request. Templates you found or built for one project go into `templates.local.json` in the project root; their status is always `found` or `own`. An own template built in the project is listed there once it is ready to test, with its local import; publishing it as its own repository switches the entry to the repository's URLs.

## Data format

Both files hold `{ "version": 1, "templates": [ … ] }`. Each entry has these fields:

- `id`: lowercase letters, digits and single hyphens
- `name`, `description`, optional `icon` (default `🧩`) and `note`
- `import`, `repo`, `demo`: `https:` URLs — one exception: an `own` template that stays in the project (local list only) imports `./lia-templates/{id}/README.md` with its own `id`; `repo` and `demo` are optional then (`https:` when present), and its card has no "Try it" button
- `subjects`: non-empty list of lowercase kebab-case words
- `audiences`: non-empty list from `primary`, `secondary`, `vocational`, `higher-education`, `adult`
- `macros`: strings starting with `@`
- `status`: `checked` (shared list only, with `checked: YYYY-MM-DD`), `found` or `own`
- `shared` (local list only, optional): `not-offered`, `offered`, `declined` or `pull-request`

```json
{
  "id": "skulpt",
  "name": "Skulpt",
  "icon": "🐢",
  "description": "Executable Python blocks run by the Skulpt interpreter in the browser, with turtle graphics drawn on a canvas.",
  "import": "https://raw.githubusercontent.com/LiaTemplates/Skulpt/0.0.6/README.md",
  "repo": "https://github.com/LiaTemplates/Skulpt",
  "demo": "https://liascript.github.io/course/?https://raw.githubusercontent.com/LiaTemplates/Skulpt/master/README.md",
  "subjects": ["programming", "python", "turtle"],
  "audiences": ["primary", "secondary"],
  "macros": ["@Skulpt.eval"],
  "status": "checked",
  "checked": "2026-10-24",
  "note": "The turtle mode (@Skulpt.eval(skulpt_canvas) with a canvas element, as documented in the README) suits younger learners. The demo (default branch) also shows @Skulpt.terminal, which release 0.0.6 does not contain yet."
}
```
