const BASE=new URL('./',self.location.href);
const PREFIX='multidivi-'+BASE.pathname+'-';
const CACHE=PREFIX+'v2.0.0';
const FILES=['./','index.html','styles.css','app.js','config.js','content.js','learning-engine.js','statistics.js','storage.js','session.js','rewards.js','place-value.js','strategy.js','progress.js','share-card.js','manifest.json','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(p=>new URL(p,BASE).href)))));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith(PREFIX)||/^einmaleins-v1\./.test(k))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    // A complete installed release is atomic; activate the next one only on request or tab close.
    const hit=await cache.match(event.request,{ignoreSearch:true});if(hit)return hit;
    try{return await fetch(event.request);}catch(error){
      if(event.request.mode==='navigate')return cache.match(new URL('index.html',BASE).href);
      throw error;
    }
  }));
});
