"use client";

import * as React from "react";

/**
 * Removes any previously-installed service worker and clears its caches.
 *
 * Earlier builds shipped an offline-caching SW that could serve a stale JS
 * bundle on mobile after a redeploy, breaking clicks/links. The app now relies
 * on cloud sync (online), so we actively clean up old service workers and let
 * /sw.js (a self-destructing no-op) finish the job for devices still holding it.
 */
export function ServiceWorkerRegistrar() {
  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    // Re-fetch /sw.js so the self-destruct version activates, then unregister.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        reg.update().catch(() => {});
        reg.unregister().catch(() => {});
      });
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
