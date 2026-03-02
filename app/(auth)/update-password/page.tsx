import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrNull } from '@/lib/auth';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';
import { RecoverySessionHandler } from '@/components/auth/RecoverySessionHandler';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export const metadata = {
  title: 'Update password',
};

/**
 * If URL has ?code= (e.g. old reset link or direct redirect), exchange on the server
 * so session is stored in cookies only—no client localStorage (avoids "storage full" errors).
 * Session is in httpOnly cookies, so the client cannot read it; we must decide here and pass down.
 */
export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) redirect('/update-password');
    // Exchange failed (e.g. expired); fall through to session check below
  }

  const user = await getUserOrNull();
  if (!user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-4">
          <Alert variant="error">
            <p className="text-sm">
              No valid reset link found. Please request a new password reset.
            </p>
          </Alert>
          <Button as="a" href="/reset-password" variant="primary" fullWidth>
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RecoverySessionHandler hasSessionFromServer>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center w-full max-w-sm">
          <h1 className="mb-6 text-xl font-semibold tracking-tight text-gray-900">
            Set new password
          </h1>
          <p className="text-gray-600 mb-6 text-center max-w-sm">
            You arrived here from the password reset link. Enter your new password
            below.
          </p>
          <UpdatePasswordForm />
        </div>
      </div>
    </RecoverySessionHandler>
  );
}
