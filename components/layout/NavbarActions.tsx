"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDashboardPathname } from "@/components/layout/DashboardPathnameContext";

export function NavbarActions() {
  const nextPathname = usePathname();
  const ctx = useDashboardPathname();
  const pathname = ctx?.pathname ?? nextPathname;
  const showHistory = pathname === "/week";

  return (
    <div className="flex justify-end">
      {showHistory ? (
        <Link
          href="/history"
          className="rounded-full p-2 text-fg-muted transition-colors hover:bg-muted hover:text-fg"
          aria-label="History"
        >
          <History className="h-6 w-6" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
