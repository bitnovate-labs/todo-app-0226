'use client';

import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

const PWA_PROMPT_SEEN_KEY = 'pwa-install-prompt-seen';

function hasSeenInstallPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PWA_PROMPT_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markInstallPromptSeen(): void {
  try {
    localStorage.setItem(PWA_PROMPT_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
  return isIOS && isSafari;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [installed, setInstalled] = useState(false);
  const viewedTrackedRef = useRef(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    if (hasSeenInstallPrompt()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Fallback: show install UI after a short delay if browser never fires beforeinstallprompt (e.g. Safari)
    const fallbackTimer = window.setTimeout(() => {
      if (!isStandalone() && !hasSeenInstallPrompt()) setShowFallback(true);
    }, 2500);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    const visible = showPrompt || showFallback;
    if (visible && !viewedTrackedRef.current) {
      viewedTrackedRef.current = true;
      trackEvent({ name: ANALYTICS_EVENTS.PWA_INSTALL_VIEWED });
    }
  }, [showPrompt, showFallback]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      markInstallPromptSeen();
      trackEvent({ name: ANALYTICS_EVENTS.PWA_INSTALL_INSTALLED });
    }
    setShowPrompt(false);
    setShowFallback(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    markInstallPromptSeen();
    trackEvent({ name: ANALYTICS_EVENTS.PWA_INSTALL_DISMISSED });
    setShowPrompt(false);
    setShowFallback(false);
    setDeferredPrompt(null);
  };

  if (installed) return null;

  const visible = showPrompt || showFallback;
  const hasNativePrompt = !!deferredPrompt;
  const iosSafari = isIOSSafari();

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm bg-gray-900 text-white p-4 rounded-lg shadow-lg flex flex-col gap-2">
      {hasNativePrompt ? (
        <p className="text-sm">Install this app for a better experience.</p>
      ) : iosSafari ? (
        <p className="text-sm">
          Add to Home Screen: tap the Share button, then &quot;Add to Home Screen&quot;.
        </p>
      ) : (
        <p className="text-sm">
          Install this app from your browser menu (e.g. ⋮ or ⋯ → Install / Add to Home Screen).
        </p>
      )}
      <div className="flex gap-2">
        {hasNativePrompt ? (
          <>
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
          </>
        ) : (
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 bg-white text-gray-900 text-sm font-medium rounded"
          >
            Got it
          </button>
        )}
      </div>
    </div>
  );
}
