# MultiDivi V2

Ruhige, deutschsprachige Lern-App für Klasse 4. Statische HTML/CSS/JavaScript-App ohne Laufzeitbibliotheken, Konto, Analyse oder Backend. Veröffentlichung: https://eleonore-codes.github.io/MultiDivi/

## Was bleibt, was neu ist

Ausgangspunkt war das vorhandene Repository mit getrennten Modulen für Inhalte, Lernmodell, Sitzungen, Statistik, Speicherung und Canvas-Karten. Diese Trennung, die ruhige Gestaltung, große Tastatur, Icons und das statische Hosting bleiben erhalten. V2 erweitert die bestehenden Module und ergänzt place-value.js, strategy.js, rewards.js und progress.js.

## Üben und Eingeben

Ein Tageszyklus besteht aus **3 Minuten allgemein → Bericht → 2 Minuten gezielt → Abschluss**. Die aktuell begonnene Aufgabe darf immer beendet werden. Bei einem mehrschrittigen Rechenweg gilt der ganze begonnene Rechenweg als Aufgabe; daher kann die tatsächliche Dauer spürbar länger sein. Feedbackzeit zählt zur Phase, Pausen und verdeckte Seiten nicht. Kein sichtbarer Countdown, keine dritte Trainingsphase. Direkt nach einer Freischaltung darf eine einzelne, nicht gewertete Beispielaufgabe ausprobiert werden; danach kehrt die App zum Bericht zurück.

Alle Zahlen werden von rechts aufgebaut: **Einer → Zehner → Hunderter → Tausender → Fertig**.

| Ergebnis | Tasteneingabe |
| --- | --- |
| 56 | 6, 5, Fertig |
| 100 | 0, 0, 1, Fertig |
| 240 | 0, 4, 2, Fertig |
| 322 | 2, 2, 3, Fertig |
| 1000 | 0, 0, 0, 1, Fertig |

Die Anzeige beginnt mit einer einzigen leeren Zahl und „Einer“. Es gibt keine vom richtigen Ergebnis abhängige Anzahl von Feldern. Das Stellenlimit ist immer vier Ziffern. Löschen entfernt die zuletzt eingegebene, höchstwertige Stelle. Bedeutungsvolle Nullen bleiben erhalten. Gleichartige Ereignisse innerhalb von 90 ms werden als versehentlicher Doppeltipp ignoriert; bewusst wiederholte Ziffern danach werden angenommen. Quotient und Rest werden jeweils mit einem eigenen „Fertig“ abgeschlossen. Es gibt keine normalen Eingabefelder, die auf dem iPhone die Tastatur öffnen.

## Stufen und mathematische Generatoren

| Level | Inhalte / aktuell gewählte Grenzen |
| --- | --- |
| 1 | Alle 1×1 bis 10×10, fünf Formen je geordnetem Faktorenpaar: Produkt, linker/rechter Faktor, Quotient, Divisor. 500 Formen. |
| 2 | Divisoren 2–10, Quotienten 1–10, Rest 1 bis Divisor−1. 450 Formen. |
| 3 | Faktoren 1–10 mit Zehnerzahlen 10–90, beide Multiplikationsrichtungen und exakte Division durch die Zehnerzahl. 270 Formen. Bezug zur kleinen Faktenfamilie bleibt erhalten. |
| 4 | Faktor 11–29 mit Faktor 2–9, Produkt und exakte Umkehrdivision. 304 Formen. |
| 5 | Faktoren 11–39 und 11–19, jeweils ohne Null an der Einerstelle. 243 Aufgaben. |
| 6 | Divisoren 11–19, Quotienten 11–29, ganzzahlig erzeugter Dividend. 171 Aufgaben. |

Maximal erlaubtes Ergebnis: 9999. Die derzeitigen Generatoren schöpfen diese Grenze bewusst nicht aus. Keine willkürlich geratene Teilbarkeit; Dividenden entstehen immer aus gültigen Faktoren. Sämtliche generierten Aufgaben besitzen IDs, Stufe, Typ, Operanden, Lösung, Faktenfamilie, Schwierigkeitsstufe und Stellenwerte; komplexe Aufgaben zusätzlich Zerlegungs-/Strategiemetadaten.

### Rechenbrett in Level 5

