import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadState,saveState,STORAGE_KEY,LEGACY_KEY,exportLearningData} from '../storage.js';
const legacy=()=>({version:1,model:{'7-8-product':{attempts:1,correct:1,incorrect:0,recent:[{ok:true,ms:6000}],streak:0,last:123,state:'slow'}},level2:false,level1Attempts:1,recentLevel1:[],day:{date:'2026-09-21',stage:'a',rows:{a:[]},results:{}},history:[]});
function db(raw){const m=new Map([[LEGACY_KEY,raw]]);return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};}
test('V1-only browser migrates without changing its original or inventing successes',()=>{
 const original=JSON.stringify(legacy()),storage=db(original),loaded=loadState(storage);assert.equal(loaded.blocked,false);assert.equal(loaded.legacy,true);assert.deepEqual(loaded.state.unlockedLevels,[1,2,3,4,5,6]);assert.equal(loaded.state.factMastery['1-7-8-product'].attempts,1);assert.equal(loaded.state.factMastery['1-7-8-product'].recent[0].firstMs,null);assert.equal(loaded.state.factMastery['1-7-8-product'].recent[0].totalMs,6000);assert.deepEqual(loaded.state.legacyArchive,legacy());assert.equal(loaded.state.successNumber,0);assert(saveState(loaded.state,storage));assert.equal(storage.getItem(LEGACY_KEY),original);assert.equal(loadState(storage).state.factMastery['1-7-8-product'].attempts,1);
});
test('Malformed legacy data stays blocked and export preserves original bytes',()=>{
 const storage=db('{broken'),loaded=loadState(storage);assert(loaded.blocked);assert.match(loaded.diagnostic,/JSON/);const exported=JSON.parse(exportLearningData(storage));assert.equal(exported.entries[LEGACY_KEY],'{broken');assert.equal(storage.getItem(STORAGE_KEY),null);
});
test('Rest entry has explicit transition and confirmation labels',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert(app.includes('Weiter zum Rest'));assert(app.includes('Rest eingeben'));assert(app.includes('Rest bestätigen'));
});
