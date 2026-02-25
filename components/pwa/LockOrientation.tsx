'use client';

import { useEffect } from 'react';

/**
 * Locks screen orientation to portrait when the app is running as a PWA
 * (standalone display mode). Helps prevent rotation on Android; iOS ignores
 * the Screen Orientation API but respects manifest orientation.
 */
export function LockOrientation() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;
    const orientation = screen.orientation;
    if (orientation?.lock) {
      orientation.lock('portrait').catch(() => {});
    }
  }, []);
  return null;
}
