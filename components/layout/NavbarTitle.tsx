'use client';

import { usePathname } from 'next/navigation';
import { useDashboardPathname } from '@/components/layout/DashboardPathnameContext';
import { useCalendarView } from '@/hooks/useCalendarView';

const pathTitles: Record<string, string> = {
  '/': 'Home',
  '/box': 'Box',
  '/week': 'Week',
  '/todo/new': 'New todo',
  '/timeblock': 'Time block',
  '/habits': 'Habit Tracker',
  '/settings': 'Settings',
  '/sign-in': 'Sign in',
  '/sign-up': 'Sign up',
  '/reset-password': 'Reset password',
  '/update-password': 'Update password',
};

export function NavbarTitle() {
  const nextPathname = usePathname();
  const ctx = useDashboardPathname();
  const pathname = ctx?.pathname ?? nextPathname;
  const [calendarView] = useCalendarView();
  const title =
    pathname === '/week'
      ? calendarView === 'month'
        ? 'Month'
        : 'Week'
      : pathTitles[pathname] ?? 'App';

  return (
    <span className="shrink-0 font-semibold text-gray-900" aria-hidden>
      {title}
    </span>
  );
}
