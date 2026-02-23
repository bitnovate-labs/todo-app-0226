'use client';

import { useActionState } from 'react';
import { signIn, signUp, type SignInResult, type SignUpResult } from '@/app/actions/auth';
import { PasswordInput } from './PasswordInput';

type AuthFormProps = {
  mode: 'sign-in' | 'sign-up';
  initialEmail?: string;
};

export function AuthForm({ mode, initialEmail }: AuthFormProps) {
  const action = mode === 'sign-in' ? signIn : signUp;
  const [state, formAction] = useActionState(action, null as SignInResult | SignUpResult | null);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm w-full">
      {mode === 'sign-up' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your name"
          />
        </div>
      )}
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
          defaultValue={initialEmail}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>
      <PasswordInput
        id="password"
        name="password"
        label="Password"
        autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
        required
        minLength={8}
      />
      {mode === 'sign-up' && (
        <>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 -mt-2">
            Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
          </p>
        </>
      )}
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state && 'message' in state && state.message && (
        <p className="text-sm text-green-700" role="status">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] touch-manipulation"
      >
        {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
      </button>
    </form>
  );
}
