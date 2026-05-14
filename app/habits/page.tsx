import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Habit Tracker",
};

/**
 * Route exists so /habits is a valid URL; `MainContent` renders `HabitTrackerView` when
 * the dashboard pathname is /habits (same pattern as /box, /week, etc.).
 */
export default async function HabitsPage() {
  await requireUser();
  return null;
}
