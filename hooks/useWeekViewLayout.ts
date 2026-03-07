"use client";

import { useCallback, useEffect, useState } from "react";

export type WeekViewLayout = "vertical" | "horizontal";

const STORAGE_KEY = "week_view_layout";

function load(): WeekViewLayout {
  if (typeof window === "undefined") return "vertical";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "vertical" || v === "horizontal") return v;
  } catch {
    // ignore
  }
  return "vertical";
}

function save(value: WeekViewLayout): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export function useWeekViewLayout(): [WeekViewLayout, (value: WeekViewLayout) => void, boolean] {
  const [value, setValueState] = useState<WeekViewLayout>("vertical");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setValueState(load());
  }, [mounted]);

  const setValue = useCallback((next: WeekViewLayout) => {
    setValueState(next);
    save(next);
  }, []);

  return [mounted ? value : "vertical", setValue, mounted];
}
