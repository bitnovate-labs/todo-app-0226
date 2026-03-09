"use client";

import { useCallback, useEffect, useState } from "react";

export type ListFontSize = "small" | "medium" | "large";

const STORAGE_KEY = "list_font_size";

export const LIST_FONT_SIZE_CLASSES: Record<ListFontSize, string> = {
  small: "text-sm",
  medium: "text-[15px]",
  large: "text-base",
};

function load(): ListFontSize {
  if (typeof window === "undefined") return "small";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "small" || v === "medium" || v === "large") return v;
  } catch {
    // ignore
  }
  return "small";
}

function save(value: ListFontSize): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export function useListFontSize(): [ListFontSize, (value: ListFontSize) => void, boolean] {
  const [value, setValueState] = useState<ListFontSize>("small");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setValueState(load());
  }, [mounted]);

  const setValue = useCallback((next: ListFontSize) => {
    setValueState(next);
    save(next);
  }, []);

  return [mounted ? value : "small", setValue, mounted];
}
