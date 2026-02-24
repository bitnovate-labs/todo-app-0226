import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

/**
 * Shown while initial data (todos, time blocks) is loading. Matches the shell layout
 * so the transition to real content is seamless. Displays app logo so the opening
 * screen is branded whenever the app opens.
 */
export function ShellFallback() {
  return (
    <>
      {/* Top bar with app logo (matches Navbar height) */}
      <div className="fixed top-0 left-0 right-0 z-50 safe-area-t flex items-center justify-center bg-white border-b border-gray-200">
        <div className="mx-auto flex h-14 max-w-[430px] flex-1 items-center justify-center gap-2 px-4">
          <Image
            src="/icon-192.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0"
            priority
          />
          <span className="text-lg font-semibold text-gray-900">{APP_NAME}</span>
        </div>
      </div>
      <main
        className={`flex min-h-0 flex-1 flex-col pt-[calc(3.5rem+env(safe-area-inset-top,0px))] safe-area-x pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)]`}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-6">
          <div className="h-8 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bottom-nav-fixed">
        <div className="h-16 w-full max-w-[430px] bg-white" />
      </div>
    </>
  );
}
