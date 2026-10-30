const CACHE='oasis-v41';
const SHELL=['oasis-app.html','oasis.webmanifest','oasis-192.png','oasis-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const own=u.origin===location.origin,lib=u.hostname==='cdn.jsdelivr.net';
  if(!own&&!lib)return;
  e.respondWith(fetch(r,own?{cache:'no-cache'}:undefined).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r)));
});
self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch(_){}
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    if(cs.some(c=>c.visibilityState==='visible'))return;
    return self.registration.showNotification(d.title||'Oasis',{body:d.body||'',icon:'oasis-192.png',badge:'oasis-192.png',tag:'chat-'+(d.chat||''),renotify:true,data:{chat:d.chat}});
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const chat=e.notification.data&&e.notification.data.chat;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    if(cs.length){const c=cs[0];c.focus();if(chat)c.postMessage({open:chat});return}
    return self.clients.openWindow('oasis-app.html'+(chat?'#chat='+chat:''));
  }));
});
