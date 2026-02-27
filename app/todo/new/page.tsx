"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateTodoForm } from "@/components/todos/CreateTodoForm";
import { useUser } from "@/components/layout/UserContext";

export default function NewTodoPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/sign-in?next=" + encodeURIComponent("/todo/new"));
    }
  }, [user, router]);

  if (user === null) {
    return (
      <div className="animate-page-load py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return <CreateTodoForm userId={user.id} />;
}
