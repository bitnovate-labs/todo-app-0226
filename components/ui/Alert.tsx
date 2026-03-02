"use client";

type Variant = "error" | "success" | "info";

const variantClasses: Record<Variant, string> = {
  error: "bg-danger-muted border-danger-border text-red-800",
  success: "bg-success-muted border-green-200 text-green-800",
  info: "bg-gray-50 border-gray-200 text-gray-800",
};

type Props = {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
};

/**
 * Shared alert/notice box. Use semantic variant so theme changes apply.
 * Replaces repeated "bg-red-50 border border-red-200 rounded-md" patterns.
 */
export function Alert({
  variant = "error",
  children,
  className = "",
}: Props) {
  const combined = [
    "p-4 rounded-md border",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={combined}>{children}</div>;
}
