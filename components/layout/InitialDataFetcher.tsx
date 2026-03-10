import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomNavShell } from "@/components/layout/BottomNavShell";
import { DashboardPathnameProvider } from "@/components/layout/DashboardPathnameContext";
import { AddDrawerProvider } from "@/components/layout/AddDrawerContext";
import { MainContent } from "@/components/layout/DashboardContent";
import { UserProvider } from "@/components/layout/UserContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { TodosPrefetcher } from "@/components/providers/TodosPrefetcher";
import { PostHogPageView } from "@/app/providers";
import { AuthEventTracker } from "@/components/analytics/AuthEventTracker";
import { IdentifyUser } from "@/components/analytics/IdentifyUser";
import { AppContentReadyNotifier } from "@/components/pwa/AppContentReadyNotifier";
import { getTodosForUser } from "@/app/actions/todos";
import { getTimeBlocksForUser } from "@/app/actions/time-blocks";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User;
  today: string;
  children: React.ReactNode;
};

/**
 * Fetches initial todos and time blocks in parallel (using cached user, no duplicate auth),
 * then renders the dashboard with QueryProvider. Used inside Suspense so the shell can
 * stream first and this streams in when data is ready.
 */
export async function InitialDataFetcher({ user, today, children }: Props) {
  const [todosResult, timeBlocksResult] = await Promise.all([
    getTodosForUser(user.id),
    getTimeBlocksForUser(user.id, today),
  ]);
  const initialTodos = todosResult?.data ?? [];
  const initialTimeBlocks = timeBlocksResult?.data ?? [];

  return (
    <QueryProvider
      initialTodos={initialTodos}
      initialTimeBlocks={initialTimeBlocks}
      initialTimeBlocksDate={today}
      userId={user.id}
    >
      <UserProvider user={{ id: user.id, email: user.email ?? undefined }}>
      <AppContentReadyNotifier />
      <TodosPrefetcher userId={user.id} />
      <PostHogPageView />
      <AuthEventTracker />
      <IdentifyUser
        userId={user.id}
        email={user.email ?? undefined}
        createdAt={user.created_at}
      />
      <Navbar />
      <DashboardPathnameProvider>
        <AddDrawerProvider>
        <main
          className={`flex min-h-0 flex-1 flex-col pt-[calc(3.5rem+env(safe-area-inset-top,0px))] safe-area-x pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)]`}
        >
          <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
            <MainContent userId={user.id}>{children}</MainContent>
          </div>
        </main>
        <BottomNavShell>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </BottomNavShell>
        </AddDrawerProvider>
      </DashboardPathnameProvider>
      </UserProvider>
    </QueryProvider>
  );
}
