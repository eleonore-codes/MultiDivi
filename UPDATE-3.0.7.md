# MultiDivi 3.0.7

Level 6: Teilquotient ändern nimmt eine gewählte Anzahl samt gegebenenfalls berechnetem Produkt zurück, solange die Subtraktion noch nicht abgeschlossen ist. Letzte Teilrechnung zurücknehmen stellt nach einer abgeschlossenen Subtraktion den vorherigen Rest wieder her. Wiederholtes Zurücknehmen erlaubt weitere Korrekturen; frühere verbleibende Teilrechnungen bleiben erhalten. Auch vor dem abschließenden Zusammensetzen nutzbar, nicht mehr nach Abschluss der Aufgabe.

Die aktuelle Zifferneingabe wird geleert. Strategieänderungen erzeugen keine Fehler. Bereits tatsächlich beobachtete Fehler und Komponentenbeobachtungen bleiben erhalten. Zurückgenommene richtige Schritte zählen nicht zusätzlich zur Schrittzahl des abgeschlossenen Rechenwegs. Trainingszeit läuft regulär weiter, Lernstand wird gespeichert.

43 Tests bestanden. Neu geprüft: 299 : 13, Teilquotient 2 nach Produkt 26 verwerfen, anschließend 20×13=260, Rest 39, dann 3×13=39 und Gesamtergebnis 23; wiederholtes Zurücknehmen fertiger Teilrechnungen; Reload; Fehlererhalt; Zurücknehmen vor Schlussaddition. Syntaxprüfung bestanden. Geändert: strategy.js, app.js, service-worker.js, package.json; neue Tests in tests/division-undo.test.js. Alle vorherigen Updates enthalten. Noch nicht veröffentlicht.
