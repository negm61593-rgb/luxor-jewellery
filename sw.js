// LUXOR JEWELLERY Service Worker — High-Performance PWA Cache
const CACHE_NAME = 'luxor-v5';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'config.js',
  'avatar.webp',
  'avatar.jpg',
  'favicon.svg',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'gold-prices.json',
  'qr-codes/LUXOR_JEWELLERY_QR.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate for static assets; Network-First with offline fallback for HTML & Live APIs
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isLiveOrNav = url.pathname.includes('/api/') || event.request.mode === 'navigate';

  if (isLiveOrNav) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match('./').then(res => res || caches.match('index.html'));
            }
            return new Response(JSON.stringify({ success: false, error: 'Offline' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, WebP, JPG, SVG, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network offline
      });

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetchPromise.then(res => res || caches.match(event.request));
    })
  );
});
