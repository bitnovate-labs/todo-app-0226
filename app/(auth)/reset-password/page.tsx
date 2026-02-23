import Link from 'next/link';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

export const metadata = {
  title: 'Reset password',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Reset your password
      </h1>
      <p className="text-gray-600 mb-6 text-center max-w-sm">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>
      <PasswordResetForm />
      <p className="mt-4 text-sm text-gray-600">
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
