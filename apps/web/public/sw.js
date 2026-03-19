const CACHE_NAME = "urbannest-v1";
const STATIC_ASSETS = ["/", "/search", "/offline.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Network-first for API/GraphQL
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/graphql")) {
    e.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "offline" }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Cache-first for static assets
  if (request.destination === "image" || url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(request).then((cached) =>
        cached ??
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // Network-first for pages, fallback to offline
  e.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((cached) => cached ?? caches.match("/offline.html"))
    )
  );
});
