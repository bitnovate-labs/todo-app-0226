"use client";

import { useEffect, useRef } from "react";

const SPLASH_MIN_MS = 400;
const SPLASH_MAX_MS = 2000;
const FADE_OUT_MS = 250;
const CONTENT_READY_DELAY_MS = 80;

/** Dispatch from client when main content has mounted so splash can hide sooner. */
export const APP_CONTENT_READY = "app-content-ready";

/**
 * Hides the static splash after a short minimum (so it doesn't flash) or when
 * main content signals ready, whichever is later. Max display time avoids hanging.
 */
export function SplashHideTrigger() {
  const hideScheduled = useRef(false);

  useEffect(() => {
    const splash = document.getElementById("app-splash");
    if (!splash) return;

    const hide = () => {
      if (hideScheduled.current) return;
      hideScheduled.current = true;
      splash.classList.add("splash-fade-out");
      setTimeout(() => splash.remove(), FADE_OUT_MS);
    };

    const minTimer = setTimeout(hide, SPLASH_MIN_MS);
    const maxTimer = setTimeout(hide, SPLASH_MAX_MS);

    const onContentReady = () => {
      setTimeout(hide, CONTENT_READY_DELAY_MS);
    };
    window.addEventListener(APP_CONTENT_READY, onContentReady);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      window.removeEventListener(APP_CONTENT_READY, onContentReady);
    };
  }, []);

  return null;
}
