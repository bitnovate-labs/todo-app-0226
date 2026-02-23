'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { identifyUser, trackEvent } from '@/lib/analytics/track';
import type { UserTraits } from '@/lib/analytics/events';
import { getMe } from '@/app/actions/auth';

/**
 * When landing on a page with ?from=sign_in or ?from=sign_up, fetches current user
 * via getMe(), identifies the user with PostHog, tracks the event, and clears the query param.
 * Place once in the app (e.g. layout or root page).
 */
export function AuthEventTracker() {
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    const from = searchParams.get('from') as 'sign_in' | 'sign_up' | null;
    if (!from || (from !== 'sign_in' && from !== 'sign_up')) return;
    if (handledRef.current) return;
    handledRef.current = true;

    const run = async () => {
      try {
        const data = await getMe();
        const user = data?.user;
        if (!user?.id) return;

        const created = user.created_at ? new Date(user.created_at) : null;
        const traits: UserTraits = {
          email: user.email,
          signup_date: created ? created.toISOString().slice(0, 10) : undefined,
          created_at: user.created_at,
          onboarding_completed: false, // placeholder until you have onboarding
          subscription_status: 'none', // placeholder
          plan_type: 'free', // placeholder
        };

        identifyUser(user.id, traits);

        if (from === 'sign_in') {
          trackEvent({ name: ANALYTICS_EVENTS.USER_SIGNED_IN });
        } else {
          trackEvent({ name: ANALYTICS_EVENTS.USER_SIGNED_UP });
        }
      } finally {
        // Remove ?from= from URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete('from');
        window.history.replaceState({}, '', url.pathname + (url.search || ''));
      }
    };

    run();
  }, [searchParams]);

  return null;
}
