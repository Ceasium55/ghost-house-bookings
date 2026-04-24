import { supabase } from '@/integrations/supabase/client';

export type AdminActivity = 'haunted-house' | 'escape-room' | 'chess';

const TABLE_MAP: Partial<Record<AdminActivity, string>> = {
  'haunted-house': 'haunted_house_admins',
  'escape-room': 'escape_room_admins',
};

export async function isSuperAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const { data } = await supabase
    .from('super_admins')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  return !!data;
}

export async function isActivityAdmin(email: string | undefined, activity: AdminActivity): Promise<boolean> {
  if (!email) return false;
  const table = TABLE_MAP[activity];
  if (!table) return false; // chess: super-admin only
  const { data } = await supabase
    .from(table as any)
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  return !!data;
}

export async function canAccessActivity(email: string | undefined, activity: AdminActivity): Promise<boolean> {
  if (!email) return false;
  const [superAdmin, activityAdmin] = await Promise.all([
    isSuperAdmin(email),
    isActivityAdmin(email, activity),
  ]);
  return superAdmin || activityAdmin;
}

export async function isAnyAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const superAdmin = await isSuperAdmin(email);
  if (superAdmin) return true;
  const activities: AdminActivity[] = ['haunted-house', 'escape-room'];
  const results = await Promise.all(activities.map(a => isActivityAdmin(email, a)));
  return results.some(Boolean);
}

export async function getAccessibleActivities(email: string | undefined): Promise<AdminActivity[]> {
  if (!email) return [];
  const superAdmin = await isSuperAdmin(email);
  if (superAdmin) return ['haunted-house', 'escape-room', 'chess'];
  const activities: AdminActivity[] = ['haunted-house', 'escape-room'];
  const results = await Promise.all(activities.map(a => isActivityAdmin(email, a)));
  return activities.filter((_, i) => results[i]);
}
