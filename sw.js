// Service Worker for RecipeBliss PWA
const CACHE_NAME = 'recipebliss-v1';
const CACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/state.js',
  './js/components/ui.js',
  './js/views/grid.js',
  './js/views/detail.js',
  './js/views/shopping.js',
  './js/utils/scaling.js',
  './js/data/recipeLoader.js',
  './manifest.json'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
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
              console.log('Deleting old cache:', cacheName);
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
            if (!response || response.status !== 200 || response.type === 'error') {
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
            console.log('Fetch failed, serving offline content');
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
