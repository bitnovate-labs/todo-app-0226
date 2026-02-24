"use client";

import { useState, useCallback } from "react";
import { dateKey, todayKey } from "@/lib/todos";
import type { TimeBlock } from "@/lib/time-blocks";
import { TIME_BLOCK_COLOR_KEYS, isValidTimeBlockColor } from "@/lib/time-blocks";
import { useTimeBlocks } from "@/hooks/useTimeBlocks";

const START_HOUR = 5;
const END_HOUR = 22;
const SLOT_MINUTES = 30;

function slotMinutes(): string[] {
  const slots: string[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return slots;
}

const SLOTS = slotMinutes();

/** User-selectable colors for time blocks (key -> styles) */
const BLOCK_COLOR_MAP: Record<
  string,
  { card: string; bar: string; label: string; time: string; swatch: string }
> = {
  blue: {
    card: "border-blue-200/80 bg-blue-50/70",
    bar: "bg-blue-500/80",
    label: "text-blue-900",
    time: "text-blue-600/90",
    swatch: "bg-blue-500",
  },
  emerald: {
    card: "border-emerald-200/80 bg-emerald-50/70",
    bar: "bg-emerald-500/80",
    label: "text-emerald-900",
    time: "text-emerald-600/90",
    swatch: "bg-emerald-500",
  },
  amber: {
    card: "border-amber-200/80 bg-amber-50/70",
    bar: "bg-amber-500/80",
    label: "text-amber-900",
    time: "text-amber-600/90",
    swatch: "bg-amber-500",
  },
  violet: {
    card: "border-violet-200/80 bg-violet-50/70",
    bar: "bg-violet-500/80",
    label: "text-violet-900",
    time: "text-violet-600/90",
    swatch: "bg-violet-500",
  },
  rose: {
    card: "border-rose-200/80 bg-rose-50/70",
    bar: "bg-rose-500/80",
    label: "text-rose-900",
    time: "text-rose-600/90",
    swatch: "bg-rose-500",
  },
  slate: {
    card: "border-slate-200/80 bg-slate-100/70",
    bar: "bg-slate-500/80",
    label: "text-slate-900",
    time: "text-slate-600/90",
    swatch: "bg-slate-500",
  },
};

function getBlockColors(block: TimeBlock) {
  const key = block.color && isValidTimeBlockColor(block.color) ? block.color : "blue";
  return BLOCK_COLOR_MAP[key] ?? BLOCK_COLOR_MAP.blue;
}

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

type TimeBlockViewProps = { userId: string };

type Segment =
  | { type: "block"; block: TimeBlock }
  | { type: "empty"; start: string; end: string };

function buildSegments(blocks: TimeBlock[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  const sorted = [...blocks].sort(
    (a, b) => SLOTS.indexOf(a.start) - SLOTS.indexOf(b.start)
  );
  for (const block of sorted) {
    const startIdx = SLOTS.indexOf(block.start);
    const endIdx = SLOTS.indexOf(block.end);
    if (startIdx < cursor) continue;
    if (startIdx > cursor) {
      segments.push({
        type: "empty",
        start: SLOTS[cursor],
        end: SLOTS[startIdx],
      });
    }
    segments.push({ type: "block", block });
    cursor = Math.max(cursor, endIdx);
  }
  if (cursor < SLOTS.length) {
    segments.push({
      type: "empty",
      start: SLOTS[cursor],
      end: SLOTS[SLOTS.length - 1],
    });
  }
  if (segments.length === 0) {
    segments.push({
      type: "empty",
      start: SLOTS[0],
      end: SLOTS[SLOTS.length - 1],
    });
  }
  return segments;
}

export function TimeBlockView({ userId }: TimeBlockViewProps) {
  const [date, setDate] = useState(todayKey());
  const [addOpen, setAddOpen] = useState(false);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState<string>("blue");

  const {
    blocks,
    loading,
    addBlock,
    updateBlock,
    deleteBlock,
    addBlockPending,
    updateBlockPending,
    deleteBlockPending,
  } = useTimeBlocks(userId, date);

  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  const dateDisplay = (() => {
    const [y, m, d] = date.split("-").map(Number);
    const dObj = new Date(y, m - 1, d);
    return dObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  })();

  const goPrevDay = () => {
    const [y, m, d] = date.split("-").map(Number);
    const prev = new Date(y, m - 1, d - 1);
    setDate(dateKey(prev));
  };

  const goNextDay = () => {
    const [y, m, d] = date.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    setDate(dateKey(next));
  };

  const today = todayKey();
  const canGoNext = (() => {
    const [y, m, d] = date.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    return dateKey(next) <= today;
  })();

  const segments = buildSegments(blocks);

  const handleAddBlock = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (newStart >= newEnd) return;
      try {
        if (editingBlock) {
          await updateBlock(editingBlock.id, date, newStart, newEnd, newLabel.trim() || "Block", newColor);
        } else {
          await addBlock(date, newStart, newEnd, newLabel.trim() || "Block", newColor);
        }
        setNewLabel("");
        setNewStart("09:00");
        setNewEnd("10:00");
        setNewColor("blue");
        setAddOpen(false);
        setEditingBlock(null);
      } catch {
        // error already surfaced or ignore
      }
    },
    [date, newStart, newEnd, newLabel, newColor, editingBlock, addBlock, updateBlock]
  );

  const removeBlock = useCallback(
    (id: string) => {
      deleteBlock(id);
    },
    [deleteBlock]
  );

  const openAddAt = (start: string, end: string) => {
    setEditingBlock(null);
    setNewStart(start);
    setNewEnd(end);
    setNewLabel("");
    setNewColor("blue");
    setAddOpen(true);
  };

  const openEdit = (block: TimeBlock) => {
    setEditingBlock(block);
    setNewStart(block.start);
    setNewEnd(block.end);
    setNewLabel(block.label);
    setNewColor(block.color && isValidTimeBlockColor(block.color) ? block.color : "blue");
    setAddOpen(true);
  };

  const closeSheet = useCallback(() => {
    setAddOpen(false);
    setEditingBlock(null);
    setNewLabel("");
    setNewStart("09:00");
    setNewEnd("10:00");
    setNewColor("blue");
  }, []);

  return (
    <div className="min-w-0 animate-page-load">
      {/* Header: minimal */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          Time
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">Block your day</p>
      </div>

      {/* Date: compact pill */}
      <div className="mb-6 flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={goPrevDay}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200"
          aria-label="Previous day"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="min-w-[140px] text-center text-sm font-medium text-gray-700">
          {dateDisplay}
        </span>
        <button
          type="button"
          onClick={goNextDay}
          disabled={!canGoNext}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next day"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Timeline segments */}
      {loading && blocks.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-2">
          {segments.map((seg, segIdx) => {
            if (seg.type === "block") {
              const colors = getBlockColors(seg.block);
              const { block } = seg;
              return (
                <div
                  key={block.id}
                  className={`group flex items-center gap-3 rounded-2xl border py-3 pl-4 pr-3 shadow-sm transition-shadow hover:shadow ${colors.card}`}
                >
                  <div
                    className={`h-full min-h-[40px] w-1 shrink-0 self-stretch rounded-full ${colors.bar}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[15px] font-medium ${colors.label}`}>
                      {block.label}
                    </p>
                    <p className={`mt-0.5 text-xs font-medium uppercase tracking-wider ${colors.time}`}>
                      {formatTimeLabel(block.start)} – {formatTimeLabel(block.end)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => openEdit(block)}
                      disabled={updateBlockPending}
                      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200/80 hover:text-gray-600 active:bg-gray-200 disabled:opacity-50"
                      aria-label="Edit block"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      disabled={deleteBlockPending}
                      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100 disabled:opacity-50"
                      aria-label="Remove block"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <button
                key={`empty-${seg.start}-${seg.end}`}
                type="button"
                onClick={() => openAddAt(seg.start, seg.end)}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-3 pl-4 pr-4 text-left transition-colors hover:border-gray-300 hover:bg-gray-100/80 active:bg-gray-100"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {formatTimeLabel(seg.start)} – {formatTimeLabel(seg.end)}
                </span>
                <span className="text-sm text-gray-500">+ Add block</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Primary CTA */}
      <button
        type="button"
        onClick={() => {
          setEditingBlock(null);
          setNewStart("09:00");
          setNewEnd("10:00");
          setNewLabel("");
          setNewColor("blue");
          setAddOpen(true);
        }}
        className="mt-6 w-full rounded-2xl bg-gray-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 active:bg-gray-700"
      >
        Add time block
      </button>

      {/* Sheet modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-block-title"
        >
          <div
            className="w-full max-w-[430px] rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2 id="add-block-title" className="text-lg font-semibold text-gray-900">
                {editingBlock ? "Edit block" : "New block"}
              </h2>
            </div>
            <form onSubmit={handleAddBlock} className="space-y-4 px-5 pb-8 pt-2">
              <div>
                <label htmlFor="block-label" className="sr-only">
                  What are you doing?
                </label>
                <input
                  id="block-label"
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="What are you doing?"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIME_BLOCK_COLOR_KEYS.map((key) => {
                    const { swatch } = BLOCK_COLOR_MAP[key];
                    const selected = newColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewColor(key)}
                        className={`h-9 w-9 rounded-full ${swatch} transition-transform active:scale-95 ${
                          selected
                            ? "ring-2 ring-offset-2 ring-gray-400"
                            : "hover:opacity-90"
                        }`}
                        title={key}
                        aria-label={`Color ${key}`}
                        aria-pressed={selected}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="block-start" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                    Start
                  </label>
                  <select
                    id="block-start"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-900 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    {SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {formatTimeLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="block-end" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                    End
                  </label>
                  <select
                    id="block-end"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-900 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    {SLOTS.filter((s) => s > newStart).map((s) => (
                      <option key={s} value={s}>
                        {formatTimeLabel(s)}
                      </option>
                    ))}
                    {SLOTS.filter((s) => s > newStart).length === 0 && (
                      <option value={newStart}>{formatTimeLabel(newStart)}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSheet}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newStart >= newEnd || addBlockPending || updateBlockPending}
                  className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
                >
                  {addBlockPending || updateBlockPending
                    ? (editingBlock ? "Saving…" : "Adding…")
                    : editingBlock
                      ? "Save"
                      : "Add"}
                </button>
              </div>
            </form>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 -z-10"
            onClick={closeSheet}
          />
        </div>
      )}
    </div>
  );
}
