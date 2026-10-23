<!--
author: Teaching-Agent
version: 0.0.1
language: de
narrator: Deutsch Female
mode: Textbook
comment: Kleine LiaScript-Bibliothek für Übersichten, Einheiten und Arbeitsprozesse.
script: ./dashboard.js
link: ./dashboard.css



@Dashboard.View
<script run-once modify="false" style="display:block">
const runtimeReady = window.LiaDashboard ? Promise.resolve(window.LiaDashboard) : new Promise((resolve, reject) => {
  const onReady = () => { clearTimeout(timeout); resolve(window.LiaDashboard); };
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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
  const timeout = setTimeout(() => { document.removeEventListener("lia-dashboard-ready", onReady); reject(new Error(String(document.documentElement.lang).startsWith("de") ? "Die Dashboard-Bibliothek wurde nicht geladen." : "The dashboard library was not loaded.")); }, 5000);
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

Diese Bibliothek stellt acht Komponenten bereit: **Hero, Progress, Card, Action, Status, Units, Process und Explore**. `Unit` ist ein Unter-Makro; `View` setzt die Komponenten zu einer gemeinsamen Übersicht zusammen.

CSS und JavaScript liegen neben dieser Datei. Sie braucht keine weiteren Bibliotheken und keinen Build-Schritt. Der Interpreter lädt beide Dateien über den Template-Import.

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
  "subtitle": "Ihr Kurs nimmt Form an.",
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
      {"title": "Aufgaben durchsehen", "state": "current", "why": "Sie kennen den Lernstand Ihrer Zielgruppe.", "next": "Welche Aufgabe braucht eine zusätzliche Hilfe?"},
      {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Wir gleichen Aufgaben und Lernziele ab."}
    ]}}
  ]
}
```

Wählen Sie eine Einheit. Die Prozessanzeige und Auswahl ändern sich; die übergebenen Zustände und der Gesamtfortschritt bleiben erhalten. Hat eine Einheit noch keine Arbeitsschritte, zeigt die Prozessanzeige ihren Zustand, ihre `summary` und den Text `processEmpty` („Für diese Einheit sind noch keine Arbeitsschritte eingetragen.“). Fehlt auch der globale Prozess, steht dort `courseProcessEmpty`.

Enthält der Datensatz einen globalen `process`, steht über den Einheiten der Eintrag **Gesamter Kurs**. Er zeigt wieder den Ablauf des ganzen Kurses; von dort wechseln Sie mit einem Klick zurück in eine Einheit. `"selected": ""` öffnet die Übersicht direkt mit dieser Kursansicht. Sein Zähler heißt „2 von 6 Planungsschritten“ (`courseSteps`) und zählt nur Pflichtschritte: Schritte im Zustand `optional` (etwa das Veröffentlichen) bleiben außen vor, ebenso in den Schrittzählern der Einheitenkarten. Solange ein Kursschritt `current` ist und mindestens ein Pflichtschritt einer Einheit `done`, bekommt der Zähler einen Teilwert aus den Einheiten: „4 von 6 Planungsschritten · Material: 1 von 12 Schritten“ (`courseStepsMaterial`: erledigte Pflichtschritte aller Einheiten / alle Pflichtschritte der Einheiten). So bleibt er in der langen Materialphase nicht stehen; neue Daten braucht das nicht.

Die Fortschrittszeile nennt ihren Gegenstand: Die Überschrift ist „Fertige {unitsTitle}“ („Fertige Lerneinheiten“; englisch „{unitsTitle} finished“, ohne `unitsTitle` aus `unitLabel.many`), außer `progressTitle` oder `labels.progress` geben sie vor. Die Leiste erscheint erst, wenn mindestens eine Einheit `done` ist. Bis dahin steht ein Satz an ihrer Stelle:

- Hat noch nichts begonnen (keine Einheit über `planned`, kein Pflichtschritt über `planned`): „Noch nichts fertig – das Material beginnt mit Lerneinheit 1.“ (`progressStart`, Wort aus `unitLabel.one`, Nummer aus der `id` der ersten Einheit).
- Hat eine Einheit begonnen: „Noch nichts fertig – Lerneinheit 1 ist in Arbeit (1 von 3 Schritten).“ (`progressStarted`). Genannt wird die erste Einheit, die über `planned` hinaus ist oder einen Pflichtschritt über `planned` hat, mit ihren erledigten und allen Pflichtschritten. Hat sie keine Arbeitsschritte, bleibt es beim Satz `progressStart` mit ihrer Nummer.

So steht nach dem ersten Speichern nie „0 von 4 … abgeschlossen“ mit leerer Leiste da, und nie stehen zwei Zahlen ohne Gegenstand nebeneinander.

Ist eine Einheit schon mit den Lernenden nutzbar (`usable` mit `yes` oder `limited`), aber noch nicht `done`, entmutigt die Zeile nicht: Statt „Noch nichts fertig …“ steht „Fertig geprüft: noch keine · Schon nutzbar: Lerneinheit 2 (mit Einschränkungen)“ (`checkedNone`, `usableUnits`, `usableLimitedShort`; englisch „Fully checked: none yet · Usable now: unit 2 (with limits)“). Gibt es schon eine fertige Einheit, bleibt die Leiste, und „Schon nutzbar: …“ folgt als zweite Zeile.

### Nutzbar und Lernendenansicht

Eine Einheitenkarte ordnet ihre drei Maße in einer festen Reihenfolge: (1) **nutzbar mit den Lernenden** (`usable`), (2) **offene Punkte** (der Zustandschip mit `statusLabel`), (3) **Arbeitsschritte** (der Zähler).

- `usable`: `{"state": "yes" | "limited" | "no", "missing": ["1 Foto", "kurze Nachprüfung"]}` – die Pflichtzeile „Jetzt mit den Lernenden nutzbar“ des Prüfberichts. Die Karte beginnt damit: „Mit den Lernenden nutzbar: ja, mit Einschränkungen – es fehlt noch: 1 Foto, kurze Nachprüfung“ (`usable.yes`, `usable.limited`, `usable.no`, `usableMissing`). Die Prozessanzeige der gewählten Einheit wiederholt die Zeile oben. `missing` ist Pflicht außer bei `yes`; bei `yes` darf nichts fehlen.
- `view`: `{"href": "agent:teaching/preview?file=1", "command": ":preview 1", "label"?}` – das Material so, wie die Lernenden es sehen. Es erscheint als eigener 👁-Knopf unter der Karte und in der Prozessanzeige vor „Planung ansehen“ (Beschriftung `viewMaterial`, „So sehen es die Lernenden“; `label` nur für das eigene Wort des Kurses, etwa „So sehen es die Teilnehmenden“).
- Der Planungslink (`href` der Einheit) heißt immer „Planung ansehen“ (`plan`, englisch „See planning“). Ein Feld `planLabel` gibt es nicht; `validate-journal.mjs` warnt, wenn `labels.plan` in Deutsch oder Englisch gesetzt ist.

```json @Dashboard.View
{
  "title": "Nutzbar zuerst",
  "context": "Darstellungsbeispiel · zwei fiktive Einheiten",
  "unitLabel": {"one": "Einheit", "many": "Einheiten"},
  "units": [
    {"id": 1, "title": "Grundbegriffe", "state": "revision", "statusLabel": "Prüfung: Korrektur nötig: 1 von 3 Punkten offen – 2 Punkte seither geändert – kurze Nachprüfung offen", "href": "#dashboard",
     "usable": {"state": "no", "missing": ["eine lösbare Aufgabe auf „Begriffe ordnen“"]},
     "view": {"href": "agent:teaching/preview?file=1", "command": ":preview 1"},
     "process": {"steps": [{"title": "Material", "state": "done"}, {"title": "Prüfen", "state": "revision"}]}},
    {"id": 2, "title": "Anwendungen", "state": "review", "statusLabel": "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen", "href": "#dashboard",
     "usable": {"state": "limited", "missing": ["1 Foto", "kurze Nachprüfung"]},
     "view": {"href": "agent:teaching/preview?file=2", "command": ":preview 2"},
     "process": {"steps": [{"title": "Material", "state": "done"}, {"title": "Prüfen", "state": "review"}]}}
  ]
}
```

## Hero

Parameter: `Titel, Beschreibung, Kontext, Beschriftung, Link, lesbarer Befehl`.

@Dashboard.Hero(Datenbanken verstehen, Ihr Kurs nimmt Form an., Fiktives Beispiel, Möglichkeiten ansehen, agent:teaching/help, :help)

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

Eine Einheitenkarte leitet eine Beschriftung ab: Ist die Einheit noch `planned`, aber mindestens ein Pflichtschritt (nicht `optional`) `done`, und fehlt `statusLabel`, steht dort „Angefangen“ (`state.started`, englisch „Started“) statt „Noch offen“. So widerspricht der Chip nie dem eigenen Schrittzähler („1 von 3 Schritten“). Der Zustand in den Daten bleibt `planned`; ein eigenes `statusLabel` hat Vorrang.

Ebenso leitet ein Prozessschritt im Zustand `review` ohne eigenes `statusLabel` „Wartet auf: {Schritt}“ ab (`state.waiting`, englisch „Waiting for: {step}“), solange ein früherer Pflichtschritt nicht `done` ist. So zeigt eine Nachprüfung, die auf eingefügte Bilder wartet, nicht „Zur Durchsicht“. `revision` heißt „Korrektur nötig“ (englisch „Correction needed“) und klingt nicht nach einer Note.

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
    {"title": "Durchsehen", "state": "planned", "why": "Sie prüfen, ob die Aufgaben zu Ihrer Klasse passen."}
  ],
  "note": "Rückmeldungen können zu einer erneuten Überarbeitung führen."
}
```

