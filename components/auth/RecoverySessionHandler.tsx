'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface RecoverySessionHandlerProps {
  children: React.ReactNode;
  /** When true, server already verified session (httpOnly cookies); skip client getSession() so we don't show "No valid reset link". */
  hasSessionFromServer?: boolean;
}

export function RecoverySessionHandler({ children, hasSessionFromServer }: RecoverySessionHandlerProps) {
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

        // Method 3: ?code= (PKCE) is handled on the server (update-password page or /auth/callback); not in browser (avoids storage full).
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          window.location.href = `/update-password?code=${encodeURIComponent(code)}`;
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

        // No recovery tokens found. If server already confirmed session (httpOnly cookies), don't call getSession() (client can't read httpOnly).
        if (hasSessionFromServer) {
          setIsExchanging(false);
          return;
        }
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
        <div className="max-w-sm w-full space-y-3">
          <Alert variant="error">
            <p className="text-sm">{error}</p>
          </Alert>
          {isQuotaError && (
            <Button type="button" onClick={clearStorageAndRetry} variant="warning" fullWidth>
              Clear storage and retry
            </Button>
          )}
          <Button as="a" href="/reset-password" variant="primary" fullWidth>
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
