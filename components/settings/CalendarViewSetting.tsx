"use client";

import { useCalendarView } from "@/hooks/useCalendarView";

const radioClass = "h-4 w-4 border-border text-primary focus:ring-primary-focus";

export function CalendarViewSetting() {
  const [calendarView, setCalendarView, mounted] = useCalendarView();

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-fg-muted">Calendar view</p>
      {!mounted ? (
        <div className="space-y-2">
          <div className="h-[52px] animate-pulse rounded-xl bg-muted" />
          <div className="h-[52px] animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <label className="flex cursor-pointer items-center gap-3 border-b border-border-subtle px-3 py-3 last:border-0 hover:bg-muted">
            <input
              type="radio"
              name="calendar-view"
              checked={calendarView === "week"}
              onChange={() => setCalendarView("week")}
              className={radioClass}
            />
            <span className="text-fg">Week — 7 days at a time</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-muted">
            <input
              type="radio"
              name="calendar-view"
              checked={calendarView === "month"}
              onChange={() => setCalendarView("month")}
              className={radioClass}
            />
            <span className="text-fg">Month — Full month with tasks</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-fg-muted">
        Affects the Calendar tab in the bottom navigation.
      </p>
    </div>
  );
}
