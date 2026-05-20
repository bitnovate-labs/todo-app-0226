import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Time block",
};

/** Route for /timeblock; MainContent renders TimeBlockView when pathname is /timeblock. */
export default async function TimeBlockPage() {
  await requireUser();
  return null;
}
