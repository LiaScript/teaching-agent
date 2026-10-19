# Template-Katalog und Template-Entwicklung – Entwurf

Stand: 2026-10-19 · Branch: `feature/dashboard-library`

## Absicht

Heute ist `:manage-templates` rein reaktiv: Es trägt Templates ein, die die
Lehrkraft schon kennt und nennt. Für viele Fächer gibt es aber bereits passende
LiaScript-Templates – mehrere für Python (manche mit Turtle-Modus, der sich für
Kinder eignet), mehrere für SQL, eigene für die Darstellung chemischer Elemente.
Die Lehrkraft kennt sie meist nicht.

Der Teaching-Agent soll deshalb **nach der Didaktik von sich aus passende
Templates vorschlagen** – nach Fach *und* Zielgruppe begründet – und, wenn
nichts passt, **mit der Lehrkraft ein eigenes Template entwickeln lassen**, das
sie auf Wunsch als eigenes Repo der Community zur Verfügung stellt.

Grundlage ist ein **Template-Katalog als LiaScript-Dokument**: Menschen
stöbern darin, filtern nach Tags und testen Templates im Browser; Agenten
durchsuchen dieselben Daten.

## Ziele

1. Ein eigener Workflow-Schritt **nach `:create-didactics`**, der Templates für
   den Kurs vorschlägt und begründet (Fach, Zielgruppe, Lernaktivitäten aus der
   Didaktik).
2. Ein **kuratierter Katalog** (gemeinsame Liste) plus eine **Projektliste**
   für lokale Einträge, zusammen angezeigt als durchsuchbares Kartenraster.
3. Eine **Online-Suche** unter `github.com/topics/liascript-template` bei jedem
   Vorschlagslauf; Treffer außerhalb des Katalogs erscheinen als „neu gefunden,
   nicht geprüft“.
4. **Übernehmen per Klick**: Die Karte startet `:manage-templates {name}`, das
   den Import ins `journal.md` schreibt und das Template unter `## Templates`
   dokumentiert.
5. **Eigene Templates**: Teaching-Agent schreibt einen Steckbrief,
   Development-Agent entwickelt, testet und veröffentlicht auf Wunsch als
   eigenes Repo.
6. **Skills vorschlagen und installieren**: Fehlen die LiaScript-Skills,
   schlägt der Agent die Installation vor und installiert nach Zustimmung
   lokal im Projekt.
7. **Browser-Tests absichern**: Playwright wird bei Bedarf nach Zustimmung
   installiert; `check-material.mjs` funktioniert auf allen Systemen oder meldet
   klar, was fehlt.

## Nicht-Ziele

- Eingebaute LiaScript-Interaktionen (Quiz, Umfrage, ausführbarer Code,
  Diagramme, Animationen) vorschlagen. Es geht **nur um Templates**.
- Ein öffentlicher Template-Store oder eine Bewertungs-/Kommentarfunktion.
- Automatisches Pflegen der gemeinsamen Liste ohne Pull Request.

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Der Agent schlägt ungeprüfte Fundstücke so vor, als wären sie geprüft, oder
  baut ein kaputtes Template ungefragt in den Kurs ein.
- Ein Update des Teaching-Agenten löscht lokale Einträge oder eigene Templates.
- Skills oder Templates werden ohne ausdrückliche Zustimmung installiert,
  importiert, veröffentlicht oder per Pull Request geteilt.
- Der Katalog funktioniert nur mit Internet oder nur mit Claude Code.
- Karten-Einträge, Makronamen oder Import-URLs werden erfunden.

## Ablauf im Workflow

```
:create-didactics ──► [NEU] Templates vorschlagen ──► (:create-visuals) ──► :create-agenda ──► Einheiten …
        │                       │                                                     │
   kurzer Hinweis         Katalog + Online-Suche                         :coauthor-materials:
   „es gibt dafür         → Vorschläge mit Begründung                    fehlt eine Interaktion?
   Templates“             → übernehmen / testen / selbst entwickeln     → suchen oder entwickeln
```

1. **Während `:create-didactics`** – nur ein kurzer Hinweis, welche Arten von
   Templates es für das Fach gibt, weil das Werkzeug die Methode beeinflussen
   kann (z. B. „Programmieren über Zeichnen“ durch Turtle). Keine Auswahl.
2. **Neuer Schritt nach der Didaktik** (eigener Befehl, siehe unten): liest
   `## Course Context` (Fach, Zielgruppe, Sprache) und `## Didactics`
   (Lernaktivitäten, Methoden), durchsucht Katalog und Projektliste, macht die
   Online-Suche und schlägt 1–3 Templates mit Begründung vor. Hinweis auf
   Unterschiede zwischen Kandidaten (z. B. Turtle vs. Pyodide für Kinder). Der
   Schritt ist wiederholbar, ohne die Didaktik neu aufzurollen.
