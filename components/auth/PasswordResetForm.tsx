'use client';

import { useActionState } from 'react';
import { resetPassword, type ResetResult } from '@/app/actions/auth';
import { trackEvent } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

export function PasswordResetForm() {
  const [state, formAction] = useActionState(resetPassword, null as ResetResult | null);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm w-full">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state && !state.error && (
        <p className="text-sm text-green-700" role="status">
          Check your email for a link to reset your password.
        </p>
      )}
      <button
        type="submit"
        onClick={() => trackEvent({ name: ANALYTICS_EVENTS.RESET_PASSWORD_REQUEST })}
        className="w-full min-h-[44px] py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
      >
        Send reset link
      </button>
    </form>
  );
}
