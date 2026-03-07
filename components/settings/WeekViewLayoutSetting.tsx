"use client";

import { useWeekViewLayout } from "@/hooks/useWeekViewLayout";

export function WeekViewLayoutSetting() {
  const [layout, setLayout, mounted] = useWeekViewLayout();

  return (
    <div className="border-t border-gray-200 pt-6 text-left">
      <p className="mb-3 text-sm font-medium text-gray-700">Week view layout</p>
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
              name="week-view-layout"
              checked={layout === "vertical"}
              onChange={() => setLayout("vertical")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Vertical — scroll down through days</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <input
              type="radio"
              name="week-view-layout"
              checked={layout === "horizontal"}
              onChange={() => setLayout("horizontal")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Horizontal — scroll sideways through days</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Affects the Week tab.
      </p>
    </div>
  );
}
