/**
 * Root loading UI: shown immediately while the root segment (layout children) is
 * resolving. Prevents black/empty first paint — sent with initial response so
 * the user always sees a shell instead of a blank screen.
 */
import { ShellFallback } from "@/components/layout/ShellFallback";

export default function Loading() {
  return <ShellFallback />;
}
