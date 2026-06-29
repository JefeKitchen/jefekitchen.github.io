const CACHE_NAME = 'jeffs-kitchen-v168';

const PAGES = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon.png',
  './docs/theme.css',
  './docs/menu-card.css',
  './docs/wide-layout.css',
  './docs/wide-pills.js',
  './docs/instruction-content.js?v=19',
  './docs/quantity-scaler.js?v=2',
  './docs/recipe-catalog.js?v=1',
  './docs/recipe-serving-data.js?v=1',
  './docs/firebase-config.js',
  './docs/firebase-state.js?v=4',
  './docs/instruction-renderer.js?v=20',
  './docs/grocery-boom.js',
  './docs/poll/dinner-poll.html',
  './docs/beef-meatballs-buttered-noodles/beef-meatballs-buttered-noodles-menu.html',
  './docs/beef-meatballs-buttered-noodles/grocery-list-beef-meatballs-buttered-noodles.html',
  './docs/beef-meatballs-buttered-noodles/beef-meatballs-buttered-noodles-instructions.html',
  './docs/beef-meatballs-buttered-noodles/beef-meatballs-buttered-noodles-wide.html',
  './docs/chicken-mashed-potato-bowls/chicken-mashed-potato-bowls-menu.html',
  './docs/creamy-orzo-chicken/creamy-orzo-chicken-menu.html',
  './docs/baked-salmon-rice-cucumber/baked-salmon-rice-cucumber-menu.html',
  './docs/baked-salmon-rice-cucumber/grocery-list-baked-salmon-rice-cucumber.html',
  './docs/baked-salmon-rice-cucumber/baked-salmon-rice-cucumber-instructions.html',
  './docs/baked-salmon-rice-cucumber/baked-salmon-rice-cucumber-wide.html',
  './docs/chicken-pot-pie-rice-skillet/chicken-pot-pie-rice-skillet-menu.html',
  './docs/mild-chicken-noodle-bake/mild-chicken-noodle-bake-menu.html',
  './docs/chicken-fried-rice/chicken-fried-rice-wide.html',
  './docs/chicken-fried-rice/chicken-fried-rice-instructions.html',
  './docs/chicken-fried-rice/grocery-list-chicken-fried-rice.html',
  './docs/chicken-fried-rice/chicken-fried-rice-menu.html',
  './docs/mild-chicken-noodle-bake/grocery-list-mild-chicken-noodle-bake.html',
  './docs/mild-chicken-noodle-bake/mild-chicken-noodle-bake-instructions.html',
  './docs/mild-chicken-noodle-bake/mild-chicken-noodle-bake-wide.html',
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
  './docs/beef-onion-smash-bowls/beef-onion-smash-bowls-menu.html',
  './docs/crispy-onion-chicken-bowls/crispy-onion-chicken-bowls-menu.html',
  './docs/beef-broccoli-wok/beef-broccoli-wok-menu.html',
  './docs/beef-broccoli-wok/grocery-list-beef-broccoli-wok.html',
  './docs/beef-broccoli-wok/beef-broccoli-wok-instructions.html',
  './docs/beef-broccoli-wok/beef-broccoli-wok-wide.html',
  './docs/steak-scallion-fried-rice/steak-scallion-fried-rice-menu.html',
  './docs/steak-scallion-fried-rice/grocery-list-steak-scallion-fried-rice.html',
  './docs/steak-scallion-fried-rice/steak-scallion-fried-rice-instructions.html',
  './docs/steak-scallion-fried-rice/steak-scallion-fried-rice-wide.html',
  './docs/oniony-chicken-quesadillas/oniony-chicken-quesadillas-menu.html',
  './docs/korean-beef-scallion-bowls/korean-beef-scallion-bowls-menu.html',
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
  './docs/cuban-sandwiches/cuban-sandwiches-menu.html',
  './docs/cuban-sandwiches/grocery-list-cuban-sandwiches.html',
  './docs/cuban-sandwiches/cuban-sandwiches-instructions.html',
  './docs/cuban-sandwiches/cuban-sandwiches-wide.html',
  './docs/mojo-pork-bowls/mojo-pork-bowls-menu.html',
  './docs/mojo-pork-bowls/grocery-list-mojo-pork-bowls.html',
  './docs/mojo-pork-bowls/mojo-pork-bowls-instructions.html',
  './docs/mojo-pork-bowls/mojo-pork-bowls-wide.html',
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
  './docs/sriracha-salmon-rice-bowls/sriracha-salmon-rice-bowls-menu.html',
  './docs/sriracha-salmon-rice-bowls/grocery-list-sriracha-salmon-rice-bowls.html',
  './docs/sriracha-salmon-rice-bowls/sriracha-salmon-rice-bowls-instructions.html',
  './docs/sriracha-salmon-rice-bowls/sriracha-salmon-rice-bowls-wide.html',
  './docs/savory-roasted-edamame/savory-roasted-edamame-menu.html',
  './docs/savory-roasted-edamame/grocery-list-savory-roasted-edamame.html',
  './docs/savory-roasted-edamame/savory-roasted-edamame-instructions.html',
  './docs/savory-roasted-edamame/savory-roasted-edamame-wide.html',
  './docs/poll/snackie-menus/spicy-honey-pretzel-snack-mix.html',
  './docs/poll/snackie-menus/savory-roasted-edamame.html',
  './docs/poll/snackie-menus/crunchy-ranch-chickpeas.html',
  './docs/poll/snackie-menus/buffalo-ranch-snack-crackers.html',
  './docs/poll/snackie-menus/sesame-soy-trail-mix.html',
  './docs/poll/snackie-menus/chocolate-peanut-butter-protein-bites.html',
];

const PAGE_URLS = new Set(PAGES.map(page => new URL(page, self.registration.scope).href));
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon.png',
  './docs/theme.css',
  './docs/recipe-catalog.js?v=1',
  './docs/recipe-serving-data.js?v=1',
  './docs/quantity-scaler.js?v=2',
  './docs/firebase-config.js',
  './docs/firebase-state.js?v=4',
  './docs/combined-shopping/this-week-shopping-list.html'
];

// Install - cache the app shell and linked pages.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
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

// Fetch - network first for known app pages, cache fallback when offline.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (!PAGE_URLS.has(requestUrl.href)) return;

  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
