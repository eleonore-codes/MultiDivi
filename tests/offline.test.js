import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
test('Service worker precaches all local modules under a repository subpath',async()=>{
 const handlers={},assets=[];let activated=false;
 const context={URL,self:{location:{href:'https://example.test/MultiDivi/service-worker.js'},addEventListener:(type,fn)=>handlers[type]=fn,clients:{claim:async()=>{}},skipWaiting:()=>{activated=true;}},caches:{open:async()=>({addAll:async urls=>assets.push(...urls)}),keys:async()=>[],delete:async()=>true}};
 vm.runInNewContext(readFileSync(new URL('../service-worker.js',import.meta.url),'utf8'),context);
 let install;handlers.install({waitUntil:p=>install=p});await install;
 for(const url of assets){assert(url.startsWith('https://example.test/MultiDivi/'));const file=url.split('/MultiDivi/')[1]||'index.html';assert(existsSync(new URL('../'+file,import.meta.url)));}
 const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');for(const match of source.matchAll(/from '\.\/([^']+)'/g))assert(assets.some(url=>url.endsWith('/'+match[1])));
 assert.equal(activated,false);handlers.message({data:{type:'ACTIVATE_UPDATE'}});assert.equal(activated,true);
});
test('Runtime has no external dependencies, countdown or old card themes',()=>{
 const files=['app.js','content.js','learning-engine.js','share-card.js','styles.css','index.html'];
 for(const file of files){const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');assert(!/https?:\/\//.test(source),file);}
 const card=readFileSync(new URL('../share-card.js',import.meta.url),'utf8');assert(!/tennis|sportwagen|baustein|themeForDate/i.test(card));
});
