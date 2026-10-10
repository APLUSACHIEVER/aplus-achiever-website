const CACHE_NAME = "psle-vocabulary-app-v1";
const APP_SHELL = [
  "https://aplusachiever.github.io/aplus-achiever-website/king-of-psle-vocabulary.html",
  "https://aplusachiever.github.io/aplus-achiever-website/data/vocabulary.js",
  "https://aplusachiever.github.io/aplus-achiever-website/king-of-psle-vocabulary-icon.svg",
  "https://aplusachiever.github.io/aplus-achiever-website/king-of-psle-vocabulary.webmanifest"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.href.startsWith("https://aplusachiever.github.io/aplus-achiever-website/") &&
      (url.pathname.endsWith("/king-of-psle-vocabulary.html") || url.pathname.endsWith("/data/vocabulary.js") || url.pathname.endsWith("/king-of-psle-vocabulary-icon.svg") || url.pathname.endsWith("/king-of-psle-vocabulary.webmanifest"))) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.ok) { const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)); }
      return response;
    }).catch(() => caches.match("https://aplusachiever.github.io/aplus-achiever-website/king-of-psle-vocabulary.html"))));
  }
});