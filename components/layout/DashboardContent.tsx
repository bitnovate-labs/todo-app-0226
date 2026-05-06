"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDashboardPathname,
  isDashboardPath,
} from "@/components/layout/DashboardPathnameContext";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { TodayTodoList } from "@/components/todos/TodayTodoList";
import { TimeBlockView } from "@/components/todos/TimeBlockView";
import { HabitTrackerView } from "@/components/habits/HabitTrackerView";
import { useCalendarView } from "@/hooks/useCalendarView";
import { todosQueryKey } from "@/lib/todos-query";
import {
  timeBlocksQueryKey,
  fetchTimeBlocks,
} from "@/lib/time-blocks-query";
import { todayKey } from "@/lib/todos";

const dashboardViewLoading = (
  <div className="flex min-h-[200px] items-center justify-center py-8">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" aria-hidden />
  </div>
);

const BoxSection = dynamic(
  () => import("@/components/todos/BoxSection").then((m) => ({ default: m.BoxSection })),
  { ssr: false, loading: () => dashboardViewLoading }
);

const WeekView = dynamic(
  () => import("@/components/todos/WeekView").then((m) => ({ default: m.WeekView })),
  { ssr: false, loading: () => dashboardViewLoading }
);

const MonthView = dynamic(
  () => import("@/components/todos/MonthView").then((m) => ({ default: m.MonthView })),
  { ssr: false, loading: () => dashboardViewLoading }
);

/**
 * Renders the main dashboard view based on current pathname (client state).
 * No server round-trip when switching between dashboard tabs.
 * Pull-to-refresh on all dashboard tabs to refresh todos and time blocks.
 * Wrapper is client-only to avoid SSR/hydration mismatch with the inner view's root DOM.
 */
export function DashboardContent({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const ctx = useDashboardPathname();
  const pathname = ctx?.pathname ?? "/";
  const [calendarView] = useCalendarView();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefetch today's time blocks as soon as we have userId so the Time tab has data when user switches (no loading).
  useEffect(() => {
    if (!userId) return;
    const today = todayKey();
    const key = timeBlocksQueryKey(userId, today);
    if (queryClient.getQueryData(key) == null) {
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: () => fetchTimeBlocks(userId, today),
      });
    }
  }, [userId, queryClient]);

  const handleRefresh = async () => {
    const todosKey = todosQueryKey(userId);
    const timeBlocksKey = timeBlocksQueryKey(userId, todayKey());
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: todosKey }),
      queryClient.invalidateQueries({ queryKey: timeBlocksKey }),
    ]);
  };

  const content =
    pathname === "/week" ? (
      calendarView === "month" ? (
        <MonthView userId={userId} />
      ) : (
        <WeekView userId={userId} />
      )
    ) : pathname === "/box" ? (
      <div className="min-w-0 animate-page-load pt-2 pb-8">
        <BoxSection userId={userId} />
      </div>
    ) : pathname === "/timeblock" ? (
      <TimeBlockView userId={userId} />
    ) : pathname === "/habits" ? (
      <HabitTrackerView userId={userId} />
    ) : (
      <div className="min-h-full bg-gray-100 -mx-4 -my-6 px-4 py-6">
        <TodayTodoList userId={userId} />
      </div>
    );

  if (!mounted) return content;
  return (
    <PullToRefresh onRefresh={handleRefresh}>{content}</PullToRefresh>
  );
}

/**
 * For dashboard paths (e.g. /, /week, /timeblock) renders DashboardContent (instant tab switch).
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
