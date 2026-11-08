// Mahdi Repair service worker: installable app, fast start, works with a weak connection. Data always comes live from Firebase.
const V='rd-v69',CORE=['app.html','index.html','common.css','logo.png','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 const same=u.origin===location.origin,lib=/gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com/.test(u.href);if(!same&&!lib)return;
 // network first (always the newest version), cache as fallback when offline
 e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c)).catch(()=>{})}return res}).catch(()=>caches.match(r,{ignoreSearch:false}).then(m=>m||caches.match(r,{ignoreSearch:true}))))});
self.addEventListener('notificationclick',e=>{e.notification.close();const href=(e.notification.data&&e.notification.data.href)||'app.html';e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{for(const c of L){if('focus' in c){c.postMessage({rdGo:href});return c.focus()}}return self.clients.openWindow('app.html#'+encodeURIComponent(href))}))});
