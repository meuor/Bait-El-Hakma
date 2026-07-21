const CACHE_NAME = 'bait-el-hakma-v2';
const STATIC_CACHE = 'bait-el-static-v2';

// Install: precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/logo.png',
        '/manifest.json',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first with fast timeout fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET, API calls, and chrome-extension
  if (request.method !== 'GET' || 
      request.url.includes('/api/') ||
      request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetchWithTimeout(request, 5000)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cached) => {
          return cached || caches.match('/index.html');
        });
      })
  );
});

// Fetch with timeout
function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    fetch(request, { signal: controller.signal })
      .then((response) => {
        clearTimeout(id);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}
