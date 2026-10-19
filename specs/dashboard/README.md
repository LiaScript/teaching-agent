<!--
author: Teaching-Agent
version: 0.0.1
language: de
narrator: Deutsch Female
mode: Textbook
comment: Kleine LiaScript-Library für Übersichten, Einheiten und Arbeitsprozesse.
script: ./dashboard.js
link: ./dashboard.css



@Dashboard.View
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  const data = library.parseInput(`@'0`);
  send.lia("HTML: " + library.renderComponent("View", "dashboard_" + Math.random().toString(36).slice(2), data));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Units
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  const data = library.parseInput(`@'0`);
  send.lia("HTML: " + library.renderComponent("Units", "dashboard_" + Math.random().toString(36).slice(2), data));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Process
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  const data = library.parseInput(`@'0`);
  send.lia("HTML: " + library.renderComponent("Process", "dashboard_" + Math.random().toString(36).slice(2), data));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Explore
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  const data = library.parseInput(`@'0`);
  send.lia("HTML: " + library.renderComponent("Explore", "dashboard_" + Math.random().toString(36).slice(2), data));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Hero
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  send.lia("HTML: " + library.renderComponent("Hero", "", {title: "@'0", subtitle: "@'1", context: "@'2", next: {label: "@'3", href: "@'4", command: "@'5"}}));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Progress
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  send.lia("HTML: " + library.renderComponent("Progress", "", {completed: Number("@'0"), total: Number("@'1"), label: "@'2"}));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Card
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  send.lia("HTML: " + library.renderComponent("Card", "", {title: "@'0", body: "@'1"}));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Action
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  send.lia("HTML: " + library.renderComponent("Action", "", {icon: "@'0", title: "@'1", description: "@'2", label: "@'3", href: "@'4", command: "@'5"}));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Status
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  send.lia("HTML: " + library.renderComponent("Status", "", {state: "@'0"}));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end

@Dashboard.Unit
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error("Dashboard-Library wurde nicht geladen.")); }, 5000);
  document.addEventListener("lia-dashboard-ready", onReady, {once: true});
});
runtimeReady.then(library => {
  send.lia("HTML: " + library.renderComponent("Unit", "", {id: "@'0", title: "@'1", state: "@'2"}));
  send.lia("LIA: stop");
})
.catch(error => { send.lia("Dashboard: " + error.message); send.lia("LIA: stop"); });
"LIA: wait"
</script>
@end
-->


# Dashboard

Diese Library stellt acht Komponenten bereit: **Hero, Progress, Card, Action, Status, Units, Process und Explore**. `Unit` ist ein Unter-Makro; `View` setzt die Komponenten zu einer gemeinsamen Übersicht zusammen.

CSS und JavaScript liegen neben dieser Datei. Es gibt keine externen Bibliotheken und keinen Build-Schritt. Der Interpreter lädt beide Dateien über den Template-Import.

Einbinden, wenn das Template im Projektordner `dashboard/` liegt:

```markdown
<!--
import: ./dashboard/README.md
-->
```

Alle Inhalte sind Beispiele. Makros zeigen übergebene Daten; sie entscheiden nicht, ob ein Kurs didaktisch vollständig oder zur Veröffentlichung freigegeben ist.

## Zusammengesetzte Übersicht

`Dashboard.View` übernimmt einen JSON-Datensatz als letzten Codeblock-Parameter. Der Renderer berechnet erledigte Einheiten und Gesamtzahl **aus der Einheitenliste**. Frei übergebene Zähler werden ignoriert.

