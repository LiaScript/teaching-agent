<!--
language: de
narrator: Deutsch Female
mode: Textbook
version: 0.0.1
import: ./README.md
-->

# Dashboard-Demo

Dieser Entwurf zeigt sechs fiktive Einheiten. Wählen Sie eine Einheit, um ihren Materialprozess zu sehen. Die Auswahl verändert nur die Ansicht. Die zweite Seite zeigt eine vorläufige Planung mit langen Titeln, solange noch keine Einheiten angelegt sind. Die dritte zeigt den Stand nach dem Ablaufplan, bevor das erste Material entsteht, die vierte den Stand nach dem ersten erledigten Arbeitsschritt, die fünfte einen geprüften, schon nutzbaren Abend, bevor einer fertig geprüft ist.

## Dashboard

```json @Dashboard.View
{
  "title": "Datenbanken verstehen",
  "context": "Sechs Einheiten · fiktives Darstellungsbeispiel",
  "subtitle": "Ihr Kurs nimmt Form an. Am SQL-Material arbeiten wir weiter.",
  "notice": "Diese Beispieldaten zeigen die Oberfläche. Sie sind keine bestätigte Kursplanung.",
  "next": {
    "title": "Den Materialentwurf für SQL erstellen",
    "why": "Lernziele und Lernaktivitäten liegen bereits vor. Jetzt entstehen konkrete Aufgaben und Hilfen.",
    "label": "SQL-Prozess ansehen",
    "href": "#dashboard",
    "selectUnit": 3
  },
  "units": [
    {
      "id": 1,
      "title": "Einführung",
      "state": "done",
      "usable": {"state": "yes"},
      "view": {"href": "agent:teaching/preview?file=1", "command": ":preview 1"},
      "summary": "Beispielmaterial abgeschlossen.",
      "process": {
        "title": "Einführung",
        "steps": [
          {
            "title": "Lernziele klären",
            "why": "Die Ziele legen fest, was die Lernenden anschließend können sollen.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Lernaktivitäten planen",
            "why": "Die Aktivitäten führen zu den festgelegten Lernzielen.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Materialentwurf erstellen",
            "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Gemeinsam durchsehen",
            "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Prüfen und überarbeiten",
            "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          }
        ],
        "note": "Nach Rückmeldungen kann eine Einheit erneut überarbeitet werden."
      }
    },
    {
      "id": 2,
      "title": "Datenmodelle",
      "state": "done",
      "usable": {"state": "yes"},
      "view": {"href": "agent:teaching/preview?file=2", "command": ":preview 2"},
      "summary": "Beispielmaterial abgeschlossen.",
      "process": {
        "title": "Datenmodelle",
        "steps": [
          {
            "title": "Lernziele klären",
            "why": "Die Ziele legen fest, was die Lernenden anschließend können sollen.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Lernaktivitäten planen",
            "why": "Die Aktivitäten führen zu den festgelegten Lernzielen.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Materialentwurf erstellen",
            "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Gemeinsam durchsehen",
            "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Prüfen und überarbeiten",
            "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          }
        ],
        "note": "Nach Rückmeldungen kann eine Einheit erneut überarbeitet werden."
      }
    },
    {
      "id": 3,
      "title": "SQL",
      "state": "current",
      "summary": "Der Materialentwurf entsteht.",
      "process": {
        "title": "SQL",
        "steps": [
          {
            "title": "Lernziele klären",
            "why": "Die Ziele legen fest, was die Lernenden anschließend können sollen.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Lernaktivitäten planen",
            "why": "Die Aktivitäten führen zu den festgelegten Lernzielen.",
            "state": "done",
            "result": "Im fiktiven Beispiel abgestimmt und erledigt."
          },
          {
            "title": "Materialentwurf erstellen",
            "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar.",
            "state": "current",
            "next": "Eine verständliche SELECT-Aufgabe mit einer passenden Hilfe formulieren."
          },
          {
            "title": "Gemeinsam durchsehen",
            "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab.",
            "state": "planned"
          },
          {
            "title": "Prüfen und überarbeiten",
            "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft.",
            "state": "planned"
          }
        ],
        "note": "Nach Rückmeldungen kann eine Einheit erneut überarbeitet werden."
      }
    },
    {
      "id": 4,
      "title": "Normalisierung",
      "state": "planned",
      "summary": "Die Planung steht noch aus.",
      "process": {
        "title": "Normalisierung",
        "steps": [
          {
            "title": "Lernziele klären",
            "why": "Die Ziele legen fest, was die Lernenden anschließend können sollen.",
            "state": "planned"
          },
          {
            "title": "Lernaktivitäten planen",
            "why": "Die Aktivitäten führen zu den festgelegten Lernzielen.",
            "state": "planned"
          },
          {
            "title": "Materialentwurf erstellen",
            "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar.",
            "state": "planned"
          },
          {
            "title": "Gemeinsam durchsehen",
            "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab.",
            "state": "planned"
          },
          {
            "title": "Prüfen und überarbeiten",
            "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft.",
            "state": "planned"
          }
        ],
        "note": "Nach Rückmeldungen kann eine Einheit erneut überarbeitet werden."
      }
    },
    {
      "id": 5,
      "title": "Transaktionen",
      "state": "planned",
      "summary": "Die Planung steht noch aus.",
      "process": {
        "title": "Transaktionen",
        "steps": [
          {
            "title": "Lernziele klären",
            "why": "Die Ziele legen fest, was die Lernenden anschließend können sollen.",
            "state": "planned"
          },
          {
            "title": "Lernaktivitäten planen",
            "why": "Die Aktivitäten führen zu den festgelegten Lernzielen.",
            "state": "planned"
          },
          {
            "title": "Materialentwurf erstellen",
            "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar.",
            "state": "planned"
          },
          {
            "title": "Gemeinsam durchsehen",
            "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab.",
            "state": "planned"
          },
          {
            "title": "Prüfen und überarbeiten",
            "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft.",
            "state": "planned"
          }
        ],
        "note": "Nach Rückmeldungen kann eine Einheit erneut überarbeitet werden."
      }
    },
    {
      "id": 6,
      "title": "Datenbanken anwenden",
      "state": "planned",
      "summary": "Die Planung steht noch aus.",
      "process": {
        "title": "Datenbanken anwenden",
        "steps": [
          {
            "title": "Lernziele klären",
            "why": "Die Ziele legen fest, was die Lernenden anschließend können sollen.",
            "state": "planned"
          },
          {
            "title": "Lernaktivitäten planen",
            "why": "Die Aktivitäten führen zu den festgelegten Lernzielen.",
            "state": "planned"
          },
          {
            "title": "Materialentwurf erstellen",
            "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar.",
            "state": "planned"
          },
          {
            "title": "Gemeinsam durchsehen",
            "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab.",
            "state": "planned"
          },
          {
            "title": "Prüfen und überarbeiten",
            "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft.",
            "state": "planned"
          }
        ],
        "note": "Nach Rückmeldungen kann eine Einheit erneut überarbeitet werden."
      }
    }
  ],
  "selected": 3,
  "decisions": [
    {
      "key": "review-2-example",
      "kind": "decide",
      "title": "Das Beispiel zu Fremdschlüsseln kürzen?",
      "why": "Die Prüfung fand es für einen Abend zu lang.",
      "how": "Im Chat antworten.",
      "source": {"check": 2, "date": "2026-10-23"}
    },
    {
      "key": "projector",
      "kind": "prepare",
      "title": "Beamer im Kursraum reservieren",
      "how": "Bei der Hausverwaltung, eine Woche vorher."
    }
  ],
  "explore": [
    {
      "icon": "📖",
      "title": "Die Bibliothek kennenlernen",
      "description": "Komponenten und ihre Makros in der Dokumentation ansehen.",
      "label": "Dokumentation öffnen",
      "href": "README.md"
    }
  ],
  "footer": "Fiktive Zustände für die gemeinsame Gestaltungsdiskussion."
}
```

