"use client";

import { useEffect } from "react";
import { APP_CONTENT_READY } from "./SplashScreen";

/**
 * Dispatches app-content-ready when mounted so the splash can hide.
 * Place once inside the main content tree (after auth/data is ready).
 */
export function AppContentReadyNotifier() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(APP_CONTENT_READY));
  }, []);
  return null;
}
