'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker and checks for updates whenever the user opens the app
 * (page load or tab/window becomes visible), so the PWA always runs the latest version.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const checkForUpdates = () => {
      registration?.update().catch(() => {});
    };

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registration = reg;
        if (reg.installing) return;
        reg.update();
      })
      .catch(() => {});

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdates();
    });
    window.addEventListener('focus', checkForUpdates);

    return () => {
      window.removeEventListener('focus', checkForUpdates);
      document.removeEventListener('visibilitychange', checkForUpdates);
    };
  }, []);
  return null;
}
