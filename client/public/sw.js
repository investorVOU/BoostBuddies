
const CACHE_NAME = 'boostbuddies-v1';
const urlsToCache = [
  '/',
  '/src/index.css',
  '/src/main.tsx',
  '/src/App.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Cache API responses for 5 minutes
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            const cachedTime = new Date(response.headers.get('cached-time'));
            const now = new Date();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (now - cachedTime < fiveMinutes) {
              return response;
            }
          }
          
          return fetch(event.request).then((networkResponse) => {
            const responseClone = networkResponse.clone();
            responseClone.headers.append('cached-time', new Date().toISOString());
            cache.put(event.request, responseClone);
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Cache static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
