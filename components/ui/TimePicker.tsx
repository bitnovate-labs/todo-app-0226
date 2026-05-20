"use client";

import {
  hhmmToTime12Parts,
  time12PartsToHhmm,
} from "@/lib/todos";

const selectClass =
  "min-w-0 flex-1 appearance-none rounded-xl border border-border bg-muted px-3 py-3 text-[15px] text-fg focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-focus/25";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

type TimePickerProps = {
  id?: string;
  /** Stored time HH:mm, or empty string when unset. */
  value: string;
  onChange: (value: string) => void;
};

/**
 * Mobile-safe time picker (native type="time" overflows on iOS Safari).
 * Optional: leave hour on "—" for no time.
 */
export function TimePicker({ id, value, onChange }: TimePickerProps) {
  const parts = value ? hhmmToTime12Parts(value) : null;
  const hourValue = parts ? String(parts.hour12) : "";
  const minuteValue = parts?.minute ?? 0;
  const periodValue = parts?.period ?? "am";

  const setTime = (
    hour12: number | "",
    minute: number,
    period: "am" | "pm"
  ) => {
    if (hour12 === "") {
      onChange("");
      return;
    }
    onChange(time12PartsToHhmm({ hour12, minute, period }));
  };

  return (
    <div
      id={id}
      className="flex min-w-0 max-w-full items-center gap-1.5"
      role="group"
      aria-label="Time"
    >
      <select
        aria-label="Hour"
        value={hourValue}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) setTime("", 0, "am");
          else setTime(Number(v), minuteValue, periodValue);
        }}
        className={selectClass}
      >
        <option value="">—</option>
        {HOURS.map((h) => (
          <option key={h} value={String(h)}>
            {h}
          </option>
        ))}
      </select>
      <span className="shrink-0 text-fg-muted" aria-hidden>
        :
      </span>
      <select
        aria-label="Minute"
        value={String(minuteValue)}
        disabled={!hourValue}
        onChange={(e) =>
          setTime(Number(hourValue), Number(e.target.value), periodValue)
        }
        className={`${selectClass} disabled:opacity-50`}
      >
        {MINUTES.map((m) => (
          <option key={m} value={String(m)}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
      <select
        aria-label="AM or PM"
        value={periodValue}
        disabled={!hourValue}
        onChange={(e) =>
          setTime(Number(hourValue), minuteValue, e.target.value as "am" | "pm")
        }
        className={`${selectClass} max-w-[5.5rem] shrink-0 flex-none basis-[5.5rem] disabled:opacity-50`}
      >
        <option value="am">am</option>
        <option value="pm">pm</option>
      </select>
    </div>
  );
}
