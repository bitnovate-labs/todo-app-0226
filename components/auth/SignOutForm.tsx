'use client';

import { signOut } from '@/app/actions/auth';
import { useUser } from '@/components/layout/UserContext';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { clearPersistedReactQueryCache } from '@/lib/query-persistence';
import { trackEvent, resetAnalyticsIdentity } from '@/lib/analytics/track';

export function SignOutForm() {
  const user = useUser();

  const handleSubmit = () => {
    if (user?.id) {
      clearPersistedReactQueryCache(user.id);
    }
    trackEvent({ name: ANALYTICS_EVENTS.USER_SIGNED_OUT });
    resetAnalyticsIdentity();
    // Form action (signOut) will then run and redirect
  };

  return (
    <form action={signOut} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Sign out
      </button>
    </form>
  );
}
