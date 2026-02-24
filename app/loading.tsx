import { ShellFallback } from "@/components/layout/ShellFallback";

/**
 * Instant loading state for the app segment. Shown while the route segment (layout
 * content + page) is loading so the user never sees a blank screen on navigation.
 */
export default function Loading() {
  return <ShellFallback />;
}
