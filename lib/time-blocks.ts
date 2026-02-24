/** Single time block (app shape) */
export type TimeBlock = {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;
  label: string;
  /** Color key for display */
  color: string;
};

/** Valid color keys for time blocks */
export const TIME_BLOCK_COLOR_KEYS = [
  "blue",
  "emerald",
  "amber",
  "violet",
  "rose",
  "slate",
] as const;

export type TimeBlockColorKey = (typeof TIME_BLOCK_COLOR_KEYS)[number];

export function isValidTimeBlockColor(color: string): color is TimeBlockColorKey {
  return TIME_BLOCK_COLOR_KEYS.includes(color as TimeBlockColorKey);
}
