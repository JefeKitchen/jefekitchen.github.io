const CACHE_NAME = 'jeffs-kitchen-v13';

const PAGES = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpeg',
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
  if (!PAGE_URLS.has(requestUrl.href)) return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