3. **Während `:coauthor-materials`** – zeigt sich, dass eine Interaktion fehlt,
   bietet der Agent an, zu suchen (Schritt 2 gezielt) oder ein eigenes Template
   entwickeln zu lassen.

Die Reihenfolge zum Artist-Agenten (`:create-visuals`) bleibt offen; beide
werden nach der Didaktik vorgeschlagen.

## Der Katalog

### Dateien

| Datei | Gehört | Inhalt | Bei Update des Teaching-Agenten |
|---|---|---|---|
| `specs/catalog/README.md` | Teaching-Agent-Repo | Katalogseite (LiaScript) | wird überschrieben |
| `specs/catalog/templates.json` | Teaching-Agent-Repo | gemeinsame, kuratierte Liste | wird überschrieben |
| `templates.local.json` (Projektwurzel) | Projekt | lokale Einträge | **nie angefasst** |

- Die Katalogseite lädt beide Listen und zeigt sie gemeinsam. Fehlt die
  Projektdatei, erscheint nur die gemeinsame Liste.
- Der Teaching-Agent schreibt **nur** in `templates.local.json`, nie in
  `specs/catalog/templates.json`.
- `journal.md` → `## Templates` bleibt das Protokoll der Templates, die der Kurs
  **tatsächlich nutzt**. Kandidaten und Fundstücke stehen dort nicht.
  Zwei Ausnahmen *(meine Entscheidung)*:
  - eine Zeile **`__Template selection:__`** mit dem Ergebnis des
    Vorschlagsschritts (`open` | `done – {ids}` | `done – none needed`), analog
    zu `Agenda required`. Daran erkennt das Dashboard, ob der Schritt erledigt
    ist, auch wenn kein Template gebraucht wird. Der Vorschlagsschritt schreibt
    diese Zeile nach Bestätigung; deshalb ist er kein reiner Lesebefehl.
  - **Steckbriefe** für Templates in Entwicklung, als eigener Unterabschnitt
    `### {id} (in development)` mit dem Steckbrief statt der Nutzungsdoku. Nach
    der Fertigstellung ersetzt der normale Template-Eintrag ihn.

### Datensatz pro Template

Mindestens:

- `id` (stabil, Kleinbuchstaben, z. B. `python-turtle`)
- `name`, `icon`, `description` (kurz, Kartentext)
- `import` (Import-URL, möglichst mit festem Tag/Commit)
- `repo` (Repo-URL), `demo` (Link zum lauffähigen README im LiaScript-Viewer)
- `subjects` (Tags: Fach), `audiences` (Tags: Zielgruppe), `macros` (wichtigste Makronamen)
- `status`: `checked` | `found` | `own`
- `checked` (Prüfdatum, nur bei `checked`), `note` (optional: Einschränkungen, Risiko)
- nur in der Projektliste: `shared` (wurde das Teilen angeboten/abgelehnt/als PR gestellt)

Die genaue Schreibweise legt der Builder fest; die Felder oben sind die
fachliche Mindestmenge.

**Status-Regel** *(meine Entscheidung)*: `checked` gibt es **nur in der
gemeinsamen Liste** (kuratiert, per Pull Request aufgenommen). Einträge in
`templates.local.json` sind immer `found` oder `own` – auch wenn der Agent ihr
README gelesen hat. So kann ein lokaler Eintrag nie als „geprüft“ erscheinen.

**Sprache** *(meine Entscheidung)*: Katalogdaten (Beschreibungen, Tags) sind
**englisch**, passend zur Regel „Templates auf Englisch dokumentieren“. Die
Oberflächentexte der Katalogseite (Suche, Filter, Buttons, Status) übersetzt die
Library wie beim Dashboard (`de`/`en`, Fallback `en`). Beim Vorschlagen erklärt
der Agent die Templates in der Kurssprache.

### Darstellung (entschieden: Kartenraster)

- Ein Suchfeld und Tag-Filter für **Fach**, **Zielgruppe** und **Status**
  („✓ geprüft“, „neu gefunden“, „nur dieses Projekt“).
- Jede Karte zeigt Icon, Name, Kurztext, Status-Abzeichen, Tags und zwei Buttons:
  - **👁 Ausprobieren** – normaler Link auf `demo`: öffnet das README des
    Templates selbst im LiaScript-Viewer (Template-READMEs sind lauffähige
    LiaScript-Dokumente). Funktioniert ohne Agent und ohne DevServer. Der
    Katalog importiert selbst **kein** Template → keine Makro-Konflikte.
  - **📥 In meinen Kurs übernehmen** – `agent:`-Link
    `agent:teaching/manage-templates?name={id}` mit sichtbarem Befehl
    `:manage-templates {id}`.
