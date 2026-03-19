/**
 * @file sw.js
 * @description Stale-while-revalidate PWA service worker; offline fallback for UrbanNest.ai.
 * @author BharatERP
 * @created 2026-03-19
 */

const CACHE = "urbannest-v1";
const PRECACHE = ["/", "/search", "/offline.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.url.includes("/graphql") || request.url.includes("/api/")) return;
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const c = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, c));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r ?? caches.match("/offline.html")))
    );
    return;
  }
  if (request.destination === "image" || request.url.includes("/_next/static/")) {
    e.respondWith(
      caches.match(request).then(
        (r) =>
          r ??
          fetch(request).then((res) => {
            const c = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, c));
            return res;
          })
      )
    );
  }
});
