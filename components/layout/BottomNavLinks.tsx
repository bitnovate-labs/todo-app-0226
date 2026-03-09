"use client";

import { useEffect } from "react";
import { useDashboardPathname } from "@/components/layout/DashboardPathnameContext";
import { useAddDrawer } from "@/components/layout/AddDrawerContext";
import { AddTodoDrawer } from "@/components/todos/AddTodoDrawer";

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
  const addDrawer = useAddDrawer();

  const handleDashboardTab = (path: string) => {
    if (pathname === path) return;
    pathnameCtx?.setPathname(path);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !addDrawer) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "1") {
      addDrawer.openDrawer();
      const path = pathnameCtx?.pathname ?? window.location.pathname;
      window.history.replaceState(null, "", path);
    }
  }, [addDrawer, pathnameCtx?.pathname]);

  return (
    <>
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
        active={pathname === "/box"}
        onClick={() => handleDashboardTab("/box")}
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
            d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <span>Box</span>
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
        <span>Calendar</span>
      </NavTab>
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
      <NavTab
        active={pathname === "/timeblock"}
        onClick={() => handleDashboardTab("/timeblock")}
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
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span>Time</span>
      </NavTab>
    </div>
    {/* FAB: opens add-todo drawer */}
    <button
      type="button"
      onClick={() => addDrawer?.openDrawer()}
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Add todo"
    >
      <svg className="h-7 w-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    </button>
    {addDrawer && (
      <AddTodoDrawer
        open={addDrawer.open}
        onClose={addDrawer.closeDrawer}
        userId={userId}
        next={addDrawer.next}
        defaultDate={addDrawer.defaultDate}
      />
    )}
    </>
  );
}
