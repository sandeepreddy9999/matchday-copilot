/**
 * public/sw.js
 * Caches the app shell (HTML/CSS/JS bundle) on install so the app still
 * opens on patchy stadium wifi. Deliberately does NOT cache API/proxy
 * requests — live density and copilot answers should always be fresh or
 * fall through to the app's own offline mode, not a stale service-worker
 * cache pretending to be live data.
 */

const CACHE_NAME = 'matchday-copilot-shell-v1';
const SHELL_PATHS = ['/fifa-copilot/', '/fifa-copilot/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_PATHS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache the proxy / API calls — only the static app shell.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
