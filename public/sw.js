/* Self-destructing service worker.
 *
 * Earlier versions cached the app shell for offline use, but on mobile that
 * could serve a stale JavaScript bundle after a redeploy — which made buttons
 * and links stop responding (handlers attached to outdated code). Since the app
 * now relies on cloud sync (online), we remove the service worker entirely.
 *
 * The browser automatically checks /sw.js on navigation; this version takes
 * over, wipes all caches, unregisters itself, and reloads open tabs with fresh
 * content. After that, no service worker controls the app.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch {
        /* ignore */
      }
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
