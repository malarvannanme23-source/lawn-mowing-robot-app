const CACHE_NAME = 'lawn-mower-pro-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/css/main.css',
    '/js/app.js',
    '/js/service-worker.js',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(function(error) {
                // Non-critical: some assets may not be available yet
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
    var request = event.request;
    
    // Skip cross-origin requests
    if (request.url.indexOf(self.location.origin) === -1) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(function(response) {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise, try to fetch from network
                return fetch(request)
                    .then(function(response) {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        // Clone response for caching
                        var responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(request, responseToCache);
                            });
                        
                        return response;
                    });
            })
            .catch(function(error) {
                // Offline fallback - return cached index.html if available
                if (request.method === 'GET' && request.destination !== 'script' && request.destination !== 'style') {
                    return caches.match('/index.html');
                }
                return null;
            })
    );
});