## Vorläufige Planung

Noch keine Einheiten angelegt: Die Übersicht zeigt die vorläufige Planung. Lange Titel stehen in einer schmalen Spalte über ihrem Text, in einer breiten Spalte daneben. Ein Entscheidungspunkt mit Abschnittslink erscheint als Textlink, nicht als Button.

```json @Dashboard.View
{
  "title": "Datenbanken verstehen",
  "context": "Erwachsenenbildung · sechs Abende à 90 Minuten · fiktives Darstellungsbeispiel",
  "subtitle": "Die Gliederung steht. Als Nächstes legen wir fest, wie gelernt wird.",
  "next": {
    "title": "Lernaktivitäten planen",
    "why": "Danach lässt sich jede Einheit mit passenden Aufgaben und Hilfen ausarbeiten.",
    "label": "Möglichkeiten ansehen",
    "href": "agent:teaching/help",
    "command": ":help"
  },
  "decisions": [
    {
      "key": "exam",
      "kind": "decide",
      "title": "Abschlussaufgabe am letzten Abend oder als Heimarbeit?",
      "why": "Die Entscheidung bestimmt, wie viel Zeit der sechste Abend für Übungen lässt.",
      "how": "Im Chat antworten, sobald es feststeht.",
      "label": "Beispiel mit Einheiten ansehen",
      "href": "#dashboard"
    }
  ],
  "process": {
    "title": "Kursplanung",
    "steps": [
      {"title": "Rahmen und Gliederung", "state": "done", "result": "Sechs Abende mit je einem Lernziel."},
      {"title": "Lernaktivitäten planen", "state": "current", "why": "Die Aktivitäten führen zu den Lernzielen."},
      {"title": "Einheiten ausarbeiten", "state": "planned", "why": "Jede Einheit bekommt Material, das zu den Zielen passt."}
    ]
  },
  "plan": {
    "note": "Vorläufig, bis der Ablauf feststeht.",
    "rows": [
      {"label": "Abend 1: Wozu Datenbanken im Alltag gebraucht werden", "text": "Beispiele aus Vereinsverwaltung und Online-Shop sammeln und vergleichen. Ca. 90 Minuten."},
      {"label": "Abend 2: Tabellen, Zeilen und Spalten sicher unterscheiden", "text": "Eine Mitgliederliste in eine erste Tabelle übertragen. Ca. 90 Minuten."},
      {"label": "Abend 3: Beziehungen zwischen Tabellen modellieren", "text": "Mitglieder und Kurse über eine Zwischentabelle verbinden. Ca. 90 Minuten."},
      {"label": "Abend 4: Erste Abfragen mit SELECT und WHERE", "text": "Fragen an die eigene Tabelle stellen und Ergebnisse prüfen. Ca. 90 Minuten."},
      {"label": "Abend 5: Datenbankgestützte Mitgliederverwaltungsprogramme", "text": "Ein fertiges Programm untersuchen und mit dem eigenen Modell vergleichen. Ca. 90 Minuten."},
      {"label": "Abend 6: Abschluss und Ausblick", "text": "Die eigene Datenbank vorstellen und offene Fragen klären. Ca. 90 Minuten."}
    ]
  },
  "explore": [
    {
      "icon": "📖",
      "title": "Die Bibliothek kennenlernen",
      "description": "Komponenten und ihre Makros in der Dokumentation ansehen.",
      "label": "Dokumentation öffnen",
      "href": "README.md"
    }
  ],
  "footer": "Fiktive Planung für die gemeinsame Gestaltungsdiskussion."
}
```

