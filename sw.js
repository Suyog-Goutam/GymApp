const CACHE_NAME = 'dammigym-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/animations.css',
  './js/crypto.js',
  './js/utils.js',
  './js/ui.js',
  './js/storage.js',
  './js/exercises.js',
  './js/auth.js',
  './js/profile.js',
  './js/dashboard.js',
  './js/workout.js',
  './js/nutrition.js',
  './js/hydration.js',
  './js/weight.js',
  './js/progress.js',
  './js/admin.js',
  './js/app.js',
  './gymlogo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // Fallback logic could go here if offline
        });
      })
  );
});
