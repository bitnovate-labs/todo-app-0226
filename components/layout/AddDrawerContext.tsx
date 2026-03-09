"use client";

import { createContext, useCallback, useContext, useState } from "react";

type AddDrawerContextValue = {
  open: boolean;
  next: string | null;
  /** When set (e.g. from Calendar with a day selected), drawer skips "When?" and uses this date. */
  defaultDate: string | null;
  setDefaultDateForAdd: (date: string | null) => void;
  openDrawer: (next?: string) => void;
  closeDrawer: () => void;
};

const Context = createContext<AddDrawerContextValue | null>(null);

export function useAddDrawer() {
  const ctx = useContext(Context);
  return ctx;
}

export function AddDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState<string | null>(null);
  const [defaultDate, setDefaultDateForAdd] = useState<string | null>(null);

  const openDrawer = useCallback((nextPath?: string) => {
    setNext(nextPath ?? null);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    setNext(null);
    setDefaultDateForAdd(null);
  }, []);

  return (
    <Context.Provider value={{ open, next, defaultDate, setDefaultDateForAdd, openDrawer, closeDrawer }}>
      {children}
    </Context.Provider>
  );
}
