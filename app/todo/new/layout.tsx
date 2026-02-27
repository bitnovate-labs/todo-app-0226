import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New todo",
};

export default function NewTodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
