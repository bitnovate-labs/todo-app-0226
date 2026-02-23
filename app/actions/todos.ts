'use server';

import { createClient } from '@/lib/supabase/server';
import type { Todo } from '@/lib/todos';

type DbRow = {
  id: string;
  profile_id: string;
  title: string;
  date: string;
  completed: boolean;
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
  };
}

export type GetTodosResult = { data?: Todo[]; error?: string };

export async function getTodosAction(): Promise<GetTodosResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: [], error: authError?.message ?? 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('todos')
    .select('id, profile_id, title, date, completed, created_at, updated_at')
    .eq('profile_id', user.id)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return { error: error.message, data: [] };
  return { data: (data ?? []).map(mapRowToTodo) };
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
    })
    .select('id, profile_id, title, date, completed, created_at, updated_at')
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

export async function deleteTodoAction(id: string): Promise<UpdateTodoResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('todos').delete().eq('id', id);
  return error ? { error: error.message } : {};
}
