import { supabase } from '@/integrations/supabase/client';

export type ChessCategory = 's1-s3' | 's4-s7';

export const CHESS_CATEGORY_CAPACITY = 16;

export const CHESS_CATEGORIES: { id: ChessCategory; label: string }[] = [
  { id: 's1-s3', label: 'S1 - S3' },
  { id: 's4-s7', label: 'S4 - S7' },
];

export interface ChessRegistration {
  id: string;
  tournament_id: string;
  category: ChessCategory;
  created_at: string;
}

export async function getChessAvailability(): Promise<Record<ChessCategory, { taken: number; available: number; capacity: number }>> {
  const fallback = {
    's1-s3': { taken: 0, available: CHESS_CATEGORY_CAPACITY, capacity: CHESS_CATEGORY_CAPACITY },
    's4-s7': { taken: 0, available: CHESS_CATEGORY_CAPACITY, capacity: CHESS_CATEGORY_CAPACITY },
  };
  try {
    const { data, error } = await supabase.functions.invoke('chess-availability', { body: {} });
    if (error || !data) return fallback;
    return data as typeof fallback;
  } catch {
    return fallback;
  }
}

export async function registerChess(category: ChessCategory): Promise<{ registration?: ChessRegistration; error?: string; full?: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('chess-register', { body: { category } });
    if (error) {
      // Edge function HTTP errors come back here; try to extract JSON
      const ctx: any = error;
      const ctxData = ctx?.context?.body;
      if (ctxData?.full) return { error: 'Category is full', full: true };
      return { error: 'Registration failed' };
    }
    if ((data as any)?.full) return { error: 'Category is full', full: true };
    return { registration: (data as any)?.registration };
  } catch {
    return { error: 'Registration failed' };
  }
}

export async function getChessRegistrations(): Promise<ChessRegistration[]> {
  const { data, error } = await supabase
    .from('chess_registrations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching chess registrations:', error);
    return [];
  }
  return (data || []) as ChessRegistration[];
}

export async function deleteChessRegistration(id: string): Promise<boolean> {
  const { error } = await supabase.functions.invoke('chess-delete-registration', {
    body: { registrationId: id },
  });
  if (error) {
    console.error('Error deleting chess registration:', error);
    return false;
  }
  return true;
}
