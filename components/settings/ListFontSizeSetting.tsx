"use client";

import { useListFontSize } from "@/hooks/useListFontSize";

const radioClass = "h-4 w-4 border-border text-primary focus:ring-primary-focus";

export function ListFontSizeSetting() {
  const [listFontSize, setListFontSize, mounted] = useListFontSize();

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-fg-muted">List text size</p>
      {!mounted ? (
        <div className="space-y-2">
          <div className="h-[52px] animate-pulse rounded-xl bg-muted" />
          <div className="h-[52px] animate-pulse rounded-xl bg-muted" />
          <div className="h-[52px] animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <label className="flex cursor-pointer items-center gap-3 border-b border-border-subtle px-3 py-3 last:border-0 hover:bg-muted">
            <input
              type="radio"
              name="list-font-size"
              checked={listFontSize === "small"}
              onChange={() => setListFontSize("small")}
              className={radioClass}
            />
            <span className="text-fg">Small (14px)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 border-b border-border-subtle px-3 py-3 hover:bg-muted">
            <input
              type="radio"
              name="list-font-size"
              checked={listFontSize === "medium"}
              onChange={() => setListFontSize("medium")}
              className={radioClass}
            />
            <span className="text-fg">Medium (15px)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-muted">
            <input
              type="radio"
              name="list-font-size"
              checked={listFontSize === "large"}
              onChange={() => setListFontSize("large")}
              className={radioClass}
            />
            <span className="text-fg">Large (16px)</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-fg-muted">
        Affects todo list items on Today, Week, Month, Box, and History.
      </p>
    </div>
  );
}
