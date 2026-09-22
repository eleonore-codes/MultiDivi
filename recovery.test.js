import test from 'node:test';
import assert from 'node:assert/strict';
import {loadState,saveState,LEGACY_KEY,STORAGE_KEY,exportLearningData} from '../storage.js';
const old={version:1,model:{'7-8-product':{attempts:1,correct:1,incorrect:0,recent:[{ok:true,ms:6000}]}},history:[],recentLevel1:[]};
test('V1 migration preserves original and maps evidence without inventing retrieval speed',()=>{const m=new Map([[LEGACY_KEY,JSON.stringify(old)]]),db={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)},s=loadState(db);assert(!s.blocked);assert.equal(s.state.factMastery['1-7-8-product'].recent[0].firstMs,null);assert.equal(s.state.factMastery['1-7-8-product'].recent[0].totalMs,6000);assert(saveState(s.state,db));assert.deepEqual(JSON.parse(m.get(LEGACY_KEY)),old);assert.equal(loadState(db).state.successNumber,0);});
test('Unreadable data remains exportable without replacement',()=>{const db={getItem:k=>k===STORAGE_KEY?'{broken':null};assert(loadState(db).blocked);assert.equal(JSON.parse(exportLearningData(db)).entries[STORAGE_KEY],'{broken');});
