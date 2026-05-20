import { WelcomePage } from "@/components/welcome/WelcomePage";
import { EmailConfirmationHandler } from "@/components/auth/EmailConfirmationHandler";
import { getUserOrNull } from "@/lib/auth";

export const metadata = {
  title: "Home",
};

/**
 * Logged-in home is rendered by MainContent → DashboardContent (client tabs).
 * Avoid SSR of TodayTodoList here — it duplicated work and bloated the RSC payload.
 */
export default async function HomePage() {
  const user = await getUserOrNull();

  if (user) {
    return <EmailConfirmationHandler>{null}</EmailConfirmationHandler>;
  }

  return (
    <EmailConfirmationHandler>
      <WelcomePage />
    </EmailConfirmationHandler>
  );
}
