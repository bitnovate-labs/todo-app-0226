'use client';

import { useEffect, useRef } from 'react';
import type { OrientationAPI } from '@/lib/orientation';

/**
 * Locks screen orientation to portrait when the app is running as a PWA
 * (standalone). Re-applies lock when the app becomes visible or orientation
 * changes (Android only). iOS does not support the Screen Orientation API
 * and ignores manifest orientation.
 */
export function LockOrientation() {
  const lockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;

    const orientation = screen.orientation as OrientationAPI | undefined;
    if (!orientation?.lock) return;
    const orientationLock = orientation;

    function lockPortrait() {
      if (lockedRef.current) return;
      const modes: ('portrait' | 'portrait-primary')[] = ['portrait', 'portrait-primary'];
      const tryLock = (i: number) => {
        if (i >= modes.length) return;
        orientationLock
          .lock!(modes[i])
          .then(() => {
            lockedRef.current = true;
          })
          .catch(() => {
            tryLock(i + 1);
          });
      };
      tryLock(0);
    }

    lockPortrait();

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      lockedRef.current = false;
      setTimeout(lockPortrait, 50);
    };

    const onOrientationChange = () => {
      const type = (screen.orientation as OrientationAPI)?.type ?? '';
      if (type.startsWith('portrait')) {
        lockedRef.current = false;
        setTimeout(lockPortrait, 50);
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('orientationchange', onOrientationChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, []);

  return null;
}
