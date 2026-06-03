const CACHE_NAME = 'jeffs-kitchen-v119';

const PAGES = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './docs/theme.css',
  './docs/menu-card.css',
  './docs/wide-layout.css',
  './docs/wide-pills.js',
  './docs/instruction-content.js?v=8',
  './docs/instruction-renderer.js?v=10',
  './docs/grocery-boom.js',
  './docs/poll/dinner-poll.html',
  './docs/smash-sliders/slider-guide-lineup-a.html',
  './docs/smash-sliders/slider-menu.html',
  './docs/smash-sliders/slider-prep-order.html',
  './docs/smash-sliders/slider-wide.html',
  './docs/smash-sliders/grocery-list.html',
  './docs/honey-mustard/honey-mustard-instructions.html',
  './docs/honey-mustard/honey-mustard-wide.html',
  './docs/honey-mustard/honey-mustard-menu.html',
  './docs/honey-mustard/grocery-list-honey-mustard.html',
  './docs/honey-garlic/honey-garlic-chicken-instructions.html',
  './docs/honey-garlic/honey-garlic-chicken-wide.html',
  './docs/honey-garlic/honey-garlic-menu.html',
  './docs/honey-garlic/grocery-list-honey-garlic.html',
  './docs/one-pan-lemon-chicken/one-pan-lemon-chicken-menu.html',
  './docs/garlic-butter-shrimp-skillet/garlic-butter-shrimp-skillet-menu.html',
  './docs/beef-onion-smash-skillet/beef-onion-smash-skillet-menu.html',
  './docs/sausage-pepper-skillet/sausage-pepper-skillet-menu.html',
  './docs/sheet-pan-salmon/sheet-pan-salmon-menu.html',
  './docs/meatloaf/meatloaf-instructions.html',
  './docs/meatloaf/meatloaf-wide.html',
  './docs/meatloaf/meatloaf-menu.html',
  './docs/meatloaf/grocery-list-meatloaf.html',
  './docs/teriyaki/teriyaki-spread-instructions.html',
  './docs/teriyaki/teriyaki-wide.html',
  './docs/teriyaki/teriyaki-menu.html',
  './docs/teriyaki/grocery-list-combined-2.html',
  './docs/seasoning/griddle-initial-seasoning.html',
  './docs/charcoal-basics/charcoal-shopping-list.html',
  './docs/charcoal-basics/charcoal-lighting-instructions.html',
  './docs/overnight-oats/grocery-list-overnight-oats.html',
  './docs/overnight-oats/overnight-oats-instructions.html',
  './docs/overnight-oats/overnight-oats-wide.html',
  './docs/overnight-oats/overnight-oats-menu.html',
  './docs/buffalo-chickpea-dip/grocery-list-buffalo-chickpea-dip.html',
  './docs/buffalo-chickpea-dip/buffalo-chickpea-dip-instructions.html',
  './docs/buffalo-chickpea-dip/buffalo-chickpea-dip-wide.html',
  './docs/buffalo-chickpea-dip/buffalo-chickpea-dip-menu.html',
  './docs/combined-shopping/this-week-shopping-list.html',
  './docs/carnitas-elote-bowls/grocery-list-carnitas-elote-bowls.html',
  './docs/carnitas-elote-bowls/carnitas-elote-bowls-menu.html',
  './docs/carnitas-elote-bowls/carnitas-elote-bowls-instructions.html',
  './docs/carnitas-elote-bowls/carnitas-elote-bowls-wide.html',
  './docs/garlic-shrimp-rice-bowls/grocery-list-garlic-shrimp-rice-bowls.html',
  './docs/garlic-shrimp-rice-bowls/garlic-shrimp-rice-bowls-menu.html',
  './docs/garlic-shrimp-rice-bowls/garlic-shrimp-rice-bowls-instructions.html',
  './docs/garlic-shrimp-rice-bowls/garlic-shrimp-rice-bowls-wide.html',
  './docs/crispy-shrimp-tacos/grocery-list-crispy-shrimp-tacos.html',
  './docs/crispy-shrimp-tacos/crispy-shrimp-tacos-menu.html',
  './docs/crispy-shrimp-tacos/crispy-shrimp-tacos-instructions.html',
  './docs/crispy-shrimp-tacos/crispy-shrimp-tacos-wide.html',
  './docs/charcoal-chicken/grocery-list-charcoal-chicken.html',
  './docs/charcoal-chicken/charcoal-chicken-instructions.html',
  './docs/grilled-chicken-sandwiches/grocery-list-grilled-chicken-sandwiches.html',
  './docs/grilled-chicken-sandwiches/grilled-chicken-sandwiches-instructions.html',
  './docs/chicken-skewers/grocery-list-chicken-skewers.html',
  './docs/chicken-skewers/chicken-skewers-menu.html',
  './docs/chicken-skewers/chicken-skewers-instructions.html',
  './docs/chicken-skewers/chicken-skewers-wide.html',
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
