import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomNavShell } from "@/components/layout/BottomNavShell";
import { DashboardPathnameProvider } from "@/components/layout/DashboardPathnameContext";
import { MainContent } from "@/components/layout/DashboardContent";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PostHogProvider, PostHogPageView } from './providers';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { TodosPrefetcher } from '@/components/providers/TodosPrefetcher';
import { AnalyticsConsentGate } from '@/components/analytics/AnalyticsConsentGate';
import { AuthEventTracker } from '@/components/analytics/AuthEventTracker';
import { IdentifyUser } from '@/components/analytics/IdentifyUser';
import { APP_NAME } from "@/lib/constants";
import { getUserOrNull } from "@/lib/auth";
import { getTodosAction } from "@/app/actions/todos";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "A simple todo list PWA. Add tasks, view by day or week, and track what's done.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: APP_NAME },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserOrNull();
  const showBottomNav = !!user;
  const initialTodos =
    user != null ? (await getTodosAction()).data ?? [] : undefined;

  return (
    <html lang="en">
      <body className="min-h-dynamic-screen bg-gray-50 text-gray-900 antialiased">
        <PostHogProvider>
          <QueryProvider
            initialTodos={initialTodos}
            userId={user?.id ?? null}
          >
          <TodosPrefetcher userId={user?.id ?? null} />
          <PostHogPageView />
          <AuthEventTracker />
          {user ? (
            <IdentifyUser
              userId={user.id}
              email={user.email}
              createdAt={user.created_at}
            />
          ) : null}
        <Script
          id="scroll-restoration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Disable automatic scroll restoration
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            `,
          }}
        />
        <ScrollToTop />
        <div className="mx-auto flex min-h-dynamic-screen max-w-[430px] flex-col bg-white shadow-lg">
          {user ? <Navbar /> : ""}

          {user ? (
            <DashboardPathnameProvider>
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
            </DashboardPathnameProvider>
          ) : (
            <>
              <main
                className={`flex min-h-0 flex-1 flex-col pt-0 safe-area-x pb-6`}
              >
                <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
                  {children}
                </div>
              </main>
            </>
          )}
        </div>
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
        <AnalyticsConsentGate />
          </QueryProvider>
      </PostHogProvider>
      </body>
    </html>
  );
}
