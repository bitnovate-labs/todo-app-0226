import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomNavShell } from "@/components/layout/BottomNavShell";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PostHogProvider, PostHogPageView } from './providers';
import { AnalyticsConsentGate } from '@/components/analytics/AnalyticsConsentGate';
import { AuthEventTracker } from '@/components/analytics/AuthEventTracker';
import { IdentifyUser } from '@/components/analytics/IdentifyUser';
import { APP_NAME } from "@/lib/constants";
import { getUserOrNull } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "Next.js App Router + Supabase Auth + PWA boilerplate",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: APP_NAME },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserOrNull();
  const showBottomNav = !!user;

  return (
    <html lang="en">
      <body className="min-h-dynamic-screen bg-gray-50 text-gray-900 antialiased">
        <PostHogProvider>
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

          <main
            className={`flex min-h-0 flex-1 flex-col ${
              user
                ? "pt-[calc(3.5rem+env(safe-area-inset-top,0px))]"
                : "pt-0"
            } safe-area-x ${
              showBottomNav
                ? "pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)]"
                : "pb-6"
            }`}
          >
            <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
              {children}
            </div>
          </main>
        </div>
        {showBottomNav ? (
          <BottomNavShell>
            <Suspense fallback={null}>
              <BottomNav />
            </Suspense>
          </BottomNavShell>
        ) : null}
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
        <AnalyticsConsentGate />
      </PostHogProvider>
      </body>
    </html>
  );
}