## Card und Action

`Card(Titel, Text)` und `Action(Symbol, Titel, Beschreibung, Beschriftung, Link, Befehl)` stellen zusätzliche Hinweise oder Möglichkeiten dar. Das Symbol steht im Button vor der Beschriftung; in `Dashboard.View` übernehmen `next`, `decisions` und `explore` es aus dem Feld `icon`. Ohne Symbol zeigt ein `agent:`-Button `▶️`, ein Abschnittslink (`#…`) bleibt ohne Symbol. Texte werden als Text behandelt, nicht als frei eingefügtes HTML.

In `decisions` wird nur ein `agent:`-Link zum Button. Jeder andere Link (etwa ein Abschnittsanker `#…`) springt nur zu einer Stelle und erscheint deshalb als schlichter Textlink. Seine Beschriftung kommt aus `label` und nennt das Ziel („Gliederung ansehen“); ohne `label` steht der feste Text `more` („Mehr dazu“), nie die offene Frage. `validate-journal.mjs` verlangt `label`, sobald `href` gesetzt ist, und meldet `explore`-Buttons mit dem Symbol von `next`.

Herkunft: Ein offener Punkt, den die Prüfung einer Einheit gefunden hat, trägt `"source": {"check": 1, "date": "2026-10-23"}` (`check`: Nummer der Einheit, muss es in `units` geben; `date` optional). Hinter dem Titel steht dann ein kleines Etikett „aus der Prüfung vom 23.10.2026“ (`fromCheckOn`, ohne Datum `fromCheck`; ein ISO-Datum erscheint auf Deutsch als TT.MM.JJJJ). Ein Link dieses Punkts zeigt auf die Berichtsüberschrift der Einheit `check`, nicht auf die Einheit (`validate-journal.mjs` prüft das). Andere Felder in `source` sind ein Datenfehler.

