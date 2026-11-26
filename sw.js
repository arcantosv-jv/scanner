const C = 'scanner-v1';
const ASSETS = [
  './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.9.0-release.3/dist/opencv.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  const net = () => fetch(e.request).then(res => {
    const cp = res.clone();
    caches.open(C).then(c => c.put(e.request, cp));
    return res;
  });
  e.respondWith(same
    ? net().catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    : caches.match(e.request).then(r => r || net()));
});