## Vor dem ersten Material

Der Ablaufplan steht, aber noch keine Einheit hat Material. Statt einer Leiste bei null steht ein Satz. Der Zähler unter **Gesamter Kurs** zählt nur Planungsschritte; das freiwillige Veröffentlichen zählt nicht mit. Jede Einheit hat von Anfang an dieselben Arbeitsschritte.

```json @Dashboard.View
{
  "title": "Datenbanken verstehen",
  "context": "Erwachsenenbildung · drei Abende à 90 Minuten · fiktives Darstellungsbeispiel",
  "subtitle": "Der Ablaufplan steht. Als Nächstes entsteht das Material für den ersten Abend.",
  "unitsTitle": "Abende",
  "unitLabel": {"one": "Abend", "many": "Abenden"},
  "next": {
    "title": "Material für Abend 1 beginnen",
    "why": "Ziele, Aktivitäten und Zeit stehen fest; jetzt entstehen Aufgaben und Hilfen.",
    "label": "Möglichkeiten ansehen",
    "href": "agent:teaching/help",
    "command": ":help"
  },
  "selected": "",
  "process": {
    "title": "Kursplanung",
    "steps": [
      {"title": "Rahmen und Gliederung", "state": "done", "result": "Drei Abende mit je einem Lernziel."},
      {"title": "Lernaktivitäten planen", "state": "done", "result": "Ein Ablaufmuster für alle Abende."},
      {"title": "Ablaufplan", "state": "done", "result": "Drei Abende à 90 Minuten."},
      {"title": "Material erstellen", "state": "current", "why": "Abend für Abend entsteht das Material."},
      {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Erst eine bestandene Prüfung gibt das Material frei."},
      {"title": "Veröffentlichen", "state": "optional", "why": "Bei Bedarf den geprüften Kurs als Link teilen."}
    ]
  },
  "units": [
    {"id": 1, "title": "Wozu Datenbanken?", "state": "planned", "summary": "Im Ablaufplan: 90 Minuten, Beispiele sammeln und vergleichen.", "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "planned", "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar."},
          {"title": "Gemeinsam durchsehen", "state": "planned", "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab."},
          {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft."}
        ]}},
    {"id": 2, "title": "Tabellen und Beziehungen", "state": "planned", "summary": "Im Ablaufplan: 90 Minuten, eine erste Tabelle anlegen.", "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "planned", "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar."},
          {"title": "Gemeinsam durchsehen", "state": "planned", "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab."},
          {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft."}
        ]}},
    {"id": 3, "title": "Erste Abfragen", "state": "planned", "summary": "Im Ablaufplan: 90 Minuten, Fragen an die eigene Tabelle.", "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "planned", "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar."},
          {"title": "Gemeinsam durchsehen", "state": "planned", "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab."},
          {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft."}
        ]}}
  ],
  "footer": "Fiktive Planung für die gemeinsame Gestaltungsdiskussion."
}
```

