import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VALID_DATES = ['2026-05-07', '2026-05-08'];
const VALID_TIME_SLOTS = [
  '10:00', '10:20', '10:40',
  '11:00', '11:20', '11:40',
  '12:00', '12:20', '12:40',
  '13:00', '13:20', '13:40',
  '14:00', '14:20', '14:40',
];
const MAX_GROUP_SIZE = 6;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, timeSlot } = await req.json();

    if (!date || !VALID_DATES.includes(date)) {
      return new Response(JSON.stringify({ error: 'Invalid date' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!timeSlot || !VALID_TIME_SLOTS.includes(timeSlot)) {
      return new Response(JSON.stringify({ error: 'Invalid time slot' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from('bookings')
      .select('group_size')
      .eq('date', date)
      .eq('time_slot', timeSlot);

    if (error) {
      console.error('Error checking availability:', error);
      return new Response(JSON.stringify({ error: 'Failed to check availability' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalBooked = (data || []).reduce((sum: number, b: { group_size: number }) => sum + b.group_size, 0);
    const available = MAX_GROUP_SIZE - totalBooked;

    return new Response(JSON.stringify({ available }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
