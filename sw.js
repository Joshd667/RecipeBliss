// Service Worker for RecipeBliss PWA
const CACHE_NAME = 'recipebliss-v2';
const CACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/state.js',
  './js/db.js',
  './js/components/ui.js',
  './js/views/grid.js',
  './js/views/detail.js',
  './js/views/shopping.js',
  './js/views/add.js',
  './js/utils/scaling.js',
  './js/utils/sharing.js',
  './js/utils/filters.js',
  './js/utils/helpers.js',
  './js/data/recipeLoader.js',
  './manifest.json',
  './recipes/index.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.ico',
  'https://unpkg.com/dexie@3.2.7/dist/dexie.js'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy for static assets, network-first for navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-first strategy for navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request)
            .then((response) => {
              return response || caches.match('./index.html');
            });
        })
    );
    return;
  }

  // Cache-first strategy for all other requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone and cache the response for future use
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // Return offline fallback for failed requests
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
