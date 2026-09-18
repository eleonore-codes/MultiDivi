# Einmaleins in Ruhe

Eine statische, deutschsprachige Lern-App für das kleine Einmaleins und die zugehörigen Geteiltaufgaben. Große Zahlentastatur, keine Bildschirmtastatur, kein sichtbarer Zeitdruck, keine Anmeldung. Die Rechenansicht bleibt frei von Illustrationen. Nur selbst erstellte Erfolgskarten zeigen ein neutrales Auto, Bausteine oder Tennis.

## Starten

Im Projektordner mit Python 3:

```sh
python -m http.server 8000
```

Danach `http://localhost:8000/` öffnen. Nicht per Doppelklick auf index.html starten: ES-Module und Service Worker brauchen HTTP bzw. HTTPS. Keine Installation, kein Build, keine Laufzeitpakete nötig. Optional Node.js 22 oder neuer zum Testen: `npm test`.

## Aufbau

| Datei | Aufgabe |
| --- | --- |
| index.html, styles.css | Semantisches Grundgerüst und responsive Gestaltung |
| app.js | Ansichten, Eingabe, unsichtbare Zeitmessung und Browser-Lebenszyklus |
| config.js | Pädagogische Parameter, Produktions- und Testzeiten, zentrale Rückmeldungen |
| content.js | 500 Mal-/Geteiltformen sowie 450 Aufgaben mit echtem Rest |
| learning-engine.js | Beobachtungen, Beherrschung, gewichtete Auswahl, Freischaltung |
| session.js | Antworten verbuchen und Phasen abschließen |
| statistics.js | Auswertung und vorsichtiger Vorher-/Nachhervergleich |
| storage.js | Versioniertes lokales Datenformat und Tageswechsel |
| share-card.js | PNG-Erzeugung mit Canvas und Erkennung der Dateifreigabe |
| service-worker.js, manifest.json, icon-* | Offline-Speicher und installierbare Web-App |
| tests/engine.test.js | Mathematik-, Lernmodell-, Speicher- und Ablauftests |

## Lernmodell

Alle geordneten Faktorenpaare von 1 bis 10 kommen in fünf Formen vor: Ergebnis, rechter Faktor, linker Faktor, Quotient und Divisor. Eine Familie fasst a×b, b×a und zugehörige Divisionen zusammen. Beherrschung wird trotzdem pro Aufgabenform separat nachgewiesen; eine richtige Malaufgabe macht nicht automatisch die verwandte Geteiltaufgabe sicher.

Gespeichert werden Versuche, richtig/falsch, die letzten zwölf Antworten und Antwortzeiten, schnelle Erfolgsserie, letzter Übungszeitpunkt, Zustand und Score. Zustände sind neu, unsicher, langsam, im Aufbau, sicher und automatisiert. Die Geschwindigkeit ist der Median der zuletzt korrekt und ohne Unterbrechung beantworteten Aufgaben. Ab 60 Sekunden oder bei Seitenwechsel/Pause zählt die Antwort für die Genauigkeit, aber nicht für die Geschwindigkeit. Unterbrochene Antworten verlängern keine schnelle Erfolgsserie.

Die Auswahl kombiniert gewichtete Unsicherheit, langsame Antworten, unbesuchte Aufgaben, leichte Erfolgserlebnisse und mit der Zeit steigende Wiederholungspriorität. Die letzten vier Familien sind vorübergehend ausgeschlossen. Automatisierte Aufgaben behalten ein positives Gewicht. Leichte Aufgaben werden ausdrücklich mit ausgewählt. In Teil 2 werden nach Möglichkeit 72 % der Auswahl auf bis zu acht in Teil 1 falsch beantwortete Familien konzentriert (nur wenn keine Fehler vorliegen: langsame oder unsichere Familien); die Abstandsregel hat Vorrang.

## Pädagogische Startwerte

Alle Grenzwerte stehen in `config.js`. Sie sind abstimmbare Produktentscheidungen, keine diagnostisch validierten Normwerte.

