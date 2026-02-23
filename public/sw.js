// Minimal service worker: cache app shell for offline.
const CACHE_NAME = 'todo-pwa-v1';
// Don't pre-cache '/' so the server always decides welcome vs home; cache other shells for offline.
const SHELL_URLS = ['/sign-in', '/sign-up', '/profile', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode !== 'navigate') return;
  // Network-first for page navigations: server decides welcome vs home from cookies.
  // Only fall back to cache when offline (e.g. cached /sign-in as offline shell).
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((res) => res || caches.match('/sign-in'))
    )
  );
});
