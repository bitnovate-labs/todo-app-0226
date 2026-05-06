"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useHabits } from "@/hooks/useHabits";

type AddHabitModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
};

export function AddHabitModal({ open, onClose, userId }: AddHabitModalProps) {
  const { addHabit, addPending } = useHabits(userId);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    try {
      await addHabit(t);
      setTitle("");
      onClose();
    } catch {
      /* mutation surfaces via query; avoid duplicate toast here */
    }
  };

  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    if (!input) return;
    const id = requestAnimationFrame(() => input.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    if (!input) return;
    const onFocus = () => {
      requestAnimationFrame(() => {
        input.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    };
    input.addEventListener("focus", onFocus);
    return () => input.removeEventListener("focus", onFocus);
  }, [open]);

  if (!open) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[9998] bg-black/60"
      aria-hidden
      onClick={handleClose}
    />
  );

  const dialog = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-habit-modal-title"
    >
      <div
        className="w-full max-w-[430px] flex flex-col rounded-2xl bg-white shadow-xl safe-area-b"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-4 pt-4 pb-2">
          <h2
            id="add-habit-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            New habit
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4 pb-6"
        >
          <div>
            <label
              htmlFor="add-habit-title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Habit name
            </label>
            <input
              ref={inputRef}
              id="add-habit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Drink water"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={80}
              required
              autoComplete="off"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addPending || !title.trim()}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {addPending ? "Adding…" : "Add habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      {overlay}
      {dialog}
    </>,
    document.body
  );
}