Gruppentitel: „Noch zu entscheiden“ (`decide`, Datenfeld `decisionsTitle`) und „Vor dem Einsatz vorbereiten“ (`prepare`, Datenfeld `prepareTitle`) lassen sich über `labels.decide` und `labels.prepare` setzen. `validate-journal.mjs` (und damit `write-dashboard.mjs`) gibt die sichtbaren Titel in der Kurssprache mit der Zahl ihrer Einträge aus, dazu die sichtbaren Zustandstexte:

```text
Groups (as shown): "Noch zu entscheiden" 3 (2 aus der Prüfung) · "Vor dem Einsatz vorbereiten" 1
States (as shown): "In Arbeit" · "Abgeschlossen" · "Wartet auf: Bilder einfügen"
```

Hat eine Einheit `usable`, folgt `Usable (as shown): 1 "Mit den Lernenden nutzbar: …"`. Ein Agent nennt Gruppen, Zustände und Nutzbarkeit mit genau diesen Worten. `LiaDashboard.visibleTexts(data, lang)` liefert dieselben Angaben als Objekt (dazu `viewMaterial` und `plan`).

@Dashboard.Card(Bisher festgehalten, Drei Lernziele liegen als Entwurf vor.)

@Dashboard.Action(💬, Unterstützung, Welche Möglichkeiten gibt es?, Ansehen, agent:teaching/help, :help)

Parameter mit Kommas in Backticks einschließen:

@Dashboard.Card(`Texte, Zahlen und Zustände`, `Ein gemeinsamer Datensatz hält die Angaben konsistent.`)

## Explore

Zusätzliche Aktionen erscheinen aufklappbar. Eine leere Liste erzeugt keinen unnötigen Bereich.

```json @Dashboard.Explore
[
  {"icon": "💬", "title": "Unterstützung", "description": "Möglichkeiten für die Unterrichtsplanung ansehen.", "label": "Ansehen", "href": "agent:teaching/help", "command": ":help"}
]
```

## Daten und Grenzen

1. Die Fachanwendung liefert Zustände, Gründe und zulässige Aktionen. Die Bibliothek kennt keine Teaching-Agent-Voraussetzungen oder Veröffentlichungsfreigaben.
2. `Dashboard.View` hält Zähler, Fortschrittsanzeige und Auswahl konsistent. Unbekannte Zustände und doppelte Einheiten-IDs erzeugen einen sichtbaren Datenhinweis.
3. Eine Auswahl verändert ausschließlich die Ansicht. Es gibt keine Schreibzugriffe auf Journal, Materialien oder Lernfortschritt.
4. Lokale CSS-Variablen, responsives Layout und ein dunkles Farbschema sind enthalten. Eine Anpassung an manuell gewählte LiaScript-Themes ist ein späterer Schritt.
5. Feste Beschriftungen sind auf Deutsch und Englisch eingebaut (Sprache aus `lang`, sonst aus dem `lang` der Seite, Rückfall: Englisch). Für jede andere Sprache liefert das Feld `labels` die Beschriftungen. Titel, Gründe und mehrere Bereichsbeschriftungen kommen aus den Daten.

Für eine spätere Veröffentlichung sollen sowohl ein fester Tag/Commit als auch die aktuelle Entwicklungsfassung angeboten werden. Der Prototyp wird zunächst lokal importiert.

## Implementierung