- Umsetzung nach dem Muster der Dashboard-Library: Datenblock + Makro, das die
  Karten rendert; keine externen Bibliotheken, kein Build-Schritt. Ob das eine
  neue Komponente der Dashboard-Library oder eine eigene kleine Library unter
  `specs/catalog/` wird, entscheidet der Builder.
- Gleiche Konventionen wie das Dashboard: Icons ▶️ ✏️ 🔍 👁 🚀, `agent:`-Links
  als Buttons, Texte in der Kurssprache, helles/dunkles Farbschema.

### Erstbefüllung

Der Builder füllt `templates.json` mit einer Startauswahl aus
`topics/liascript-template` und den LiaTemplates. **Jeder Eintrag** wird gegen
das echte README geprüft (Import-URL, Makronamen, Demo lauffähig). Fächer
mindestens: Programmieren (Python, darunter eine Turtle-Variante, falls
vorhanden), Datenbanken (SQL), Chemie. Nichts erfinden; was nicht geprüft werden
kann, kommt nicht hinein.

## Online-Suche

- Bei jedem Vorschlagslauf sucht der Agent unter
  `github.com/topics/liascript-template` (Weg: `gh`/GitHub-API oder Abruf der
  Topic-Seite – Builder-Entscheidung, mit Rückfallebene).
- Treffer, die in keiner Liste stehen, liest er an (README), bevor er sie nennt,
  und zeigt sie als **„neu gefunden, nicht geprüft“** mit kurzem Risiko-Hinweis.
- Nutzt die Lehrkraft ein Fundstück, bietet der Agent an, es in
  `templates.local.json` aufzunehmen (Status `found`).
- Ohne Netz, im Web-Chat-Bundle oder bei API-Grenzen: Vorschläge nur aus dem
  Katalog, mit einem Satz, dass die Online-Suche ausgefallen ist.

## Übernehmen in den Kurs

`:manage-templates {name}` existiert bereits und bleibt der einzige Weg ins
Journal. Erweiterung: Ist `{name}` eine Katalog-`id`, nimmt der Task Import-URL,
Makros und Beispiel aus dem Katalogeintrag und liest zur Bestätigung das README.
Vor dem Schreiben bestätigt die Lehrkraft im Chat (Stufe **confirm in chat**,
wie bisher). Danach wie heute: `import:` in den Journal-Kopf, Eintrag unter
`## Templates`, später Import in Materialien, die das Template nutzen.

## Eigene Templates

### Rollen

- **Teaching-Agent**: erkennt den Bedarf, schreibt mit der Lehrkraft einen
  **Steckbrief** in `journal.md` → `## Templates` (was die Lernenden tun, welche
  Rückmeldung sie bekommen, welches Lernziel, welche Zielgruppe), prüft danach,
  ob das Ergebnis den Steckbrief erfüllt, und setzt es in den Materialien ein.
- **Development-Agent**: entwickelt, testet, lagert aus, taggt, veröffentlicht,
  trägt in die Projektliste ein. Liest dafür den Steckbrief (seine
  Aktivierungsregeln werden um diesen Lesezugriff erweitert).

### Ablauf

1. Steckbrief (Teaching) → Übergabe an Development (`agent:development/…`).
2. Development entwickelt mit dem Skill `template-development` – **der Skill
   ist Voraussetzung**: Fehlt er, bietet der Befehl die Installation an
   (siehe unten); lehnt die Lehrkraft ab, endet der Befehl mit diesem Hinweis.
   Es gibt keine eingebaute Ersatz-Anleitung in `specs/`. Entwickelt wird **im Projekt**,
   in einem eigenen Ordner außerhalb von `specs/` (Name: Builder-Entscheidung,
   z. B. `lia-templates/{id}/`), nach dem Muster von `specs/dashboard/`:
   README mit Makros + Beispielen, JS/CSS daneben, lokal importiert.
3. Die Lehrkraft testet im Preview; Rückmeldungen gehen in den Steckbrief /
   die nächste Runde.
4. Der Agent **schlägt vor**, das Template als **eigenes Repo** zu hosten und
   weiterzuentwickeln (Nutzen: mehrere Projekte, Community). **Die Lehrkraft
   entscheidet.**
