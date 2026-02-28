import Link from 'next/link';

export const metadata = {
  title: 'Confirm your email',
};

export default function SignUpConfirmPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-gray-900">
        Confirm your email
      </h1>
      <p className="text-gray-600 mb-6 text-center max-w-sm">
        The email confirmation has been sent to your email address. Please check your inbox and
        click the link to activate your account. If you don&apos;t see it, check your spam folder.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
