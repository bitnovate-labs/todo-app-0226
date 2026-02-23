import { requireUser } from "@/lib/auth";
import { HistoryView } from "@/components/todos/HistoryView";

export const metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const user = await requireUser();
  return <HistoryView userId={user.id} />;
}
