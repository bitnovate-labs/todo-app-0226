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
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 bg-white p-4 shadow-lg safe-area-b md:left-1/2 md:max-w-[430px] md:-translate-x-1/2"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
    >
      <p id="consent-title" className="text-sm font-medium text-gray-900">
        Help us improve
      </p>
      <p id="consent-desc" className="mt-1 text-xs text-gray-600">
        We use anonymous analytics (PostHog) to understand how the app is used and fix issues. No ads or selling data.{' '}
        <a href="/privacy" className="text-blue-600 underline">
          Privacy
        </a>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={handleDecline}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
