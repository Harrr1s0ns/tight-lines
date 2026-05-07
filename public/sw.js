const CACHE = 'tight-lines-v4';
const PRECACHE = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;

  // Never intercept POST requests or Netlify function calls — let them go straight to the network
  if (request.method !== 'GET' || request.url.includes('/.netlify/functions/')) {
    return;
  }

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return response;
      })
    )
  );
});
