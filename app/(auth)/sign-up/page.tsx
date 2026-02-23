import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign up',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-1 flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign up</h1>
      <AuthForm mode="sign-up" />
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
