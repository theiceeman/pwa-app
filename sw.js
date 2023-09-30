const CACHE_NAME = 'static-cache'
const DYNAMIC_CACHE = 'dynamic-cache-v1'
const assets = [
    '/',
    '/index.html',
    '/js/materialize.min.js',
    '/js/app.js',
    '/js/ui.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'
];

// This code executes in its own worker or thread
self.addEventListener("install", event => {
    console.log("Service worker installed");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
});

self.addEventListener("activate", event => {
    console.log("Service worker activated");
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key))
            )
        })
    )
});

self.addEventListener('fetch', event => {
    // console.log({ event })
    event.respondWith(
        // check if requests matches an asset in cache
        caches.match(event.request).then(
            cacheRes => {
                // return asset in catch, else make request
                return cacheRes || fetch(event.request).then(fetchRes => {
                    // create new cache for dynamic assets
                    return caches.open(DYNAMIC_CACHE).then(cache => {
                        // cache response and dynamic asset
                        cache.put(event.request.url, fetchRes.clone());
                        return fetchRes;
                    })
                })
            }).catch(() => {
                if (event.request.url.indexOf('.html') > -1) {
                    return caches.match('/pages/fallback.html')
                }
            })
    )
})
