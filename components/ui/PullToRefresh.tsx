"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";

const PULL_THRESHOLD = 72;
const RESISTANCE = 2.5;

type Props = {
  children: React.ReactNode;
  onRefresh: () => Promise<unknown>;
  disabled?: boolean;
};

/**
 * Pull-to-refresh for the main list. Only active when scroll is at top.
 * Shows a spinner when pulling; triggers onRefresh on release past threshold.
 */
export function PullToRefresh({ children, onRefresh, disabled }: Props) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const touching = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      if (window.scrollY > 8) return;
      touching.current = true;
      startY.current = e.touches[0].clientY;
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touching.current || disabled) return;
      if (window.scrollY > 8) {
        setPullY(0);
        return;
      }
      const y = e.touches[0].clientY;
      const delta = y - startY.current;
      if (delta <= 0) {
        setPullY(0);
        return;
      }
      const resisted = Math.min(delta / RESISTANCE, PULL_THRESHOLD * 1.5);
      setPullY(resisted);
    },
    [disabled]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;
    const onMove = (e: TouchEvent) => {
      if (!touching.current || e.touches.length === 0) return;
      if (window.scrollY > 8) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 5) e.preventDefault();
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    if (!touching.current) return;
    touching.current = false;
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      Promise.resolve(onRefresh())
        .finally(() => setRefreshing(false));
    }
    setPullY(0);
  }, [pullY, refreshing, onRefresh]);

  const showIndicator = pullY > 0 || refreshing;
  const progress = Math.min(1, pullY / PULL_THRESHOLD);

  return (
    <div
      ref={containerRef}
      className="relative min-h-0 flex-1 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Pull indicator above content */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center transition-opacity duration-150"
        style={{
          height: showIndicator ? 56 : 0,
          opacity: showIndicator ? 1 : 0,
        }}
        aria-hidden
      >
        <div
          className="flex h-14 items-center justify-center text-gray-500"
          style={{ transform: `translateY(${Math.min(pullY, 56) - 56}px)` }}
        >
          {refreshing ? (
            <span className="flex items-center gap-2 text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" aria-hidden />
              Updating…
            </span>
          ) : (
            <span
              className="text-sm text-gray-500 transition-transform"
              style={{
                transform: `scale(${0.6 + 0.4 * progress}) rotate(${(1 - progress) * -180}deg)`,
              }}
            >
              <ChevronDown className="h-5 w-5" />
            </span>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
