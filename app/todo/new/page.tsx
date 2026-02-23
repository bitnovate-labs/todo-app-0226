import { requireUser } from "@/lib/auth";
import { CreateTodoForm } from "@/components/todos/CreateTodoForm";

export const metadata = {
  title: "New todo",
};

export default async function NewTodoPage() {
  const user = await requireUser();
  return <CreateTodoForm userId={user.id} />;
}
