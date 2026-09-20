# V2 – Prüfbericht
Stand: 20. September 2026.

## Automatisch
**26 Tests bestanden, 0 fehlgeschlagen** mit Node.js 24.20.0 und npm test.

- Alle 500 Level-1-Aufgabenformen gegen mögliche Antworten geprüft: eindeutig richtig.
- Alle 450 Restaufgaben: Rest strikt positiv und kleiner als Divisor, vollständige Rekonstruktion.
- Alle 270 Zehneraufgaben und 304 Aufgaben mit größeren Faktoren: richtige Produkte und ganzzahlige Division.
- Alle 243 Rechenbretter: richtige Zerlegungen, Teilprodukte und Gesamtsumme.
- Alle 171 Divisionsaufgaben: mathematisch gültige Ausgangsbeziehungen. Insgesamt 1.938 verschiedene Aufgaben-IDs.
- Alle geforderten Eingabebeispiele 8, 12, 21, 56, 80, 81, 100, 104, 140, 240, 322, 630, 1000; Löschen, Wiederholung, bedeutsame Nullen und mögliche Stellenwertfehler.
- Erste Ziffer und gesamte Eingabedauer getrennt; langsames Tippen allein verhindert Automatisierung nicht; Unterbrechungen werden nicht zur Fluenzbewertung genutzt.
- Unsicherheit, langsame richtige Antworten, ausreichende Beobachtungen und automatisierte Aufgaben getrennt.
- 500 deterministisch ausgewählte Aufgaben: Familienabstand, alle Reihen, leichte und bereits automatisierte Aufgaben bleiben vorhanden.
- Exakt 90 %, knapp darunter, kleine Stichproben, separate Kriterien für Rechenwege.
- Doppelte Phasenvergabe nach Serialisierung ausgeschlossen; zwei Erfolge am selben Tag bei einmaliger Serienerhöhung.
- Lokale Tagesgrenzen, Sommerzeit, Folgetage und ausgelassene Tage.
- Freischaltung nach fünf Erfolgen, kein Abzug bei schwachen Ergebnissen, dauerhafte Freischaltung.
- Weitere Stufen erfordern eigene Beobachtungs-/Abdeckungs-/Strategiekriterien.
- Freie Teilproduktreihenfolge; richtige Zellen bei einem Fehler erhalten; unabhängige Korrektur und Zusammensetzen.
- Verschiedene gültige Teilquotientenfolgen und Ablehnung unpassender Vielfacher.
- Komponententraining statt vollständiger Wiederholung.
- Phasenübergänge, Tagesabschluss, Tageshistorie und Start am Folgetag.
- Laden/Speichern/Reset, unbekannte oder beschädigte Versionen und Speicherfehler.
- Ungeübte Formen im Erwachsenenbereich separat; vorsichtige Vergleiche ohne erfundene Verbesserung.
- Dateifreigabe-Erkennung einschließlich fehlender und fehlerwerfender API.
- Worker-Vorcache enthält lokale Module und bleibt unter /MultiDivi/. Aktivierung nur nach Freigabe bzw. Lebenszyklus.
- Keine externen Laufzeitressourcen und keine früheren Kartenthemen.

## Im Browser
Im Codex-Browser mit 390 × 844 CSS-Pixeln:

- Level 1: 7×8 mit 6 → 5 → Fertig ergibt 56. Nur eine Zahlendarstellung; kein Hinweis auf die richtige Stellenanzahl.
- Level 2: Ergebnis und Rest jeweils separat Einer zuerst.
- Level 3: 30×8 mit 0 → 4 → 2.
- Level 4: 26×4 mit 4 → 0 → 1.
- Level 5: 23×14 vollständig zerlegt; Teilprodukte in selbst gewählter Reihenfolge. Zwei richtige Zellen über Neuladen erhalten. Weitere richtige Zelle beibehalten, falsche 20 statt 200 korrigiert, Ergebnis 322 eingegeben.
- Level 6: 156:12 vollständig über 10 und 3 Teilquotienten inklusive Produkt, Subtraktion und Endsumme bearbeitet.
- Phasengrenze überschritten: Aufgabe blieb aktiv, danach korrekter Zwischenbericht.
- Qualifizierender Zwischenbericht: Erfolg Nr. 1, Mindestmenge erfüllt. Einzelantwort 1/1 zeigte unterstützende Rückmeldung, aber keine Erfolgsnummer.
- Zweiter Teil beendet; Abschluss bietet keine dritte Trainingsphase. Neuladen belässt den Abschluss.
- Erwachsenenbereich mit Zählern, geöffnetem Zustandsbereich und korrekter Trennung unzureichend geübter Formen.
- Reset mit Warnung und zweiter ausdrücklicher Bestätigung; separates Entwicklungsprofil danach bei null.
- Neue Erfolgskarte visuell geprüft: lesbare Hierarchie, Datum, Stufe, Phase, Quote, Erfolgsnummer und Serie. Speichern/Öffnen/Teilen verfügbar.
- Keine horizontalen Überläufe in den geprüften Ansichten; lange Erwachsenenansicht und längere Rechenanweisungen dürfen vertikal scrollen.
- Offline-Test mit beendetem lokalem HTTP-Server: Neuladen und erneute PNG-Erzeugung funktionieren.
- In den geprüften Browserabläufen keine JavaScript-Konsolenfehler.

## Grenzen der Prüfung
Kein echtes iPhone, Safari oder VoiceOver verfügbar. Native iOS-Dateifreigabe an einen Empfänger, Home-Bildschirm-Installation, reale Safe-Area und 200-%-Textvergrößerung sind nicht als getestet ausgewiesen. Der komplette Ablauf wurde mit lokalen Testdaten und verkürzten Entwicklungszeiten geprüft; Produktionszeiten sind durch Konfiguration und Tests mit 180/120 Sekunden abgesichert.

Die mathematischen Bereiche sind vollständig generatorseitig geprüft, aber nicht jede der 1.938 Aufgaben wurde im Browser angeklickt. Pädagogische Wirksamkeit und individuelle Zeitgrenzen müssen im echten Einsatz beobachtet werden.

V2 wurde lokal am geklonten GitHub-Repository erstellt. Eine neue öffentliche GitHub-Pages-Bereitstellung wurde noch nicht durchgeführt. Der Unterpfad /MultiDivi/ wurde lokal verwendet; der reale Pages-Workflow muss nach Upload erfolgreich laufen.
