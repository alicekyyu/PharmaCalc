// Self-destructing service worker.
//
// The previous version cached index.html with a cache-first strategy and a
// fixed cache name, so it pinned a stale index.html that pointed at a deleted
// JS bundle — every deploy showed returning visitors a blank screen. This
// version exists only to undo that: it clears all caches, unregisters itself,
// and reloads open pages onto fresh, network-served content. Browsers re-fetch
// the SW script from the network on navigation, so already-affected devices
// pick this up and self-heal.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});

// No fetch handler: all requests go straight to the network.
