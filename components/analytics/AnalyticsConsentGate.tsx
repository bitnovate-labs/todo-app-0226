'use client';

import { useEffect, useState } from 'react';
import { hasConsentAnswer } from '@/lib/analytics/consent';
import { ConsentBanner } from './ConsentBanner';

/**
 * Renders the consent banner only when the user has not yet accepted or declined.
 * After Accept/Decline, the banner is hidden for the rest of the session and via cookie on reload.
 */
export function AnalyticsConsentGate() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    setShowBanner(!hasConsentAnswer());
  }, []);

  if (!showBanner) return null;
  return <ConsentBanner onDismiss={() => setShowBanner(false)} />;
}
