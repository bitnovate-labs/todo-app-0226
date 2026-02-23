import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign in',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-1 flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in</h1>
      <AuthForm mode="sign-in" />
      <p className="mt-4 text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-sm text-gray-600">
        <Link href="/reset-password" className="text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
