import {CONFIG as C,TEXT,durations} from './config.js';
import {BY_ID} from './content.js';
import {selectTask} from './learning-engine.js';
import {loadState,saveState,ensureDay,dayKey,STORAGE_KEY} from './storage.js';
import {recordAnswer,finishPhase} from './session.js';
import {createCard,canShareFile} from './share-card.js';
const dev=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('dev')==='1';
const key=dev?STORAGE_KEY+'-dev':STORAGE_KEY, loaded=loadState(localStorage,key);
let state=loaded.state,blocked=loaded.blocked,paused=true,started=0,taskStarted=0,answer=['',''],field=0,cardURL=null,cardFile=null;
const duration=durations(dev),app=document.querySelector('#app'),notice=document.querySelector('#notice');
function warn(text){notice.textContent=text;notice.hidden=false;}
function save(){if(!blocked&&!saveState(state,localStorage,key))warn('Dein Gerät speichert gerade nicht. Lass diese Seite offen und hole einen Erwachsenen dazu.');}
if(loaded.error)warn(loaded.error);
ensureDay(state);if(state.day.active)state.day.active.interrupted=true;if(!blocked)save();
function button(label,action,cls='primary'){return `<button class="${cls}" data-action="${action}">${label}</button>`;}
function setView(html){app.innerHTML=html;app.focus({preventScroll:true});}
function checkpoint(){if(!started)return;const now=performance.now(),delta=now-started;state.day.elapsed+=delta;started=now;if(delta>C.INTERRUPTION_MS&&state.day.active)state.day.active.interrupted=true;}
function pause(){checkpoint();started=0;taskStarted=0;paused=true;if(state.day.active)state.day.active.interrupted=true;save();render();}
function begin(phase){ensureDay(state);state.day.stage=phase;state.day.elapsed=0;state.day.active=null;state.day.feedback=null;paused=false;nextTask();}
function nextTask(){const d=state.day;const recent=Object.values(d.rows).flat().slice(-C.SPACING_TASKS).map(r=>BY_ID[r.id]);
  const task=selectTask(state.model,{level:d.stage==='rest'?2:1,recent,focus:d.stage==='b'?d.focus:[]});
  d.active={id:task.id,interrupted:false};d.feedback=null;answer=['',''];field=0;save();render();}
