'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { WelcomeSlides } from './WelcomeSlides';

export function WelcomePage() {
  useEffect(() => {
    trackEvent({ name: ANALYTICS_EVENTS.WELCOME_PAGE_VIEW });
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-1 flex-col items-center justify-center px-4">
      <WelcomeSlides />
    </div>
  );
}
