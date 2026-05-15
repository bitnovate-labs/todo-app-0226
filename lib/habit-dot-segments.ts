import { addDaysToDateKey, dateKey } from "@/lib/todos";

/** Misses allowed per phase before a reset (the 4th miss triggers the penalty). */
const ALLOWED_MISSES = 3;
/** Consecutive check-ins needed to lock the first 3 dots. */
const SEG1_CONSECUTIVE = 3;
/** Max dots in the second segment (after the first 3 are locked). */
const SEG2_DOT_CAP = 4;

export type HabitDotSegmentResult = {
  /** Seven dots: indices 0–2 = first segment, 3–6 = second segment. */
  filled: boolean[];
  segment1Locked: boolean;
};

/**
 * “Rhythm” dots: imperfect-life model derived only from check-in history.
 *
 * **Segment 1 (dots 1–3):** Build 3 consecutive calendar days with a check-in.
 * While unlocked, each missed day increments a miss budget; a missed day also
 * breaks the consecutive counter. If misses exceed {@link ALLOWED_MISSES}, the
 * whole meter resets (all 7 dots empty, segment 1 unlocks).
 *
 * **Segment 2 (dots 4–7):** After segment 1 is locked, the first 3 dots stay
 * filled. Progress in the last 4 dots follows the same rules: consecutive
 * check-ins fill up to four dots; misses break that run and add to a separate
 * budget; more than {@link ALLOWED_MISSES} misses in this phase clears only
 * segment 2 (four dots empty, miss budget cleared), segment 1 stays locked.
 *
 * Replay runs from the habit’s local creation day through today (inclusive).
 */
export function computeHabitDotSegments(
  completedDatesSorted: readonly string[],
  habitCreatedDay: string,
  todayDay: string
): HabitDotSegmentResult {
  const done = new Set(completedDatesSorted);
  const filledEmpty: boolean[] = Array.from({ length: 7 }, () => false);

  if (habitCreatedDay > todayDay) {
    return { filled: filledEmpty, segment1Locked: false };
  }

  let p1Locked = false;
  let p1Consec = 0;
  let p1Misses = 0;
  let p2Consec = 0;
  let p2Misses = 0;

  for (let d = habitCreatedDay; d <= todayDay; d = addDaysToDateKey(d, 1)) {
    const checked = done.has(d);

    if (!p1Locked) {
      if (checked) {
        p1Consec += 1;
        if (p1Consec >= SEG1_CONSECUTIVE) {
          p1Locked = true;
          p1Consec = SEG1_CONSECUTIVE;
        }
      } else {
        p1Consec = 0;
        p1Misses += 1;
        if (p1Misses > ALLOWED_MISSES) {
          p1Misses = 0;
          p1Consec = 0;
          p2Consec = 0;
          p2Misses = 0;
          p1Locked = false;
        }
      }
      continue;
    }

    if (checked) {
      p2Consec += 1;
    } else {
      p2Consec = 0;
      p2Misses += 1;
      if (p2Misses > ALLOWED_MISSES) {
        p2Misses = 0;
        p2Consec = 0;
      }
    }
  }

  const p2Fill = p1Locked ? Math.min(p2Consec, SEG2_DOT_CAP) : 0;

  const filled: boolean[] = [
    ...(p1Locked
      ? [true, true, true]
      : [p1Consec >= 1, p1Consec >= 2, p1Consec >= 3]),
    ...(p1Locked
      ? [
          p2Fill >= 1,
          p2Fill >= 2,
          p2Fill >= 3,
          p2Fill >= 4,
        ]
      : [false, false, false, false]),
  ];

  return { filled, segment1Locked: p1Locked };
}

export function habitCreatedDayKey(createdAtMs: number): string {
  return dateKey(new Date(createdAtMs));
}
