const CACHE_NAME = 'jeffs-kitchen-v2';

const PAGES = [
  './index.html',
  './docs/slider-guide-lineup-a.html',
  './docs/slider-menu.html',
  './docs/slider-prep-order.html',
  './docs/grocery-list.html',
  './docs/honey-mustard-instructions.html',
  './docs/honey-mustard-instructions-laptop.html',
  './docs/grocery-list-honey-mustard.html',
  './docs/honey-garlic-chicken-instructions.html',
  './docs/honey-garlic-ipad.html',
  './docs/grocery-list-honey-garlic.html',
  './docs/jalapeno-gruyere-chicken.html',
  './docs/grocery-list-jalapeno-gruyere.html',
  './docs/meatloaf-instructions.html',
  './docs/grocery-list-meatloaf.html',
  './docs/teriyaki-spread-instructions.html',
  './docs/teriyaki-menu.html',
  './docs/grocery-list-combined-2.html',
  './docs/sarah-menu.html',
  './docs/sarah-grilled-cheese.html',
  './docs/sarah-mac-and-cheese.html',
  './docs/sarah-full-menu-instructions.html',
  './docs/griddle-initial-seasoning.html',
  './docs/griddle-reseasoning.html',
  './docs/dinner-menu.html',
];

// Install — cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PAGES))
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
