import {distribution,metrics} from './learning-engine.js';
import {LEVEL_NAMES,CONFIG as C} from './config.js';
import {currentStreak} from './storage.js';
export function progressHTML(state){
  const labels={automated:'Automatisiert',secure:'Sicher',slow:'Richtig, aber langsam',uncertain:'Unsicher',unseen:'Noch nicht ausreichend geübt'};
  let html=`<p class="eyebrow">Für Erwachsene</p><h1>Fortschritt</h1><div class="stats"><div class="stat"><strong>${state.learningDays.length}</strong>Lerntage</div><div class="stat"><strong>${state.successNumber}</strong>Erfolge</div><div class="stat"><strong>${currentStreak(state)}</strong>Tage in Folge</div><div class="stat"><strong>${state.longestStreak}</strong>Längste Serie</div></div><p>Freigeschaltet: Level ${state.unlockedLevels.join(', ')}.</p><p>Für Level 2: ${state.level2QualifyingSuccesses} von 5 Erfolgen.</p>`;
  for(let l=1;l<=4;l++){
    const d=distribution(state.factMastery,l);
    html+=`<details><summary>Level ${l} · ${LEVEL_NAMES[l]}</summary><p>${d.sufficient} von ${d.total} Aufgabenformen ausreichend geübt.</p><dl class="distribution">${Object.entries(labels).map(([key,label])=>`<div><dt>${label}</dt><dd>${d.counts[key]} · ${Math.round(d.counts[key]/d.total*100)} %</dd></div>`).join('')}</dl><p>Prozentwerte beziehen sich auf alle ${d.total} Aufgabenformen. Mindestens ${C.SUFFICIENT_OBSERVATIONS} Beobachtungen sind nötig. Automatisiert heißt: wiederholt richtig und schnell mit stabiler Abrufzeit.</p>`;
    if(l===1)for(const [name,filter] of [['Multiplikation',t=>['product','left','right'].includes(t.form)],['Division ohne Rest',t=>['quotient','divisor'].includes(t.form)]]){const a=distribution(state.factMastery,l,filter);html+=`<p>${name}: ${a.counts.automated} von ${a.total} automatisiert.</p>`;}
    html+='</details>';
  }
  html+='<details><summary>Level 5 und 6 · Rechenwege</summary><p>Hier zählt der Rechenweg. Geschwindigkeit ist kein Beherrschungskriterium.</p>';
  const components={decomposition:'Zerlegung','partial-product':'Teilprodukte','partial-calculation':'Teilrechnung','division-relationship':'Passende Vielfache',recombination:'Zusammensetzen',fact:'Rechenbeziehung',remainder:'Rest'};
  for(const [key,s] of Object.entries(state.strategyEvidence)){const [level,comp]=key.split(':');if(Number(level)<5)continue;html+=`<p><strong>Level ${level}: ${components[comp]||comp}</strong><br>${s.correct} von ${s.attempts} Schritten beim ersten bzw. erneuten Versuch richtig. ${s.possiblePlaceValueErrors>=2?`${s.possiblePlaceValueErrors} mögliche Stellenwertfehler: Nullen gemeinsam anschauen.`:'Noch kein wiederholter Hinweis auf Stellenwertfehler.'}</p>`;}
  html+='</details><h2>Letzte 7 Lerntage</h2>';
  const days=Object.values(state.dailySummaries).sort((a,b)=>a.date.localeCompare(b.date)).slice(-7).reverse();
  html+=days.length?days.map(d=>`<div class="panel"><strong>${new Date(d.date+'T12:00:00').toLocaleDateString('de-DE')}</strong><p>Level ${d.levels.join(', ')} · ${d.successNumbers.length} Erfolge</p>${d.successNumbers.map(n=>`<button data-action="card" data-number="${n}">Karte: Erfolg Nr. ${n}</button>`).join('')}${d.reports.map(r=>`<p>${r.phase==='a'?'3 Minuten':'2 Minuten'}: ${r.accuracy??'–'} % richtig${r.firstMs!==null&&r.level<=4?` · erste Ziffer im Median ${(r.firstMs/1000).toFixed(1).replace('.',',')} s`:''}</p>`).join('')}</div>`).join(''):'<p>Noch keine Lerntage gespeichert.</p>';
  html+='<details><summary>Wie werden Erfolge gezählt?</summary><p>Level 1–4: mindestens 90 % richtig und mindestens 12 Aufgaben in 3 Minuten bzw. 8 in 2 Minuten. Ein Erfolg sagt noch nichts über die Automatisierung aus.</p><p>Level 5–6: mindestens 80 % der Aufgaben ohne Fehler; mindestens 2 vollständige Rechenwege / 8 Schritte im ersten Teil und 1 Rechenweg / 4 Schritte im zweiten. Reines Komponententraining braucht mindestens 8 bzw. 6 Aufgaben.</p></details><details><summary>Einstellungen und Lerndaten</summary><p>Die Daten bleiben in diesem Browser. Website-Daten löschen entfernt die Lernhistorie.</p><button data-action="reset-warning">Lerndaten zurücksetzen</button></details>';
  return html;
}
