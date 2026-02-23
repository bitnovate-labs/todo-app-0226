"use client";

import Link from "next/link";
import { useDashboardPathname } from "@/components/layout/DashboardPathnameContext";

const navItemClass =
  "flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors min-w-0 flex-1 ";

function NavTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${navItemClass} ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </button>
  );
}

/**
 * Dashboard tabs (/, /week, /history) use client-only navigation (pushState)
 * so switching is instant. Add and Settings use real Link for full navigation.
 */
export function BottomNavLinks({ userId }: { userId: string }) {
  const pathnameCtx = useDashboardPathname();
  const pathname = pathnameCtx?.pathname ?? "/";

  const handleDashboardTab = (path: string) => {
    if (pathname === path) return;
    pathnameCtx?.setPathname(path);
  };

  return (
    <div className="flex h-16 items-stretch">
      <NavTab
        active={pathname === "/"}
        onClick={() => handleDashboardTab("/")}
      >
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
      </NavTab>
      <NavTab
        active={pathname === "/week"}
        onClick={() => handleDashboardTab("/week")}
      >
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
      </NavTab>
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
      <NavTab
        active={pathname === "/history"}
        onClick={() => handleDashboardTab("/history")}
      >
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
      </NavTab>
      <Link
        href="/settings"
        className={`${navItemClass} ${
          pathname === "/settings"
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
        }`}
        aria-current={pathname === "/settings" ? "page" : undefined}
      >
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
  );
}
