/**
 * Minimal service worker for PWA installability.
 * Does NOT cache /api or private data — network-only pass-through.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api") || event.request.method !== "GET") {
    return;
  }
  event.respondWith(fetch(event.request));
});