Zunächst werden die Zehner- und Eineranteile der beiden Faktoren aktiv eingegeben. Danach sind die vier Teilprodukte in beliebiger Reihenfolge wählbar. Nach Auswahl eines Feldes steht dessen Eingabe im Mittelpunkt; das Brett erscheint anschließend wieder. Richtige Felder bleiben gespeichert, auch bei Fehlern und Neuladen. Eine falsche Teilrechnung wird separat korrigiert. Erst danach folgt die Summe aller vier Teilprodukte, wiederum Einer zuerst. 23×14 führt zu 200+80+30+12=322.

### Divisionsweg in Level 6

Das Kind wählt selbst eine positive Anzahl, deren Vielfaches in die noch übrige Zahl passt. Danach gibt es das Produkt und die verbleibende Zahl ein. Das wiederholt sich bis zum Rest null; abschließend wird die Summe der gewählten Teilquotienten eingegeben. Für 156:12 sind beispielsweise 10+3, 5+5+3, 1+12 und 13 zulässig. Jeder Produkt-/Subtraktionsschritt wird geprüft. Es gibt keinen fest verdrahteten einzigen Lösungsweg. Null oder ein zu großes Vielfaches wird nicht übernommen.

Fehler werden nach Komponente und als mögliche Fehlerevidenz gespeichert: Zerlegung, Teilprodukt, Rechenfakt, möglicher Stellenwertfehler, Teilrechnung, passende Vielfache und Zusammensetzen. Das ist keine Diagnose. Ein ausgelassener Nullstellenwert wird nur als möglicher Hinweis behandelt. In der Fokusphase können einzelne fehlerhafte Komponenten anstelle des ganzen Rechenwegs geübt werden.

## Zeitmessung und adaptive Beherrschung

Die Zeitmessung startet nach zwei Render-Frames. Sie ist nicht sichtbar.

- **firstMs:** bis zur ersten eingegebenen Ziffer. Stärkerer, aber nicht perfekter Näherungswert für Abruf/Überlegung.
- **totalMs:** bis zum fertigen Ergebnis einschließlich Zahleneingabe; bei mehrschrittigen Aufgaben gesamte aktive Bearbeitungszeit. Einzelne Schritte haben zusätzlich eigene Zeiten.
- Pausen, Neuladen oder erkannte Unterbrechungen entwerten die Zeiten für diese Aufgabe; die Genauigkeit zählt weiterhin. Zeiten ab 60 Sekunden werden nicht als Fluenzmessung verwendet. Dadurch können komplexe Rechenwege durchaus korrekt sein, obwohl kein gültiger Gesamtzeitwert vorliegt.

V2 benötigt zunächst **3 Beobachtungen**, bevor eine Aufgabenform eingeordnet wird. Ohne genügend gültige Geschwindigkeitshinweise wird sie ebenfalls nicht als automatisiert ausgegeben.

| Zustand | Regel für Level 1–4 |
| --- | --- |
| Noch nicht ausreichend geübt | Weniger als 3 Beobachtungen oder keine auswertbare richtige Abrufzeit |
| Unsicher | Letzte Genauigkeit unter 80 % |
| Richtig, aber langsam | Genauigkeit mindestens 80 %, Median erste Ziffer über Stufengrenze |
| Sicher | Mindestens 80 % richtig, schneller Median; Automatisierungsbedingungen noch nicht alle erfüllt |
| Automatisiert | Mindestens 6 Beobachtungen; mindestens 90 % der letzten maximal 12 richtig; schneller Median; letzte 3 Antworten schnell und richtig; stabile jüngste Abrufzeiten |

Grenzen bis zur ersten Ziffer: **Level 1: 3 s; Level 2: 4 s; Level 3: 5 s; Level 4: 7 s.** Stabilitätsobergrenze: das Zweifache der Stufengrenze für die jüngsten drei gültigen Zeiten; die drei aufeinanderfolgenden schnellen Antworten sind die strengere zusätzliche Bedingung. Langsames Tippen allein macht die Rechenbeziehung nicht langsam.

Level 5–6: mindestens 4 Beobachtungen und 90 % jüngst ohne Fehler ergeben „sicherer Rechenweg“. Geschwindigkeit entscheidet hier nicht. Die Erwachsenenansicht zeigt außerdem die einzelnen Komponenten.