Die Makros stehen im ersten Metadatenkommentar dieser Datei; Darstellung und Datennormalisierung in `dashboard.js`, Gestaltung in `dashboard.css`.

```markdown
script: ./dashboard.js
link: ./dashboard.css

@Dashboard.View wird an den JSON-Codeblock angehängt.
```

Modellprüfungen: `node specs/dashboard/check.mjs` aus dem Projektordner. Den Dashboard-Datensatz in `journal.md` prüft `node specs/dashboard/validate-journal.mjs` (auch alle `#`-Links gegen die echten LiaScript-Anker – vollständiger Überschriftentext, in Kleinbuchstaben, Leerzeichen → „-“, Satzzeichen bleiben – und rohe Platzhalter in sichtbaren Befehlen). Geschrieben wird der Block nur mit `node specs/dashboard/write-dashboard.mjs <draft.json>`: Entwurf prüfen, Block in einem Schreibvorgang ersetzen, danach validieren.

Schreibbudget: `write-dashboard.mjs`, `localize-journal.mjs` und `migrate-journal.mjs` tragen jeden Schreibvorgang in `.cache/writes.json` ein (Modul `write-count.mjs`) und warnen ab dem 6. Schreibvorgang innerhalb von 10 Minuten, denn jeder Schreibvorgang lädt die Vorschau neu und setzt die Quizantworten zurück. Schreibvorgänge mit dem Edit-Werkzeug zählt der Zähler nicht.

Ältere Journale: Ein Journal aus einer älteren Vorlage zeigt in nicht ausgefüllten Abschnitten noch `{{…}}`-Gerüste oder Prüfberichte unter `#### Validation Report`. `validate-journal.mjs` meldet das als „older journal layout“. `node specs/dashboard/migrate-journal.mjs --check` listet die Änderungen, ohne zu schreiben. Ohne `--check` setzt das Skript die Darstellung auf den aktuellen Stand, nur die Darstellung, nie Inhalte:
- Leere Abschnitte bekommen die Einzeiler der aktuellen Vorlage, in der Kurssprache aus dem Sprachpaket. Die Überschrift bleibt, wie sie ist.
- Ein Platzhalter im Titel wird zum neutralen Titel, die Fußzeile des Dashboards verliert ihren Datumsplatzhalter.
- Prüfberichte bekommen die Überschrift „Prüfbericht – {Einheitenwort} {n}“ mit `<section data-key="validation-report">` direkt darunter; eine Überschrift, die noch innerhalb ihres `<section>` stand, kommt davor.

Abschnitte, in denen ausgefüllte Zeilen neben `{{…}}`-Zeilen stehen, lässt es unverändert und nennt sie unter „Left for you“ (Exit 2). Die Lehrkraft bestätigt die Migration vorher (`tasks/update-dashboard.md` Schritt 9). Gegen Rückschritte prüft `check.mjs` die Migration an `fixtures/journal-84484ae.md`, dem leeren Journal vor der Umstellung.

`validate-journal.mjs` prüft außerdem den Ablaufplan gegen die Übersicht: Zeilen der Einheitentabelle werden an der Nummer erkannt (`| 1 |`, auch `| 1. |` und `| 1\. |`). Hat `## Agenda` eine Tabelle ohne erkennbare Nummernzeilen, meldet es „agenda table found, but no numbered rows recognised“ statt eines fehlenden Ablaufplans. Hat eine Einheit `process.steps` und eine andere nicht, ist das ein Fehler: Jede Einheit bekommt von Anfang an dieselben Materialschritte, eine noch nicht begonnene mit allen Schritten `planned`. Plant `## Agenda` Einheiten, während der Einzeiler unter `## Sessions` noch sagt, sie entstünden erst nach der Didaktik (Vorlage oder Sprachpaket `specs/templates/i18n/*.json` → `unitLines`, Einheitenwort darf ersetzt sein), wird auch das gemeldet.

Unter „Warnings:“ nennt `validate-journal.mjs` wahrscheinliche Widersprüche, die den Exit-Code nicht ändern:

