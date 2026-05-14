import { getUserOrNull } from "@/lib/auth";
import { BottomNavLinks } from "./BottomNavLinks";

export async function BottomNav() {
  const user = await getUserOrNull();
  if (!user) return null;

  return (
    <nav
      className="mx-auto max-w-[430px] border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] backdrop-blur-md backdrop-saturate-150"
      role="navigation"
      aria-label="Main"
    >
      <div className="w-full">
        <BottomNavLinks userId={user.id} />
      </div>
    </nav>
  );
}
