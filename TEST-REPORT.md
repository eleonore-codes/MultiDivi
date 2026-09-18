# Prüfung der ersten Version

Stand: 18. September 2026. Keine Veröffentlichung erfolgt.

## Automatisch – bestanden

`npm test` (Node.js 24.20.0): **9 Tests, 9 bestanden, 0 fehlgeschlagen**.

- Alle 500 Level-1-Formen gegen sämtliche möglichen Antworten 0–100 geprüft: genau eine richtige Antwort, ganzzahlige Division, vollständige Faktoren 1–10.
- Alle 450 Restaufgaben geprüft: Dividend = Divisor × Quotient + Rest; Rest strikt größer null und kleiner als Divisor.
- Fehler und langsame richtige Antworten erhöhen Priorität; wiederholt schnelle Antworten erreichen Automatisierung; automatisierte Formen behalten Wiederholungsgewicht.
- 1.500 deterministisch ausgewählte Aufgaben: keine Wiederholung einer der letzten vier Familien, alle zehn Reihen vorhanden, leichte Aufgaben weiterhin enthalten.
- Freischaltung scheitert an geringer Breite trotz vieler richtiger leichter Antworten; gelingt bei breiter Automatisierung; gespeichertes Flag bleibt auch bei später schlechterer Leistung erhalten.
- Serialisierung, Tageswechsel, Historie, Speicherfehler und kaputte JSON-Daten geprüft.
- A → Zwischenbericht → B → Abschluss; Standardzeiten 360/240 Sekunden und getrennte Entwicklungszeiten geprüft.
- Unvergleichbare Aufgaben ergeben keine erfundene Verbesserung.
- Dateifreigabe: fehlende, nicht unterstützte, fehlerwerfende und unterstützte APIs geprüft. Drei Datumsmotive rotieren.

Der erste Aufruf des Node-Test-Runners wurde durch die Prozessbeschränkung der Umgebung gestoppt. Der finale npm-Testbefehl verwendet daher `--test-isolation=none`; die eigentlichen Tests liefen danach erfolgreich.

## Im Browser – geprüft

- Startseite und ruhige Rechenoberfläche unter dem Unterpfad `/einmaleins/`.
- 390 × 844: gesamte Level-1-Aufgabe einschließlich Tastatur und Prüfen sichtbar.
- Zusätzlich 320 × 568, 375 × 812 und 430 × 932 eingestellt: kein horizontales Überlaufen in den geprüften Ansichten. Bei geringer Höhe ist vertikales Scrollen nötig und möglich.
- Testablauf mit verkürzten Zeiten: richtige Antwort, „✓ Richtig“, Zwischenbericht, gezielter Teil, falsche Antwort und vollständig sichtbare richtige Beziehung, Abschluss ohne dritte Runde.
- Neuladen während Teil B: Fortsetzen bietet dieselbe Aufgabe an; Ergebnis aus Teil A bleibt erhalten.
- Restaufgabe 58 : 7: Ergebnis 8 eingeben; Prüfen wechselt bei fehlendem Rest zum Restfeld; Rest 2 ergibt „✓ Richtig“.
- Alle drei Karten mit Testdaten als PNG erzeugt und visuell betrachtet. Statistiken sind frei von Überlagerungen; Illustrationen erscheinen ausschließlich auf Karten.
- Offline-Test: Produktions-App einmal laden, lokalen HTTP-Server beenden, Test-App neu laden. Abschlussseite lädt weiterhin, Erfolgskarte lässt sich ohne Server neu erzeugen. Teilen-, Speichern- und Öffnen-Schaltflächen erscheinen.
- Keine JavaScript-Fehler in den geprüften Browser-Konsolen.

## Statisch geprüft

- Produktionszeiten 6 + 4 Minuten; unsichtbare Aufgabenzeit; fertige Antwort nach Zeitablauf bleibt möglich.
- Ausschließlich lokale Laufzeitmodule und Assets; relative Ressourcen-/Service-Worker-Pfade.
- Keine externen Bibliotheken, Netz-APIs, Analyse, Namen, Markenlogos oder fremden Grafiken.
- Cache umfasst sämtliche Laufzeitdateien. Manifest mit relativer Startadresse und Scope.
- Kinderoberfläche deutsch; Rückmeldungen nutzen Zeichen, Text und Farbe.

## Noch am echten Gerät prüfen

Kein physisches iPhone/Safari war verfügbar. Die iOS-Freigabe an einen Empfänger wurde nicht ausgeführt; geprüft wurden die Erkennung, PNG-Erzeugung und angebotenen Fallbacks. Installation zum Home-Bildschirm, reale Safe-Area, VoiceOver, 200-%-Textvergrößerung und iOS-Speicherbereinigung sind nicht als bestanden ausgewiesen. Auch ein realer 10-Minuten-Durchlauf mit dem Kind und längerfristige pädagogische Wirksamkeit wurden nicht getestet. Die Schwellenwerte sind ausdrücklich anpassbare Anfangswerte.

Die lokale Seite `tests/browser-fixtures.html` ermöglicht die Restaufgabe und alle Kartenthemen erneut zu prüfen. Sie setzt ausschließlich den separaten lokalen Entwicklungslernstand; auf einer öffentlichen Domain sind diese Fixture-Aktionen deaktiviert.

## Anpassung auf 6 + 4 Minuten

Produktionsdauer, Startseite, Zwischenmeldung, Abschluss und Karten auf 6 + 4 Minuten angepasst. Fokusfamilien stammen vorrangig ausschließlich aus falschen Antworten; ohne Fehler werden langsamere/unsichere Aufgaben geübt. Zusätzlicher Regressionstest für diese Auswahl. Service-Worker-Version erhöht. Die oben dokumentierten Browserprüfungen stammen vom ursprünglichen Durchlauf; die Anpassung wurde durch die automatisierten Tests geprüft.
