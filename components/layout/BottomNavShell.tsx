'use client';

import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders the tab bar fixed to the viewport. After mount, portals to `document.body`
 * so `backdrop-filter` / `transform` on in-app ancestors (e.g. habit cards) cannot
 * pin `position: fixed` to the wrong scroll container on mobile WebKit.
 */
export function BottomNavShell({ children }: { children: React.ReactNode }) {
  const [portaled, setPortaled] = useState(false);

  useLayoutEffect(() => {
    setPortaled(true);
  }, []);

  const shell = (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bottom-nav-fixed">
      <div className="w-full max-w-[430px] bg-surface backdrop-blur-md backdrop-saturate-150">
        {children}
      </div>
    </div>
  );

  if (portaled && typeof document !== 'undefined' && document.body) {
    return createPortal(shell, document.body);
  }

  return shell;
}