| Einstellung | Standard |
| --- | --- |
| Allgemeiner Teil / gezielter Teil | 360 / 240 Sekunden |
| Schnell / schnell bei Restaufgaben | höchstens 6 / 10 Sekunden, inklusive Zahleneingabe |
| Automatisiert | mindestens 6 Versuche, mindestens 90 % zuletzt richtig, Median höchstens 6 Sekunden, mindestens 3 schnelle richtige Antworten in Folge |
| Sicher | mindestens 3 Versuche, mindestens 80 % zuletzt richtig, schneller Median |
| Stufe 2: Beobachtungen | mindestens 600 insgesamt und mindestens 100 zuletzt gültig zeitgemessene richtige Antworten |
| Stufe 2: letzte maximal 200 Antworten | mindestens 95 % richtig und Median höchstens 6 Sekunden |
| Stufe 2: Breite | 80 % aller 500 Formen automatisiert; außerdem je 80 % der direkten Mal- und Geteiltaufgaben automatisiert; 90 % der 55 Familien mindestens dreimal in mindestens einer Form geübt |

Die breite Freischalthürde ist bewusst anspruchsvoll: faktisch müssen für die 80 % Formenabdeckung mindestens 2.400 Versuche vorliegen. Die Mindestzahl 600 allein genügt also nie. Nach realer Nutzung insbesondere Eingabezeit, sechs Sekunden und Umfang der Formenabdeckung überprüfen. Einmal freigeschaltet bleibt Stufe 2 gespeichert und kann an folgenden Tagen unabhängig vom Tagestraining als eigener Fünf-Minuten-Modus gestartet werden. Nach dem Abschluss des täglichen Trainings gibt es an diesem Tag keine dritte Runde.

## Zeit und Wiederaufnahme

6 + 4 Minuten sind die Sollzeiten aktiver Übungszeit, einschließlich Rückmeldungen. Pausen, verdeckte Seiten, geschlossene Browser und der Zwischenbericht zählen nicht. Antwortzeit startet nach zwei Render-Frames und endet bei „Prüfen“. Eine laufende Aufgabe wird nach Zeitablauf fertig beantwortet; ihre Rückmeldung bleibt bis „Weiter“ sichtbar. Daher kann die tatsächliche Dauer etwas länger als 10 Minuten sein. Ein unsichtbarer viersekündlicher Speicherpunkt begrenzt bei einem harten Absturz den Verlust der Phasenzeit; jede Antwort wird sofort gespeichert.

Nach Neuladen wird die aktuelle Aufgabe unverändert angeboten, eine unvollständige Zahl muss neu eingegeben werden. Bereits verbuchte Rückmeldungen werden nicht doppelt gezählt. Ein neuer lokaler Kalendertag beginnt beim nächsten Laden mit einer neuen Tagesübung, auch wenn die alte unvollständig war; langfristige Werte bleiben erhalten. Ein zweites Fenster wird bei Änderungen angehalten, damit es ältere Daten nicht weiter überschreibt. Ein einzelnes Fenster verwenden.

## Datenspeicherung und Datenschutz

`einmaleins-in-ruhe-v1` enthält Versionsnummer, Aufgabenmodell, dauerhaftes Level-2-Flag, Level-1-Beobachtungen, heutigen Ablauf und bis zu 90 kompakte Tagesberichte. Pro Aufgabenform bleiben zwölf Einzelbeobachtungen erhalten, für die Freischaltung höchstens 200. Alte Tage behalten Ergebnisse, keine vollständigen Antwortlisten. Die letzten Ergebnisse sind keine vollständige Datenexportfunktion.

Keine Cookies, Werbung, Analyse, externen Schriftarten, Bibliotheken oder API-Aufrufe. Der Server liefert nur die eigenen Dateien. GitHub kann beim Abrufen wie jeder Webhost technische Verbindungsdaten erhalten; die App sendet keine Lerndaten. Erst eine vom Benutzer ausgelöste Freigabe verlässt absichtlich die lokale App. Karten tragen kein Kinderdatum außer dem Trainingstag und keinen Namen. Browserdaten löschen, Privatmodus oder automatische Speicherbereinigung können den Lernstand entfernen. Fehlerhaftes JSON wird nicht still überschrieben; Speicherfehler werden sichtbar gemeldet.

## Vergleich und Karten

Verglichen werden ausschließlich identische Aufgabenformen, die in beiden Teilen vorkamen. Prozentwerte erscheinen ab mindestens fünf Antworten pro Teil und drei gemeinsamen Formen. Das ist eine beschreibende Auswertung, kein Wirksamkeitsnachweis; unterschiedliche Häufigkeiten können die Werte beeinflussen. „Schneller“ braucht je zwei korrekte, gültig zeitgemessene Antworten und mindestens 15 % niedrigeren Median. Bei zu wenig Daten oder fehlender Verbesserung bleibt die Aussage unterstützend und wahrheitsgemäß.

