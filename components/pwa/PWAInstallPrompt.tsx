'use client';

import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const viewedTrackedRef = useRef(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      setInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (showPrompt && !viewedTrackedRef.current) {
      viewedTrackedRef.current = true;
      trackEvent({ name: ANALYTICS_EVENTS.PWA_INSTALL_VIEWED });
    }
  }, [showPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      trackEvent({ name: ANALYTICS_EVENTS.PWA_INSTALL_INSTALLED });
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    trackEvent({ name: ANALYTICS_EVENTS.PWA_INSTALL_DISMISSED });
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (installed || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gray-900 text-white p-4 rounded-lg shadow-lg flex flex-col gap-2">
      <p className="text-sm">Install this app for a better experience.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex-1 py-2 px-3 bg-white text-gray-900 text-sm font-medium rounded"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="py-2 px-3 text-sm text-gray-300 hover:text-white"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
