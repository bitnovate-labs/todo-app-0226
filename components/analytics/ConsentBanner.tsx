'use client';

import { acceptAnalyticsConsent, declineAnalyticsConsent } from '@/app/providers';

type Props = {
  onDismiss?: () => void;
};

/**
 * Shown when user has not yet accepted or declined analytics.
 * Accept: enables PostHog and records analytics_consent_accepted.
 * Decline: stores choice and hides banner (no tracking; we do not send decline to PostHog).
 */
export function ConsentBanner({ onDismiss }: Props) {
  const handleAccept = () => {
    acceptAnalyticsConsent();
    onDismiss?.();
  };

  const handleDecline = () => {
    declineAnalyticsConsent();
    onDismiss?.();
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-surface p-4 shadow-popover safe-area-b md:left-1/2 md:max-w-[430px] md:-translate-x-1/2"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
    >
      <p id="consent-title" className="text-sm font-medium text-fg">
        Help us improve
      </p>
      <p id="consent-desc" className="mt-1 text-xs text-fg-muted">
        We use anonymous analytics (PostHog) to understand how the app is used and fix issues. No ads or selling data.{' '}
        <a href="/privacy" className="text-primary underline hover:text-primary-hover">
          Privacy
        </a>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={handleDecline}
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-fg hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
