// 999lite (v.3): 미리 받아 둔 영상을 저장소(Cache Storage)에서 꺼내 줌. 영상 탐색에 필요한 부분 요청(Range)도 처리
const CN='g999lite-v1',MEM=new Map();
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(!/\/videos(264)?\/[^/]+\.mp4$/.test(u.pathname))return;   // 영상 저장소가 다른 주소(R2)여도 처리
 e.respondWith((async()=>{
  const key=u.origin+u.pathname;let bp=MEM.get(key);
  if(!bp){const c=await caches.open(CN),hit=await c.match(key);if(!hit)return fetch(e.request);
   bp=hit.blob();MEM.set(key,bp);while(MEM.size>3)MEM.delete(MEM.keys().next().value)}   // 최근에 쓴 영상 3개는 다시 읽지 않도록 잡아 둠 (부분 요청마다 통째로 다시 읽으면 끊김)
  else{MEM.delete(key);MEM.set(key,bp)}
  const blob=await bp,size=blob.size,h={'Content-Type':'video/mp4','Accept-Ranges':'bytes','Cache-Control':'no-store'};
  if(e.request.method==='HEAD')return new Response(null,{status:200,headers:Object.assign(h,{'Content-Length':size})});
  const m=/bytes=(\d*)-(\d*)/.exec(e.request.headers.get('range')||'');
  if(!m)return new Response(blob,{status:200,headers:Object.assign(h,{'Content-Length':size})});
  let a=m[1]===''?Math.max(0,size-(+m[2]||0)):+m[1],b=m[1]===''||m[2]===''?size-1:Math.min(size-1,+m[2]);
  if(a>=size||a>b)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
  return new Response(blob.slice(a,b+1,'video/mp4'),{status:206,headers:Object.assign(h,{'Content-Length':b-a+1,'Content-Range':'bytes '+a+'-'+b+'/'+size})});
 })());
});
