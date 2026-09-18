const CACHE='einmaleins-v1.0.1';
const BASE=new URL('./',self.location.href);
const FILES=['./','index.html','styles.css','app.js','config.js','content.js','learning-engine.js','statistics.js','storage.js','session.js','share-card.js','manifest.json','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(p=>new URL(p,BASE).href)))));
// Do not replace a running lesson; activate the complete new version after old tabs close.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('einmaleins-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(event.request,{ignoreSearch:true});if(hit)return hit;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return cache.match(new URL('index.html',BASE));throw error;}}));
});