function startClock(){requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!paused&&state.day.active&&!document.hidden){if(!started)started=performance.now();if(!state.day.feedback)taskStarted=performance.now();}}));}
function render(){const d=state.day;
  if(blocked){setView('<h1>Lernstand prüfen</h1><p>Bitte hole einen Erwachsenen dazu. Die gespeicherten Daten werden nicht überschrieben.</p>');return;}
  if(['a','b','rest'].includes(d.stage)) {
    if(paused){setView(`<p class="eyebrow">Deine Übung ist gespeichert</p><h1>In Ruhe weiter</h1><p>Du machst dort weiter, wo du aufgehört hast.</p>${button('Weiterüben','resume')}`);return;}
    const task=BY_ID[d.active?.id];if(!task){nextTask();return;}
    const feedback=d.feedback;
    setView(`<div class="topline"><p class="eyebrow">${d.stage==='a'?'Teil 1 · Gemischt':d.stage==='b'?'Teil 2 · Gezielt üben':'Teilen mit Rest'}</p>${button('Pause','pause','plain')}</div><section class="exercise" aria-label="Rechenaufgabe"><h1 class="equation">${task.label}</h1>${feedback?`<div class="feedback ${feedback.ok?'good':'bad'}" role="status"><strong>${feedback.ok?TEXT.correct:TEXT.wrong}</strong>${!feedback.ok?`<span class="solution">${task.solution}</span>`:''}</div>${button(TEXT.next,'next')}`:`<div class="answers"><button class="answer" data-field="0" aria-label="${task.level===2?'Ergebnis':'Antwort'} eingeben" aria-pressed="true"><span id="value0">□</span></button>${task.level===2?'<span>Rest</span><button class="answer" data-field="1" aria-label="Rest eingeben" aria-pressed="false"><span id="value1">□</span></button>':''}</div><p id="input-hint" class="muted">${task.level===2?'Gib das Ergebnis ein.':'Welche Zahl fehlt?'}</p><div class="keypad" aria-label="Zahlentasten">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button data-digit="${n}" class="${n===0?'zero':''}">${n}</button>`).join('')}<button class="delete" data-action="delete" aria-label="Letzte Ziffer löschen">Löschen</button></div>${button(TEXT.check,'submit')}`}</section>`);
    if(!feedback)updateAnswer();startClock();return;
  }
  if(d.stage==='between'){const s=d.results.a;setView(`<p class="eyebrow">Teil 1 geschafft</p><h1>6 Minuten geschafft!</h1>${stats(s)}<p>${s.wrong ? 'Jetzt übst du die Aufgaben, bei denen noch Fehler waren.' : 'Alles richtig! Jetzt übst du weiter, damit es noch leichter geht.'}</p><p>Übe sie jetzt 4 Minuten. So wirst du sicherer.</p>${button('4-Minuten-Training starten','focus')}`);return;}
  if(d.stage==='done'){const c=d.results.comparison;setView(`<p class="eyebrow">Beide Teile geschafft</p><h1>Gut geübt!</h1><div class="panel"><h2>Dein Training heute</h2><p>6 Minuten: <strong>${d.results.a.correct} richtig</strong></p><p>4 Minuten: <strong>${d.results.b.correct} richtig</strong></p>${c.adequate?`<p>Gleiche Aufgaben in beiden Teilen:</p><div class="stats"><div class="stat"><span>Vorher</span><strong>${c.before.accuracy} %</strong><span>richtig</span></div><div class="stat"><span>Nachher</span><strong>${c.after.accuracy} %</strong><span>richtig</span></div>`:''}<p>${c.message}</p></div><p><strong>${TEXT.done}</strong></p>${button('Erfolgskarte erstellen','card')}<div id="card"></div>${state.level2?'<p class="muted">Teilen mit Rest ist freigeschaltet. Du findest es morgen auf der Startseite.</p>':''}`);return;}
  setView(`<p class="eyebrow">Dein tägliches Training</p><h1>Einmaleins.<br>Schritt für Schritt.</h1><div class="steps"><div class="step"><span class="number">1</span><div><strong>6 Minuten gemischt</strong><span>Malnehmen und Teilen</span></div></div><div class="step"><span class="number">2</span><div><strong>4 Minuten gezielt</strong><span>Üben, was noch schwerfällt</span></div></div></div>${button('Training starten','start')}<div class="panel"><h2>Teilen mit Rest</h2>${state.level2?`<p>Freigeschaltet · 5 Minuten</p>${button('Mit Rest üben','rest','secondary')}`:'<p>Noch gesperrt</p><p>Wird frei, wenn du viele Aufgaben sicher und schnell lösen kannst.</p>'}</div><details><summary>Für Erwachsene</summary><p>Der Lernstand bleibt in diesem Browser. Beim Löschen der Website-Daten geht er verloren.</p><p>Die Übungszeit pausiert beim Verlassen der Seite. Die aktuelle Aufgabe darf immer fertig gerechnet werden.</p><p>Stufe 2 braucht mindestens 600 Antworten, 95 % richtige Antworten zuletzt und automatisierte Antworten bei 80 % aller Aufgabenformen.</p><p>Zum Offline-Üben diese Seite einmal mit Internet öffnen und kurz offen lassen.</p></details><p class="footnote">Ohne Anmeldung. Ohne Werbung.</p>${dev?'<p>Testmodus · 30 + 20 Sekunden · eigener Lernstand</p>':''}`);
}
function stats(s){return `<div class="stats"><div class="stat"><strong>${s.correct}</strong><span>richtig</span></div><div class="stat"><strong>${s.wrong}</strong><span>noch mit Fehler</span></div></div>`;}
function updateAnswer(){answer.forEach((v,i)=>{const el=document.querySelector(`#value${i}`);if(el)el.textContent=v||'□';});document.querySelectorAll('[data-field]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.field)===field)));const hint=document.querySelector('#input-hint');if(hint&&state.day.stage==='rest')hint.textContent=field===0?'Gib das Ergebnis ein.':'Gib den Rest ein.';}
function submit(){const d=state.day;if(paused||d.feedback||!taskStarted)return;const t=BY_ID[d.active.id];if(answer[0]===''||(t.level===2&&answer[1]==='')){if(t.level===2&&answer[0]!==''){field=1;updateAnswer();}return;}
  checkpoint();const ms=d.active.interrupted?null:performance.now()-taskStarted;taskStarted=0;
  const ok=Number(answer[0])===t.answer&&(t.level!==2||Number(answer[1])===t.remainder);
  recordAnswer(state,t,ok,ms);d.feedback={ok};save();render();
}
app.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.field!==undefined){field=Number(b.dataset.field);updateAnswer();return;}
  if(b.dataset.digit!==undefined){if(answer[field].length<3)answer[field]+=b.dataset.digit;updateAnswer();return;}
  switch(b.dataset.action){case 'start':begin('a');break;case 'focus':begin('b');break;case 'rest':state.day.returnStage=state.day.stage;begin('rest');break;
    case 'pause':pause();break;case 'resume':paused=false;answer=['',''];render();break;
    case 'delete':answer[field]=answer[field].slice(0,-1);updateAnswer();break;case 'submit':submit();break;
    case 'next':checkpoint();if(state.day.elapsed>=duration[state.day.stage]){started=0;finishPhase(state);save();render();}else nextTask();break;
    case 'card':await showCard();break;
    case 'share':try{await navigator.share({files:[cardFile],title:'Mein Einmaleins-Training'});}catch(err){if(err.name!=='AbortError')warn('Teilen klappt hier nicht. Du kannst die Karte unten speichern oder öffnen.');}break;
  }
});
document.addEventListener('keydown',e=>{if(paused||!['a','b','rest'].includes(state.day.stage)||state.day.feedback||e.altKey||e.ctrlKey||e.metaKey)return;
  if(/^\d$/.test(e.key)){e.preventDefault();if(answer[field].length<3)answer[field]+=e.key;updateAnswer();}
  if(e.key==='Backspace'){e.preventDefault();answer[field]=answer[field].slice(0,-1);updateAnswer();}
  if(e.key==='Enter'&&e.target===app){e.preventDefault();submit();}
});
async function showCard(){try{const blob=await createCard(state.day);if(cardURL)URL.revokeObjectURL(cardURL);cardURL=URL.createObjectURL(blob);cardFile=new File([blob],`einmaleins-${state.day.date}.png`,{type:'image/png'});
  const host=document.querySelector('#card');host.replaceChildren();const img=new Image();img.src=cardURL;img.alt='Deine Erfolgskarte mit den Ergebnissen beider Übungsteile';img.className='card-image';host.append(img);
  if(canShareFile(navigator,cardFile)){const b=document.createElement('button');b.dataset.action='share';b.className='primary';b.textContent='Karte teilen';host.append(b);}
  const a=document.createElement('a');a.href=cardURL;a.download=cardFile.name;a.className='button secondary';a.textContent='Bild speichern';host.append(a);
  const open=document.createElement('a');open.href=cardURL;open.target='_blank';open.rel='noopener';open.className='button secondary';open.textContent='Bild öffnen';host.append(open);
  const tip=document.createElement('p');tip.textContent='Auf dem iPhone: Bild öffnen und lange auf das Bild drücken, um es zu sichern.';host.append(tip);
}catch{warn('Die Karte konnte nicht erstellt werden. Bitte versuche es noch einmal.');}}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['a','b','rest'].includes(state.day.stage))pause();else if(!document.hidden&&state.day.date!==dayKey()&&!['a','b','rest','between'].includes(state.day.stage)){ensureDay(state);save();render();}});
window.addEventListener('pagehide',()=>{checkpoint();started=0;if(state.day.active)state.day.active.interrupted=true;save();});
window.addEventListener('storage',e=>{if(e.key===key){started=0;paused=true;blocked=true;warn('Das Training wurde in einem anderen Fenster geändert. Bitte nutze nur ein Fenster und lade diese Seite neu.');render();}});
setInterval(()=>{if(started){checkpoint();save();}},4000);
if(!dev&&'serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>warn('Offline-Speichern klappt gerade nicht. Mit Internet kannst du weiterüben.'));
if(dev)window.learningDev={reset(){localStorage.removeItem(key);location.reload();},snapshot:()=>structuredClone(state)};
render();
