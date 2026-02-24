import Link from "next/link";
import Image from "next/image";
import { getUserOrNull } from "@/lib/auth";
import { NavbarTitle } from "./NavbarTitle";

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
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </div>
            <div className="flex min-w-0 items-center justify-center gap-2">
              <Image
                src="/icon-192.png"
                alt=""
                width={28}
                height={28}
                className="shrink-0"
                aria-hidden
              />
              <NavbarTitle />
            </div>
            <div />
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
