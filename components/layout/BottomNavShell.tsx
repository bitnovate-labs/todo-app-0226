'use client';

export function BottomNavShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white bottom-nav-fixed">
      {children}
    </div>
  );
}
