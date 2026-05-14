"use client";

import { useWeekViewLayout } from "@/hooks/useWeekViewLayout";

const radioClass = "h-4 w-4 border-border text-primary focus:ring-primary-focus";

export function WeekViewLayoutSetting() {
  const [layout, setLayout, mounted] = useWeekViewLayout();

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-fg-muted">Week view layout</p>
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
              name="week-view-layout"
              checked={layout === "vertical"}
              onChange={() => setLayout("vertical")}
              className={radioClass}
            />
            <span className="text-fg">Vertical — scroll down through days</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-muted">
            <input
              type="radio"
              name="week-view-layout"
              checked={layout === "horizontal"}
              onChange={() => setLayout("horizontal")}
              className={radioClass}
            />
            <span className="text-fg">Horizontal — scroll sideways through days</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-fg-muted">
        Affects the Week tab.
      </p>
    </div>
  );
}