- Eine Einheit hat `href` (also ihren Abschnitt), ist aber `planned` ohne `statusLabel`.
- Der Einzeiler unter `## Sessions` sagt, die Einheiten entstünden nacheinander „beginnend mit“ / „starting with“ einer Einheit (die genannte Nummer, sonst die erste), obwohl deren `### {n}.`-Abschnitt schon existiert.
- `next` gehört zu einer Einheit (`agent:`-Link mit `number=n`), aber `next.title` enthält nicht den Titel ihres aktuellen Schritts, oder `next.label` nennt keines seiner Wörter. Den Kursschritt zeigt die Prozessleiste; andere Arbeit in derselben Einheit bekommt einen eigenen Schritt statt eines neuen Etiketts.
- `statusLabel` oder die Statuszeile `{n}. {Titel} – {Status}` unter `## Sessions` sagt „fertig/abgeschlossen/erledigt“ bzw. „finished/ready/complete/done“ (nicht verneint), obwohl der Validierungsbericht der Einheit kein `__Result:__ PASS` hat.
- Eine Einheit hat in der Tabelle Material ✅ und ist dokumentiert freigegeben („freigegeben“, „bestätigt“, „approved“, „confirmed“ in `summary`, im Ergebnis des Materialschritts oder im `### {n}.`-Abschnitt), ihr Materialschritt (Titel mit „Materi…“) ist aber nicht `done` und kein Prüfergebnis (FAIL, „with concerns“) hat ihn zurückgesetzt.
- Ein `#`-Link in einer Aktionszeile zeigt auf eine Überschrift in einem `<section>`-Block oder auf gar keine. LiaScript macht daraus keine Folie und öffnet Folie 1; verlinkt wird die umgebende `##`-Überschrift, der Unterabschnitt steht im Text. Derselbe Link in den Dashboard-Daten ist ein Fehler.
- Ein offener Punkt ohne `source` hat ein `label` mit „Bericht“/„report“, sein `#`-Link zeigt aber auf keine Berichtsüberschrift.
- Eine Einheit hat einen Prüfbericht, aber kein `usable`, oder `usable.state` widerspricht der Zeile „Jetzt mit den Lernenden nutzbar“ des Berichts (erkannt an „yes / yes, with limits / not yet“ und an `terms.usableYes`, `usableLimited`, `usableNo` der Sprachpakete).
- Eine Einheit hat in der Tabelle Material ✅, aber kein `view`, oder ihre Aktionszeile unter `### {n}.` hat keinen `preview`-Link (die Lernendenansicht steht nicht nur in den technischen Einstellungen). `labels.plan` ist in Deutsch oder Englisch gesetzt (der Planungslink behält seinen Namen).
- Ein veralteter Wortlaut im Ergebnis eines Berichts, in einer Statuszeile, einem `statusLabel` oder einer Notes-Zelle: ein Schrittname als Subjekt („… still follows“ / „… folgt noch“), „revised“ / „überarbeitet“, eine Nachprüfung ohne „short“ / „kurze“, nach Änderungen „correction needed ({n})“ statt der offenen Punkte. Die Muster stehen englisch im Skript und je Sprachpaket unter `outdatedTerms`. Die Warnung empfiehlt den aktuellen Wortlaut aus `terms` (bzw. `templates/session-validation.yaml` → `outcome_words`), nie den alten des Berichts; der Abgleich Statuszeile ↔ Bericht entfällt dann für diese Einheit.
- Ein nummerierter Listenpunkt beginnt mit einem Datum („1. 23.10.2026: …“ wird als „1.23.10. 2026“ gezeigt). Entscheidungen stehen als `- **23.10.2026:** …`.
- Ein Text der Übersicht (`subtitle`, `notice`, `next.title`, `next.why`, `summary`, `statusLabel`, `result`/`why`/`next` der Schritte) nennt eine Zahl von Punkten („zwei kleine Punkte“, „die beiden Punkte“, „3 decisions“), die nicht zur Gruppe passt: Steht der Gruppentitel im selben Satz, zählt diese Gruppe; ist von der Prüfung die Rede und haben Punkte `source`, zählen diese; sonst muss die Zahl einer Gruppe, beiden zusammen oder den Punkten aus der Prüfung entsprechen. „{offen} von {n} Punkten offen“ zählt die Punkte eines Berichts und bleibt außen vor. Besser: die Punkte mit ihren Titeln nennen.

Prüfberichte erkennt `validate-journal.mjs` an `<section data-key="validation-report">` direkt unter einer `####`-Überschrift in der Kurssprache (etwa `#### Prüfbericht – Lerneinheit 1`); ältere Journale mit `#### Validation Report …` gelten weiter. Alle Berichtsprüfungen (Überschrift nicht in `<section>`, sichtbare Zusammenfassung mit `<details>`, keine Zeilennummern, „Done ✅“ nur mit `__Result:__ PASS`, kein ⏳) gelten für beide Formen. Fehler sind außerdem: dieselbe Berichtsüberschrift zweimal (der Anker wäre mehrdeutig) und ein Punkt mit `source.check` n, dessen `#`-Link nicht auf den Bericht von Einheit n zeigt, oder dessen Einheit keinen Bericht hat.

Links und Bildeinträge prüft `validate-journal.mjs` wie das Material: Ein Link- oder Bildziel oder eine bloße URL mit unkodierter `(`, `)` oder Leerzeichen ist ein Fehler mit Zeile und nächster Überschrift (Codeblöcke und Kommentare ausgenommen). Für Einträge in `#### Images` (`<section>` mit `__Status:__`, `tasks/create-image.md`) gilt: `inserted` braucht `__File:__` und `__Alt text:__`, bei `__Source:__ free-photo` zusätzlich `__Author:__`, `__License:__` und `__Page:__`; `generated` braucht `__File:__`; `candidate` braucht mindestens eine Zeile unter `__Candidates:__`. Fehlt etwas, ist das ein Fehler. Als Warnung folgt der Abgleich mit dem Material (single-file: `README.md` für alle Einheiten, multi-file: `materials/<Nummer>-…/README.md`): Die Datei jedes `inserted`- oder `generated`-Eintrags steht im Material (Kodierung egal), und die Zahl der offenen Einträge (`wanted`, `candidate`, `selected`, `prompt-ready`) gleicht der Zahl der Bildplatzhalter, die `check-material.mjs` findet.

