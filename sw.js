// Bump CACHE_VERSION on every deploy that changes a precached asset.
const CACHE_VERSION = 'v11';
const CACHE_NAME = `ahmed-elngar-${CACHE_VERSION}`;
const OFFLINE_URL = '/index.html';

// App shell. Keep this list to paths that are certain to exist — addAll()
// rejects the whole install if a single entry 404s.
const ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/assets/themes/midnight/theme.css',
  '/assets/js/script.js',
  '/assets/favicon.svg',
  '/assets/contact-qr.png',
  '/assets/contact.vcf'
];

// Storage can be unavailable or fail outright (private mode, evicted quota,
// locked-down browsers). Every cache interaction below degrades to the network
// rather than rejecting, so a broken CacheStorage can never break the page.
function safeCacheMatch(request) {
  return Promise.resolve()
    .then(() => caches.match(request))
    .catch(() => undefined);
}

function safeCachePut(request, response) {
  return caches
    .open(CACHE_NAME)
    .then((cache) => cache.put(request, response))
    .catch(() => {});
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => {})
      // Take over as soon as the new worker is ready rather than waiting for
      // every old tab to close.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('ahmed-elngar-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .catch(() => {})
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch non-GET, and let cross-origin requests (fonts, CDN, analytics)
  // go straight to the network so they keep their own caching semantics.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // HTML: network-first, so a fresh deploy is picked up on the next visit.
  // Falls back to the cached shell when offline.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          safeCachePut(request, response.clone());
          return response;
        })
        .catch(() =>
          safeCacheMatch(request)
            .then((cached) => cached || safeCacheMatch(OFFLINE_URL))
            .then((res) => res || Response.error())
        )
    );
    return;
  }

  // Static assets: cache-first, but revalidate in the background so the next
  // load gets the updated file even without a version bump.
  event.respondWith(
    safeCacheMatch(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            safeCachePut(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
