'use client';

import { useEffect, useRef } from 'react';
import { identifyUser } from '@/lib/analytics/track';
import type { UserTraits } from '@/lib/analytics/events';

type Props = {
  userId: string;
  email?: string | null;
  createdAt?: string | null;
};

/**
 * Identifies the user with PostHog when they are logged in (e.g. in layout).
 * Call once when user is available; traits are merged with any existing person profile.
 */
export function IdentifyUser({ userId, email, createdAt }: Props) {
  const doneRef = useRef(false);

  useEffect(() => {
    if (!userId || doneRef.current) return;
    doneRef.current = true;

    const created = createdAt ? new Date(createdAt) : null;
    const traits: UserTraits = {
      email: email ?? undefined,
      signup_date: created ? created.toISOString().slice(0, 10) : undefined,
      created_at: createdAt ?? undefined,
      onboarding_completed: false,
      subscription_status: 'none',
      plan_type: 'free',
    };
    identifyUser(userId, traits);
  }, [userId, email, createdAt]);

  return null;
}
