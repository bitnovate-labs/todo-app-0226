import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Box",
};

/**
 * Route exists so /box is a valid URL; MainContent renders BoxSection when pathname is /box.
 */
export default async function BoxPage() {
  await requireUser();
  return null;
}
