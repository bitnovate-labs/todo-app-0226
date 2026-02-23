'use client';

import { signOut } from '@/app/actions/auth';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent, resetAnalyticsIdentity } from '@/lib/analytics/track';

export function SignOutForm() {
  const handleSubmit = () => {
    trackEvent({ name: ANALYTICS_EVENTS.USER_SIGNED_OUT });
    resetAnalyticsIdentity();
    // Form action (signOut) will then run and redirect
  };

  return (
    <form action={signOut} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Sign out
      </button>
    </form>
  );
}
