'use client';

import { useActionState } from 'react';
import { updatePassword, type UpdatePasswordResult } from '@/app/actions/auth';
import { PasswordInput } from './PasswordInput';
import { trackEvent } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(
    updatePassword,
    null as UpdatePasswordResult | null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm w-full">
      <PasswordInput
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      <PasswordInput
        id="confirm"
        name="confirm"
        label="Confirm password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      <p className="text-xs text-gray-500 -mt-2">
        Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
      </p>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        onClick={() => trackEvent({ name: ANALYTICS_EVENTS.UPDATE_PASSWORD_SUBMIT })}
        className="w-full min-h-[44px] py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
      >
        Update password
      </button>
    </form>
  );
}
