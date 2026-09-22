import {CONFIG as C,LEVEL_NAMES,TEXT,durations} from './config.js';
import {BY_ID,LEVEL_TASKS} from './content.js';
import {selectTask} from './learning-engine.js';
import {loadState,saveState,resetState,exportLearningData,STORAGE_KEY,dayKey} from './storage.js';
import {startSession,startFocus,recordTask,recordEvidence,finishPhase} from './session.js';
import {newInput,enterDigit,backspace,inputValue,inputDisplay,activePlace} from './place-value.js';
import {newWork,promptFor,acceptValue,selectPartial,completeRemainderTask} from './strategy.js';
import {progressHTML} from './progress.js';
import {createCard,canShareFile} from './share-card.js';
const local=['localhost','127.0.0.1'].includes(location.hostname);
const dev=local&&new URLSearchParams(location.search).get('dev')==='1',key=STORAGE_KEY+(dev?'-dev':'');
let storage;try{storage=localStorage;}catch{}
const loaded=loadState(storage,key);
let state=loaded.state,blocked=loaded.blocked,view='main',paused=true,phaseClock=null,answerClock=null,firstDigit=null,renderToken=0,cardFile=null,cardURL=null,pendingWorker=null;
const duration=durations(dev),app=document.querySelector('#app'),notice=document.querySelector('#notice');
function warn(message){notice.hidden=false;notice.textContent=message;}
if(loaded.error)warn(loaded.error);
if(loaded.legacy)warn('Dein älterer Lernstand wurde übernommen. Das Original bleibt gesichert.');
function save(){if(blocked||!state)return false;if(!saveState(state,storage,key)){blocked=true;warn('Der Lernstand konnte nicht sicher gespeichert werden. Bitte diese Seite neu laden.');return false;}return true;}
if(state?.session){
  state.session.drills=(state.session.drills||[]).map(t=>completeRemainderTask(t,BY_ID));
  const a=state.session.active,t=a?.task,full=completeRemainderTask(t,BY_ID);
  if(t&&full!==t&&!a.work.done){
    // Retain unfinished old component input for recovery; restart this task in the clear full format.
    state.session.previousComponentWork=structuredClone(a);
    state.session.active={taskId:full.id,work:newWork(full),input:newInput()};
  }
}
if(state)save();
if(state?.session?.active){state.session.active.work.interrupted=true;state.session.active.input.lastTap=null;}
if(state?.session?.trial){state.session.trial.work.interrupted=true;state.session.trial=null;}
const btn=(label,action,cls='primary',extra='')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
function display(html){app.innerHTML=html+((pendingWorker&&!active())?btn('Neue Version laden','update','secondary'):'');app.focus({preventScroll:true});}
function active(){return state?.session?.trial||state?.session?.active;}
function task(){const a=active();return a?.task||BY_ID[a?.taskId];}
function running(){return !paused&&view==='main'&&!!active();}
function checkpoint(){
  if(phaseClock===null)return;const now=performance.now(),delta=now-phaseClock;
  if(!state.session.trial)state.session.elapsed+=delta;
  if(active()&&!active().work.done)active().work.elapsedMs=(active().work.elapsedMs||0)+delta;
  if(delta>C.INTERRUPTION_MS&&active())active().work.interrupted=true;phaseClock=now;
}
function stopClock(){checkpoint();phaseClock=null;answerClock=null;renderToken++;}
function pause(){stopClock();paused=true;if(active())active().work.interrupted=true;save();render();}
function startClock(){
  const token=++renderToken;requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(token!==renderToken||!running()||document.hidden)return;
    if(phaseClock===null)phaseClock=performance.now();
    if(!active().work.feedback&&promptFor(task(),active().work)){answerClock=performance.now();firstDigit=null;}
  }));
}
function makeActive(t){return {taskId:t.id,task:t.drill?t:undefined,work:newWork(t),input:newInput()};}
function nextTask(){
  const s=state.session,recent=s.rows.a.concat(s.rows.b).slice(-C.SPACING_TASKS);
  let t;
  if(s.stage==='b'&&s.drills.length&&Math.random()<C.FOCUS_SHARE){
    const pool=s.drills.filter(d=>!recent.slice(-2).some(r=>r.id===d.id));
    if(pool.length)t=pool[Math.floor(Math.random()*pool.length)];
  }
  t ||= selectTask(state.factMastery,{level:s.level,recent,focus:s.stage==='b'?s.focus:[]});
  s.active=makeActive(t);answerClock=null;save();render();
}
function begin(){
  if(startSession(state,state.selectedLevel)){paused=false;nextTask();}
  else render();
}
function boardHTML(t,w){
  if(t.level===2&&!t.drill)return '<p>Ergebnis eingeben · R drücken · Rest eingeben.</p>';
  if(t.drill)return '<p class="eyebrow">Ein Rechenschritt zum Üben</p>';
  if(t.level===5){
    if(w.stage==='decompose'){const i=w.decomp.length;return `<p>Zerlege ${i<2?t.a:t.b} in Zehner und Einer.</p><p>${i%2===1?w.decomp.at(-1)+' + □':'Zuerst die Zehnerzahl, dann die Einerzahl.'}</p>`;}
    const split=`<p class="decomposition">${t.a} = ${t.decomposition[0].join(' + ')}<br>${t.b} = ${t.decomposition[1].join(' + ')}</p>`;
    if(w.stage==='partials'&&w.selected!==null)return split;
    if(w.stage==='partials')return split+`<p>Wähle eine Teilaufgabe.</p><div class="board">${t.partials.map((p,i)=>`<button data-partial="${i}" ${w.partials[i]!==undefined?'disabled':''} class="${w.selected===i?'selected':''}">${p.label}<br><strong>${w.partials[i]!==undefined?'✓ '+w.partials[i]:'□'}</strong></button>`).join('')}</div>`;
    return split;
  }
  if(t.level===6)return `<p>Noch zu verteilen: <strong>${w.remaining}</strong></p>${w.stage==='choose'?'<p>Wie oft passt die Zahl hinein?<br>Du darfst mit einem Teil anfangen.</p>':''}${w.chunks.length?`<details><summary>Bisheriger Rechenweg</summary>${w.chunks.map(c=>`<p>${t.divisor} × ${c.q} = ${c.product}<br>${c.before} − ${c.product} = ${c.after}</p>`).join('')}</details>`:''}`;
  return '';
}
function inputHTML(){return `<div class="input-area"><p id="place" class="place" aria-live="polite"></p><output id="number" class="number-output" aria-label="Deine eingegebene Zahl"></output><p class="entry-help">Beginne mit den Einern.</p><div class="keypad" aria-label="Zahlentasten">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button data-digit="${n}" class="${n===0?'zero':''}">${n}</button>`).join('')}${isRemainder()?'<button data-action="remainder" aria-label="R – Rest eingeben">R</button>':''}<button class="delete" data-action="delete" aria-label="Letzte Stelle löschen">Löschen</button></div>${btn('Fertig','submit')}</div>`;}
function reportHTML(r){
  if(!r)return '';
  const event=state.cards.find(c=>c.phaseId===r.id);
  r={...r,successNumber:event?.number};
  return `<div class="panel"><h2>${r.successNumber?'Erfolg Nr. '+r.successNumber:'Training abgeschlossen.'}</h2><p>${r.total} ${r.total===1?'Aufgabe':'Aufgaben'} gerechnet.<br><strong>${r.correct} ${r.level>=5?'ohne Korrektur richtig':'richtig'} · ${r.accuracy??0} %</strong></p>${r.successNumber?btn('Erfolgskarte ansehen','card','secondary',`data-number="${r.successNumber}"`):'<p>Du hast geübt. Bleib dran.</p>'}</div>`;
}
function render(){
  renderToken++;
  if(blocked){display('<h1>Lernstand prüfen</h1><p>Die gespeicherten Daten werden nicht überschrieben. Du kannst sie hier als Datei sichern.</p><p id="storage-diagnostic"></p>'+btn('Lerndaten sichern','export-data','secondary')+btn('Erneut laden','reload','secondary'));document.querySelector('#storage-diagnostic').textContent=loaded.diagnostic||'Speichern nicht möglich oder Lernstand in einem anderen Fenster geändert.';return;}
  if(view==='progress'){display(progressHTML(state)+btn('Zurück','back','secondary'));return;}
  if(view==='reset-warning'){display('<h1>Lerndaten zurücksetzen?</h1><p>Alle Lerntage, Erfolge und Lernstände dieses Browsers werden gelöscht. Dies ist nicht rückgängig zu machen.</p>'+btn('Abbrechen','progress','secondary')+btn('Ich möchte zurücksetzen','reset-confirm','secondary'));return;}
  if(view==='reset-confirm'){display('<h1>Wirklich neu beginnen?</h1><p>Erfolg Nr. 0 · 0 Lerntage · keine Serie.</p>'+btn('Abbrechen','progress','secondary')+btn('Ja, alle Lerndaten endgültig löschen','reset-final','secondary'));return;}
  if(view==='card'){return;}
  const s=state.session;
  if(s&&(s.trial||['a','b'].includes(s.stage))){
    if(paused){display('<p class="eyebrow">Deine Übung ist gespeichert</p><h1>In Ruhe weiter</h1><p>Die aktuelle Aufgabe bleibt erhalten.</p>'+btn('Weiterüben','resume')+btn('Fortschritt','progress','plain'));return;}
    const a=active(),t=task();if(!a){nextTask();return;}
    const w=a.work,p=promptFor(t,w);
    display(`<div class="topline"><p>${s.trial?'Beispielaufgabe':s.stage==='a'?'Teil 1 · Gemischt':'Teil 2 · Gezielt'}</p>${btn('Pause','pause','plain')}</div><section class="exercise"><h1 class="equation">${t.label}</h1>${boardHTML(t,w)}${w.feedback?`<div class="feedback ${w.feedback.ok?'good':'bad'}" role="status"><strong>${w.feedback.ok?TEXT.correct:TEXT.wrong}</strong>${!w.feedback.ok?`<span class="solution">${w.feedback.solution}</span>`:''}</div>${btn(w.feedback.retry?'Noch einmal':'Weiter','next')}`:p?`${t.level>=5||t.level===2?`<h2 class="step-equation">${p.label}</h2>`:''}${inputHTML()}`:''}</section>`);
    if(!w.feedback&&p)updateInput();startClock();return;
  }
  if(s?.stage==='between'){
    display(`<p class="eyebrow">Teil 1 geschafft</p><h1>3 Minuten geschafft!</h1>${reportHTML(s.reports.a)}<p>Jetzt übst du 2 Minuten die Aufgaben, die noch Training brauchen.</p>${btn('2-Minuten-Training starten','focus')}${btn('Fortschritt','progress','plain')}`);return;
  }
  if(s?.stage==='done'&&state.completedDates.includes(dayKey())){
    display(`<h1>Für heute geschafft!</h1>${reportHTML(s.reports.b)}<p>${s.comparison.message}</p><p><strong>${TEXT.done}</strong></p>${s.reports.a.successNumber?btn('Karte aus Teil 1','card','secondary',`data-number="${s.reports.a.successNumber}"`):''}${btn('Fortschritt','progress','plain')}`);return;
  }
  display(`<p class="eyebrow">Dein tägliches Training</p><h1>MultiDivi</h1><p>3 Minuten gemischt.<br>2 Minuten gezielt üben.</p><div class="level-list" aria-label="Lernstufe auswählen">${Object.entries(LEVEL_NAMES).map(([l,name])=>`<button data-action="level" data-level="${l}" aria-pressed="${state.selectedLevel===Number(l)}" ><strong>Level ${l}</strong><span>${name}</span></button>`).join('')}</div>${btn('Training starten','start')}${btn('Fortschritt','progress','plain')}<p class="footnote">Version 3.0.3 · Ohne Anmeldung. Dein Lernstand bleibt hier.</p>${dev?'<p>Testmodus · 30 + 20 Sekunden · eigener Lernstand</p>':''}${pendingWorker?btn('Neue Version laden','update','secondary'):''}`);
}
function isRemainder(){return task()?.level===2&&!task()?.drill;}
function remainder(){
  const a=active();if(!running()||!isRemainder()||a.work.feedback||a.quotientInput||a.work.stage==='rest'||inputValue(a.input)===null)return;
  a.quotientInput=a.input;a.quotientTiming={firstMs:firstDigit,totalMs:performance.now()-answerClock,interrupted:a.work.interrupted};a.input=newInput();answerClock=performance.now();firstDigit=null;updateInput();save();
}
function deleteDigit(){
  const a=active();if(!a||a.work.feedback)return;
  if(isRemainder()&&a.quotientInput&&!a.input.digits.length){a.input=a.quotientInput;delete a.quotientInput;delete a.quotientTiming;a.work.interrupted=true;}
  else backspace(a.input);updateInput();save();
}
function updateInput(){
  const a=active(),rest=isRemainder(),hasR=rest&&(a.quotientInput||a.work.stage==='rest');
  document.querySelector('#number').textContent=hasR?`${a.quotientInput?inputDisplay(a.quotientInput):a.work.quotient} R ${inputDisplay(a.input)}`:inputDisplay(a.input);
  document.querySelector('#place').textContent=(rest?(hasR?'Rest · ':'Ergebnis · '):'')+activePlace(a.input);
  if(rest){const heading=document.querySelector('.step-equation');if(heading)heading.textContent=task().label+' · Ergebnis und Rest';}
  const b=document.querySelector('[data-action="submit"]');if(b)b.disabled=!a.input.digits.length||(rest&&!hasR);
  const r=document.querySelector('[data-action="remainder"]');if(r)r.disabled=!!hasR||!a.input.digits.length;
}
function digit(n){
  if(!running()||answerClock===null||active().work.feedback)return;
  const now=performance.now();if(enterDigit(active().input,n,now)){if(firstDigit===null)firstDigit=now-answerClock;updateInput();save();}
}
function submit(){
  if(!running()||answerClock===null||active().work.feedback)return;
  const a=active(),value=inputValue(a.input);if(value===null)return;checkpoint();
  const t=task(),timing={firstMs:firstDigit,totalMs:performance.now()-answerClock,interrupted:a.work.interrupted};
  if(isRemainder()&&a.work.stage!=='rest'){
    if(!a.quotientInput)return;
    const q=acceptValue(t,a.work,inputValue(a.quotientInput),{...a.quotientTiming,interrupted:a.work.interrupted});
    if(!state.session.trial)recordEvidence(state,t,q);
    a.work.feedback=null;
  }
  const e=acceptValue(t,a.work,value,timing);if(!e)return;
  if(!state.session.trial)recordEvidence(state,t,e);
  answerClock=null;a.input=newInput();
  if(a.work.done&&!state.session.trial)recordTask(state,t,a.work);
  save();render();
}
async function showCard(number){
  if(!save())return;
  const persisted=loadState(storage,key);
  const card=persisted.state?.cards.find(c=>c.number===number);if(!card)return;
  stopClock();view='card';
  try{
    const blob=await createCard(card);if(cardURL)URL.revokeObjectURL(cardURL);cardURL=URL.createObjectURL(blob);cardFile=new File([blob],`multidivi-erfolg-${card.number}.png`,{type:'image/png'});
    display(`<h1>Erfolg Nr. ${card.number}</h1><img class="card-image" src="${cardURL}" alt="Erfolgskarte mit Ergebnis, Datum und Tagesserie">${canShareFile(navigator,cardFile)?btn('Karte teilen','share'):''}<a class="button secondary" href="${cardURL}" download="${cardFile.name}">Bild speichern</a><a class="button secondary" href="${cardURL}" target="_blank" rel="noopener">Bild öffnen</a><p>Auf dem iPhone: Bild öffnen und lange auf das Bild drücken.</p>${btn('Zurück','back','secondary')}`);
  }catch{view='main';warn('Die Karte konnte nicht erstellt werden. Bitte erneut versuchen.');render();}
}
app.addEventListener('click',async event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.digit!==undefined){digit(Number(b.dataset.digit));return;}
  if(b.dataset.partial!==undefined){if(selectPartial(active().work,Number(b.dataset.partial))){active().input=newInput();save();render();}return;}
  switch(b.dataset.action){
    case 'export-data':try{const blob=new Blob([exportLearningData(storage,key)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='multidivi-lerndaten-sicherung.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch{warn('Der Browser verhindert auch das Lesen für die Sicherung. Bitte die Website-Daten nicht löschen.');}break;
    case 'reload':location.reload();break;
    case 'level':state.selectedLevel=Number(b.dataset.level);save();render();break;
    case 'start':begin();break;
    case 'resume':paused=false;render();break;
    case 'pause':pause();break;
    case 'delete':deleteDigit();break;
    case 'remainder':remainder();break;
    case 'submit':submit();break;
    case 'next':{
      checkpoint();const a=active();if(!a?.work.feedback)break;
      if(a.work.done){
        if(state.session.trial){state.session.trial=null;stopClock();paused=true;save();render();break;}
        if(state.session.elapsed>=duration[state.session.stage]){stopClock();finishPhase(state);save();render();}
        else nextTask();
      }else{a.work.feedback=null;a.input=newInput();save();render();}break;
    }
    case 'focus':if(startFocus(state)){paused=false;nextTask();}break;
    case 'progress':stopClock();paused=true;if(active())active().work.interrupted=true;view='progress';save();render();break;
    case 'back':view='main';render();break;
    case 'card':await showCard(Number(b.dataset.number));break;
    case 'share':try{await navigator.share({files:[cardFile],title:'Mein MultiDivi-Erfolg'});}catch(e){if(e.name!=='AbortError')warn('Teilen klappt hier nicht. Nutze Bild speichern oder Bild öffnen.');}break;
    case 'try-level':{const level=Number(b.dataset.level);if(state.unlockedLevels.includes(level)){state.session.trial=makeActive(LEVEL_TASKS[level][0]);paused=false;save();render();}break;}
    case 'reset-warning':view='reset-warning';render();break;
    case 'reset-confirm':view='reset-confirm';render();break;
    case 'reset-final':try{stopClock();state=resetState(storage,key);paused=true;view='main';notice.hidden=true;render();}catch{warn('Zurücksetzen konnte nicht gespeichert werden.');}break;
    case 'update':save();pendingWorker?.postMessage({type:'ACTIVATE_UPDATE'});break;
  }
});
document.addEventListener('keydown',e=>{
  if(!running()||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
  if(/^\d$/.test(e.key)){e.preventDefault();digit(Number(e.key));}
  else if(e.key.toLowerCase()==='r'&&isRemainder()){e.preventDefault();remainder();}
  else if(e.key==='Backspace'&&active()&&!active().work.feedback){e.preventDefault();deleteDigit();}
  else if(e.key==='Enter'&&e.target===app){e.preventDefault();submit();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running())pause();else if(!document.hidden&&view==='main')render();});
window.addEventListener('pagehide',()=>{stopClock();if(active())active().work.interrupted=true;save();});
window.addEventListener('storage',e=>{if(e.key===key){stopClock();blocked=true;warn('Der Lernstand wurde in einem anderen Fenster geändert. Bitte diese Seite neu laden.');render();}});
setInterval(()=>{if(phaseClock!==null){checkpoint();save();}},C.CHECKPOINT_MS);
if('serviceWorker' in navigator&&!dev){
  navigator.serviceWorker.register('./service-worker.js').then(reg=>{
    const ready=()=>{pendingWorker=reg.waiting;if(pendingWorker){warn('Eine neue Version ist bereit. Nach dem Training kannst du sie auf der Startseite laden.');if(!active())render();}};
    ready();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',ready));
    reg.update().catch(()=>{});
  }).catch(()=>warn('Offline-Speichern klappt gerade nicht. Mit Internet kannst du üben.'));
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(pendingWorker)location.reload();});
}
if(dev)window.learningDev={snapshot:()=>structuredClone(state),reset:()=>{state=resetState(storage,key);location.reload();}};
render();
