# MultiDivi 3.0.1

## Division mit Rest

Ergebnis und Rest werden nacheinander auf demselben Zahlenfeld eingegeben. Die erste Bestätigung heißt jetzt „Weiter zum Rest“, anschließend erscheinen „Rest eingeben“, das eingegebene Ergebnis und „Rest bestätigen“. Beispiel: 58 : 7 → 8 → Weiter zum Rest → 2 → Rest bestätigen. Browserprüfung erfolgreich. Rechenlogik unverändert.

## Älterer Lernstand

V1-only-Profile werden jetzt übernommen, statt pauschal blockiert. Der ursprüngliche localStorage-Eintrag bleibt unverändert und das vollständige alte Profil liegt zusätzlich in legacyArchive. Aufgabenbeobachtungen werden auf die aktuellen IDs übertragen. Alte Gesamtantwortzeiten werden als Gesamtzeiten erhalten, nicht als erste-Ziffer-Abrufzeiten interpretiert. Frühere Beherrschungswerte bleiben im Archiv; die aktuelle Abrufbewertung braucht passende neue Zeitbeobachtungen. Alte laufende Sitzungen bleiben archiviert und werden wegen des anderen Ablaufs nicht als neue Sitzung fortgesetzt. Keine nachträglich erfundenen Erfolge/Serien. V2/V3-Migration unverändert.

Bei anderen Ladefehlern zeigt die App jetzt den konkreten Grund und bietet „Lerndaten sichern“ als lokale JSON-Datei sowie „Erneut laden“. Keine automatische Löschung. Der konkrete Lernstand aus dem Screenshot lag nicht vor; deshalb ist nicht bestätigt, ob dort V1 oder eine andere Ursache vorliegt.

## Prüfung und Installation

38 automatisierte Tests bestanden. Zusätzlich Rest-Eingabe im Browser vollständig geprüft. app.js-Syntaxprüfung erfolgreich. Kein Update auf GitHub vorgenommen.

ZIP-Inhalt in die Wurzel des Repositorys laden, gleichnamige Dateien ersetzen. Anschließend „Neue Version laden“ oder alle alten App-Tabs schließen und neu öffnen. Website-Daten nicht löschen.

Geändert: app.js, storage.js, service-worker.js, package.json; neu tests/recovery.test.js und dieser Bericht. Cacheversion 3.0.1. Dieser Bericht ergänzt und korrigiert die ältere Aussage im V3-Prüfbericht, wonach V1-Profile blockiert bleiben.
