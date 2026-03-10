"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional title shown at top of the card */
  title?: string;
};

/**
 * Lightweight modal for todo (or block) actions. Always visible and not clipped
 * by viewport, unlike dropdowns at the bottom of the list.
 */
export function TodoActionsModal({ open, onClose, children, title }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Actions"}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        ref={cardRef}
        className="relative w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white py-1 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-sm font-medium text-gray-700 truncate" title={title}>
              {title}
            </p>
          </div>
        ) : null}
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
