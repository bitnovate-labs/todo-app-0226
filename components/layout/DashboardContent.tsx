"use client";

import { usePathname } from "next/navigation";
import {
  useDashboardPathname,
  isDashboardPath,
} from "@/components/layout/DashboardPathnameContext";
import { TodayTodoList } from "@/components/todos/TodayTodoList";
import { WeekView } from "@/components/todos/WeekView";
import { HistoryView } from "@/components/todos/HistoryView";

/**
 * Renders the main dashboard view based on current pathname (client state).
 * No server round-trip when switching between Home / Week / History.
 */
export function DashboardContent({ userId }: { userId: string }) {
  const ctx = useDashboardPathname();
  const pathname = ctx?.pathname ?? "/";

  switch (pathname) {
    case "/week":
      return <WeekView userId={userId} />;
    case "/history":
      return <HistoryView userId={userId} />;
    case "/":
    default:
      return <TodayTodoList userId={userId} />;
  }
}

/**
 * For dashboard paths (/, /week, /history) renders DashboardContent (instant tab switch).
 * For other paths (e.g. /settings, /todo/new) renders the actual page (children).
 * Uses context pathname so client-only tab switches show the right view immediately.
 */
export function MainContent({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const pathname = usePathname();
  const ctx = useDashboardPathname();
  const effectivePath = ctx?.pathname ?? pathname;
  if (isDashboardPath(effectivePath)) {
    return <DashboardContent userId={userId} />;
  }
  return <>{children}</>;
}
