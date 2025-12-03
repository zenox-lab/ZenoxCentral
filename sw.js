const CACHE_NAME = 'zenox-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/store.js',
    './js/firebase-config.js',
    './js/modules/auth.js',
    './js/modules/dashboard.js',
    './js/modules/trades.js',
    './js/modules/equity.js',
    './js/modules/analysis.js',
    './js/modules/expenses.js',
    './js/modules/habits.js',
    './js/modules/notes.js',
    './js/modules/strategies.js',
    './js/modules/checklist.js',
    './js/modules/wallet.js',
    './js/data/marketData.js',
    './assets/icon.svg',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests like Firebase or Google Fonts if needed, 
    // but for now we try to cache everything we can or fallback to network.
    // For API calls (Firebase), we usually want Network First or Network Only.

    if (event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('googleapis.com/auth')) {
        return; // Let Firebase handle its own persistence
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
