// VibeLink Service Worker
// Strategy:
//   - HTML (navigation requests): network-only, offline.html fallback only on failure.
//     Reason: HTML embeds hashed bundle URLs that change every deploy. Caching HTML
//     causes "blank screen after deploy" because the cached HTML references a JS bundle
//     the server no longer has.
//   - Hashed assets (JS/CSS): cache-first, immutable. The hash in the filename makes
//     each version a different URL, so we never serve a stale one.
//   - Images / icons / fonts: cache-first.
//   - Supabase / API / functions: bypassed entirely (must always hit the network).

const CACHE_NAME = 'vibelink-v3';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

const isApiRequest = (url) =>
  url.origin.includes('supabase') ||
  url.pathname.startsWith('/api') ||
  url.pathname.includes('functions') ||
  url.hostname.includes('google.com') ||
  url.hostname.includes('gstatic.com');

const isHashedAsset = (url) =>
  /\/assets\/.*\-[A-Za-z0-9_]{6,}\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname);

const isStaticAsset = (url) =>
  /\.(?:png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|otf)$/i.test(url.pathname) ||
  url.pathname === '/manifest.json' ||
  url.pathname === '/favicon.ico';

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (isApiRequest(url)) return;

  // HTML / navigation: ALWAYS go to network. Fall back to offline.html only on failure.
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Hashed assets: cache-first, store immutably.
  if (isHashedAsset(url) || isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: try network, no caching.
  event.respondWith(fetch(event.request).catch(() => new Response('Network error', { status: 408 })));
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'VibeLink Event';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/admin'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/admin'));
});
