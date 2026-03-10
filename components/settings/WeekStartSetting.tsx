"use client";

import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";

export function WeekStartSetting() {
  const [weekStartsOn, setWeekStartsOn, mounted] = useWeekStartsOn();

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-gray-700">Start week on</p>
      {!mounted ? (
        <div className="space-y-2">
          <div className="h-[52px] animate-pulse rounded-xl bg-gray-100" />
          <div className="h-[52px] animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-3 last:border-0 hover:bg-gray-50/80">
            <input
              type="radio"
              name="week-starts-on"
              checked={weekStartsOn === "sunday"}
              onChange={() => setWeekStartsOn("sunday")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Sunday (default)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-gray-50/80">
            <input
              type="radio"
              name="week-starts-on"
              checked={weekStartsOn === "monday"}
              onChange={() => setWeekStartsOn("monday")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Monday</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Affects the Week view and History week tab.
      </p>
    </div>
  );
}
