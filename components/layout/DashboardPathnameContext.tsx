"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const DASHBOARD_PATHS = ["/", "/box", "/week", "/timeblock", "/habits"] as const;
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

  // On client mount (e.g. refresh), sync to the actual URL so we stay on the current page
  useEffect(() => {
    setPathnameState(window.location.pathname);
  }, []);

  const isFirstPathSync = useRef(true);
  useEffect(() => {
    if (isFirstPathSync.current) {
      isFirstPathSync.current = false;
      return;
    }
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
