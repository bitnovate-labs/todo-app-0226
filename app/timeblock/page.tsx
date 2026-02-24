import { requireUser } from "@/lib/auth";
import { TimeBlockView } from "@/components/todos/TimeBlockView";

export const metadata = {
  title: "Time block",
};

export default async function TimeBlockPage() {
  const user = await requireUser();
  return <TimeBlockView userId={user.id} />;
}
