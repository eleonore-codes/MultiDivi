import test from 'node:test';
import assert from 'node:assert/strict';
import {BY_ID} from '../content.js';
import {strategyDrills,completeRemainderTask,newWork,acceptValue} from '../strategy.js';
test('Quotient and remainder errors target the complete division in focus',()=>{
 const t=BY_ID['2-10-2-4'];
 const drills=strategyDrills([{id:t.id,errors:[{component:'fact',label:'24 : 10 · Ergebnis',expected:2},{component:'remainder',label:'24 : 10 · Rest',expected:4}]}],BY_ID);
 assert.equal(drills.length,1);assert.equal(drills[0],t);assert(!drills[0].drill);
 const w=newWork(t);acceptValue(t,w,2);assert.equal(w.stage,'rest');assert(!w.done);acceptValue(t,w,4);assert(w.done);assert(w.feedback.ok);
});
test('Stored focus drills resolve to full task without carrying rest as quotient',()=>{
 const t=BY_ID['2-10-2-4'];
 for(const component of ['fact','remainder']){const old={...t,id:'drill-old',drill:true,component,answer:component==='remainder'?4:2};assert.equal(completeRemainderTask(old,BY_ID),t);assert.equal(old.drill,true);}
 assert.equal(completeRemainderTask(t,BY_ID),t);
 const advanced={level:5,drill:true};assert.equal(completeRemainderTask(advanced,BY_ID),advanced);
});