```json @Dashboard.View
{
  "title": "Datenbanken verstehen",
  "subtitle": "Dein Kurs nimmt Form an.",
  "context": "Darstellungsbeispiel · drei fiktive Einheiten",
  "next": {"title": "Den SQL-Entwurf gemeinsam durchsehen", "why": "So stimmen wir die Aufgaben auf die Zielgruppe ab.", "label": "Möglichkeiten ansehen", "href": "agent:teaching/help", "command": ":help"},
  "process": {"title": "Kursplanung", "steps": [
    {"title": "Lernziele und Ablauf", "state": "done", "result": "Drei Einheiten sind geplant."},
    {"title": "Einheiten ausarbeiten", "state": "current", "why": "Jede Einheit bekommt Material, das zu den Zielen passt."},
    {"title": "Kurs prüfen und veröffentlichen", "state": "planned", "why": "Erst eine bestandene Gesamtprüfung gibt den Kurs frei."}
  ]},
  "units": [
    {"id": 1, "title": "Einführung", "state": "done"},
    {"id": 2, "title": "Datenmodelle", "state": "done"},
    {"id": 3, "title": "SQL", "state": "current", "process": {"steps": [
      {"title": "Lernziele klären", "state": "done", "result": "Einfache Abfragen mit SELECT und WHERE.", "why": "Die Ziele geben den Aufgaben eine klare Richtung."},
      {"title": "Aufgaben durchsehen", "state": "current", "why": "Du kennst den Lernstand deiner Zielgruppe.", "next": "Welche Aufgabe braucht eine zusätzliche Hilfe?"},
      {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Wir gleichen Aufgaben und Lernziele ab."}
    ]}}
  ]
}
```

Wähle eine Einheit. Die Prozessanzeige und Auswahl ändern sich; die übergebenen Zustände und der Gesamtfortschritt bleiben erhalten. Ohne detaillierte Prozessdaten erscheint ein verständlicher Hinweis.

Enthält der Datensatz einen globalen `process`, steht über den Einheiten der Eintrag **Gesamter Kurs**. Er zeigt wieder den Ablauf des ganzen Kurses; von dort wechselst du mit einem Klick zurück in eine Einheit. `"selected": ""` öffnet die Übersicht direkt mit dieser Kursansicht.

## Hero

Parameter: `Titel, Beschreibung, Rahmen, Aktionslabel, Link, lesbarer Befehl`.

@Dashboard.Hero(Datenbanken verstehen, Dein Kurs nimmt Form an., Fiktives Beispiel, Möglichkeiten ansehen, agent:teaching/help, :help)

Bei `agent:`-Links ist der lesbare Befehl erforderlich. Normale Links verwenden im letzten Parameter ein leeres Argument. Die ausführliche Begründung der nächsten Aktion wird in `Dashboard.View` über `next.why` übergeben.

## Progress

Parameter: `erledigt, gesamt, Beschriftung`.

@Dashboard.Progress(2, 6, Fortschritt der Materialien)

@Dashboard.Progress(0, 0, Noch am Anfang)

Ein Entwurf oder eine laufende Durchsicht zählt nicht als abgeschlossen. Bei null Einheiten erscheint keine irreführende Prozentanzeige.

## Status

Zustände: `planned`, `current`, `draft`, `review`, `revision`, `done`, `optional`.

@Dashboard.Status(planned)

@Dashboard.Status(current)

@Dashboard.Status(draft)

@Dashboard.Status(review)

@Dashboard.Status(revision)

@Dashboard.Status(done)

@Dashboard.Status(optional)

Jeder Zustand hat einen Text und ein Symbol. `statusLabel` kann in Datensätzen eine passende Beschriftung ergänzen, etwa „Als Beispiel eingetragen“.

## Units

Eine JSON-Liste zeigt mehrere Einheiten. In `Dashboard.View` sind die Einheiten auswählbar. Als einzelnes Makro ist die Übersicht statisch.

```json @Dashboard.Units
[
  {"id": 1, "title": "Einführung", "state": "done"},
  {"id": 2, "title": "Datenmodelle", "state": "review"},
  {"id": 3, "title": "SQL", "state": "planned"}
]
```

Eine einzelne Einheit:

@Dashboard.Unit(3, SQL, current)

## Process

Jeder Schritt hat `title` und `state`; `why`, `result`, `next` und `statusLabel` sind optionale Erläuterungen. Der aufrufende Agent liefert die fachlichen Gründe und Belege.

