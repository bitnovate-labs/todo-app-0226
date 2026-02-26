'use server';

import { createClient } from '@/lib/supabase/server';
import type { Todo } from '@/lib/todos';

type DbRow = {
  id: string;
  profile_id: string;
  title: string;
  date: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

function mapRowToTodo(row: DbRow): Todo {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
    position: row.position ?? 0,
  };
}

export type GetTodosResult = { data?: Todo[]; error?: string };

/**
 * Server-only: fetch todos for a known user (e.g. from layout). Skips auth to avoid duplicate getUser().
 * Use getTodosAction() when called from the client (needs auth).
 */
export async function getTodosForUser(userId: string): Promise<GetTodosResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('todos')
    .select('id, profile_id, title, date, completed, position, created_at, updated_at')
    .eq('profile_id', userId)
    .order('date', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return { error: error.message, data: [] };
  return { data: (data ?? []).map(mapRowToTodo) };
}

export async function getTodosAction(): Promise<GetTodosResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: [], error: authError?.message ?? 'Not authenticated' };
  }
  return getTodosForUser(user.id);
}

export type AddTodoResult = { data?: Todo; error?: string };

export async function addTodoAction(title: string, date: string): Promise<AddTodoResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError?.message ?? 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('todos')
    .insert({
      profile_id: user.id,
      title,
      date,
      completed: false,
      position: 0,
    })
    .select('id, profile_id, title, date, completed, position, created_at, updated_at')
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: 'No data returned' };
  return { data: mapRowToTodo(data as DbRow) };
}

export type UpdateTodoResult = { error?: string };

export async function toggleTodoAction(id: string, completed: boolean): Promise<UpdateTodoResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('todos').update({ completed }).eq('id', id);
  return error ? { error: error.message } : {};
}

export async function updateTodoDateAction(id: string, date: string): Promise<UpdateTodoResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('todos').update({ date }).eq('id', id);
  return error ? { error: error.message } : {};
}

export async function updateTodoTitleAction(id: string, title: string): Promise<UpdateTodoResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('todos').update({ title: title.trim() || 'Untitled' }).eq('id', id);
  return error ? { error: error.message } : {};
}

export async function deleteTodoAction(id: string): Promise<UpdateTodoResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('todos').delete().eq('id', id);
  return error ? { error: error.message } : {};
}

export type ReorderTodosResult = { error?: string };

/**
 * Reorder todos for a given date. todoIds must be the full ordered list of todo ids for that date.
 * Updates position to 0, 1, 2, ... for each id.
 */
export async function reorderTodosAction(
  date: string,
  todoIds: string[]
): Promise<ReorderTodosResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError?.message ?? 'Not authenticated' };
  }
  for (let i = 0; i < todoIds.length; i++) {
    const { error } = await supabase
      .from('todos')
      .update({ position: i })
      .eq('id', todoIds[i])
      .eq('profile_id', user.id)
      .eq('date', date);
    if (error) return { error: error.message };
  }
  return {};
}
