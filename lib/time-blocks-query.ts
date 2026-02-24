import { getTimeBlocksAction } from "@/app/actions/time-blocks";
import type { TimeBlock } from "@/lib/time-blocks";
import { TIME_BLOCKS_QUERY_KEY } from "@/lib/query-client";

export function timeBlocksQueryKey(userId: string | null | undefined, date: string) {
  return [...TIME_BLOCKS_QUERY_KEY, userId ?? "", date] as const;
}

export async function fetchTimeBlocks(
  userId: string,
  date: string
): Promise<TimeBlock[]> {
  const result = await getTimeBlocksAction(date);
  if (result.error) return [];
  return result.data ?? [];
}
