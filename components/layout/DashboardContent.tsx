"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDashboardPathname,
  isDashboardPath,
} from "@/components/layout/DashboardPathnameContext";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { TodayTodoList } from "@/components/todos/TodayTodoList";
import { WeekView } from "@/components/todos/WeekView";
import { HistoryView } from "@/components/todos/HistoryView";
import { TimeBlockView } from "@/components/todos/TimeBlockView";
import { todosQueryKey } from "@/lib/todos-query";
import { timeBlocksQueryKey } from "@/lib/time-blocks-query";
import { todayKey } from "@/lib/todos";

/**
 * Renders the main dashboard view based on current pathname (client state).
 * No server round-trip when switching between Home / Week / History.
 * Pull-to-refresh on all dashboard tabs to refresh todos and time blocks.
 * Wrapper is client-only to avoid SSR/hydration mismatch with the inner view's root DOM.
 */
export function DashboardContent({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const ctx = useDashboardPathname();
  const pathname = ctx?.pathname ?? "/";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <WeekView userId={userId} />
    ) : pathname === "/history" ? (
      <HistoryView userId={userId} />
    ) : pathname === "/timeblock" ? (
      <TimeBlockView userId={userId} />
    ) : (
      <TodayTodoList userId={userId} />
    );

  if (!mounted) return content;
  return (
    <PullToRefresh onRefresh={handleRefresh}>{content}</PullToRefresh>
  );
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
