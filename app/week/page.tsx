import { requireUser } from "@/lib/auth";
import { WeekView } from "@/components/todos/WeekView";
import { getTodosAction } from "@/app/actions/todos";

export const metadata = {
  title: "Week",
};

export default async function WeekPage() {
  const user = await requireUser();
  const { data: initialTodos } = await getTodosAction();
  return <WeekView userId={user.id} initialTodos={initialTodos ?? []} />;
}