## Nach dem ersten Arbeitsschritt

Der erste Arbeitsschritt von Abend 1 ist erledigt, fertig ist noch kein Abend. Die Karte zeigt „Angefangen“ statt „Noch offen“, obwohl der Zustand in den Daten `planned` bleibt. Statt einer leeren Leiste nennt ein Satz den laufenden Abend mit seinen Schritten, und der Zähler unter **Gesamter Kurs** zeigt den Teilwert des Materials.

```json @Dashboard.View
{
  "title": "Datenbanken verstehen",
  "context": "Erwachsenenbildung · drei Abende à 90 Minuten · fiktives Darstellungsbeispiel",
  "subtitle": "Der Materialentwurf für den ersten Abend liegt vor. Als Nächstes sehen wir ihn gemeinsam durch.",
  "unitsTitle": "Abende",
  "unitLabel": {"one": "Abend", "many": "Abenden"},
  "next": {
    "title": "Materialentwurf für Abend 1 durchsehen",
    "why": "Sprache und Schwierigkeit passen erst, wenn Sie sie auf Ihre Zielgruppe abgestimmt haben.",
    "label": "Möglichkeiten ansehen",
    "href": "agent:teaching/help",
    "command": ":help"
  },
  "selected": "",
  "process": {
    "title": "Kursplanung",
    "steps": [
      {"title": "Rahmen und Gliederung", "state": "done", "result": "Drei Abende mit je einem Lernziel."},
      {"title": "Lernaktivitäten planen", "state": "done", "result": "Ein Ablaufmuster für alle Abende."},
      {"title": "Ablaufplan", "state": "done", "result": "Drei Abende à 90 Minuten."},
      {"title": "Material erstellen", "state": "current", "why": "Abend für Abend entsteht das Material."},
      {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Erst eine bestandene Prüfung gibt das Material frei."},
      {"title": "Veröffentlichen", "state": "optional", "why": "Bei Bedarf den geprüften Kurs als Link teilen."}
    ]
  },
  "units": [
    {"id": 1, "title": "Wozu Datenbanken?", "state": "planned", "summary": "Materialentwurf liegt vor: Beispiele sammeln und vergleichen.", "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "done", "result": "Erklärung, zwei Aufgaben und eine Hilfe."},
          {"title": "Gemeinsam durchsehen", "state": "planned", "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab."},
          {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft."}
        ]}},
    {"id": 2, "title": "Tabellen und Beziehungen", "state": "planned", "summary": "Im Ablaufplan: 90 Minuten, eine erste Tabelle anlegen.", "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "planned", "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar."},
          {"title": "Gemeinsam durchsehen", "state": "planned", "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab."},
          {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft."}
        ]}},
    {"id": 3, "title": "Erste Abfragen", "state": "planned", "summary": "Im Ablaufplan: 90 Minuten, Fragen an die eigene Tabelle.", "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "planned", "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar."},
          {"title": "Gemeinsam durchsehen", "state": "planned", "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab."},
          {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft."}
        ]}}
  ],
  "footer": "Fiktive Planung für die gemeinsame Gestaltungsdiskussion."
}
```

