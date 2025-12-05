const CACHE_NAME = 'zenox-central-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/store.js',
    './js/modules/auth.js',
    './js/modules/dashboard.js',
    './js/modules/expenses.js',
    './js/modules/trades.js',
    './js/modules/habits.js',
    './js/modules/notes.js',
    './js/modules/equity.js',
    './js/modules/checklist.js',
    './js/modules/strategies.js',
    './assets/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
