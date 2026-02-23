'use client';

/** Cookie name for analytics consent (value: "true" | "false") */
export const ANALYTICS_CONSENT_COOKIE = 'analytics_consent';

/** Cookie max-age for consent (1 year) */
export const ANALYTICS_CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentStatus = true | false | null;

/** Get consent from cookie. Returns null if not set. */
export function getConsentFromCookie(): ConsentStatus {
  if (typeof document === 'undefined') return null;
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`))
    ?.split('=')[1];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

/** Set consent cookie (call from client after user choice). */
export function setConsentCookie(accepted: boolean): void {
  if (typeof document === 'undefined') return;
  const maxAge = ANALYTICS_CONSENT_MAX_AGE;
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${accepted}; path=/; max-age=${maxAge}; SameSite=Lax${document.location?.protocol === 'https:' ? '; Secure' : ''}`;
}

/** Whether the user has made a consent choice (accepted or declined). */
export function hasConsentAnswer(): boolean {
  return getConsentFromCookie() !== null;
}
