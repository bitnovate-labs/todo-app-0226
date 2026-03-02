"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "warning";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus:ring-primary-focus border-transparent",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400 border-gray-300",
  danger:
    "bg-danger text-white hover:bg-red-700 focus:ring-red-500 border-transparent",
  warning:
    "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 border-transparent",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
  /** Use for links styled as primary button (e.g. "Request New Reset Link"). */
  as?: "button" | "a";
  href?: string;
};

/**
 * Shared button styles. Use semantic variant so theme changes apply everywhere.
 * Prefer this over repeating bg-blue-600 / bg-amber-600 class strings.
 */
export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  as: As = "button",
  href,
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] touch-manipulation border py-3 px-4";
  const combined = [
    base,
    variantClasses[variant],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (As === "a" && href != null) {
    const { type: _t, ...anchorRest } = rest as ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;
    return (
      <a href={href} className={combined} {...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button type={(rest as ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"} className={combined} {...rest}>
      {children}
    </button>
  );
}