Die Auswahl nutzt Unsicherheit, langsame richtige Antworten, junge/ungeübte Formen, leichte Aufgaben und zeitlichen Abstand. Gewichte: ungeübt 3, unsicher 10, langsam 7, sicher 2, automatisiert 0,6; bis zu 3 Zusatzpunkte mit wachsendem Abstand. Vier jüngste Familien werden ausgespart. Zielanteil Fokus 72 %, leichte Aufgaben 15 %, Erkundung ohne Fokus weitere 20 %. Fokus berücksichtigt ausdrücklich auch langsame richtige Antworten trotz guter Erfolgsquote. Verwandte kleine Fakten können die Priorität von Zehneraufgaben erhöhen, übertragen aber niemals automatisch Beherrschung.

## Sichtbarer Erfolg ist etwas anderes

rewards.js entscheidet über Belohnungen, learning-engine.js über die nächste Aufgabe. Erfolgsnummer und Serie fließen nicht in die Auswahl ein.

| Stufen | Qualifizierender Bericht |
| --- | --- |
| 1–4, 3 Minuten | mindestens 90 % richtig und mindestens 12 abgeschlossene Aufgaben |
| 1–4, 2 Minuten | mindestens 90 % richtig und mindestens 8 abgeschlossene Aufgaben |
| 5–6, 3 Minuten | mindestens 80 % Aufgaben ohne Korrektur, mindestens 2 vollständige Rechenwege und 8 korrekt abgeschlossene Schritte |
| 5–6, 2 Minuten | mindestens 80 % Aufgaben ohne Korrektur, mindestens 1 vollständiger Rechenweg und 4 korrekt abgeschlossene Schritte |
| 5–6, reine Komponentenphase | mindestens 80 % richtig und mindestens 8 / 6 Komponentenaufgaben |

12 bzw. 8 einfache Aufgaben entsprechen ungefähr einer Aufgabe in 15 Sekunden inklusive Stellenwerteingabe. Dies sind vorsichtige Anfangswerte, keine aus Kinderdaten abgeleiteten Normen. Die langsameren strategischen Aufgaben erhalten eigene Anforderungen. Ein nach Korrektur beendeter Rechenweg wird nicht nachträglich zu einem fehlerfreien Versuch.

Der Schwellenvergleich verwendet die ungerundete Quote; die Anzeige rundet Prozentwerte. Daher können angezeigte 90 % knapp unter der exakten Grenze liegen. Es werden keine Erfolge für 1/1 vergeben.

Jeder Bericht hat eine stabile Sitzungs-ID plus Phasenkennung. Eine gespeicherte Vergabeliste verhindert doppelte Erfolgsnummern nach Neuladen. Jede passende Phase erhöht successNumber genau einmal. Beide Phasen eines Tages können jeweils einen Erfolg bekommen. Schlechtere Ergebnisse nehmen nichts weg.

## Freischaltung

Jede Freischaltung bleibt dauerhaft gespeichert.

| Ziellevel | Voraussetzungen |
| --- | --- |
| 2 | Genau fünf beliebige qualifizierende Phasenberichte gesammelt; nicht zwingend aufeinanderfolgend. Counter steigt nur bis 5. |
| 3 | Level 1 offen; 8 Erfolge in Level 1; 180 Beobachtungen dort; 15 % aller Level-1-Formen sicher oder automatisiert. |
| 4 | Level 3 offen; dort 6 Erfolge, 120 Beobachtungen, 20 % sichere/automatisierte Formen. |
| 5 | Level 4 offen; dort 6 Erfolge, 120 Beobachtungen, 15 % sichere/automatisierte Formen. |
| 6 | Level 5 offen; dort 4 Erfolge, 20 Beobachtungen, mindestens 10 volle Rechenwege und mindestens 80 % der vollen Wege ohne Korrektur. |

Level 3 muss nicht auf Restdivision warten: es ist ein Transferzweig aus Level 1. Alle Regeln stehen in CONFIG.UNLOCK. Die Kriterien sind veränderbare Startannahmen und sollten nach realem Üben abgestimmt werden.

## Lerntage, Serie und Fortschritt

Ein Lerntag ist ein lokaler Kalendertag mit mindestens einer fertig bearbeiteten Aufgabe. Die Erfolgsserie zählt dagegen nur Tage mit mindestens einem qualifizierenden Erfolg. Ein Tag erhöht die Serie höchstens einmal. Nach einem ausgelassenen Tag beginnt der nächste Erfolg bei 1; es gibt keine negative Meldung. Die längste Serie bleibt erhalten. Tagesdifferenzen werden aus lokalen Datumszeichenketten berechnet, unabhängig von Sommerzeitwechseln.

