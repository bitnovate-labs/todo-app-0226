"use client";

import { usePathname } from "next/navigation";

/**
 * Renders the copyright footer only on the Settings page.
 */
export function CopyrightFooter() {
  const pathname = usePathname();
  if (pathname !== "/settings") return null;
  return (
    <footer className="shrink-0 px-4 py-4 text-center text-xs text-gray-500">
      Copyright 2026. Built by The Timinator
    </footer>
  );
}
