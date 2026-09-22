import test from 'node:test';
import assert from 'node:assert/strict';
import {CONFIG as C,durations} from '../config.js';
import {TASKS,REMAINDERS,LEVEL_TASKS,ALL_TASKS,BY_ID} from '../content.js';
import {newInput,enterDigit,inputValue,inputDisplay,activePlace,backspace,possiblePlaceValueError} from '../place-value.js';
import {observe,mastery,priority,selectTask,focusFamilies,distribution} from '../learning-engine.js';
import {freshState,loadState,saveState,resetState,dayKey,dayOrdinal,currentStreak} from '../storage.js';
import {qualifies,awardSuccess,unlockLevels} from '../rewards.js';
import {startSession,startFocus,finishPhase,recordTask} from '../session.js';
import {newWork,acceptValue,selectPartial,strategyDrills} from '../strategy.js';
import {compare} from '../statistics.js';
import {canShareFile} from '../share-card.js';
const timing={firstMs:1000,totalMs:8000};
function fill(n){const i=newInput();[...String(n)].reverse().forEach((d,k)=>enterDigit(i,Number(d),k*200));return i;}
const report=(id,phase='a',correct=18,total=20,level=1)=>({id,phase,correct,total,level,accuracy:Math.round(correct/total*100),steps:total,drills:0,fullTasks:total});
test('All 500 small-table forms have exactly one answer',()=>{
 assert.equal(TASKS.length,500);
 for(const t of TASKS){let valid=[];for(let n=0;n<=100;n++){const p=t.a*t.b;if(({product:n===p,left:n*t.b===p,right:t.a*n===p,quotient:p/t.a===n,divisor:n>0&&p/n===t.b})[t.form])valid.push(n);}assert.deepEqual(valid,[t.answer]);}
});
test('All 450 remainder equations have a strictly positive valid remainder',()=>{
 assert.equal(REMAINDERS.length,450);for(const t of REMAINDERS){assert.equal(t.dividend,t.a*t.answer+t.remainder);assert(t.remainder>0&&t.remainder<t.a);}
});
test('All level 3–4 equations are valid and divide exactly',()=>{
 for(const l of [3,4])for(const t of LEVEL_TASKS[l]){if(t.form==='quotient')assert.equal(t.dividend/t.divisor,t.answer);else assert.equal(t.a*t.b,t.answer);assert(t.answer<=C.MAX_RESULT);assert(t.a>0&&t.b>0);}
 assert.equal(LEVEL_TASKS[3].length,270);assert.equal(LEVEL_TASKS[4].length,304);
});
test('All advanced generators reconstruct exactly',()=>{
 assert.equal(new Set(ALL_TASKS.map(t=>t.id)).size,ALL_TASKS.length);
 for(const t of LEVEL_TASKS[5]){assert.equal(t.decomposition[0].reduce((a,b)=>a+b),t.a);assert.equal(t.decomposition[1].reduce((a,b)=>a+b),t.b);for(const p of t.partials)assert.equal(p.answer,p.a*p.b);assert.equal(t.partials.reduce((n,p)=>n+p.answer,0),t.answer);}
 for(const t of LEVEL_TASKS[6])assert.equal(t.dividend/t.divisor,t.answer);
});
test('Right-to-left input, all required examples, corrections and place labels',()=>{
 for(const n of [8,12,21,56,80,81,100,104,140,240,322,630,1000]){const i=fill(n);assert.equal(inputValue(i),n);assert.equal(inputDisplay(i),String(n));}
 const i=newInput();assert.equal(activePlace(i),'Einer');enterDigit(i,6,100);assert.equal(activePlace(i),'Zehner');assert.equal(inputValue(i),6);enterDigit(i,5,300);assert.equal(inputValue(i),56);backspace(i);enterDigit(i,4,500);assert.equal(inputValue(i),46);
});
test('Duplicate events ignored, intentional repeated zeros preserved',()=>{
 const i=newInput();assert(enterDigit(i,0,100));assert.equal(enterDigit(i,0,120),false);assert(enterDigit(i,0,300));enterDigit(i,1,500);assert.equal(inputValue(i),100);assert(possiblePlaceValueError(240,24));assert.equal(possiblePlaceValueError(240,239),false);
});
test('First digit drives fluency; total input time and interruption kept separate',()=>{
 const t=TASKS[0],fast={},slow={};for(let i=0;i<6;i++){observe(fast,t,true,{firstMs:1200,totalMs:15000});observe(slow,t,true,{firstMs:7000,totalMs:9000});}
 assert.equal(mastery(fast[t.id]),'automated');assert.equal(mastery(slow[t.id]),'slow');assert(priority(t,slow)>priority(t,fast));observe(fast,t,true,{firstMs:150000,totalMs:160000});assert.equal(fast[t.id].recent.at(-1).firstMs,null);
});
test('Errors increase priority; insufficient observations remain separate',()=>{
 const t=TASKS[1],model={};observe(model,t,false,timing);assert.equal(mastery(model[t.id]),'unseen');for(let i=0;i<3;i++)observe(model,t,false,timing);assert.equal(mastery(model[t.id]),'uncertain');assert(priority(t,model)>priority(t,{}));
});
test('Scheduler spaces families and retains easy/automated facts',()=>{
 let seed=1;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32),model={};for(const t of TASKS)for(let i=0;i<6;i++)observe(model,t,true,timing);
 const seen=new Set();let recent=[],easy=0;for(let i=0;i<500;i++){const t=selectTask(model,{recent},rng);assert(!recent.some(r=>r.family===t.family));seen.add(t.a);easy+=t.easy;recent=[...recent,t].slice(-4);}assert.equal(seen.size,10);assert(easy>50);
});
test('Visible success does not remove slow facts from focus',()=>{
 const s=freshState(),t=TASKS[0];for(let i=0;i<6;i++)observe(s.factMastery,t,true,{firstMs:7000,totalMs:8000});awardSuccess(s,report('slow','a',20,20),'2026-09-20');assert.equal(s.successNumber,1);assert.equal(mastery(s.factMastery[t.id]),'slow');assert(focusFamilies([{...t,ok:true,firstMs:7000}],s.factMastery).includes(t.family));
});
test('90 percent inclusive; raw below-threshold accuracy and tiny samples fail',()=>{
 assert(qualifies(report('a','a',18,20)));assert.equal(qualifies(report('b','a',17,19)),false);assert.equal(qualifies(report('c','a',1,1)),false);assert(qualifies(report('d','b',8,8)));assert.equal(qualifies(report('e','b',7,7)),false);
});
test('Advanced rewards require strategy work; strategy mastery ignores speed',()=>{
 const r={...report('advanced','a',2,2,5),steps:8,fullTasks:2};assert(qualifies(r));assert.equal(qualifies({...r,total:1,correct:1,fullTasks:1}),false);assert.equal(qualifies({...r,total:2,correct:2,fullTasks:0,drills:2}),false);
 const model={},t=LEVEL_TASKS[5][0];for(let i=0;i<4;i++)observe(model,t,true,{firstMs:50000,totalMs:500000});assert.equal(mastery(model[t.id],5),'secure');
});
test('Success IDs persist: reload and same-day reports cannot duplicate streak',()=>{
 const s=freshState(),a=report('id:a');awardSuccess(s,a,'2026-09-20');awardSuccess(s,report('id:b','b'),'2026-09-20');const copy=JSON.parse(JSON.stringify(s));awardSuccess(copy,a,'2026-09-20');assert.equal(copy.successNumber,2);assert.equal(copy.currentStreak,1);assert.equal(copy.cards.length,2);
});
test('Local calendar streak handles consecutive days, gaps and DST',()=>{
 const s=freshState();awardSuccess(s,report('1'),'2026-09-20');awardSuccess(s,report('2'),'2026-09-21');assert.equal(s.currentStreak,2);awardSuccess(s,report('3'),'2026-09-23');assert.equal(s.currentStreak,1);assert.equal(s.longestStreak,2);assert.equal(currentStreak(s,'2026-09-25'),0);assert.equal(dayOrdinal('2026-03-30')-dayOrdinal('2026-03-29'),1);assert.equal(dayKey(new Date(2026,8,20,23,59)),'2026-09-20');
});
test('All six levels selectable with zero rewards, weak mastery, reload and reset',()=>{
 const map=new Map(),store={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 for(const l of [1,2,3,4,5,6]){const s=freshState();observe(s.factMastery,TASKS[0],false,timing);assert(startSession(s,l,'2026-09-20'));assert.equal(s.successNumber,0);}
 const s=freshState();saveState(s,store);assert.deepEqual(loadState(store).state.unlockedLevels,[1,2,3,4,5,6]);assert.deepEqual(resetState(store).unlockedLevels,[1,2,3,4,5,6]);
});
function solveBoard(order=[3,1,0,2],error=false){const t=BY_ID['5-23-14'],w=newWork(t);for(const n of t.decomposition.flat())acceptValue(t,w,n,timing);if(error){selectPartial(w,3);acceptValue(t,w,99,timing);w.feedback=null;}for(const i of order){assert(selectPartial(w,i));acceptValue(t,w,t.partials[i].answer,timing);}acceptValue(t,w,t.answer,timing);return {t,w};}
test('Board permits arbitrary order and independent correction without losing cells',()=>{
 const {w}=solveBoard([3,1,0,2],true);assert(w.done);assert.equal(Object.keys(w.partials).length,4);assert.equal(w.errors.length,1);
 const t=BY_ID['5-23-14'],v=newWork(t);for(const n of t.decomposition.flat())acceptValue(t,v,n);for(const i of [0,1,2]){selectPartial(v,i);acceptValue(t,v,t.partials[i].answer);}const saved={...v.partials};selectPartial(v,3);acceptValue(t,v,21);assert.deepEqual(v.partials,saved);v.feedback=null;acceptValue(t,v,12);assert.equal(v.stage,'sum');acceptValue(t,v,322);assert(v.done);
});
test('Decomposition and component mistakes retain separate evidence',()=>{
 const t=BY_ID['5-23-14'],w=newWork(t);acceptValue(t,w,3);assert.equal(w.errors[0].errorType,'decomposition');const solved=solveBoard(undefined,true),drills=strategyDrills([{id:t.id,errors:solved.w.errors}],BY_ID);assert.equal(drills.length,1);assert(drills[0].drill);const v=newWork(drills[0]);acceptValue(drills[0],v,12,timing);assert(v.done);
});
test('Division accepts alternative partial-quotient strategies and rejects invalid chunks',()=>{
 const t=BY_ID['6-12-13'];for(const route of [[10,3],[5,5,3],[13],[1,12]]){const w=newWork(t);for(const q of route){acceptValue(t,w,q,timing);acceptValue(t,w,t.divisor*q,timing);acceptValue(t,w,w.remaining-t.divisor*q,timing);}acceptValue(t,w,t.answer,timing);assert(w.done);assert.equal(w.chunks.reduce((n,c)=>n+c.product,0),156);}
 const w=newWork(t);acceptValue(t,w,14);assert.equal(w.feedback.ok,false);assert.equal(w.remaining,156);w.feedback=null;acceptValue(t,w,0);assert.equal(w.feedback.ok,false);
});
test('Remainder and quotient are independent input components',()=>{
 const t=BY_ID['2-7-8-2'],w=newWork(t);acceptValue(t,w,inputValue(fill(8)),timing);assert.equal(w.stage,'rest');assert.equal(w.done,false);acceptValue(t,w,inputValue(fill(2)),timing);assert(w.done);assert.equal(w.errors.length,0);
});
test('3+2 cycle: idempotent finish, unique days, summaries and no third phase',()=>{
 const s=freshState();assert(startSession(s,1,'2026-09-20','test'));for(let i=0;i<12;i++){const w=newWork(TASKS[0]);acceptValue(TASKS[0],w,TASKS[0].answer,timing);recordTask(s,TASKS[0],w,'2026-09-20');}finishPhase(s,'2026-09-20');finishPhase(s,'2026-09-20');assert.equal(s.successNumber,1);assert(startFocus(s));for(let i=0;i<8;i++){const w=newWork(TASKS[1]);acceptValue(TASKS[1],w,TASKS[1].answer,timing);recordTask(s,TASKS[1],w,'2026-09-20');}finishPhase(s,'2026-09-20');assert.equal(s.successNumber,2);assert.equal(s.session.stage,'done');assert.equal(s.learningDays.length,1);assert.equal(s.dailySummaries['2026-09-20'].reports.length,2);assert.equal(startFocus(s),false);assert(startSession(s,2,'2026-09-20'));assert.equal(startSession(s,1,'2026-09-21'),false);assert.equal(durations().a,180000);assert.equal(durations().b,120000);
});
test('Storage rejects unknown/corrupt schemas and reset produces a zero profile',()=>{
 const map=new Map(),store={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};const s=freshState();awardSuccess(s,report('persist'),'2026-09-20');saveState(s,store);assert.equal(loadState(store).state.successNumber,1);const fresh=resetState(store);assert.equal(fresh.successNumber,0);assert.equal(fresh.learningDays.length,0);assert.equal(loadState({getItem:()=>'{'}).blocked,true);assert.equal(loadState({getItem:()=>JSON.stringify({schemaVersion:99})}).blocked,true);assert.equal(saveState(s,{setItem(){throw Error();}}),false);
});
test('Progress states separate insufficient evidence; comparisons are conservative',()=>{
 const s=freshState();assert.equal(distribution(s.factMastery,1).counts.unseen,500);for(let i=0;i<6;i++)observe(s.factMastery,TASKS[0],true,timing);assert.equal(distribution(s.factMastery,1).sufficient,1);assert.equal(compare([{id:'x',ok:true,firstMs:5000}],[{id:'y',ok:true,firstMs:1000}]).adequate,false);
});
test('Share fallback detects missing, throwing and supported APIs',()=>{
 assert.equal(canShareFile({},{}),false);assert.equal(canShareFile({share(){},canShare(){throw Error();}},{}),false);assert(canShareFile({share(){},canShare:()=>true},{}));
});
