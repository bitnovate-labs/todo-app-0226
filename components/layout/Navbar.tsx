import Link from "next/link";
import { Settings } from "lucide-react";
import { getUserOrNull } from "@/lib/auth";
import { NavbarTitle } from "./NavbarTitle";
import { NavbarActions } from "./NavbarActions";

export async function Navbar() {
  const user = await getUserOrNull();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-area-t">
      <header className="mx-auto max-w-[430px] border-b border-gray-200 bg-white">
        <div className="w-full">
        {user ? (
          <nav className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 py-3">
            <div className="flex justify-start">
              <Link
                href="/settings"
                className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
              <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
                Sign in
              </Link>
              <Link href="/sign-up" className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap">
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
