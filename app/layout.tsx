import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Suspense } from "react";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PreventSwipeBack } from "@/components/ui/PreventSwipeBack";
import { PostHogProvider } from "./providers";
import { AnalyticsConsentGate } from "@/components/analytics/AnalyticsConsentGate";
import { APP_NAME } from "@/lib/constants";
import { ShellFallback } from "@/components/layout/ShellFallback";
import { AuthBoundary } from "@/components/layout/AuthBoundary";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dynamic-screen bg-gray-50 text-gray-900 antialiased">
        <PostHogProvider>
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
          <PreventSwipeBack />
          <div className="mx-auto flex min-h-dynamic-screen max-w-[430px] flex-col bg-white shadow-lg">
            <Suspense fallback={<ShellFallback />}>
              <AuthBoundary>{children}</AuthBoundary>
            </Suspense>
          </div>
          <PWAInstallPrompt />
          <ServiceWorkerRegister />
          <AnalyticsConsentGate />
        </PostHogProvider>
      </body>
    </html>
  );
}