Die PNG-Karte entsteht vollständig lokal (1080 × 1350). Die drei originalen Canvas-Zeichnungen in `share-card.js` rotieren nach Datum. Zeichnungen, Farben und Textanordnung lassen sich dort separat ändern. Nach der Generierung startet ein eigener Knopf die Web-Share-Dateifreigabe, damit die iOS-Benutzergeste erhalten bleibt. „Bild speichern“ und „Bild öffnen“ bleiben als Fallback verfügbar; auf iOS kann das geöffnete Bild durch langes Drücken gespeichert werden. Ein abgebrochener Freigabedialog gilt nicht als Fehler.

## Testmodus und Reset

Nur auf `localhost` oder `127.0.0.1` mit `?dev=1`: Teil 1 dauert 30 Sekunden, Teil 2 20 Sekunden. Dieser Modus verwendet den separaten Schlüssel `einmaleins-in-ruhe-v1-dev`; Produktionsdaten werden nicht verändert. Der Testmodus registriert keinen neuen Service Worker. Ein schon installierter Worker kann localhost weiterhin kontrollieren; nach Quelländerungen alle betreffenden Tabs schließen oder den Worker in den Browser-Entwicklerwerkzeugen entfernen.

In der Entwicklerkonsole steht ausschließlich im Testmodus `learningDev.reset()` für einen vollständigen Reset der Testdaten und `learningDev.snapshot()` für eine Kopie des aktuellen Testzustands bereit. Kein Resetknopf ist in der Kinderoberfläche enthalten. Produktionsdaten nur absichtlich über die Browser-Website-Datenverwaltung entfernen.

## Veröffentlichung auf GitHub Pages

1. Ein neues Repository anlegen, zum Beispiel `einmaleins`. Für die unkomplizierte Veröffentlichung mit GitHub Free ein öffentliches Repository wählen. Keine echten Lerndaten hochladen.
2. Den **Inhalt dieses Projektordners** in die Wurzel des Repositorys auf Branch `main` hochladen/committen. `index.html` muss direkt dort liegen; `.nojekyll`, alle Module, Icons und Manifest mitnehmen.
3. Im Repository **Settings → Pages → Build and deployment** öffnen.
4. Bei **Source** „Deploy from a branch“ wählen.
5. Branch **main**, Ordner **/(root)** wählen und **Save** drücken.
6. Den erfolgreichen „pages build and deployment“-Lauf unter **Actions** abwarten. Die angezeigte Pages-Adresse öffnen; normalerweise `https://USERNAME.github.io/einmaleins/`.
7. Auf dem iPhone die Adresse in Safari einmal online öffnen. Danach optional **Teilen → Zum Home-Bildschirm**. Die Installation ist nicht erforderlich.

Offizielle Anleitung: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Es wurde kein GitHub-Repository angegeben und keines im Arbeitsverzeichnis gefunden. Die Dateien sind vorbereitet, aber nicht öffentlich hochgeladen.

## Offline und Updates

Alle Laufzeitpfade sind relativ und wurden unter `/einmaleins/` verwendet. Der Service Worker lädt einen vollständigen Versionssatz vor. Die Erstinstallation benötigt Internet. Danach werden Kernressourcen aus dem lokalen Cache geladen. Eine neue Version wartet, bis alte Tabs geschlossen sind, damit laufende Übungen keinen gemischten Versionsstand bekommen.

Bei jeder Veröffentlichung `CACHE` in `service-worker.js` erhöhen (z. B. `einmaleins-v1.0.1`). Anschließend alle alten App-Tabs bzw. das PWA-Fenster schließen und neu öffnen. Das Ändern des Cache-Namens löscht keinen Lernstand. Nach Änderungen am Datenformat eine explizite Migration in `storage.js` ergänzen.

## Vor Nutzung mit dem Kind

Die schnellen Antwortgrenzen und die strenge Level-2-Hürde mit dem tatsächlichen Eingabetempo abstimmen. Auf dem echten iPhone Safari, Offline-Neustart, PWA-Safe-Area und das Speichern/Teilen der Karte prüfen. Desktop-Viewporttests ersetzen keine Prüfung des iOS-Freigabedialogs. Den konkreten Testumfang dokumentiert `TEST-REPORT.md`.
