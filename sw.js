const CACHE_NAME = 'jeffs-kitchen-v18';

const PAGES = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './docs/theme.css',
  './docs/dinner-poll.html',
  './docs/slider-guide-lineup-a.html',
  './docs/slider-menu.html',
  './docs/slider-prep-order.html',
  './docs/grocery-list.html',
  './docs/honey-mustard-instructions.html',
  './docs/grocery-list-honey-mustard.html',
  './docs/honey-garlic-chicken-instructions.html',
  './docs/grocery-list-honey-garlic.html',
  './docs/meatloaf-instructions.html',
  './docs/grocery-list-meatloaf.html',
  './docs/teriyaki-spread-instructions.html',
  './docs/teriyaki-menu.html',
  './docs/grocery-list-combined-2.html',
  './docs/griddle-initial-seasoning.html',
  './docs/grocery-list-charcoal-chicken.html',
  './docs/charcoal-chicken-instructions.html',
  './docs/grocery-list-grilled-chicken-sandwiches.html',
  './docs/grilled-chicken-sandwiches-instructions.html',
  './docs/grocery-list-chicken-skewers.html',
  './docs/chicken-skewers-instructions.html',
];

const PAGE_URLS = new Set(PAGES.map(page => new URL(page, self.registration.scope).href));

// Install - cache the app shell and linked pages.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PAGES))
  );
  self.skipWaiting();
});

// Activate - clear old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - cache first for known app pages, network otherwise.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.endsWith('/docs/theme.css')) {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  if (!PAGE_URLS.has(requestUrl.href)) return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
