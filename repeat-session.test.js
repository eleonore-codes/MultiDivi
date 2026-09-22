import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,loadState,saveState} from '../storage.js';
import {startSession,startFocus,finishPhase} from '../session.js';
test('Multiple levels on one day keep unique successes, one streak day and prior history',()=>{
 let s=freshState();const date='2026-09-22';
 for(const level of [1,2]){
  assert(startSession(s,level,date,'cycle-'+level));
  for(const phase of ['a','b']){
   s.session.rows[phase]=Array.from({length:12},(_,i)=>({id:level+'-'+i,family:'f'+i,level,ok:true,firstMs:1000,totalMs:2000,steps:2,drill:false,errors:[]}));
   finishPhase(s,date);if(phase==='a')assert(startFocus(s));
  }
  const m=new Map(),db={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};assert(saveState(s,db));s=loadState(db).state;
 }
 assert.equal(s.successNumber,4);assert.equal(new Set(s.cards.map(c=>c.phaseId)).size,4);assert.equal(s.currentStreak,1);assert.equal(s.learningDays.length,1);assert.equal(s.dailySummaries[date].reports.length,4);assert(startSession(s,6,date,'cycle-6'));assert.equal(s.session.level,6);
});
