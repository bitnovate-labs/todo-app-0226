"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTimeBlocksAction,
  addTimeBlockAction,
  deleteTimeBlockAction,
  updateTimeBlockAction,
} from "@/app/actions/time-blocks";
import type { TimeBlock } from "@/lib/time-blocks";
import {
  timeBlocksQueryKey,
  fetchTimeBlocks,
} from "@/lib/time-blocks-query";

export function useTimeBlocks(userId: string | undefined | null, date: string) {
  const queryClient = useQueryClient();
  const queryKey = timeBlocksQueryKey(userId, date);

  const {
    data: blocks = [],
    isPending: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTimeBlocks(userId!, date),
    enabled: !!userId && !!date,
  });

  const addBlockMutation = useMutation({
    mutationFn: ({
      date,
      start,
      end,
      label,
      color,
    }: {
      date: string;
      start: string;
      end: string;
      label: string;
      color: string;
    }) => addTimeBlockAction(date, start, end, label, color),
    onSuccess: (result) => {
      if (!result.data) return;
      const addedDate = result.data.date;
      if (addedDate === date) {
        queryClient.setQueryData<TimeBlock[]>(queryKey, (prev) =>
          prev ? [...prev, result.data!] : [result.data!]
        );
      } else {
        queryClient.invalidateQueries({
          queryKey: timeBlocksQueryKey(userId, addedDate),
        });
      }
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id: string) => deleteTimeBlockAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<TimeBlock[]>(queryKey);
      queryClient.setQueryData<TimeBlock[]>(queryKey, (old) =>
        old ? old.filter((b) => b.id !== id) : old
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateBlockMutation = useMutation({
    mutationFn: ({
      id,
      date,
      start,
      end,
      label,
      color,
    }: {
      id: string;
      date: string;
      start: string;
      end: string;
      label: string;
      color: string;
    }) => updateTimeBlockAction(id, date, start, end, label, color),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.setQueryData<TimeBlock[]>(queryKey, (old) =>
          old
            ? old.map((b) => (b.id === result.data!.id ? result.data! : b))
            : [result.data!]
        );
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addBlock = async (
    date: string,
    start: string,
    end: string,
    label: string,
    color: string
  ) => {
    const result = await addBlockMutation.mutateAsync({
      date,
      start,
      end,
      label: label.trim() || "Block",
      color: color || "blue",
    });
    if (result.error) throw new Error(result.error);
  };

  const deleteBlock = (id: string) => deleteBlockMutation.mutate(id);

  const updateBlock = async (
    id: string,
    date: string,
    start: string,
    end: string,
    label: string,
    color: string
  ) => {
    const result = await updateBlockMutation.mutateAsync({
      id,
      date,
      start,
      end,
      label: label.trim() || "Block",
      color: color || "blue",
    });
    if (result.error) throw new Error(result.error);
  };

  return {
    blocks,
    loading,
    error: queryError ? String(queryError) : null,
    refetch,
    addBlock,
    updateBlock,
    deleteBlock,
    addBlockPending: addBlockMutation.isPending,
    updateBlockPending: updateBlockMutation.isPending,
    deleteBlockPending: deleteBlockMutation.isPending,
  };
}
