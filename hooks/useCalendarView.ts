"use client";

import { useCallback, useEffect, useState } from "react";

export type CalendarView = "week" | "month";

const STORAGE_KEY = "calendar_view";

function load(): CalendarView {
  if (typeof window === "undefined") return "week";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "week" || v === "month") return v;
  } catch {
    // ignore
  }
  return "week";
}

function save(value: CalendarView): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export function useCalendarView(): [CalendarView, (value: CalendarView) => void, boolean] {
  const [value, setValueState] = useState<CalendarView>("week");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setValueState(load());
  }, [mounted]);

  const setValue = useCallback((next: CalendarView) => {
    setValueState(next);
    save(next);
  }, []);

  return [mounted ? value : "week", setValue, mounted];
}
