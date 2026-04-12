const CACHE = 'lezheng-dashboard-v3';
const ASSETS = [
  '/lezheng-dashboard/',
  '/lezheng-dashboard/index.html',
  '/lezheng-dashboard/positions.html',
  '/lezheng-dashboard/data.html',
  '/lezheng-dashboard/dreams.html',
  '/lezheng-dashboard/logs.html',
  '/lezheng-dashboard/weather.html',
  '/lezheng-dashboard/maimemo.html',
  '/lezheng-dashboard/daily-tip.json',
  '/lezheng-dashboard/style.css',
  '/lezheng-dashboard/manifest.json',
  '/lezheng-dashboard/icon-192.png',
  '/lezheng-dashboard/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install: cache core assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch: cache-first for local assets, network-first for API
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Skip non-GET
  if (e.request.method !== 'GET') return;

  // Network-first for weather API (always try live)
  if (url.hostname === 'open.maimemo.com' || url.hostname === 'api.open-meteo.com' || url.hostname === 'nominatim.openstreetmap.org') {
    e.respondWith(
      fetch(e.request).catch(function() { return caches.match(e.request); })
    );
    return;
  }

  // Cache-first for local assets
  if (url.hostname === location.hostname || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      caches.match(e.request).then(function(r) {
        return r || fetch(e.request).then(function(resp) {
          if (resp.ok) {
            var clone = resp.clone();
            caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
          }
          return resp;
        });
      })
    );
    return;
  }

  // Default: network
  e.respondWith(fetch(e.request));
});
