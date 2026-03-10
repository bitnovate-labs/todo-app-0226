'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import type { OrientationAPI } from '@/lib/orientation';
import { SettingsSection } from './SettingsSection';

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
    <SettingsSection title="Device" icon={<Smartphone className="h-3.5 w-3.5" />}>
      <p className="mb-3 text-sm text-gray-600">
        On Android, tap below to lock rotation (fullscreen may be used). On iOS, rotation cannot be locked.
      </p>
      <button
        type="button"
        onClick={handleLockRotation}
        disabled={status === 'locking'}
        className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-3 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:opacity-70"
      >
        {status === 'idle' && 'Lock to portrait'}
        {status === 'locking' && 'Locking…'}
        {status === 'ok' && 'Locked to portrait'}
        {status === 'unsupported' && 'Not supported on this device'}
        {status === 'error' && 'Could not lock (try again)'}
      </button>
    </SettingsSection>
  );
}
