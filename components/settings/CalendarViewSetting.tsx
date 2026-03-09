"use client";

import { useCalendarView } from "@/hooks/useCalendarView";

export function CalendarViewSetting() {
  const [calendarView, setCalendarView, mounted] = useCalendarView();

  return (
    <div className="border-t border-gray-200 pt-6 text-left">
      <p className="mb-3 text-sm font-medium text-gray-700">Calendar view</p>
      {!mounted ? (
        <div className="space-y-2">
          <div className="h-[52px] animate-pulse rounded-xl bg-gray-100" />
          <div className="h-[52px] animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <input
              type="radio"
              name="calendar-view"
              checked={calendarView === "week"}
              onChange={() => setCalendarView("week")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Week — 7 days at a time</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <input
              type="radio"
              name="calendar-view"
              checked={calendarView === "month"}
              onChange={() => setCalendarView("month")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Month — Full month with tasks</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Affects the Calendar tab in the bottom navigation.
      </p>
    </div>
  );
}