5. Bei Ja (Development, Bestätigung im Terminal): Repo anlegen, Topic
   `liascript-template` setzen, Version taggen, Import im Kurs von der lokalen
   Fassung auf die Repo-URL mit Tag umstellen. Dokumentation **auf Englisch**,
   außer das Template ist sehr kursspezifisch.
   **Ort nach dem Veröffentlichen (entschieden):** Der Ordner
   `lia-templates/{id}/` bleibt im Kursprojekt und wird ein **eigenes,
   verschachteltes git-Repo**; das Kurs-Repo ignoriert ihn per `.gitignore`. Dort
   wird weiterentwickelt und im Preview des Kurses getestet. Jede veröffentlichte
   Änderung: neuer Tag im Template-Repo, dann stellt Development die Import-Zeilen
   im Journal-Kopf, unter `## Templates` und in allen Materialien auf den neuen Tag um.
   Kein Submodul, kein Subtree, kein Klon außerhalb des Projekts.
6. Eintrag in `templates.local.json` (Status `own`).
7. Der Agent fragt, ob der Eintrag in die **gemeinsame Liste** darf. Bei Ja
   bereitet Development einen **Pull Request** ans Teaching-Agent-Repo vor
   (Bestätigung im Terminal). Nach Annahme kommt der Eintrag mit dem nächsten
   Update in `specs/catalog/templates.json`; der lokale Eintrag kann dann weg.

Bleibt das Template im Projekt, endet der Ablauf nach Schritt 3 mit einem
Eintrag in `templates.local.json` (Status `own`).

## Skills vorschlagen und installieren

**Bewusste Änderung einer bestehenden Regel.** Bisher gilt überall: „never
install a skill, never assume one is installed“ (`data/skills.md`,
`agents/teaching-agent.yaml`, `agents/development-agent.yaml`,
`agents/artist-agent.yaml`, `tasks/create-project.md`, `tasks/update-project.md`,
`README.md`; daraus generiert `CLAUDE.md`, `AGENTS.md` usw.).

Neu:

- Erkennung bleibt wie in `data/skills.md` beschrieben.
- Fehlen Skills, die dem aktuellen Schritt klar helfen (für diesen Entwurf vor
  allem `template-development` und `liascript-syntax`), **fragt** der Agent, ob
  er sie installieren darf, und nennt Nutzen und Befehl.
- Nach Zustimmung installiert er **lokal im Projekt** mit
  `npx skills add LiaScript/skills --skill <name>` (Projekt-Variante des
  Befehls – genaue Flags prüft der Builder gegen die Doku des `skills`-CLI).
- Stufe **confirm in terminal** (lädt Code aus dem Netz), auch wenn der Anstoß
  aus dem Preview-Chat kommt.
- Lehnt die Lehrkraft ab: einmal pro Sitzung nicht erneut fragen; der Schritt
  läuft ohne Skill weiter wie bisher.
- Ohne Shell (Web-Chat): nur den Befehl nennen.
- *(meine Entscheidung)* Installierte Skill-Ordner (`.claude/skills/`,
  `.agents/skills/` …) kommen in die `.gitignore` des Kursprojekts, damit sie
  nicht mit dem Kurs veröffentlicht werden. Folge: Jede Person, die das Projekt
  klont, wird bei Bedarf selbst gefragt. Ziel-Ordner ist der des laufenden
  Agenten (z. B. `.claude/skills/` unter Claude Code).

## Werkzeuge: Browser-Tests mit Playwright

Templates müssen im Browser getestet werden. Playwright ist außerdem **schon
heute eine versteckte Voraussetzung**: `specs/dashboard/check-material.mjs`
(läuft u. a. in `:quick-fix` und bei Prüfungen) sucht Playwright nur im
npx-Cache (`~/.npm/_npx`) und startet fest `/usr/bin/chromium`. Auf macOS,
Windows oder ohne vorheriges `npx playwright` bricht es ab, ohne dass jemand eine
Installation anbietet.

Entschieden:

1. **Interaktiv testen ohne Installation**: Beim Entwickeln testet der
   Development-Agent im Preview der Lehrkraft mit dem DevServer-Werkzeug
   `run_in_page` (rendert das Makro, gibt es Konsolenfehler) und die Lehrkraft
   klickt selbst. Braucht nur den offenen Preview.
2. **Automatische Tests mit der Playwright-Bibliothek**: Jedes eigene Template
   bekommt Modelltests (Muster `specs/dashboard/check.mjs`) und einen Browsertest.
   Fehlt Playwright, **fragt** der Agent und installiert nach Zustimmung **lokal
   im Projekt** (`npm i -D playwright`, danach `npx playwright install chromium`;
   Stufe **confirm in terminal**, ca. 150 MB Download). Schritte, die `sudo`
   brauchen (`--with-deps` für Linux-Systembibliotheken), führt der Agent nie
   aus – er nennt sie der Lehrkraft. Lehnt sie ab, laufen nur die Modelltests
   und der Agent sagt, dass der Browsertest fehlt.
