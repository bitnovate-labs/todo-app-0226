import { Suspense } from "react";
import { getUserOrNull } from "@/lib/auth";
import { todayKey } from "@/lib/todos";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ShellFallback } from "@/components/layout/ShellFallback";
import { InitialDataFetcher } from "@/components/layout/InitialDataFetcher";

/**
 * Resolves auth (and optional initial data) inside Suspense so the root layout
 * can stay synchronous and stream the shell + loading fallback immediately.
 * This improves TTFB and FCP because we don't block the first byte on getUser().
 */
export async function AuthBoundary({ children }: { children: React.ReactNode }) {
  const user = await getUserOrNull();
  const today = todayKey();

  if (user) {
    return (
      <Suspense fallback={<ShellFallback />}>
        <InitialDataFetcher user={user} today={today}>
          {children}
        </InitialDataFetcher>
      </Suspense>
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
