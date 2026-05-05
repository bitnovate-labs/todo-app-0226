import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CopyrightFooter } from "@/components/layout/CopyrightFooter";
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
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User;
  children: React.ReactNode;
};

/**
 * Renders the logged-in shell immediately. Todos and time blocks load on the client
 * (React Query + TodosPrefetcher) so the PWA does not wait for server DB round-trips
 * before showing the UI.
 */
export function InitialDataFetcher({ user, children }: Props) {
  return (
    <QueryProvider userId={user.id}>
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
          <CopyrightFooter />
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
