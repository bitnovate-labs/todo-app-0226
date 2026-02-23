import { WelcomePage } from "@/components/welcome/WelcomePage";
import { EmailConfirmationHandler } from "@/components/auth/EmailConfirmationHandler";
import { TodayTodoList } from "@/components/todos/TodayTodoList";
import { getUserOrNull } from "@/lib/auth";
import { getTodosAction } from "@/app/actions/todos";

export const metadata = {
  title: "Home",
};

export default async function HomePage() {
  const user = await getUserOrNull();

  if (user) {
    const { data: initialTodos } = await getTodosAction();
    return (
      <EmailConfirmationHandler>
        <TodayTodoList userId={user.id} initialTodos={initialTodos ?? []} />
      </EmailConfirmationHandler>
    );
  }

  return (
    <EmailConfirmationHandler>
      <WelcomePage />
    </EmailConfirmationHandler>
  );
}
