"use client";

import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";

const radioClass = "h-4 w-4 border-border text-primary focus:ring-primary-focus";

export function WeekStartSetting() {
  const [weekStartsOn, setWeekStartsOn, mounted] = useWeekStartsOn();

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-fg-muted">Start week on</p>
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
              name="week-starts-on"
              checked={weekStartsOn === "sunday"}
              onChange={() => setWeekStartsOn("sunday")}
              className={radioClass}
            />
            <span className="text-fg">Sunday (default)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-muted">
            <input
              type="radio"
              name="week-starts-on"
              checked={weekStartsOn === "monday"}
              onChange={() => setWeekStartsOn("monday")}
              className={radioClass}
            />
            <span className="text-fg">Monday</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-fg-muted">
        Affects the Week view and History week tab.
      </p>
    </div>
  );
}
