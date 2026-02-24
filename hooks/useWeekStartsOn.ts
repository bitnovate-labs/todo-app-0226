"use client";

import { useCallback, useEffect, useState } from "react";

export type WeekStartsOn = "sunday" | "monday";

const STORAGE_KEY = "week_starts_on";

function load(): WeekStartsOn {
  if (typeof window === "undefined") return "sunday";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "sunday" || v === "monday") return v;
  } catch {
    // ignore
  }
  return "sunday";
}

function save(value: WeekStartsOn): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export function useWeekStartsOn(): [WeekStartsOn, (value: WeekStartsOn) => void, boolean] {
  const [value, setValueState] = useState<WeekStartsOn>("sunday");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setValueState(load());
  }, [mounted]);

  const setValue = useCallback((next: WeekStartsOn) => {
    setValueState(next);
    save(next);
  }, []);

  return [mounted ? value : "sunday", setValue, mounted];
}
