// 옛 Gatsby(gatsby-plugin-offline)가 등록해 둔 Service Worker를 제거하기 위한 kill-switch.
// 브라우저가 기존 /sw.js 자리에서 이 파일을 새 버전으로 받으면, 스스로 unregister 하고
// 모든 캐시를 비운 뒤 열려 있는 탭을 새로고침한다. (page-data.json 라우팅 가로채기 중단)
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.unregister();
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
