// Mahdi Repair service worker: installable app, fast start, works with a weak connection. Data always comes live from Firebase.
<<<<<<< HEAD
const V='rd-72',CORE=['app.html','index.html','css/common.css','img/logo.png','img/icon-192.png','js/common.js','js/ui.js','js/firebase-config.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u+(/\.(js|css)$/.test(u)?'?v='+V.slice(3):'')).catch(()=>{})))).then(()=>self.skipWaiting()))});
=======
const V='rd-v70',CORE=['app.html','index.html','common.css','logo.png','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()))});
>>>>>>> parent of ca08a44 (FIX LOGIN PASSWORD BOX)
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const put=(r,res)=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(V).then(x=>x.put(r,c)).catch(()=>{})}return res};
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 const same=u.origin===location.origin,lib=/gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com/.test(u.href);if(!same&&!lib)return;
 // versioned files (?v=) and the Firebase libraries never change under the same URL: serve from cache instantly
 if(lib||(same&&/\.(js|css)$/.test(u.pathname)&&u.searchParams.has('v')))return e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res))));
 // images: instant from cache, refreshed in the background
 if(same&&/\/img\//.test(u.pathname))return e.respondWith(caches.match(r).then(m=>{const f=fetch(r).then(res=>put(r,res)).catch(()=>m);return m||f}));
 // pages and data: network first (always the newest version), cache as fallback when offline
 e.respondWith(fetch(r).then(res=>put(r,res)).catch(()=>caches.match(r,{ignoreSearch:false}).then(m=>m||caches.match(r,{ignoreSearch:true}))))});
self.addEventListener('notificationclick',e=>{e.notification.close();const href=(e.notification.data&&e.notification.data.href)||'app.html';e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{for(const c of L){if('focus' in c){c.postMessage({rdGo:href});return c.focus()}}return self.clients.openWindow('app.html#'+encodeURIComponent(href))}))});
