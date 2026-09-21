# MultiDivi 3.0

Statische Offline-Lernapp für GitHub Pages. Alle sechs Level sind von Anfang an auswählbar, unabhängig von Erfolgen oder Beherrschungsstand. Ein täglicher Durchlauf: 3 Minuten allgemeines Training und 2 Minuten gezieltes Training, jeweils mit Fertigstellen der aktuellen Aufgabe. Zifferneingabe beginnt bei den Einern.

## Installation / Update

Den Inhalt von `MultiDivi-v3.zip` direkt in die Wurzel des bestehenden Repositorys laden und gleichnamige Dateien ersetzen. Keine zusätzliche übergeordnete Ordnerstufe. GitHub Pages weiterhin aus dem bisherigen Branch und `/ (root)` veröffentlichen. Die URL bleibt gleich. Nach der Bereitstellung die App online öffnen und „Neue Version laden“ benutzen; gegebenenfalls alte App-Tabs schließen und neu öffnen. Keine Website-Daten löschen: Version 2 wird automatisch datenerhaltend auf Schema 3 migriert.

## Erfolgskriterien

| Level | 3 Minuten | 2 Minuten Fokus |
| --- | --- | --- |
| 1–4 | mindestens 90 % richtig, mindestens 12 Aufgaben | mindestens 90 % richtig, mindestens 8 Aufgaben |
| 5–6, vollständige Rechenwege | mindestens 80 % fehlerfreie Aufgaben, mindestens 2 fehlerfreie vollständige Rechnungen und 8 richtige Schritte | gleiche Kriterien |
| 5–6, ausschließlich Komponententraining | mindestens 80 % richtig, mindestens 8 Teilaufgaben | mindestens 80 % richtig, mindestens 6 Teilaufgaben |

Konfiguration: `config.js`. Ein Erfolg verändert keinen Beherrschungszustand. Alle sechs Level bleiben auch ohne Erfolg und nach dem vollständigen Eltern-Reset verfügbar.

## Daten und Karten

Lokale Speicherung unter `multidivi-learning`, Schema 3. Entwicklungsmodus `?dev=1` ausschließlich auf localhost, mit separatem Schlüssel. Die globale Erfolgsnummer heißt im Code `successNumber`. `cards` enthält die gespeicherten Erfolgsevents einschließlich unveränderlicher Momentaufnahmen. `awardedPhases` verhindert wiederholte Vergabe derselben Phase.

`learningDays` zählt lokale Tage mit mindestens einem qualifizierenden Erfolg. Frühere Übungstage ohne Erfolg bleiben als `practiceDays` und in den Tageszusammenfassungen erhalten. Die Serie steigt höchstens einmal je lokalem Kalendertag. Ein ausgelassener Tag lässt die nächste erfolgreiche Serie bei 1 beginnen; der Höchstwert bleibt erhalten.

Karten entstehen clientseitig als PNG. Sie enthalten nur Appkennung, Nummer, Datum, Ergebnis, Trainingsart, Serie und einen kurzen Anerkennungssatz. Teilen ist optional; Bild speichern/öffnen dient als Fallback.

Fortschritt zeigt erfolgreiche Lerntage, Erfolge, aktuelle/längste Serie, trainierte Level, Aufgabenbeherrschung und letzte sieben Übungstage. Prozentwerte beziehen sich auf explizite Aufgabenformen. Zurücksetzen erfolgt in zwei Bestätigungsschritten im Elternbereich.

## Prüfung

`npm test` führt alle Tests ohne externe Abhängigkeiten aus. Lokale Vorschau: `python -m http.server 8772` im Projektordner. Details und Grenzen: `HANDOVER-V3.md` und `TEST-REPORT.md`. `HANDOVER-V2.md` dokumentiert ausschließlich den historischen V2-Stand; dessen Freischaltregeln gelten nicht mehr.
