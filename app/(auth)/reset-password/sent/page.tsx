import Link from 'next/link';

export const metadata = {
  title: 'Check your email',
};

export default function ResetPasswordSentPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-gray-900">
        Check your email
      </h1>
      <p className="text-gray-600 mb-6 text-center max-w-sm">
        Check your email for a link to reset your password. If it doesn&apos;t appear within a few
        minutes, check your spam folder.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
