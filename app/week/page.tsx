import { requireUser } from "@/lib/auth";
import { WeekView } from "@/components/todos/WeekView";

export const metadata = {
  title: "Week",
};

export default async function WeekPage() {
  const user = await requireUser();
  return <WeekView userId={user.id} />;
}
