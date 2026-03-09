'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import type { OrientationAPI } from '@/lib/orientation';

/**
 * When in landscape in the PWA:
 * - iOS: manifest/orientation API are ignored; show "rotate to portrait" (user must rotate).
 * - Android: show overlay with a "Lock rotation" button that enters fullscreen + locks to portrait.
 */
export function OrientationGate({ children }: { children: React.ReactNode }) {
  const [showRotateOverlay, setShowRotateOverlay] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ua = window.navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsStandalone(standalone);
    setIsIOS(ios);

    if (!standalone) {
      setShowRotateOverlay(false);
      return;
    }

    const query = window.matchMedia('(orientation: landscape)');
    const update = () => setShowRotateOverlay(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const handleLockRotation = async () => {
    const doc = document.documentElement as Element & { requestFullscreen?(): Promise<void> };
    const orientation = screen.orientation as OrientationAPI | undefined;
    try {
      if (doc.requestFullscreen) await doc.requestFullscreen().catch(() => {});
      if (orientation?.lock) {
        await orientation.lock('portrait').catch(() => orientation.lock?.('portrait-primary'));
      }
      setShowRotateOverlay(false);
    } catch {
      setShowRotateOverlay(window.matchMedia('(orientation: landscape)').matches);
    }
  };

  const canLock = isStandalone && !isIOS && typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as OrientationAPI)?.lock;

  if (showRotateOverlay) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-gray-50 px-6"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
        role="alert"
        aria-live="polite"
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"
          aria-hidden
        >
          <Smartphone className="h-10 w-10" aria-hidden />
        </div>
        <p className="max-w-[280px] text-center text-lg font-medium text-gray-900">
          {isIOS
            ? "This app is portrait only. Rotate your device back to portrait to continue."
            : "Please rotate your device to portrait to use this app."}
        </p>
        {canLock && (
          <button
            type="button"
            onClick={handleLockRotation}
            className="rounded-xl bg-blue-600 px-5 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Lock rotation to portrait
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
