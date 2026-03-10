"use client";

import { useListFontSize } from "@/hooks/useListFontSize";

export function ListFontSizeSetting() {
  const [listFontSize, setListFontSize, mounted] = useListFontSize();

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-gray-700">List text size</p>
      {!mounted ? (
        <div className="space-y-2">
          <div className="h-[52px] animate-pulse rounded-xl bg-gray-100" />
          <div className="h-[52px] animate-pulse rounded-xl bg-gray-100" />
          <div className="h-[52px] animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-3 last:border-0 hover:bg-gray-50/80">
            <input
              type="radio"
              name="list-font-size"
              checked={listFontSize === "small"}
              onChange={() => setListFontSize("small")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Small (14px)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-3 hover:bg-gray-50/80">
            <input
              type="radio"
              name="list-font-size"
              checked={listFontSize === "medium"}
              onChange={() => setListFontSize("medium")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Medium (15px)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-gray-50/80">
            <input
              type="radio"
              name="list-font-size"
              checked={listFontSize === "large"}
              onChange={() => setListFontSize("large")}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-900">Large (16px)</span>
          </label>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Affects todo list items on Today, Week, Month, Box, and History.
      </p>
    </div>
  );
}