Gibt es noch keine Einheiten, aber eine vorläufige Planung (`plan`), sagt die Fortschrittszeile nicht „sobald Einheiten angelegt sind“, sondern verwendet den eigenen Text `progressPlan` („Die Einheiten sind erst vorläufig geplant …“). Ein Prozessergebnis (`result`) beginnt ohne eigenes Statuswort wie „Gespeichert:“, denn die Bibliothek setzt `result` („Liegt vor:“) davor; `validate-journal.mjs` meldet solche Doppelungen.

Optionale Felder für die Kursterminologie: `unitsTitle` (Überschrift der Einheitenliste) und `unitLabel: {one, many}` (Wörter in der Fortschrittszeile, z. B. „1 von 4 Kapiteln ist abgeschlossen“). `many` steht in der Form nach „von“, also im Dativ Plural: `{"one": "Kapitel", "many": "Kapiteln"}`, `{"one": "Modul", "many": "Modulen"}`.

Optionales Feld `labels` für Kurssprachen ohne eingebaute Beschriftungen: ein Objekt, das feste Texte nach Schlüssel ersetzt. Fehlende Schlüssel fallen auf die eingebaute Sprache zurück. Ein spezielleres Datenfeld (`eyebrow`, `unitsTitle`, `progressTitle`, `decisionsTitle`, `prepareTitle`, `exploreTitle`, `courseLabel`, `emptyUnits`) hat Vorrang vor `labels`.

- Einfache Texte: `state.planned`, `state.current`, `state.draft`, `state.review`, `state.revision`, `state.done`, `state.optional`, `state.started` (abgeleitete Beschriftung, siehe Status), `view`, `eyebrow`, `next`, `why`, `progress` (Überschrift der Fortschrittszeile; ein eigener Text sollte den Gegenstand nennen, etwa „Unités terminées“), `progressEmpty`, `progressPlan`, `units`, `unitsHint`, `unitsEmpty`, `unitsEmptyNext`, `course`, `courseSummary`, `showProcess`, `processEyebrow`, `processTitle`, `result`, `nextStep`, `processEmpty` (Einheit ohne Arbeitsschritte), `courseProcessEmpty` (Kurs ohne Arbeitsschritte), `plan` (Planungslink, nur für Sprachen ohne eingebaute Texte), `usable.yes`, `usable.limited`, `usable.no` (erste Zeile einer Karte), `checkedNone`, `usableLimitedShort`, `viewMaterial` (Knopf der Lernendenansicht), `decide` (Gruppe „Noch zu entscheiden“), `prepare` (Gruppe „Vor dem Einsatz vorbereiten“), `how`, `more`, `fromCheck` (Etikett eines Punkts aus der Prüfung ohne Datum), `preview`, `explore`, `sections`, `error`.
- Texte mit Platzhaltern: `progressStart` mit `{unit}` (Wort aus `unitLabel.one`) und `{first}` (Nummer der ersten Einheit), etwa „Rien encore – on commence par {unit} {first}.“; `progressStarted` mit `{unit}`, `{first}` (Nummer der laufenden Einheit), `{done}` und `{total}` (ihre erledigten und alle Pflichtschritte), etwa „Rien de terminé – {unit} {first} est en cours ({done} sur {total} étapes).“; `fromCheckOn` mit `{date}` (Etikett eines Punkts aus der Prüfung); `state.waiting` mit `{step}` (Titel des offenen früheren Schritts); `usableMissing` mit `{what}` (die Einträge von `usable.missing`, mit Komma verbunden); `usableUnits` mit `{units}` (die nutzbaren Einheiten, etwa „unité 2 (avec limites)“).
- Zähltexte, als Text oder als `{one, many}` (Schritt-Texte `steps`, `courseSteps`, `courseStepsMaterial` wählen nach `{total}`, die übrigen nach der ersten Zahl): `progressText` mit `{done}`, `{total}`, `{unit}` (Wort aus `unitLabel`, gewählt nach `{total}`), `steps`, `courseSteps` (Pflichtschritte des Kurses) und `courseStepsMaterial` (Teilwert aus den Pflichtschritten der Einheiten, steht nach „ · “) mit `{done}`, `{total}`, `internal` mit `{n}`.

```json
"labels": {
  "progress": "Progression",
  "progressText": { "one": "{done} sur {total} {unit} est terminé", "many": "{done} sur {total} {unit} sont terminés" },
  "steps": "{done} sur {total} étapes"
}
```

Unbekannte Schlüssel, falsche Formen und unbekannte Platzhalter erzeugen einen Datenhinweis; `write-dashboard.mjs` und `validate-journal.mjs` lehnen den Datensatz dann ab.

## Material prüfen

