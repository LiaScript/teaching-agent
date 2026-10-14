<!--
language: de
narrator: Deutsch Female
mode: Textbook
version: 0.0.1
import: ./README.md
-->

# Dashboard-Demo

Dieser Entwurf zeigt sechs fiktive Einheiten. Wähle eine Einheit, um ihren Materialprozess zu sehen. Die Auswahl verändert nur die Ansicht.

## Dashboard

```json @Dashboard.View
{
  "title": "Datenbanken verstehen",
  "context": "Sechs Einheiten · fiktives Darstellungsbeispiel",
  "subtitle": "Dein Kurs nimmt Form an. Am SQL-Material arbeiten wir weiter.",
  "notice": "Diese Beispieldaten zeigen die Oberfläche. Sie sind keine bestätigte Kursplanung.",
  "next": {
    "title": "Den Materialentwurf für SQL erstellen",
    "why": "Lernziele und Lernaktivitäten liegen bereits vor. Jetzt entstehen konkrete Aufgaben und Hilfen.",
    "label": "SQL-Prozess ansehen",
    "href": "#2",
    "selectUnit": 3
  },
  "units": [
    {
      "id": 1,
      "title": "Einführung",
      "state": "done",
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
            "why": "Die Lehrkraft stimmt Sprache und Schwierigkeit auf die Zielgruppe ab.",
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
            "why": "Die Lehrkraft stimmt Sprache und Schwierigkeit auf die Zielgruppe ab.",
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
            "why": "Die Lehrkraft stimmt Sprache und Schwierigkeit auf die Zielgruppe ab.",
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
            "why": "Die Lehrkraft stimmt Sprache und Schwierigkeit auf die Zielgruppe ab.",
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
            "why": "Die Lehrkraft stimmt Sprache und Schwierigkeit auf die Zielgruppe ab.",
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
            "why": "Die Lehrkraft stimmt Sprache und Schwierigkeit auf die Zielgruppe ab.",
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
  "explore": [
    {
      "icon": "📖",
      "title": "Die Library kennenlernen",
      "description": "Komponenten und ihre Makros in der Dokumentation ansehen.",
      "label": "Dokumentation öffnen",
      "href": "README.md"
    }
  ],
  "footer": "Fiktive Zustände für die gemeinsame Gestaltungsdiskussion."
}
```
