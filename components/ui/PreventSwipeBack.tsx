"use client";

import { useEffect } from "react";

/** Left-edge width (px) that triggers the "swipe back" gesture - we block rightward swipes that start here */
const LEFT_EDGE_THRESHOLD = 30;

/**
 * Prevents the browser's swipe-from-left-edge "back" gesture on mobile/PWA
 * by capturing touch events and calling preventDefault when the user swipes
 * right from the left edge.
 */
export function PreventSwipeBack() {
  useEffect(() => {
    let startX = 0;
    let blocking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      if (x <= LEFT_EDGE_THRESHOLD) {
        blocking = true;
        startX = x;
      } else {
        blocking = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!blocking || e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      // Swiping right from left edge -> prevent back gesture
      if (currentX > startX) {
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      blocking = false;
    };

    const onTouchCancel = () => {
      blocking = false;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove, { capture: true });
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  return null;
}
