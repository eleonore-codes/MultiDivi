# MultiDivi V3 — Prüfbericht, 21.09.2026

## Automatisiert

`npm test`: **35 bestanden, 0 fehlgeschlagen**.

- 1938 erzeugte Aufgabenformen; exakte Division, Division mit Rest, Stellenwerttransfer, größere Faktoren, Teilprodukte und alternative Teilquotienten.
- Eingabe von rechts nach links einschließlich Nullen, Korrekturen und doppelter Eingabeereignisse.
- Abrufzeit, Unterbrechungen, adaptive Priorität, schwache/langsame Fakten unabhängig von sichtbarem Erfolg.
- 3+2-Phasen, Phasenwechsel, gezielte Wiederholung und kein dritter Tagesdurchlauf.
- Schema-2-Migration ohne Verlust von Lerndaten; bestehende Erfolgskarten, Nummern und Serien bleiben erhalten.
- Erste/zweite Vergabe, gleiche und aufeinanderfolgende lokale Tage, Datumslücke und Sommerzeit, längste Serie, winzige/nichtqualifizierende Ergebnisse.
- Snapshot-basierte PNG-Inhalte ohne private Zusatzfelder; Share-API-Fallback.
- Alle Level bei frischem Profil, null Erfolgen, schwacher Beherrschung, nach Reset und nach Reload verfügbar.
- Strukturierte Erfolgsanforderungen Level 5/6; punktuelle Grundfaktbeobachtung ohne falsche automatische Beherrschung.
- Revisionskonflikt und fehlgeschlagene Speicherung.
- Offline-Precache sämtlicher lokaler Laufzeitmodule unter GitHub-Pages-Unterpfad; keine externen Laufzeitabhängigkeiten.

## Browser (aktueller Stand)

Getrennte lokale Testdaten auf Port 8772, keine Daten des öffentlich genutzten GitHub-Profils verändert.

- Alle sechs Level der Reihe nach ausgewählt, jeweils `aria-pressed=true`; Level 6 blieb nach Reload ausgewählt.
- Erfolgsbericht und tatsächlich erzeugtes PNG visuell geprüft: Erfolg Nr. 1, 100 %, 12 Aufgaben, 1 erfolgreicher Tag, 3-Minuten-Training, lokales Datum und ein Anerkennungssatz. Speichern/Öffnen/Teilen-Steuerelemente vorhanden.
- Reload blieb bei Erfolg Nr. 1, keine zweite Vergabe.
- HTTP-Server beendet, kein Listener mehr auf Port 8772: App neu geladen und Level 6 erfolgreich offline gestartet.
- Keine JavaScript-Fehler im abschließenden Browserprotokoll.

## Grenzen

Kein tatsächlicher Versand an Empfänger, kein physisches iPhone/Safari, keine erneute umfassende Screenreaderprüfung. GitHub Pages nicht neu veröffentlicht. Mobile Gestaltung basiert auf dem unveränderten V2-Layout; die neue Karte wurde im Desktop-Browser visuell geprüft. Historische V2-Karten haben keinen nachträglich erfundenen exakten Zeitstempel. Ganz alte V1-Profile werden geschützt blockiert, statt sie stillschweigend zu ersetzen; die unterstützte Update-Migration ist V2 → V3.
