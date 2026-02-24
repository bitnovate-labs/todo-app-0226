'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import {
  getConsentFromCookie,
  setConsentCookie,
  hasConsentAnswer,
} from '@/lib/analytics/consent';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/track';

let posthogInitialized = false;

function initPostHogOnce(): void {
  if (posthogInitialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    capture_pageview: false,
    opt_out_capturing_by_default: true,
    person_profiles: 'identified_only',
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
    },
  });
  posthogInitialized = true;
}

function optInIfConsented(): boolean {
  const consent = getConsentFromCookie();
  if (consent === true) {
    posthog.opt_in_capturing();
    return true;
  }
  return false;
}

/** Defer work until after first paint so analytics don't contend with critical path. */
function runAfterFirstPaint(fn: () => void): void {
  if (typeof window === 'undefined') return;
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 0);
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    runAfterFirstPaint(() => {
      initPostHogOnce();
      if (optInIfConsented()) {
        trackEvent({ name: ANALYTICS_EVENTS.SESSION_START, path: window.location.pathname });
        trackEvent({ name: ANALYTICS_EVENTS.APP_OPENED });
      }
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/** Call when user accepts analytics consent (enables capturing and records consent event). */
export function acceptAnalyticsConsent(): void {
  setConsentCookie(true);
  initPostHogOnce();
  optInIfConsented();
  posthog.capture(ANALYTICS_EVENTS.ANALYTICS_CONSENT_ACCEPTED);
}

/** Call when user declines analytics consent. */
export function declineAnalyticsConsent(): void {
  setConsentCookie(false);
  initPostHogOnce();
  // Do not opt in; no consent event sent to avoid tracking after decline
}

/** Whether to show the consent banner (no choice made yet). */
export function shouldShowConsentBanner(): boolean {
  return !hasConsentAnswer();
}

/**
 * Captures pageviews and MVP-specific events (home_viewed, profile_viewed, welcome_page_view),
 * time_on_page for the previous path, and session_end on leave.
 */
export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | null>(null);
  const pathEnteredAtRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    const now = Date.now();
    const prevPath = prevPathRef.current;

    // Time on previous page
    if (prevPath != null) {
      const seconds = Math.round((now - pathEnteredAtRef.current) / 1000);
      if (seconds > 0) {
        trackEvent({ name: ANALYTICS_EVENTS.TIME_ON_PAGE, path: prevPath, seconds });
      }
    }

    prevPathRef.current = pathname;
    pathEnteredAtRef.current = now;

    // Standard pageview for PostHog
    let url = window.origin + pathname;
    if (searchParams?.toString()) url += `?${searchParams.toString()}`;
    posthog.capture('$pageview', { $current_url: url });

    // MVP events by route
    if (pathname === '/') {
      trackEvent({ name: ANALYTICS_EVENTS.HOME_VIEWED });
    } else if (pathname === '/settings') {
      trackEvent({ name: ANALYTICS_EVENTS.PROFILE_VIEWED });
    } else if (pathname === '/' && window.location.search === '') {
      // Welcome is shown on / when not logged in; we also fire welcome_page_view from WelcomePage
      // so this is redundant for logged-out; keep home_viewed for logged-in
    }
  }, [pathname, searchParams]);

  // Session end: when tab hidden or page unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const seconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
        trackEvent({
          name: ANALYTICS_EVENTS.SESSION_END,
          path: pathname ?? undefined,
          seconds_in_session: seconds,
        });
      } else if (document.visibilityState === 'visible') {
        sessionStartRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      const seconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      trackEvent({
        name: ANALYTICS_EVENTS.SESSION_END,
        path: pathname ?? undefined,
        seconds_in_session: seconds,
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
