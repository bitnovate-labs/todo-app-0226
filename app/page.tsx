import { WelcomePage } from "@/components/welcome/WelcomePage";
import { EmailConfirmationHandler } from "@/components/auth/EmailConfirmationHandler";
import { TodayTodoList } from "@/components/todos/TodayTodoList";
import { getUserOrNull } from "@/lib/auth";

export const metadata = {
  title: "Home",
};

export default async function HomePage() {
  const user = await getUserOrNull();

  if (user) {
    return (
      <EmailConfirmationHandler>
        <TodayTodoList userId={user.id} />
      </EmailConfirmationHandler>
    );
  }

  return (
    <EmailConfirmationHandler>
      <WelcomePage />
    </EmailConfirmationHandler>
  );
}
