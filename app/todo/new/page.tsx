"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/layout/UserContext";

/**
 * Redirect to dashboard and open the add-todo modal.
 * Keeps the app snappy: no separate page, drawer opens via FAB or ?add=1.
 */
export default function NewTodoPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/sign-in?next=" + encodeURIComponent("/"));
      return;
    }
    router.replace("/?add=1");
  }, [user, router]);

  return (
    <div className="animate-page-load py-8 text-center text-gray-500">
      Loading…
    </div>
  );
}