```json @Dashboard.Process
{
  "title": "Material für eine Unterrichtsstunde",
  "steps": [
    {"title": "Lernziele klären", "state": "done", "result": "Drei Ziele sind abgestimmt.", "why": "Sie geben dem Material eine klare Richtung."},
    {"title": "Aufgaben entwickeln", "state": "current", "why": "Die Kinder sollen die Ziele aktiv erarbeiten.", "next": "Eine Aufgabe zum Vergleichen formulieren."},
    {"title": "Durchsehen", "state": "planned", "why": "Du prüfst, ob die Aufgaben zu deiner Klasse passen."}
  ],
  "note": "Rückmeldungen können zu einer erneuten Überarbeitung führen."
}
```

## Card und Action

`Card(Titel, Text)` und `Action(Symbol, Titel, Beschreibung, Aktionslabel, Link, Befehl)` stellen zusätzliche Hinweise oder Möglichkeiten dar. Texte werden als Text behandelt, nicht als frei eingefügtes HTML.

@Dashboard.Card(Bisher festgehalten, Drei Lernziele liegen als Entwurf vor.)

@Dashboard.Action(🎓, Unterstützung, Welche Möglichkeiten gibt es?, Ansehen, agent:teaching/help, :help)

Parameter mit Kommas in Backticks einschließen:

@Dashboard.Card(`Texte, Zahlen und Zustände`, `Ein gemeinsamer Datensatz hält die Angaben konsistent.`)

## Explore

Zusätzliche Aktionen erscheinen aufklappbar. Eine leere Liste erzeugt keinen unnötigen Bereich.

```json @Dashboard.Explore
[
  {"icon": "🎓", "title": "Unterstützung", "description": "Möglichkeiten für die Unterrichtsplanung ansehen.", "label": "Ansehen", "href": "agent:teaching/help", "command": ":help"}
]
```

## Daten und Grenzen

1. Die Fachanwendung liefert Zustände, Gründe und zulässige Aktionen. Die Library kennt keine Teaching-Agent-Voraussetzungen oder Veröffentlichungsfreigaben.
2. `Dashboard.View` hält Zähler, Fortschrittsanzeige und Auswahl konsistent. Unbekannte Zustände und doppelte Einheiten-IDs erzeugen einen sichtbaren Datenhinweis.
3. Eine Auswahl verändert ausschließlich die Ansicht. Es gibt keine Schreibzugriffe auf Journal, Materialien oder Lernfortschritt.
4. Lokale CSS-Variablen, responsives Layout und ein dunkles Farbschema sind enthalten. Eine Anpassung an manuell gewählte LiaScript-Themes ist ein späterer Schritt.
5. Die Oberfläche verwendet zunächst deutsche Standardbeschriftungen. Titel, Gründe und mehrere Bereichsbeschriftungen kommen aus den Daten.

Für eine spätere öffentliche Distribution sollen sowohl ein fester Tag/Commit als auch die aktuelle Entwicklungsfassung angeboten werden. Der Prototyp wird zunächst lokal importiert.

## Implementierung

Die Makros stehen im ersten Metadatenkommentar dieser Datei; Darstellung und Datennormalisierung in `dashboard.js`, Gestaltung in `dashboard.css`.

```markdown
script: ./dashboard.js
link: ./dashboard.css

@Dashboard.View wird an den JSON-Codeblock angehängt.
```

Modellprüfungen: `node specs/dashboard/check.mjs` aus dem Projektordner. Den Dashboard-Datensatz in `journal.md` prüft `node specs/dashboard/validate-journal.mjs` (auch alle `#`-Links gegen die echten LiaScript-Anker – vollständiger Überschriftentext, klein, Leerzeichen → „-“, Satzzeichen bleiben – und rohe Platzhalter in sichtbaren Befehlen). Geschrieben wird der Block nur mit `node specs/dashboard/write-dashboard.mjs <entwurf.json>`: Entwurf prüfen, Block in einem Schreibvorgang ersetzen, danach validieren.

Optionale Felder für die Kursterminologie: `unitsTitle` (Überschrift der Einheitenliste) und `unitLabel: {one, many}` (Wörter in der Fortschrittszeile, z. B. „1 von 4 Kapiteln“). Die Browserprüfung (`check-browser.mjs`) braucht feste Testdaten (leeres und gefülltes Journal) und gehört deshalb zum Testaufbau, nicht in `specs/`.
