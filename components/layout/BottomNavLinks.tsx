"use client";

import { useEffect, useState } from "react";
import { Home, Package, Calendar, LayoutGrid, Flame, Plus } from "lucide-react";
import { useDashboardPathname } from "@/components/layout/DashboardPathnameContext";
import { useAddDrawer } from "@/components/layout/AddDrawerContext";
import { AddHabitModal } from "@/components/habits/AddHabitModal";
import { AddTodoModal } from "@/components/todos/AddTodoModal";

const navItemClass =
  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold tracking-tight transition-colors duration-200 min-h-[52px] touch-manipulation";

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
          ? "text-accent dark:text-sky-300"
          : "text-fg-muted hover:bg-muted/80 hover:text-fg active:bg-muted"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span
          className="absolute inset-x-1.5 top-1 bottom-1 -z-0 rounded-lg bg-accent-soft dark:bg-sky-400/25"
          aria-hidden
        />
      )}
      <span className="relative z-10 flex flex-col items-center gap-0.5">{children}</span>
    </button>
  );
}

/**
 * Dashboard tabs (/, /week, /box, /timeblock, /habits) use client-only navigation (pushState)
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
      <div className="flex h-16 items-stretch px-1 pt-0.5">
        <NavTab active={pathname === "/"} onClick={() => handleDashboardTab("/")}>
          <Home className="h-[22px] w-[22px] shrink-0 stroke-[2.25]" aria-hidden />
          <span>Home</span>
        </NavTab>
        <NavTab active={pathname === "/box"} onClick={() => handleDashboardTab("/box")}>
          <Package className="h-[22px] w-[22px] shrink-0 stroke-[2.25]" aria-hidden />
          <span>Box</span>
        </NavTab>
        <NavTab active={pathname === "/week"} onClick={() => handleDashboardTab("/week")}>
          <Calendar className="h-[22px] w-[22px] shrink-0 stroke-[2.25]" aria-hidden />
          <span>Calendar</span>
        </NavTab>
        <NavTab active={pathname === "/timeblock"} onClick={() => handleDashboardTab("/timeblock")}>
          <LayoutGrid className="h-[22px] w-[22px] shrink-0 stroke-[2.25]" aria-hidden />
          <span>Time</span>
        </NavTab>
        <NavTab active={pathname === "/habits"} onClick={() => handleDashboardTab("/habits")}>
          <Flame className="h-[22px] w-[22px] shrink-0 stroke-[2.25]" aria-hidden />
          <span>Habits</span>
        </NavTab>
      </div>
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)] right-6 z-50 md:left-1/2 md:right-auto md:w-full md:max-w-[430px] md:-translate-x-1/2 md:px-6 md:flex md:justify-end">
        <button
          type="button"
          onClick={() => {
            if (pathname === "/habits") setAddHabitOpen(true);
            else addDrawer?.openDrawer();
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-popover transition-transform duration-200 hover:bg-primary-hover hover:shadow-card active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:focus-visible:ring-offset-surface"
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
