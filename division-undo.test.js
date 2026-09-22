import test from 'node:test';
import assert from 'node:assert/strict';
import {BY_ID} from '../content.js';
import {newWork,acceptValue,undoDivisionPart} from '../strategy.js';
const task=BY_ID['6-13-23'];
test('299:13: replace partial quotient 2 with 20 before subtraction, then finish with 3',()=>{
 const w=newWork(task);acceptValue(task,w,2);acceptValue(task,w,26);assert.equal(w.stage,'subtract');assert(undoDivisionPart(task,w));assert.equal(w.remaining,299);assert.equal(w.checks,0);
 for(const n of [20,260,39,3,39,0,23])acceptValue(task,w,n);
 assert(w.done);assert(w.feedback.ok);assert.deepEqual(w.quotients,[20,3]);assert.equal(w.checks,7);assert(!undoDivisionPart(task,w));
});
test('Completed partial calculations undo in reverse order, preserving earlier work and reload state',()=>{
 let w=newWork(task);for(const n of [2,26,273,20,260,13])acceptValue(task,w,n);
 w=JSON.parse(JSON.stringify(w));assert(undoDivisionPart(task,w));assert.equal(w.remaining,273);assert.deepEqual(w.quotients,[2]);assert.equal(w.chunks.length,1);assert.equal(w.checks,3);
 assert(undoDivisionPart(task,w));assert.equal(w.remaining,299);assert.deepEqual(w.quotients,[]);assert.equal(w.checks,0);assert(!undoDivisionPart(task,w));
});
test('Undo available before product and final sum, retains error evidence',()=>{
 const w=newWork(task);acceptValue(task,w,2);assert(undoDivisionPart(task,w));
 acceptValue(task,w,23);acceptValue(task,w,299);acceptValue(task,w,0);assert.equal(w.stage,'sum');acceptValue(task,w,99);assert.equal(w.errors.length,1);assert(undoDivisionPart(task,w));assert.equal(w.errors.length,1);assert.equal(w.checks,1);assert.equal(w.remaining,299);assert.equal(w.feedback,null);
 assert(!undoDivisionPart({...task,drill:true},w));
});
