// Levo.dev — Service Worker v1.0.0
const CACHE = 'levo-dev-v1.0.0';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // GAS / Claude API: network first (no cache)
  if (url.hostname.includes('script.google.com') || url.hostname.includes('anthropic.com')) return;
  // Resto: cache first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    if (resp.ok && e.request.method === 'GET') {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
    }
    return resp;
  })).catch(() => caches.match('./index.html')));
});
