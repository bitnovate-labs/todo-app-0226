import { headers } from "next/headers";
import { Suspense } from "react";
import { getUserOrNull } from "@/lib/auth";
import { todayKey } from "@/lib/todos";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ShellFallback } from "@/components/layout/ShellFallback";
import { InitialDataFetcher } from "@/components/layout/InitialDataFetcher";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomNavShell } from "@/components/layout/BottomNavShell";

const DASHBOARD_PATHS = ["/", "/week", "/history", "/timeblock"] as const;
function isDashboardPath(path: string | null): boolean {
  return path !== null && (DASHBOARD_PATHS as readonly string[]).includes(path);
}

/**
 * Resolves auth (and optional initial data) inside Suspense so the root layout
 * can stay synchronous and stream the shell + loading fallback immediately.
 * Only fetches todos/time-blocks for dashboard routes to avoid lag on Add/Settings.
 */
export async function AuthBoundary({ children }: { children: React.ReactNode }) {
  const user = await getUserOrNull();
  const pathname = (await headers()).get("x-pathname");
  const useDashboardData = isDashboardPath(pathname);

  if (user) {
    if (useDashboardData) {
      const today = todayKey();
      return (
        <Suspense fallback={<ShellFallback />}>
          <InitialDataFetcher user={user} today={today}>
            {children}
          </InitialDataFetcher>
        </Suspense>
      );
    }
    return (
      <QueryProvider userId={user.id}>
        <Navbar />
        <main
          className={`flex min-h-0 flex-1 flex-col pt-[calc(3.5rem+env(safe-area-inset-top,0px))] safe-area-x pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)]`}
        >
          <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
            {children}
          </div>
        </main>
        <BottomNavShell>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </BottomNavShell>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider userId={null}>
      <main
        className={`flex min-h-0 flex-1 flex-col pt-0 safe-area-x pb-6`}
      >
        <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
          {children}
        </div>
      </main>
    </QueryProvider>
  );
}
