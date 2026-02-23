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

// --- Placeholder helpers: call these when you add checkout/payment/onboarding flows ---

/** Call when user completes onboarding. */
export function trackOnboardingCompleted(): void {
  trackEvent({ name: ANALYTICS_EVENTS.ONBOARDING_COMPLETED });
}

/** Call when checkout starts (e.g. cart → checkout). */
export function trackCheckoutStarted(properties?: Record<string, unknown>): void {
  trackEvent({ name: ANALYTICS_EVENTS.CHECKOUT_STARTED, ...properties });
}

/** Call when checkout fails. */
export function trackCheckoutFailed(reason?: string, properties?: Record<string, unknown>): void {
  trackEvent({ name: ANALYTICS_EVENTS.CHECKOUT_FAILED, reason, ...properties });
}

/** Call when payment succeeds. */
export function trackPaymentSuccess(properties?: Record<string, unknown>): void {
  trackEvent({ name: ANALYTICS_EVENTS.PAYMENT_SUCCESS, ...properties });
}

/** Call when payment fails. */
export function trackPaymentFailed(reason?: string, properties?: Record<string, unknown>): void {
  trackEvent({ name: ANALYTICS_EVENTS.PAYMENT_FAILED, reason, ...properties });
}

/** Call when subscription is completed. */
export function trackSubscriptionCompleted(properties?: Record<string, unknown>): void {
  trackEvent({ name: ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED, ...properties });
}

/** Call when a non-fatal error occurs (e.g. form validation, API error). */
export function trackError(message?: string, context?: string, properties?: Record<string, unknown>): void {
  trackEvent({ name: ANALYTICS_EVENTS.ERROR_OCCURRED, message, context, ...properties });
}