`node specs/dashboard/check-material.mjs [Datei] [--viewport BxH …]` aus dem Projektordner prüft ein Materialdokument (Standard `README.md`; im multi-file-Modus `materials/<Nummer>-<slug>/README.md`). `--help` zeigt den Aufruf; eine andere Option wird nie als Dateiname gelesen.

- **Quelle (ohne Browser):** Bildplatzhalter und Quizze. Ein Platzhalter ist eine sichtbare Zeile, die mit 🖼️, 📷 oder 📸 beginnt und hervorgehoben ist (`> 🖼️ _Bild folgt: …_` aus `tasks/create-image.md`, auch `*📷 Foto folgt*`), oder die Zeile unter dem Autorenkommentar `<!--- image: … --->`, solange dort kein `![…](…)` steht. Erkannt wird am Symbol und an der Hervorhebung, nicht an den Wörtern der Kurssprache; Kommentare und Codeblöcke zählen nicht. Hat ein Quiz zwei gleiche Optionstexte (ohne Hervorhebung, Vorlese-Klammer und Groß-/Kleinschreibung), ist das ein Fehler: Es ist nicht lösbar. Platzhalter in den Optionen oder zwischen Folienanfang (bzw. vorigem Quiz) und Quiz sind eine Warnung: Die Frage hängt an einem fehlenden Bild.
- **Quelle, Linkziele:** Ein Link- oder Bildziel mit unkodierter `(`, `)` oder Leerzeichen ist ein Fehler mit Folie und Zeile, ebenso eine bloße URL mit `(`. LiaScript schneidet die Adresse an der ersten `(` ab (CommonMark erlaubt ausgeglichene Klammern, LiaScript nicht); bei einer bloßen URL bleibt der sichtbare Text vollständig, nur der Link ist kaputt. Die Meldung nennt die kodierte Form (`%28`, `%29`, `%20`; bloße URLs als `[…](…)`). Inline-Code, Kommentare, Codeblöcke und HTML-Attribute (`src="…"`) zählen nicht.
- **Quelle, Bildgröße:** Ein Bild in einer Quizoption ohne Größenangabe direkt dahinter ist eine Warnung. Bilder in Quizoptionen erscheinen sonst in natürlicher Breite. Geprüfte Schreibweise: `- [( )] ![…](…)<!-- style="max-height: 30vh" -->` (auch `width`, `max-width`, `height`). Eine Größenangabe garantiert nicht, dass alles auf einen Bildschirm passt; das misst erst „Passt auf einen Bildschirm“.
- **Quelle, Hinweise vorlesen:** Steht `narrator:` im Kopf, ist ein Hinweis `- [[?]] …` ohne Vorlese-Markierung eine Warnung mit Zahl und Folien („2 of 24 quiz hints … are not read aloud“). Schreibweise: `- [[?]] {|>}{Hinweistext}`.
- **Gerendert:** Folien, Quizze, Vorleseknöpfe als „n blocks, m inline“ (erkannt an der Struktur der LiaScript-Knöpfe, nicht am übersetzten Tooltip), nicht gefundene Bilddateien und echte Fehler. Zeigt die Seite weniger Vorleseknöpfe, als die Quelle `{{|>}}` und `{|>}{…}` markiert, folgt eine Warnung.
- **Gerendert, Bilder:** Auf jeder Folie wartet die Prüfung, bis alle Bilder geladen oder gescheitert sind (höchstens 10 s). Ein Bild mit `naturalWidth` 0, auch ein externes, zählt als „not loaded“ (mit Adresse und Folie); Ursache sind eine kaputte Adresse, eine fehlende Datei oder kein Netz. Warnung: ein Bild über 200 KB („large image“, genannt wird die Adresse aus dem Material, auch nach Weiterleitungen; Wikimedia-Standardbreiten 330 px für Antwortbilder, 500 px für Seitenfotos). Bilder mit `loading="lazy"` werden vor der Messung geladen.
- **Gerendert, passt auf einen Bildschirm:** Je Quiz und Fenster misst die Prüfung von der Oberkante der Fragezeile (das Element direkt über dem Quiz, außer einer Überschrift) bis zur Unterkante der letzten Option, gegen die sichtbare Fläche zwischen Kopf- und Fußleiste der Folie (bei 1024 × 768 etwa 632 px, nicht 768). Zweimal: (1) beim Öffnen der Folie, (2) mit der Frage am oberen Rand. Fenster: `1024x768`, `810x1080` (hochkant) und `1080x810` (quer); mit `--viewport BxH` (wiederholbar, auch `--viewport=BxH`) nur die angegebenen, etwa das Zielgerät aus dem Kursrahmen. Die Fenster sind Desktop-Browserfenster dieser Größe, keine Geräte (kein Touch, keine Browserleisten). Ausgabe im Block „Fit on screen“ je Fenster: `fits`, `fits only once scrolled (at open n of m options visible …)` oder `does not fit (… n of m options visible, needs X px, has Y px)`, bei Bildoptionen mit der Bildhöhe, bei der es passen würde („images at most 95 px to fit at open, 170 px with the question at the top“). Quizze, die überall passen, stehen in einer Zeile. Nur „does not fit“ wird zusätzlich eine Warnung; eine fehlende Warnung belegt nichts für ein Fenster, das nicht gemessen wurde. Die Rechnung (`fitOnScreen`, `describeFit`) ist ohne Browser in `check.mjs` getestet.
- **Browser:** `CHROMIUM_PATH`, wenn gesetzt; sonst der Browser von Playwright; sonst ein System-Chrome/Chromium (übliche Programmnamen im `PATH` und in den üblichen Ordnern, macOS- und Windows-Installationsorte).
- `Missing images: n` zählt Platzhalter, nicht gefundene Dateien und nicht geladene Bilder.
- Exit-Code 0: keine Fehler, 1: Fehler im Material, 2: ungültiger Aufruf oder gerenderte Prüfung nicht möglich. Bei 2 ohne Browser stehen die Befunde der Quelle trotzdem in der Ausgabe, dazu eine Zeile „Rendered check not possible: …“ statt eines Stacktraces.

