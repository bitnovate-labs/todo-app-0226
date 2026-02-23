'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

/**
 * Handles email confirmation tokens when users land on pages after clicking confirmation links.
 * Checks for confirmation tokens in URL and exchanges them for a session.
 */
function EmailConfirmationHandlerInner({ children }: { children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleEmailConfirmation() {
      // Check for confirmation code in URL
      const code = searchParams.get('code');
      const type = searchParams.get('type');

      // Only process email confirmation tokens (not recovery tokens)
      if (code && type === 'signup') {
        setIsProcessing(true);
        try {
          const supabase = createClient();
          
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error) {
            // Successfully confirmed email and established session
            // Remove the code from URL and refresh
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('code');
            newUrl.searchParams.delete('type');
            window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
            
            // Refresh the page to show authenticated content
            router.refresh();
          }
        } catch (error) {
          console.error('Error confirming email:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    }

    handleEmailConfirmation();
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Confirming your email...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function EmailConfirmationHandler({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <EmailConfirmationHandlerInner>{children}</EmailConfirmationHandlerInner>
    </Suspense>
  );
}
