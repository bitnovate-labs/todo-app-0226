import Link from "next/link";
import { Settings } from "lucide-react";
import { getUserOrNull } from "@/lib/auth";
import { NavbarTitle } from "./NavbarTitle";
import { NavbarActions } from "./NavbarActions";

export async function Navbar() {
  const user = await getUserOrNull();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-area-t">
      <header className="mx-auto max-w-[430px] border-b border-border bg-surface backdrop-blur-md backdrop-saturate-150">
        <div className="w-full">
        {user ? (
          <nav className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 py-3">
            <div className="flex justify-start">
              <Link
                href="/settings"
                className="rounded-full p-2 text-fg-muted transition-colors hover:bg-muted hover:text-fg"
                aria-label="Settings"
              >
                <Settings className="h-6 w-6" aria-hidden />
              </Link>
            </div>
            <div className="flex min-w-0 justify-center">
              <NavbarTitle />
            </div>
            <NavbarActions />
          </nav>
        ) : (
          <nav className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 py-3">
            <div />
            <div className="flex min-w-0 justify-center">
              <NavbarTitle />
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/sign-in" className="text-sm text-fg-muted hover:text-fg whitespace-nowrap">
                Sign in
              </Link>
              <Link href="/sign-up" className="text-sm text-primary hover:text-primary-hover whitespace-nowrap">
                Sign up
              </Link>
            </div>
          </nav>
        )}
        </div>
      </header>
    </div>
  );
}
