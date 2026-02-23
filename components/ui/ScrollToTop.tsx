'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Scrolls to top on mount, on route change, and on load (e.g. refresh).
 * Useful for mobile PWA where scroll position can be preserved incorrectly.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  useEffect(() => {
    if (document.readyState === 'complete') {
      scrollToTop();
    } else {
      const onLoad = () => scrollToTop();
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return null;
}
