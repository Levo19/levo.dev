// Levo.dev — Service Worker
// La versión va atada al cache: bumpear → fuerza redescarga y "nueva versión" en frontend.
const VERSION = '1.2.0';
const CACHE = 'levo-dev-v' + VERSION;
const ASSETS = ['./', './index.html', './cv.html', './manifest.json', './version.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  // NO llamamos skipWaiting aquí — esperamos a que el usuario decida
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Permite al frontend pedir activación inmediata
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Nunca cachear backend (GAS) ni Claude API
  if (url.hostname.includes('script.google.com') || url.hostname.includes('anthropic.com')) return;
  // version.json siempre fresco (para detectar updates)
  if (url.pathname.endsWith('/version.json')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Resto: cache-first con actualización en background
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (resp.ok && e.request.method === 'GET') {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
    }
    return resp;
  })).catch(() => caches.match('./index.html')));
});
