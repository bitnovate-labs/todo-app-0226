'use client';

import { useEffect } from 'react';
import { trackError } from '@/lib/analytics/track';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackError(error.message, 'error_boundary', {
      digest: error.digest,
      name: error.name,
    });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">Something went wrong</h2>
      <p className="mb-4 text-sm text-gray-600">
        We’ve been notified and will look into it.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
