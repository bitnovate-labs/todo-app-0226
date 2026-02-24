'use client';

import { usePathname } from 'next/navigation';
import { useDashboardPathname } from '@/components/layout/DashboardPathnameContext';

const pathTitles: Record<string, string> = {
  '/': 'Home',
  '/week': 'Week',
  '/todo/new': 'New todo',
  '/history': 'History',
  '/timeblock': 'Time block',
  '/settings': 'Settings',
  '/sign-in': 'Sign in',
  '/sign-up': 'Sign up',
  '/reset-password': 'Reset password',
  '/update-password': 'Update password',
};

function getTitle(pathname: string): string {
  return pathTitles[pathname] ?? 'App';
}

export function NavbarTitle() {
  const nextPathname = usePathname();
  const ctx = useDashboardPathname();
  const pathname = ctx?.pathname ?? nextPathname;
  const title = getTitle(pathname);

  return (
    <span className="shrink-0 font-semibold text-gray-900" aria-hidden>
      {title}
    </span>
  );
}
