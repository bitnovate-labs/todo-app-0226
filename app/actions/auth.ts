'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logAuthEvent } from '@/lib/auth';
import { SITE_URL } from '@/lib/constants';
import {
  signUpSchema,
  signInSchema,
  updatePasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations';

/** Map Supabase auth errors to user-friendly messages (e.g. rate limits). */
function authErrorMessage(error: { message: string }): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('rate limit') || msg.includes('email rate limit')) {
    return 'Too many emails sent. Please wait a few minutes and try again.';
  }
  if (msg.includes('for security purposes') && msg.includes('once every')) {
    return 'Please wait a minute before requesting another email, then try again.';
  }
  return error.message;
}

/** Extract the first validation error message from a Zod error. */
function getValidationError(error: { issues: Array<{ message: string }> }): string {
  if (error.issues && error.issues.length > 0) {
    return error.issues[0].message;
  }
  return 'Validation failed. Please check your input.';
}

export type SignInResult = { error?: string };
export type SignUpResult = { error?: string; message?: string };
export type ResetResult = { error?: string };
export type UpdatePasswordResult = { error?: string };

/** Current user + profile for client (e.g. analytics). Returns null if not authenticated. */
export async function getMe(): Promise<{
  user: { id: string; email?: string; created_at?: string };
  profile: { id: string; display_name?: string; profile_image_url?: string; created_at?: string; updated_at?: string } | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, profile_image_url, created_at, updated_at')
    .eq('id', user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile ?? null,
  };
}

export async function signIn(_prev: unknown, formData: FormData): Promise<SignInResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input with Zod
  const validation = signInSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: getValidationError(validation.error) };
  }

  const { email: validatedEmail, password: validatedPassword } = validation.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedEmail,
    password: validatedPassword,
  });

  if (error) {
    logAuthEvent('auth_error', `signIn: ${error.message}`);
    return { error: authErrorMessage(error) };
  }
  logAuthEvent('sign_in', validatedEmail);
  redirect('/?from=sign_in');
}

export async function signUp(_prev: unknown, formData: FormData): Promise<SignUpResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const name = formData.get('name') as string;

  // Validate input with Zod
  const validation = signUpSchema.safeParse({
    email,
    password,
    confirmPassword,
    name,
  });

  if (!validation.success) {
    return { error: getValidationError(validation.error) };
  }

  const { email: validatedEmail, password: validatedPassword, name: validatedName } =
    validation.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validatedEmail,
    password: validatedPassword,
    options: {
      data: validatedName ? { full_name: validatedName } : undefined,
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    logAuthEvent('auth_error', `signUp: ${error.message}`);
    return { error: authErrorMessage(error) };
  }
  logAuthEvent('sign_up', validatedEmail);

  if (data.user && !data.session && data.user.identities?.length === 0) {
    return { error: 'An account with this email already exists.' };
  }

  if (data.user && !data.session) {
    redirect('/sign-up/confirm');
  }

  redirect('/?from=sign_up');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  logAuthEvent('sign_out');
  redirect('/sign-in');
}

export async function resetPassword(
  _prev: unknown,
  formData: FormData
): Promise<ResetResult> {
  const email = formData.get('email') as string;

  // Validate input with Zod
  const validation = resetPasswordSchema.safeParse({ email });
  if (!validation.success) {
    return { error: getValidationError(validation.error) };
  }

  const { email: validatedEmail } = validation.data;

  const supabase = await createClient();
  // Route via server callback so code is exchanged server-side (cookies only, no localStorage)
  const redirectTo = `${SITE_URL}/auth/callback?next=${encodeURIComponent('/update-password')}`;
  const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
    redirectTo,
  });

  if (error) {
    logAuthEvent('auth_error', `resetPassword: ${error.message}`);
    return { error: authErrorMessage(error) };
  }
  logAuthEvent('reset_password_request', validatedEmail);
  redirect('/reset-password/sent');
}

export async function updatePassword(
  _prev: unknown,
  formData: FormData
): Promise<UpdatePasswordResult> {
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  // Validate input with Zod
  const validation = updatePasswordSchema.safeParse({ password, confirm });
  if (!validation.success) {
    return { error: getValidationError(validation.error) };
  }

  const { password: validatedPassword } = validation.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: validatedPassword });

  if (error) {
    logAuthEvent('auth_error', `updatePassword: ${error.message}`);
    return { error: authErrorMessage(error) };
  }
  logAuthEvent('reset_password_confirm');
  redirect('/');
}
