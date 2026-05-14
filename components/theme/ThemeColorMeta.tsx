"use client";

import { useEffect } from "react";
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/lib/theme";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Syncs `theme-color` with resolved light/dark (class on `html` may differ from system).
 */
export function ThemeColorMeta() {
  const { resolved } = useTheme();

  useEffect(() => {
    const content =
      resolved === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
    let meta = document.querySelector('meta[name="theme-color"][data-app]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      meta.setAttribute("data-app", "1");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }, [resolved]);

  return null;
}
