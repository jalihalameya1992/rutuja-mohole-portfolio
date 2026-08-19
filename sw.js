// Rutuja Mohole — Portfolio service worker
// Bump this on every deploy that changes cached files, so old clients update.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `rm-portfolio-${CACHE_VERSION}`;

// App shell: small, essential files needed to render every page's chrome.
// Media (images/video) is NOT precached here — it's large, and is instead
// cached lazily the first time each file is actually viewed (below).
const APP_SHELL = [
  '/index.html',
  '/work.html',
  '/about.html',
  '/contact.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png',
  '/icons/favicon-48.png',
  '/work/saffola-millets.html',
  '/work/epigamia-milkshakes.html',
  '/work/wickedgud.html',
  '/work/mother-dairy-beverages.html',
  '/work/himalaya-sheet-masks.html',
  '/work/sunfeast-marie.html',
  '/work/reliance-smart-bazaar.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let Google Fonts etc. pass through untouched

  // HTML navigations: network-first, so edits show up immediately when online,
  // falling back to the cached copy (or the cached homepage) when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Everything else same-origin (css/js/icons/media/CV): cache-first,
  // then fill the cache in the background for next time.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
