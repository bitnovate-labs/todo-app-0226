"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type UserInfo = {
  id: string;
  email: string | undefined;
};

const UserContext = createContext<UserInfo | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: UserInfo;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ id: user.id, email: user.email }),
    [user.id, user.email]
  );
  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserInfo | null {
  return useContext(UserContext);
}
