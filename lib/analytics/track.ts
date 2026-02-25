'use client';

import posthog from 'posthog-js';
import type { AnalyticsEventPayload, UserTraits } from './events';
import { ANALYTICS_EVENTS } from './events';
import { getConsentFromCookie } from './consent';

export type { AnalyticsEventPayload, UserTraits } from './events';
export { ANALYTICS_EVENTS } from './events';

/** Ensure PostHog is opted in when user has consented (so capture is not skipped). */
function ensureOptedInIfConsented(): void {
  if (getConsentFromCookie() === true) {
    posthog.opt_in_capturing();
  }
}

/** Capture an analytics event. No-op if PostHog not initialized (e.g. no consent). */
export function trackEvent(event: AnalyticsEventPayload): void {
  if (typeof window === 'undefined') return;
  ensureOptedInIfConsented();
  const payload = event as Record<string, unknown>;
  const name = payload.name as string;
  posthog.capture(name, payload);
}

/** Flush queued events to PostHog immediately. Call after important events (e.g. feedback_submitted). */
export function flushAnalytics(): void {
  if (typeof window === 'undefined') return;
  (posthog as { flush?: () => void }).flush?.();
}

/** Identify user and set person properties. Call after sign-in/sign-up when you have user data. */
export function identifyUser(userId: string, traits?: UserTraits): void {
  if (typeof window === 'undefined') return;
  posthog.identify(userId, traits as Record<string, unknown>);
}

/** Reset PostHog identity (e.g. on sign-out). */
export function resetAnalyticsIdentity(): void {
  if (typeof window === 'undefined') return;
  posthog.reset();
}

/** Call when a non-fatal error occurs (e.g. form validation, API error). */
export function trackError(message?: string, context?: string, properties?: Record<string, unknown>): void {
  trackEvent({ name: ANALYTICS_EVENTS.ERROR_OCCURRED, message, context, ...properties });
}
