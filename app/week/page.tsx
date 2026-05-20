import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Week",
};

/** Route for /week; MainContent renders WeekView/MonthView when pathname is /week. */
export default async function WeekPage() {
  await requireUser();
  return null;
}