## Schon nutzbar, noch nicht fertig geprüft

Abend 1 ist geprüft und mit den Lernenden nutzbar, es fehlt noch ein Foto und die kurze Nachprüfung einer Änderung. Die Karte beginnt mit dieser Antwort, danach folgen der Prüfchip mit den offenen Punkten und der Schrittzähler. Die Fortschrittszeile sagt „Fertig geprüft: noch keine · Schon nutzbar: …“ statt „Noch nichts fertig“. Unter der Karte führt „So sehen es die Lernenden“ zum Material, „Planung ansehen“ zur Planung.

```json @Dashboard.View
{
  "title": "Datenbanken verstehen",
  "context": "Erwachsenenbildung · drei Abende à 90 Minuten · fiktives Darstellungsbeispiel",
  "subtitle": "Abend 1 kann schon eingesetzt werden. Ein Foto fehlt noch.",
  "unitsTitle": "Abende",
  "unitLabel": {"one": "Abend", "many": "Abenden"},
  "next": {
    "title": "Bilder einfügen – Abend 1",
    "why": "Mit dem Foto ist Abend 1 vollständig; danach sehe ich die geänderte Seite noch einmal kurz durch.",
    "label": "Möglichkeiten ansehen",
    "href": "agent:teaching/help",
    "command": ":help"
  },
  "units": [
    {"id": 1, "title": "Wozu Datenbanken?", "state": "review", "href": "#schon-nutzbar,-noch-nicht-fertig-geprüft",
     "statusLabel": "bestanden – es fehlt noch: 1 Foto – 1 Punkt seither geändert – kurze Nachprüfung offen",
     "usable": {"state": "limited", "missing": ["1 Foto", "kurze Nachprüfung"]},
     "view": {"href": "agent:teaching/preview?file=1", "command": ":preview 1"},
     "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "done", "result": "Erklärung, zwei Aufgaben und eine Hilfe."},
          {"title": "Gemeinsam durchsehen", "state": "done", "result": "Von Ihnen durchgesehen und freigegeben."},
          {"title": "Bilder einfügen", "state": "current", "result": "2 von 3 Fotos eingefügt.", "next": "Das Foto für die Seite „Tabellen im Alltag“."},
          {"title": "Prüfen und überarbeiten", "state": "review", "result": "Bestanden; ein Satz seither gekürzt."}
        ]}},
    {"id": 2, "title": "Tabellen und Beziehungen", "state": "planned", "process": {"steps": [
          {"title": "Materialentwurf erstellen", "state": "planned", "why": "Erklärungen, Aufgaben und Hilfen machen den Plan nutzbar."},
          {"title": "Gemeinsam durchsehen", "state": "planned", "why": "Sie stimmen Sprache und Schwierigkeit auf Ihre Zielgruppe ab."},
          {"title": "Bilder einfügen", "state": "optional", "why": "Nur wenn das Material Bilder vorsieht."},
          {"title": "Prüfen und überarbeiten", "state": "planned", "why": "Verständlichkeit und Bezug zu den Lernzielen werden geprüft."}
        ]}}
  ],
  "footer": "Fiktive Planung für die gemeinsame Gestaltungsdiskussion."
}
```
