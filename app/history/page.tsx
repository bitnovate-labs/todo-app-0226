import { requireUser } from "@/lib/auth";
import { HistoryView } from "@/components/todos/HistoryView";
import { getTodosAction } from "@/app/actions/todos";

export const metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const user = await requireUser();
  const { data: initialTodos } = await getTodosAction();
  return <HistoryView userId={user.id} initialTodos={initialTodos ?? []} />;
}