„Fortschritt“ ist eine eigene Erwachsenenansicht: Lerntage, Erfolge, aktuelle/längste Serie, offene Stufen, fünf Zustandskategorien für Level 1–4, Aufschlüsselung Multiplikation/Division, Strategiekomponenten und letzte sieben Lerntage. Prozentangaben nennen ausdrücklich den Nenner aller generierten Aufgabenformen. Nie wird ein ungeübter Fakt als beherrscht oder schwach ausgegeben.

Tagesdaten enthalten Datum, trainierte Stufen, Phasenberichte mit Genauigkeit und Zeitmedianen, Erfolgsnummern, Serie und Zustandsverteilung. Es wird keine Historie erfunden. Vorher-/Nachhervergleiche verwenden identische Formen mit gleichem Gewicht je Form, mindestens drei gemeinsame Formen und zwei Beobachtungen pro Teil. „Schneller“ benötigt zwei gültige richtige Zeiten je Teil und mindestens 15 % niedrigeren Median.

## Erfolgskarten

Jeder qualifizierende Bericht erhält dauerhaft eigene Kartenmetadaten. PNG entsteht bei Bedarf vollständig lokal (1080×1350) per Canvas. Hierarchie: Erfolg Nr. → Quote → Serie → Trainingstyp/Stufe/Datum → kurze Anerkennung. Keine früheren Interessenthemen, keine Namen, keine externen Bilder. Allgemeine Anerkennung lobt Üben und Dranbleiben; Serienmeilensteine verwenden tatsächliche Daten. Eine verbesserte Genauigkeit wird nicht ohne Vergleich behauptet.

Der Teilen-Knopf wird erst nach Erstellung angeboten, damit die Browser-Benutzergeste erhalten bleibt. Bei fehlender Dateifreigabe bleiben Bild speichern und Bild öffnen verfügbar. Auf dem iPhone kann das geöffnete Bild lange gedrückt und gesichert werden.

## Produktionsdatenformat

Schlüssel: multidivi-learning. **schemaVersion: 2**.

- factMastery: Aufgaben-ID → Versuche, richtig/falsch, letzte maximal 12 separate Zeit-/Genauigkeitswerte, schnelle Serie, letzter Zeitpunkt, Zustand.
- strategyEvidence: Level/Komponente → Versuche, Korrektheit, mögliche Stellenwertfehler, Fehlertypen, jüngste Beobachtungen.
- session: eindeutige ID, lokales Startdatum, Stufe, Phase, aktive Übungszeit, aktuelle Aufgabe und Eingabeziffern, erhaltene Teilergebnisse, Feedback, Fokuskomponenten, Phasenberichte.
- dailySummaries: kompakte Tagesberichte; learningDays: eindeutige Tage mit Übung.
- unlockedLevels, levelProgress: dauerhafte Freischaltungen und Voraussetzungen.
- successNumber, level2QualifyingSuccesses, currentStreak, longestStreak, lastQualifyingSuccessDate.
- awardedPhases, cards: Vergaben und reproduzierbare Karten.
- completedDates: verhindert eine weitere Tagesrunde. selectedLevel und revision ergänzen den Zustand.

**Einmaliger Übergang:** V1-Testdaten werden nicht übernommen. V2 beginnt unter einem neuen Schlüssel mit null. Der alte Schlüssel bleibt unbenutzt, damit kein fremder Browserinhalt gelöscht wird. Ab V2 führt eine unbekannte/beschädigte Version zu einer sichtbaren Sperre, nicht zu einem stillen Neustart. Künftige Versionen müssen migrate() erweitern. Ein Zurücksetzen ist eine ausdrücklich gewählte Elternaktion.

Speicherung erfolgt nach Eingaben/Schritten/Antworten und spätestens alle vier aktiven Sekunden. Nach einem harten Absturz kann höchstens die jüngste noch nicht geschriebene Phasenzeit fehlen. Neuladen bewahrt aktuelle Ziffern und korrekte Zwischenergebnisse, macht aber die Zeitmessung dieser Aufgabe ungültig. Eine über Mitternacht unterbrochene Sitzung bleibt fortsetzbar; Beobachtungen/Erfolge werden dem lokalen Tag ihres Abschlusses zugeordnet. Ein zweites Fenster wird bei konkurrierenden Speicheränderungen angehalten.

