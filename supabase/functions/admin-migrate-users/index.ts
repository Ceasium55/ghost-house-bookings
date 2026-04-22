import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const log: any[] = [];

  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  log.push({ existing: users.map(u => ({ id: u.id, email: u.email })) });

  const TARGET = 'usertest@admin.local';
  const ORIGINAL = 'smskackov@outlook.com';

  let target = users.find(u => u.email === TARGET);
  const original = users.find(u => u.email === ORIGINAL);

  if (original && !target) {
    const { error: e } = await supabase.auth.admin.updateUserById(original.id, {
      email: TARGET, password: 'usertest', email_confirm: true,
    });
    if (e) return new Response(JSON.stringify({ step: 'migrate', error: e.message }), { status: 500 });
    target = original;
    log.push('migrated original to ' + TARGET);
  } else if (!target) {
    const { data, error: e } = await supabase.auth.admin.createUser({
      email: TARGET, password: 'usertest', email_confirm: true,
    });
    if (e) return new Response(JSON.stringify({ step: 'create', error: e.message }), { status: 500 });
    target = data.user!;
    log.push('created ' + TARGET);
  } else {
    const { error: e } = await supabase.auth.admin.updateUserById(target.id, { password: 'usertest' });
    if (e) return new Response(JSON.stringify({ step: 'reset', error: e.message }), { status: 500 });
    log.push('reset password for ' + TARGET);
  }

  for (const u of users) {
    if (u.id !== target!.id) {
      const { error: e } = await supabase.auth.admin.deleteUser(u.id);
      log.push(e ? { deleteFail: u.email, err: e.message } : { deleted: u.email });
    }
  }

  return new Response(JSON.stringify({ ok: true, log }, null, 2), { headers: { 'Content-Type': 'application/json' } });
});
