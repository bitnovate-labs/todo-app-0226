import { requireUser } from "@/lib/auth";
import { HabitTrackerView } from "@/components/habits/HabitTrackerView";

export const metadata = {
  title: "Habit Tracker",
};

export default async function HabitsPage() {
  const user = await requireUser();
  return <HabitTrackerView userId={user.id} />;
}