Browserbereinigung, Privatmodus, Quoten oder Gerätewechsel können lokale Daten entfernen. Es gibt keine Cloud-Synchronisierung. Bei Speicherfehlern erscheint ein Hinweis; die App behauptet dann nicht, dass neue Daten sicher gespeichert seien.

## Zurücksetzen

Fortschritt → Einstellungen und Lerndaten → Lerndaten zurücksetzen → Warnung → „Ich möchte zurücksetzen“ → zweite Bestätigung „Ja, alle Lerndaten endgültig löschen“. Danach Erfolg 0, Lerntage 0, Serie 0, nur Level 1. Kein Reset auf der Kinderstartseite.

## Dateien und lokaler Betrieb

index.html/styles.css: Grundgerüst und Gestaltung. app.js: Ansichten und Browserereignisse. content.js: Generatoren. place-value.js: Eingabe. strategy.js: Rechenwege. learning-engine.js: Beherrschung/Auswahl. rewards.js: Erfolg/Serie/Freischaltung. session.js: Phasentransaktionen. storage.js: Persistenz. statistics.js/progress.js: Auswertung. share-card.js: PNG. service-worker.js/manifest.json: Offline/PWA.

Im Projektordner:

    python -m http.server 8000

http://localhost:8000/ öffnen. Keine Installation oder Build nötig; nicht per file:// starten. Für Tests Node.js 22 oder neuer:

    npm test

Nur lokal aktiviert ?dev=1 verkürzte 30+20 Sekunden und den getrennten Schlüssel multidivi-learning-dev. learningDev.snapshot() und learningDev.reset() sind nur dort verfügbar. tests/browser-fixtures.html stellt ausschließlich auf localhost Beispielsitzungen für die sechs Stufen bereit. Auf der veröffentlichten Domain deaktiviert. Keine künstlichen Testdaten werden in das normale Profil geschrieben.

## Offline und Updates

Alle Ressourcen sind relativ zu /MultiDivi/. Der Worker installiert einen vollständigen Cache-Satz. Neue Versionen werden erst nach Schließen alter Tabs oder ausdrücklichem „Neue Version laden“ aktiv. Der Knopf erscheint außerhalb aktiver Aufgaben. Der neue Worker beseitigt den alten V1-App-Cache nach seiner Aktivierung; Lerndaten liegen unabhängig davon in localStorage.

Für jedes Release den Versionssuffix in service-worker.js erhöhen. Der erstmalige Wechsel V1→V2: Seite online öffnen, kurz warten, alle MultiDivi-Tabs/PWA-Fenster schließen und neu öffnen. Die alte App hat noch keinen Updateknopf. Kein Löschen aller Browserdaten nötig. Ab V2 zeigt die App wartende Updates an.

## Veröffentlichung auf dem bestehenden Repository

Die URL bleibt https://eleonore-codes.github.io/MultiDivi/.

1. Inhalt der neuen ZIP in das bestehende Repository eleonore-codes/MultiDivi auf main hochladen; Dateien ersetzen. index.html gehört direkt in die Repository-Wurzel.
2. Auch die vier neuen Module place-value.js, strategy.js, rewards.js, progress.js und die aktualisierte service-worker.js hochladen.
3. In Settings → Pages weiterhin „Deploy from a branch“, main, /(root) verwenden. Kein anderes Hosting nötig.
4. Den erfolgreichen Pages-Workflow unter Actions abwarten.
5. URL online öffnen; für das erste V2-Update alle alten MultiDivi-Tabs schließen und neu öffnen.
6. Version anhand „3 Minuten / 2 Minuten“ und der Einer-zuerst-Eingabe erkennen.
7. Vor Start des Kindes einmal den mehrstufigen Elternreset verwenden, wenn unter V2 getestet wurde.

Die Weiterentwicklung wurde lokal auf dem geklonten Repository vorgenommen. Ohne gesonderten Push ist die öffentliche Website noch auf dem bisherigen Stand.

## Vor dem Einsatz

Alle Grenzwerte sind Anfangswerte. Besonders 3 Sekunden bis zur ersten Ziffer, Doppeltippabstand und spätere Freischaltungen mit dem tatsächlichen Verhalten des Kindes abstimmen. Ein echtes iPhone/Safari samt VoiceOver und nativer Dateifreigabe ergänzt die Desktop-Viewporttests. V2 ist ein lokales Lernwerkzeug, kein diagnostisches Verfahren. TEST-REPORT.md nennt den konkreten Testumfang.
