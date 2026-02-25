'use client';

import { useState, useEffect } from 'react';
import type { OrientationAPI } from '@/lib/orientation';

export function LockRotationSetting() {
  const [status, setStatus] = useState<'idle' | 'locking' | 'ok' | 'unsupported' | 'error'>('idle');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }, []);

  async function handleLockRotation() {
    if (typeof document === 'undefined' || typeof screen === 'undefined') return;
    const orientation = screen.orientation as OrientationAPI | undefined;
    if (!orientation?.lock) {
      setStatus('unsupported');
      return;
    }
    setStatus('locking');
    try {
      const doc = document.documentElement as Element & { requestFullscreen?(): Promise<void> };
      if (doc.requestFullscreen) {
        await doc.requestFullscreen().catch(() => {});
      }
      await orientation.lock('portrait');
      setStatus('ok');
    } catch {
      try {
        await orientation.lock?.('portrait-primary');
        setStatus('ok');
      } catch {
        setStatus('error');
      }
    }
  }

  if (!isStandalone) return null;

  return (
    <div className="border-t border-gray-200 pt-6 text-left">
      <p className="mb-3 text-sm font-medium text-gray-700">Screen rotation</p>
      <p className="mb-3 text-xs text-gray-500">
        On Android, tap below to lock rotation (fullscreen may be used). On iOS, rotation cannot be locked; rotate back to portrait when the message appears.
      </p>
      <button
        type="button"
        onClick={handleLockRotation}
        disabled={status === 'locking'}
        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-70"
      >
        {status === 'idle' && 'Lock to portrait'}
        {status === 'locking' && 'Locking…'}
        {status === 'ok' && 'Locked to portrait'}
        {status === 'unsupported' && 'Not supported on this device'}
        {status === 'error' && 'Could not lock (try again)'}
      </button>
    </div>
  );
}
