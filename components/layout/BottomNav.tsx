import { getUserOrNull } from "@/lib/auth";
import { BottomNavLinks } from "./BottomNavLinks";

export async function BottomNav() {
  const user = await getUserOrNull();
  if (!user) return null;

  return (
    <nav
      className="mx-auto max-w-[430px] border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Main"
    >
      <div className="w-full">
        <BottomNavLinks userId={user.id} />
      </div>
    </nav>
  );
}
