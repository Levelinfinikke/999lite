// 999lite: 미리 받아 둔 영상을 저장소(Cache Storage)에서 꺼내 줌. 영상 탐색에 필요한 부분 요청(Range)도 처리
const CN='g999lite-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(u.origin!==location.origin||!/\/videos\/[^/]+\.mp4$/.test(u.pathname))return;
 e.respondWith((async()=>{
  const c=await caches.open(CN),hit=await c.match(u.origin+u.pathname);
  if(!hit)return fetch(e.request);
  const blob=await hit.blob(),size=blob.size,h={'Content-Type':'video/mp4','Accept-Ranges':'bytes','Cache-Control':'no-store'};
  if(e.request.method==='HEAD')return new Response(null,{status:200,headers:Object.assign(h,{'Content-Length':size})});
  const m=/bytes=(\d*)-(\d*)/.exec(e.request.headers.get('range')||'');
  if(!m)return new Response(blob,{status:200,headers:Object.assign(h,{'Content-Length':size})});
  let a=m[1]===''?Math.max(0,size-(+m[2]||0)):+m[1],b=m[1]===''||m[2]===''?size-1:Math.min(size-1,+m[2]);
  if(a>=size||a>b)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
  return new Response(blob.slice(a,b+1,'video/mp4'),{status:206,headers:Object.assign(h,{'Content-Length':b-a+1,'Content-Range':'bytes '+a+'-'+b+'/'+size})});
 })());
});
