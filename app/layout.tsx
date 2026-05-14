import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PreventSwipeBack } from "@/components/ui/PreventSwipeBack";
import { PostHogProviderGate } from "./PostHogProviderGate";
import { AnalyticsConsentGate } from "@/components/analytics/AnalyticsConsentGate";
import { APP_NAME } from "@/lib/constants";
import { THEME_COLOR_LIGHT } from "@/lib/theme";
import { THEME_STORAGE_KEY } from "@/lib/theme-preference";
import { ShellFallback } from "@/components/layout/ShellFallback";
import { AuthBoundary } from "@/components/layout/AuthBoundary";
import { SplashHideTrigger } from "@/components/pwa/SplashScreen";
import { LockOrientation } from "@/components/pwa/LockOrientation";
import { OrientationGate } from "@/components/pwa/OrientationGate";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeColorMeta } from "@/components/theme/ThemeColorMeta";

const appSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-app",
  display: "swap",
});

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
  themeColor: THEME_COLOR_LIGHT,
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
  const themeInitScript = `
(function(){
  var KEY='${THEME_STORAGE_KEY}';
  try {
    var stored=localStorage.getItem(KEY);
    var dark=false;
    if(stored==='dark')dark=true;
    else if(stored==='light')dark=false;
    else dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(dark)document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }catch(e){}
})();
`.trim();

  return (
    <html
      lang="en"
      className={appSans.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dynamic-screen bg-canvas font-sans text-fg antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Script
          id="chunk-load-error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  function isChunkLoadError(msg) {
    if (typeof msg !== 'string') return false;
    return /ChunkLoadError|Loading chunk \\d+ failed|Loading CSS chunk \\d+ failed/i.test(msg);
  }
  function showRetryUI() {
    document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem;text-align:center;font-family:system-ui,sans-serif;background:#f2f3f5;">' +
      '<p style="margin:0 0 1rem;font-size:1.125rem;color:#111827;">Something went wrong loading the app.</p>' +
      '<button type="button" onclick="sessionStorage.removeItem(\'chunkLoadRetry\');location.reload();" style="padding:0.5rem 1.25rem;font-size:0.875rem;font-weight:500;color:#fff;background:#2563eb;border:none;border-radius:0.375rem;cursor:pointer;">Retry</button>' +
      '</div>';
  }
  window.addEventListener('error', function(e) {
    if (isChunkLoadError(e.message)) {
      var key = 'chunkLoadRetry';
      var retries = parseInt(sessionStorage.getItem(key) || '0', 10);
      if (retries < 2) {
        sessionStorage.setItem(key, String(retries + 1));
        location.reload();
      } else {
        sessionStorage.removeItem(key);
        showRetryUI();
      }
      e.preventDefault();
      return true;
    }
  });
  window.addEventListener('unhandledrejection', function(e) {
    var msg = e.reason && (e.reason.message || String(e.reason));
    if (isChunkLoadError(msg)) {
      var key = 'chunkLoadRetry';
      var retries = parseInt(sessionStorage.getItem(key) || '0', 10);
      if (retries < 2) {
        sessionStorage.setItem(key, String(retries + 1));
        location.reload();
      } else {
        sessionStorage.removeItem(key);
        showRetryUI();
      }
      e.preventDefault();
    }
  });
})();
            `.trim(),
          }}
        />
        {/* Launch splash: visible on first paint, hidden by SplashHideTrigger after mount */}
        <div id="app-splash" aria-hidden="true">
          <img
            src="/icon-192.png"
            alt=""
            width={96}
            height={96}
            style={{ width: 96, height: 96, borderRadius: '22%' }}
            fetchPriority="high"
          />
          <span className="app-splash-title">{APP_NAME}</span>
        </div>
        <SplashHideTrigger />
        <ThemeProvider>
          <ThemeColorMeta />
          <PostHogProviderGate>
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
          <OrientationGate>
            <div
              id="app-container"
              className="mx-auto flex min-h-dynamic-screen max-w-[430px] flex-col bg-surface shadow-shell"
            >
              <Suspense fallback={<ShellFallback />}>
                <AuthBoundary>{children}</AuthBoundary>
              </Suspense>
            </div>
          </OrientationGate>
          <PWAInstallPrompt />
          <ServiceWorkerRegister />
          <LockOrientation />
          <AnalyticsConsentGate />
        </PostHogProviderGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
