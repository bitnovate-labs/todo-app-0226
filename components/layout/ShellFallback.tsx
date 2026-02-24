/**
 * Shown while auth resolves and/or initial data (todos, time blocks) is loading.
 * Matches the shell layout so the transition to real content is seamless.
 * Displays a clear loading animation for signed-in users.
 */
export function ShellFallback() {
  return (
    <>
      {/* Placeholder matching Navbar height */}
      <div
        className="fixed top-0 left-0 right-0 z-50 safe-area-t bg-white"
        style={{ height: "3.5rem" }}
      >
        <div className="mx-auto h-full max-w-[430px] border-b border-gray-200" />
      </div>
      <main
        className={`flex min-h-0 flex-1 flex-col items-center justify-center pt-[calc(3.5rem+env(safe-area-inset-top,0px))] safe-area-x pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)]`}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Spinner */}
          <div
            className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-blue-500 animate-initial-load-spin"
            aria-hidden
          />
          {/* Bouncing dots */}
          <div className="flex items-center gap-1.5" aria-label="Loading">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-blue-500"
                style={{
                  animation: "initial-load-dot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}
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
