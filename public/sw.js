// Minimal service worker. Its only real job is to exist and handle fetch
// events — Chrome on Android requires this before it will offer "Install app"
// / "Add to Home screen" for a PWA. Deliberately does no caching for now, so
// it can't ever serve stale content; it just passes every request straight
// through to the network.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
