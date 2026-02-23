'use client';

import { useEffect, useState } from 'react';

function getBottomOffset(): number {
  if (typeof window === 'undefined' || !window.visualViewport) return 0;
  const vv = window.visualViewport;
  const layoutBottom = document.documentElement.clientHeight;
  const visualBottom = vv.offsetTop + vv.height;
  return Math.max(0, layoutBottom - visualBottom);
}

export function BottomNavShell({ children }: { children: React.ReactNode }) {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const update = () => setBottomOffset(getBottomOffset());
    update();
    const vv = window.visualViewport;
    if (!vv) return;
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-40 bg-white"
      style={{ bottom: bottomOffset }}
    >
      {children}
    </div>
  );
}
