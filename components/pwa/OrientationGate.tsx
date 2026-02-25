'use client';

import { useEffect, useState } from 'react';

/**
 * On iOS, the manifest "orientation" and Screen Orientation API are ignored.
 * When the device is in landscape, we show a full-screen "rotate to portrait"
 * overlay so the app is effectively portrait-only.
 */
export function OrientationGate({ children }: { children: React.ReactNode }) {
  const [showRotateOverlay, setShowRotateOverlay] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ua = window.navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (!isStandalone || !isIOS) {
      setShowRotateOverlay(false);
      return;
    }

    const query = window.matchMedia('(orientation: landscape)');
    const update = () => setShowRotateOverlay(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

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
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18V6m0 12l-4-4m4 4l4-4"
            />
          </svg>
        </div>
        <p className="max-w-[260px] text-center text-lg font-medium text-gray-900">
          Please rotate your device to portrait to use this app.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