## Vorschaubilder holen

`node specs/dashboard/fetch-thumb.mjs <Dateiseiten-URL|File:Name.jpg|Name.jpg> [--width n]` aus dem Projektordner holt ein Vorschaubild einer Datei aus Wikimedia Commons, damit ein Agent das Foto mit seinem Lesewerkzeug ansehen kann, ohne selbst etwas herunterzuladen.

- Angenommen werden Dateiseiten (`…/wiki/File:…`, auch `Datei:`, `Special:FilePath/…`, `index.php?title=…`, kodiert oder mit Klammern), `upload.wikimedia.org`-Adressen (Original oder Vorschau), `File:Name.jpg` und `Name.jpg`. Andere Hosts werden abgelehnt.
- Fragt die Commons-API (`prop=imageinfo`, `iiprop=url|size|extmetadata`, `iiurlwidth=500`) und lädt das Vorschaubild (Standard 500 px, `--width` nur mit den Standardbreiten 120, 250, 330 oder 500; ein Original, das größer als die Vorschau ist, lädt es nie) nur von `commons.wikimedia.org` und `upload.wikimedia.org`. Nennt die API `thumb.wikimedia.org`, lädt das Skript denselben Pfad von `upload.wikimedia.org`. Weiterleitungen auf andere Hosts werden abgelehnt.
- Speichert unter `.cache/thumbs/<name>.jpg` (bei PNG-/GIF-Vorschauen mit deren Endung), nur innerhalb des aktuellen Ordners, auch wenn `.cache` ein Link ist. Höchstens 5 MB, 20 s Zeitlimit je Anfrage, eigener User-Agent.
- Ausgabe: `Thumbnail:` (Pfad, Breite × Höhe), `File URL:` (`https://commons.wikimedia.org/wiki/Special:FilePath/<Name>` mit `_` statt Leerzeichen und kodierten Klammern; `?width=330` oder `?width=500` lässt sich anhängen), `Original file` (upload.wikimedia.org, kodiert), `Author:` (ohne HTML), `Credit:` (falls vorhanden), `License:`, `License URL:` (`–` bei gemeinfreien Dateien) und `Page:` (Dateiseite, kodiert). Urheber und Lizenz kommen wörtlich aus der API.
- Exit-Code 0: Vorschaubild gespeichert, 2: ungültiger Aufruf, Datei nicht gefunden, Netz- oder Downloadfehler (eine Zeile `fetch-thumb: …`, kein Stacktrace).

```bash
node specs/dashboard/fetch-thumb.mjs "https://commons.wikimedia.org/wiki/File:Example_(1).jpg" --width 330
```

## Suchen ohne grep

`node specs/dashboard/find.mjs [-i] <Muster> [Datei|Ordner …]` sucht nur lesend und gibt jede Trefferzeile als `datei:zeile: text` aus. Es ist für Agenten gedacht, die keine Shell-Suche verwenden dürfen.

- `<Muster>` ist ein regulärer Ausdruck in JavaScript-Schreibweise; `-i` als erstes Argument ignoriert Groß- und Kleinschreibung.
- Ohne Pfad wird `journal.md` durchsucht. Mehrere Dateien sind möglich; ein Ordner wird rekursiv durchsucht, dabei nur `.md`, `.yaml`, `.json` und `.mjs`, ohne `node_modules` und `.git`, ohne symbolischen Links zu folgen.
- Pfade außerhalb des aktuellen Ordners (auch über Links) werden abgelehnt.
- Höchstens 200 Treffer; lange Zeilen werden um den Treffer herum gekürzt.
- Exit-Code 0: Treffer, 1: kein Treffer, 2: ungültiger Aufruf oder abgelehnter Pfad.

```bash
node specs/dashboard/find.mjs -i "^### \d+\." journal.md
```

Die Browserprüfung (`check-browser.mjs`) braucht feste Testdaten (leeres und gefülltes Journal) und gehört deshalb zum Testaufbau, nicht in `specs/`.