3. **Playwright-MCP wird nicht vorausgesetzt** (Einrichtung je Agent
   verschieden, Neustart nötig); 1 und 2 decken die Arbeit ab.
4. **`check-material.mjs` reparieren** (gehört zu diesem Vorhaben):
   - Playwright zuerst lokal im Projekt (`node_modules`) suchen, dann im
     npx-Cache, dann `PLAYWRIGHT_MODULE_PATH`.
   - Das von Playwright installierte Chromium verwenden; `/usr/bin/chromium`
     höchstens als Rückfall, nicht fest verdrahtet.
   - Fehlt Playwright oder der Browser: klare Meldung mit Exit-Code und dem
     Installationsangebot aus Punkt 2 statt eines Absturzes; die aufrufenden
     Tasks behandeln „Prüfung nicht möglich“ sichtbar (kein stilles Bestehen).
   - Gleiches gilt für den Browsertest der Dashboard-Library, sobald er aus
     `test/` nach `specs/` wandert.
5. `node_modules/` des Kursprojekts gehört in dessen `.gitignore`;
   `package.json`/Lockfile werden angelegt, wenn nicht vorhanden *(meine
   Entscheidung)*.

## Befehle und Links

Neue/erweiterte Befehle (Namen sind Builder-Entscheidung, sofern nicht anders
genannt):

| Agent | Befehl | Zweck | Stufe |
|---|---|---|---|
| Teaching | neu, z. B. `:suggest-templates` | Vorschlagsschritt nach der Didaktik | run (nur lesen) bzw. start interview, falls er etwas notiert |
| Teaching | `:manage-templates {name?}` (besteht) | übernehmen; erweitert um Katalog-`id` | confirm in chat |
| Teaching | – | Steckbrief schreiben (Teil des Vorschlagsschritts oder eigener Befehl) | start interview |
| Development | neu, z. B. `:develop-template {id}` | entwickeln im Projekt | confirm in chat |
| Development | neu, z. B. `:publish-template {id}` | Repo, Topic, Tag, Import umstellen, optional PR | confirm in terminal |
| alle | Skill-Installation | siehe oben | confirm in terminal |
| Development (und Prüf-Tasks) | Playwright-Installation | siehe „Werkzeuge“ | confirm in terminal |

- Alle neuen Befehle in die `commands:`-Maps, in `data/agent-links.md`
  (Stufen-Tabelle, Aktionszeile `## Templates`) und in `specs/workflows/course-development.yaml`.
- Aktionszeile unter `## Templates`: Vorschlagsschritt und Katalog öffnen.
- Dashboard: Der globale Prozess bekommt einen Schritt „Templates auswählen“
  nach der Didaktik (`optional`, solange kein Fach mit passenden Templates
  erkannt ist – genaue Regel Builder-Entscheidung, aber die Schrittzahl darf
  sich nicht ohne `note` ändern, siehe `tasks/update-dashboard.md`).
- Development-Agent: Titel/Persona von „Git & Publishing“ auf
  „Git, Templates & Publishing“ (sinngemäß) erweitern.

## Rahmenbedingungen

- Läuft unter allen unterstützten Agenten (Claude Code, Codex, Cursor,
  Windsurf, Copilot, Web-Chat-Bundle). Task-Dateien müssen allein ausreichen.
- Nach Spec-Änderungen `python3 specs/build.py` (Bundles, `CLAUDE.md` usw.) und
  `node specs/check-specs.mjs`; Katalog-Renderer bekommt Tests wie
  `specs/dashboard/check.mjs`.
- Dateien nur mit dem Datei-Werkzeug ändern; keine Shell-Heredocs (Regel aus
  `CLAUDE.md` für die Preview-Chat-Reaktionszeit).

## Dem Builder überlassen

- Exakte Feldnamen und Schema von `templates.json` / `templates.local.json`.
- Ob die Katalog-Karten eine neue Dashboard-Komponente oder eine eigene Library sind.
- Wie die Katalogseite die Projektdatei lädt (z. B. `fetch` relativ zur Projektwurzel) und wie sie sich ohne DevServer verhält.
- Weg der Online-Suche (`gh`, GitHub-API, Topic-Seite) und Rückfallebene.
- Name des Entwicklungsordners für eigene Templates und der neuen Befehle.
- Genaue Startauswahl des Katalogs (nach den Regeln unter „Erstbefüllung“).
