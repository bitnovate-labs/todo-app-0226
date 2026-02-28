/** Single todo item */
export type Todo = {
  id: string;
  title: string;
  /** Date in YYYY-MM-DD */
  date: string;
  completed: boolean;
  createdAt: number;
  /** Display order within the same date (lower = higher in list). */
  position: number;
  /** When true, shown at top with highlight background. */
  priority: boolean;
};

/** Format date as YYYY-MM-DD (local date) */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today's date key */
export function todayKey(): string {
  return dateKey(new Date());
}

/** Add delta days to a date key (YYYY-MM-DD). Returns new date key. */
export function addDaysToDateKey(dateKeyStr: string, delta: number): string {
  const [y, m, d] = dateKeyStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return dateKey(date);
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format a Date for display as DD MMM. Deterministic (no locale) so server and client match. */
export function formatDateDDMMMFromDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_SHORT[d.getMonth()];
  return `${day} ${month}`;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Day of week (e.g. "Monday") for a Date. Deterministic for hydration. */
export function dayNameFromDate(d: Date): string {
  return DAY_NAMES[d.getDay()];
}

export type WeekStartsOn = "sunday" | "monday";

/** Start of the current calendar week (Sunday or Monday). */
export function getCurrentWeekStart(weekStartsOn: WeekStartsOn): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
  if (weekStartsOn === "sunday") {
    d.setDate(d.getDate() - day);
  } else {
    // Monday: go back (day + 6) % 7 days
    d.setDate(d.getDate() - ((day + 6) % 7));
  }
  return d;
}

/** Get the 7 days of the week starting from a given date. */
function weekDatesFrom(start: Date): { dateKey: string; label: string; dayName: string }[] {
  const base = new Date(start);
  base.setHours(0, 0, 0, 0);
  const out: { dateKey: string; label: string; dayName: string }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      dateKey: dateKey(d),
      label: formatDateDDMMMFromDate(d),
      dayName: dayNames[d.getDay()],
    });
  }
  return out;
}

/** Get the 7 days of the current calendar week (Sun–Sat or Mon–Sun). */
export function weekDatesForWeek(weekStartsOn: WeekStartsOn): { dateKey: string; label: string; dayName: string }[] {
  return weekDatesFrom(getCurrentWeekStart(weekStartsOn));
}

/** All date keys for the current calendar week (respects week start setting). */
export function currentWeekDateKeys(weekStartsOn?: WeekStartsOn): string[] {
  const start = weekStartsOn ? getCurrentWeekStart(weekStartsOn) : new Date();
  start.setHours(0, 0, 0, 0);
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    keys.push(dateKey(d));
  }
  return keys;
}

/** Start and end of month for a given date. Returns { start: YYYY-MM-DD, end: YYYY-MM-DD }. */
export function monthRange(d: Date): { start: string; end: string } {
  const y = d.getFullYear();
  const m = d.getMonth();
  const start = dateKey(new Date(y, m, 1));
  const end = dateKey(new Date(y, m + 1, 0));
  return { start, end };
}

/** All date keys in a month (for a given date). */
export function monthDateKeys(d: Date): string[] {
  const { start, end } = monthRange(d);
  const keys: string[] = [];
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const current = new Date(sy, sm - 1, 1);
  const lastDay = ed;
  const month = sm - 1;
  const year = sy;
  for (let day = 1; day <= lastDay; day++) {
    keys.push(dateKey(new Date(year, month, day)));
  }
  return keys;
}

/** Format month for display e.g. "February 2025". */
export function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
