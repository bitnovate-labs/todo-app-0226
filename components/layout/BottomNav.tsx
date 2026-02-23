import Link from 'next/link';
import { getUserOrNull } from '@/lib/auth';

const navItemClass =
  'flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors min-w-0 flex-1 ';

export async function BottomNav() {
  const user = await getUserOrNull();
  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-b">
      <nav
        className="mx-auto max-w-[430px] border-t border-gray-200 bg-white"
        role="navigation"
        aria-label="Main"
      >
        <div className="w-full">
          <div className="flex h-14 items-stretch">
            <Link href="/" className={`${navItemClass} text-gray-600 hover:text-gray-900 active:text-blue-600`}>
              <svg
                className="h-6 w-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>
            <Link href="/week" className={`${navItemClass} text-gray-600 hover:text-gray-900 active:text-blue-600`}>
              <svg
                className="h-6 w-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Week</span>
            </Link>
            <Link
              href="/todo/new"
              className={`${navItemClass} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800`}
              aria-label="Add todo"
            >
              <svg
                className="h-7 w-7 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add</span>
            </Link>
            <Link href="/history" className={`${navItemClass} text-gray-600 hover:text-gray-900 active:text-blue-600`}>
              <svg
                className="h-6 w-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>History</span>
            </Link>
            <Link href="/settings" className={`${navItemClass} text-gray-600 hover:text-gray-900 active:text-blue-600`}>
              <svg
                className="h-6 w-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
