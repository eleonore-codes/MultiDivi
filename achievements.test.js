import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,migrate,saveState,loadState,resetState} from '../storage.js';
import {awardSuccess,qualifies,recognition} from '../rewards.js';
import {createCard} from '../share-card.js';
import {progressHTML} from '../progress.js';
import {BY_ID} from '../content.js';
import {newWork,acceptValue,selectPartial} from '../strategy.js';
import {recordEvidence,startSession} from '../session.js';
const report=(id,phase='a')=>({id,sessionId:'session',phase,level:1,total:20,correct:19,accuracy:95});
const store=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
test('Version 2 migration preserves mastery, history, success numbers and streak snapshots',()=>{
 const old=freshState();awardSuccess(old,report('session:a'),'2026-09-20');old.schemaVersion=2;old.unlockedLevels=[1];old.learningDays=['2026-09-19','2026-09-20'];old.dailySummaries.test={existing:true};old.cards=old.cards.map(({phaseId,date,number,streak,accuracy,correct,total,level,phase,message})=>({phaseId,date,number,streak,accuracy,correct,total,level,phase,message}));
 const snapshot=JSON.stringify(old),next=migrate(old);assert.equal(JSON.stringify(old),snapshot);assert.equal(next.schemaVersion,3);assert.deepEqual(next.unlockedLevels,[1,2,3,4,5,6]);assert.deepEqual(next.dailySummaries,old.dailySummaries);assert.deepEqual(next.factMastery,old.factMastery);assert.equal(next.successNumber,1);assert.equal(next.currentStreak,1);assert.equal(next.cards[0].timestamp,null);assert.equal(next.cards[0].successNumber,1);assert.deepEqual(next.learningDays,['2026-09-20']);assert.equal(next.practiceDays.length,2);assert(startSession(next,6,'2026-09-21'));
});
test('Each phase creates one persisted event; reopening and reload do not award again',()=>{
 const s=freshState(),db=store();awardSuccess(s,report('session:a'),'2026-09-20');assert.equal(s.cards[0].successNumber,1);saveState(s,db);const restored=loadState(db).state;awardSuccess(restored,report('session:a'),'2026-09-20');awardSuccess(restored,report('session:b','b'),'2026-09-20');assert.equal(restored.successNumber,2);assert.equal(restored.currentStreak,1);assert.deepEqual(restored.learningDays,['2026-09-20']);assert.equal(restored.cards[1].trainingType,'2-Minuten-Fokustraining');assert.equal(restored.cards[0].sessionId,'session');
 const frozen=JSON.stringify(restored.cards[0]);awardSuccess(restored,report('next:a'),'2026-09-21');assert.equal(JSON.stringify(restored.cards[0]),frozen);assert.equal(restored.longestStreak,2);
});
test('Nonqualifying and tiny samples create no events and no successful learning day',()=>{
 const s=freshState();for(const r of [{...report('tiny'),total:1,correct:1},{...report('weak'),correct:10}])assert.equal(awardSuccess(s,r),null);assert.equal(s.cards.length,0);assert.equal(s.successNumber,0);assert.equal(s.learningDays.length,0);
});
test('Both advanced phases require meaningful strategy evidence, not one trivial calculation',()=>{
 for(const level of [5,6])for(const phase of ['a','b']){
 const r={...report('advanced',phase),level,total:2,correct:2,steps:8,fullTasks:2,drills:0};assert(qualifies(r));assert(!qualifies({...r,total:1,correct:1,fullTasks:1}));assert(!qualifies({...r,steps:3}));assert(!qualifies({...r,correct:1}));
 const n=phase==='a'?8:6;assert(qualifies({...r,total:n,correct:n,drills:n,fullTasks:0}));assert(!qualifies({...r,total:1,correct:1,drills:1,fullTasks:0}));
 }
});
test('Full reset clears every success and history field while keeping all levels available',()=>{
 const db=store(),s=freshState();awardSuccess(s,report('a'));saveState(s,db);const r=resetState(db);assert.equal(r.successNumber,0);assert.equal(r.cards.length,0);assert.deepEqual(r.awardedPhases,{});assert.equal(r.currentStreak,0);assert.equal(r.longestStreak,0);assert.equal(r.lastQualifyingSuccessDate,null);assert.deepEqual(r.learningDays,[]);assert.deepEqual(r.unlockedLevels,[1,2,3,4,5,6]);
});
test('Stale window cannot overwrite a newer persisted success; failed persistence never advances revision',()=>{
 const db=store(),s=freshState();saveState(s,db);const stale=loadState(db).state;awardSuccess(s,report('a'));assert(saveState(s,db));assert.equal(saveState(stale,db),false);assert.equal(loadState(db).state.successNumber,1);const rev=s.revision;assert.equal(saveState(s,{setItem(){throw Error('quota');}}),false);assert.equal(s.revision,rev);
});
test('Recognition uses comparable evidence and never infers improvement from accuracy alone',()=>{
 const s=freshState();s.successNumber=1;assert.equal(recognition(s,report('a')),'Stark geübt!');assert.match(recognition(s,{development:{adequate:true,before:70,after:95}}),/gleichen Aufgaben/);assert.equal(recognition(s,{development:{adequate:false,before:0,after:100}}),'Stark geübt!');
});
test('Advanced diagnostics update only the actually attempted small fact once, without speed mastery',()=>{
 const s=freshState(),t=BY_ID['5-23-14'],w=newWork(t);for(const n of t.decomposition.flat())acceptValue(t,w,n);selectPartial(w,3);const e=acceptValue(t,w,99);recordEvidence(s,t,e);w.feedback=null;recordEvidence(s,t,acceptValue(t,w,12));assert.equal(s.factMastery['1-3-4-product'].attempts,1);assert.equal(s.factMastery['1-3-4-product'].state,'unseen');assert.equal(Object.keys(s.factMastery).length,1);
});
test('Card draws only event snapshots; optional private fields never enter the image',async()=>{
 const s=freshState();const event=awardSuccess(s,report('a'),'2026-09-20');event.childName='PRIVATE_CHILD';event.errors='PRIVATE_ERROR';event.number=999;event.streak=999;event.message='MUTATED_ALIAS';const text=[];const ctx={fillRect(){},fillText(t){text.push(t);},measureText:t=>({width:t.length*15})};globalThis.document={createElement:()=>({getContext:()=>ctx,toBlob:fn=>fn(new Blob(['png']))})};
 try{await createCard(event);assert(text.includes('Erfolg Nr. 1'));assert(!text.join(' ').match(/PRIVATE|MUTATED|999/));assert(text.includes('3-Minuten-Training'));assert(text.join(' ').includes('20.9.2026'));}finally{delete globalThis.document;}
});
test('No obsolete lock messaging remains in UI and progress describes available and trained levels',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),html=progressHTML(freshState());assert(!/noch gesperrt|Neues Level freigeschaltet|5 Erfolge bis/.test(app+html));assert(!/Freigeschaltet|Für Level 2:/.test(html));assert(html.includes('Trainierte Level'));assert(html.includes('Alle sechs Level'));
});
