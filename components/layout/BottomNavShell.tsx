'use client';

export function BottomNavShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bottom-nav-fixed">
      <div className="w-full max-w-[430px] bg-white">
        {children}
      </div>
    </div>
  );
}
