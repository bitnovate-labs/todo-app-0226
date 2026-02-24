"use client";

import { useEffect } from "react";

const SPLASH_MIN_MS = 500;
const FADE_OUT_MS = 250;

/**
 * Hides the static splash screen after the app has mounted and a short delay.
 * The splash markup is in the root layout so it appears on first paint.
 */
export function SplashHideTrigger() {
  useEffect(() => {
    const splash = document.getElementById("app-splash");
    if (!splash) return;

    const hide = () => {
      splash.classList.add("splash-fade-out");
      setTimeout(() => splash.remove(), FADE_OUT_MS);
    };

    const t = setTimeout(hide, SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  return null;
}
