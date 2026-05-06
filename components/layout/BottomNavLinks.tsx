"use client";

import { useEffect, useState } from "react";
import { Home, Package, Calendar, Clock, LayoutGrid, Flame, Plus } from "lucide-react";
import { useDashboardPathname } from "@/components/layout/DashboardPathnameContext";
import { useAddDrawer } from "@/components/layout/AddDrawerContext";
import { AddHabitModal } from "@/components/habits/AddHabitModal";
import { AddTodoModal } from "@/components/todos/AddTodoModal";

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
  const [addHabitOpen, setAddHabitOpen] = useState(false);

  const handleDashboardTab = (path: string) => {
    if (pathname === path) return;
    pathnameCtx?.setPathname(path);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("add") !== "1") return;
    const path = pathnameCtx?.pathname ?? window.location.pathname;
    if (path === "/habits") setAddHabitOpen(true);
    else addDrawer?.openDrawer();
    window.history.replaceState(null, "", path);
  }, [addDrawer, pathnameCtx?.pathname]);

  return (
    <>
    <div className="flex h-16 items-stretch">
      <NavTab
        active={pathname === "/"}
        onClick={() => handleDashboardTab("/")}
      >
        <Home className="h-6 w-6 shrink-0" aria-hidden />
        <span>Home</span>
      </NavTab>
      <NavTab
        active={pathname === "/box"}
        onClick={() => handleDashboardTab("/box")}
      >
        <Package className="h-6 w-6 shrink-0" aria-hidden />
        <span>Box</span>
      </NavTab>
      <NavTab
        active={pathname === "/week"}
        onClick={() => handleDashboardTab("/week")}
      >
        <Calendar className="h-6 w-6 shrink-0" aria-hidden />
        <span>Calendar</span>
      </NavTab>
      <NavTab
        active={pathname === "/history"}
        onClick={() => handleDashboardTab("/history")}
      >
        <Clock className="h-6 w-6 shrink-0" aria-hidden />
        <span>History</span>
      </NavTab>
      <NavTab
        active={pathname === "/timeblock"}
        onClick={() => handleDashboardTab("/timeblock")}
      >
        <LayoutGrid className="h-6 w-6 shrink-0" aria-hidden />
        <span>Time</span>
      </NavTab>
      <NavTab
        active={pathname === "/habits"}
        onClick={() => handleDashboardTab("/habits")}
      >
        <Flame className="h-6 w-6 shrink-0" aria-hidden />
        <span>Habits</span>
      </NavTab>
    </div>
    {/* FAB: add habit on /habits, else add todo; desktop aligned to app max-width */}
    <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)] right-6 z-50 md:left-1/2 md:right-auto md:w-full md:max-w-[430px] md:-translate-x-1/2 md:px-6 md:flex md:justify-end">
      <button
        type="button"
        onClick={() => {
          if (pathname === "/habits") setAddHabitOpen(true);
          else addDrawer?.openDrawer();
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={pathname === "/habits" ? "Add habit" : "Add todo"}
      >
        <Plus className="h-7 w-7 shrink-0" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
    <AddHabitModal
      open={addHabitOpen}
      onClose={() => setAddHabitOpen(false)}
      userId={userId}
    />
    {addDrawer && (
      <AddTodoModal
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
