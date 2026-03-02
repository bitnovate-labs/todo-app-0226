'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

interface RecoverySessionHandlerProps {
  children: React.ReactNode;
}

export function RecoverySessionHandler({ children }: RecoverySessionHandlerProps) {
  const [isExchanging, setIsExchanging] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function exchangeRecoverySession() {
      try {
        const supabase = createClient();
        
        // Check if there are hash fragments in the URL (recovery tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const tokenHash = hashParams.get('token_hash');

        // Method 1: If we have access_token and refresh_token in hash, use setSession
        if (accessToken && refreshToken && type === 'recovery') {
          const { error: exchangeError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (exchangeError) {
            setError('Invalid or expired reset link. Please request a new password reset.');
            setIsExchanging(false);
            return;
          }

          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          
          // Wait a moment for cookies to be set, then refresh
          await new Promise(resolve => setTimeout(resolve, 100));
          router.refresh();
          setIsExchanging(false);
          return;
        }

        // Method 2: If we have token_hash in hash, use verifyOtp
        if (tokenHash && type === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
          });

          if (verifyError) {
            setError('Invalid or expired reset link. Please request a new password reset.');
            setIsExchanging(false);
            return;
          }

          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          
          // Wait a moment for cookies to be set, then refresh
          await new Promise(resolve => setTimeout(resolve, 100));
          router.refresh();
          setIsExchanging(false);
          return;
        }

        // Method 3: PKCE flow — Supabase may redirect with ?code=... (no type in URL)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const isQuota = /quota|QuotaBytes|storage|exceeded/i.test(exchangeError.message ?? '');
            setError(
              isQuota
                ? 'Browser storage is full. Clear this site’s data (or use a private window) and try again.'
                : 'Invalid or expired reset link. Please request a new password reset.'
            );
            setIsExchanging(false);
            return;
          }
          window.history.replaceState(null, '', window.location.pathname);
          await new Promise(resolve => setTimeout(resolve, 100));
          router.refresh();
          setIsExchanging(false);
          return;
        }

        // Method 4: Query token_hash (some email templates use query params)
        const queryTokenHash = searchParams.get('token_hash');
        const queryType = searchParams.get('type');

        if (queryTokenHash && queryType === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: queryTokenHash,
          });

          if (verifyError) {
            setError('Invalid or expired reset link. Please request a new password reset.');
            setIsExchanging(false);
            return;
          }

          // Clear query params from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Wait a moment for cookies to be set, then refresh
          await new Promise(resolve => setTimeout(resolve, 100));
          router.refresh();
          setIsExchanging(false);
          return;
        }

        // No recovery tokens found - check if user already has a session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('No valid reset link found. Please request a new password reset.');
        }

        setIsExchanging(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const isQuota = /quota|QuotaBytes|storage|exceeded/i.test(message);
        setError(
          isQuota
            ? 'Browser storage is full. Clear this site’s data (or use a private window) and try again.'
            : 'An error occurred while processing the reset link.'
        );
        setIsExchanging(false);
      }
    }

    exchangeRecoverySession();
  }, [router]);

  if (isExchanging) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isQuotaError = /storage is full|Clear this site's data/i.test(error);

    const clearStorageAndRetry = () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
          indexedDB.databases().then((dbs) => {
            dbs.forEach((db) => db.name && indexedDB.deleteDatabase(db.name));
            window.location.reload();
          }).catch(() => window.location.reload());
        } else {
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    };

    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <div className="flex flex-col gap-3">
            {isQuotaError && (
              <button
                type="button"
                onClick={clearStorageAndRetry}
                className="w-full py-3 px-4 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700"
              >
                Clear storage and retry
              </button>
            )}
            <a
              href="/reset-password"
              className="block w-full text-center py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Request New Reset Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
