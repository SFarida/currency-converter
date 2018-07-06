const cacheName = 'cache1';
const filesToCache = [
    '/',
    '/css/main.css',
    '/css/util.css',
    '/images/icons/favicon.ico',
    '/images/bg-01.jpg',
    '/js/app.js',
    '/js/idb.js',
    '/js/convert.js',
    '/index.html'
];
 
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request.url).then(function(response) {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request.url) 
    }).catch(function(error) {

      // Respond with custom offline page

    })
  );
});