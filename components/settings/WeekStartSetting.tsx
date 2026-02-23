"use client";

import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";

export function WeekStartSetting() {
  const [weekStartsOn, setWeekStartsOn] = useWeekStartsOn();

  return (
    <div className="border-t border-gray-200 pt-6 text-left">
      <p className="mb-3 text-sm font-medium text-gray-700">Start week on</p>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <input
            type="radio"
            name="week-starts-on"
            checked={weekStartsOn === "sunday"}
            onChange={() => setWeekStartsOn("sunday")}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-900">Sunday (default)</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
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
      <p className="mt-2 text-xs text-gray-500">
        Affects the Week view and History week tab.
      </p>
    </div>
  );
}
