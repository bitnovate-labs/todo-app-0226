// Minimal service worker: cache app shell for offline and start URL for instant splash.
const CACHE_NAME = 'todo-pwa-v2';
const SHELL_URLS = ['/sign-in', '/sign-up', '/profile', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS).catch(() => {}))
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

  const url = new URL(request.url);
  const isStartUrl = url.pathname === '/' || url.pathname === '';

  if (isStartUrl) {
    // Start URL: network-first so we always get correct auth state (logged-in vs welcome).
    // Cache-first would serve stale "/" (e.g. welcome page cached at install) after login.
    // Fallback to cache only when offline.
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match('/sign-in'))
        )
    );
    return;
  }

  // Other navigations: network-first, fallback to cache when offline.
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((res) => res || caches.match('/sign-in'))
    )
  );
});
