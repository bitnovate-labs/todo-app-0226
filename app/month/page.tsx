import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Month",
};

export default async function MonthPage() {
  await requireUser();
  redirect("/week");
}
