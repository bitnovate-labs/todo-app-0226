"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const DASHBOARD_PATHS = ["/", "/week", "/history"] as const;
export type DashboardPath = (typeof DASHBOARD_PATHS)[number];

export function isDashboardPath(path: string): path is DashboardPath {
  return DASHBOARD_PATHS.includes(path as DashboardPath);
}

type ContextValue = {
  pathname: string;
  setPathname: (path: string) => void;
  isDashboardPath: (path: string) => boolean;
};

const Context = createContext<ContextValue | null>(null);

export function useDashboardPathname() {
  const ctx = useContext(Context);
  if (!ctx) return null;
  return ctx;
}

export function DashboardPathnameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const nextPathname = usePathname();
  const [pathname, setPathnameState] = useState(nextPathname);

  useEffect(() => {
    setPathnameState(nextPathname);
  }, [nextPathname]);

  useEffect(() => {
    const onPopState = () => {
      setPathnameState(window.location.pathname);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setPathname = useCallback((path: string) => {
    window.history.pushState(null, "", path);
    setPathnameState(path);
  }, []);

  const value: ContextValue = {
    pathname,
    setPathname,
    isDashboardPath: (path) => isDashboardPath(path),
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
