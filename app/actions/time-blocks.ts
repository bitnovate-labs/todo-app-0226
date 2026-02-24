'use server';

import { createClient } from '@/lib/supabase/server';
import type { TimeBlock } from '@/lib/time-blocks';

type DbRow = {
  id: string;
  profile_id: string;
  date: string;
  start_time: string;
  end_time: string;
  label: string;
  color?: string; // optional until migration 20250224200000 is applied
  created_at: string;
};

function mapRowToBlock(row: DbRow): TimeBlock {
  return {
    id: row.id,
    date: row.date,
    start: row.start_time,
    end: row.end_time,
    label: row.label,
    color: row.color ?? 'blue',
  };
}

export type GetTimeBlocksResult = { data?: TimeBlock[]; error?: string };

/**
 * Server-only: fetch time blocks for a known user (e.g. from layout). Skips auth to avoid duplicate getUser().
 * Use getTimeBlocksAction() when called from the client (needs auth).
 */
export async function getTimeBlocksForUser(
  userId: string,
  date: string
): Promise<GetTimeBlocksResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('time_blocks')
    .select('id, profile_id, date, start_time, end_time, label, color, created_at')
    .eq('profile_id', userId)
    .eq('date', date)
    .order('start_time', { ascending: true });

  if (error) return { error: error.message, data: [] };
  return { data: (data ?? []).map((r) => mapRowToBlock(r as DbRow)) };
}

export async function getTimeBlocksAction(date: string): Promise<GetTimeBlocksResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: [], error: authError?.message ?? 'Not authenticated' };
  }
  return getTimeBlocksForUser(user.id, date);
}

export type AddTimeBlockResult = { data?: TimeBlock; error?: string };

export async function addTimeBlockAction(
  date: string,
  start: string,
  end: string,
  label: string,
  color: string
): Promise<AddTimeBlockResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError?.message ?? 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('time_blocks')
    .insert({
      profile_id: user.id,
      date,
      start_time: start,
      end_time: end,
      label: label || 'Block',
      color: color || 'blue',
    })
    .select('id, profile_id, date, start_time, end_time, label, created_at')
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: 'No data returned' };
  return { data: mapRowToBlock({ ...(data as DbRow), color: color || 'blue' }) };
}

export type DeleteTimeBlockResult = { error?: string };

export async function deleteTimeBlockAction(id: string): Promise<DeleteTimeBlockResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('time_blocks').delete().eq('id', id);
  return error ? { error: error.message } : {};
}

export type UpdateTimeBlockResult = { data?: TimeBlock; error?: string };

export async function updateTimeBlockAction(
  id: string,
  date: string,
  start: string,
  end: string,
  label: string,
  color: string
): Promise<UpdateTimeBlockResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError?.message ?? 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('time_blocks')
    .update({
      date,
      start_time: start,
      end_time: end,
      label: label || 'Block',
      color: color || 'blue',
    })
    .eq('id', id)
    .eq('profile_id', user.id)
    .select('id, profile_id, date, start_time, end_time, label, created_at')
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: 'No data returned' };
  return { data: mapRowToBlock({ ...(data as DbRow), color: color || 'blue' }) };
}
