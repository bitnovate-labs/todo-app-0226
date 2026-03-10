"use client";

import { useState, useEffect, type ReactNode } from "react";

/**
 * Renders children immediately; loads PostHogProvider in a separate chunk after
 * mount so posthog-js is not in the initial bundle and doesn't slow first load.
 */
export function PostHogProviderGate({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    import("./providers").then((m) => setProvider(() => m.PostHogProvider));
  }, []);

  if (!Provider) return <>{children}</>;
  return <Provider>{children}</Provider>;
}
