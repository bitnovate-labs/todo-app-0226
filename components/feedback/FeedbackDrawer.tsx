"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";
import { trackEvent } from "@/lib/analytics/track";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export function FeedbackDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    trackEvent({ name: ANALYTICS_EVENTS.FEEDBACK_CLICKED });
    setIsOpen(true);
    trackEvent({ name: ANALYTICS_EVENTS.FEEDBACK_VIEWED });
  };
  const close = () => setIsOpen(false);

  const handleSubmitted = useCallback(() => {
    // Close drawer shortly after success so user sees the thank-you message
    setTimeout(close, 1500);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium text-fg transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas"
      >
        Give feedback
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-overlay transition-opacity"
          aria-hidden
          onClick={close}
        />
      )}

      {/* Drawer panel (slide from right) */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[430px] flex-col border-l border-border bg-surface text-fg shadow-popover transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          visibility: isOpen ? "visible" : "hidden",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-drawer-title"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 safe-area-t">
          <h2
            id="feedback-drawer-title"
            className="mt-4 text-lg font-semibold text-fg"
          >
            Feedback
          </h2>
          <button
            type="button"
            onClick={close}
            className="mt-4 rounded-md p-1.5 text-fg-muted hover:bg-muted hover:text-fg focus:outline-none focus:ring-2 focus:ring-primary-focus"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-4 text-sm text-fg-muted">
            Help us improve by sharing your experience (~30 seconds).
          </p>
          <FeedbackForm onSubmitted={handleSubmitted} />
        </div>
      </div>
    </>
  );
}
