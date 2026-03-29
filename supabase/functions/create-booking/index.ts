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
    const body = await req.json();
    const { date, timeSlot, name, email, phone, groupSize } = body;

    // Validate required fields
    if (!date || !timeSlot || !name || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields (date, timeSlot, name, email)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate date
    if (!VALID_DATES.includes(date)) {
      return new Response(JSON.stringify({ error: 'Invalid date. Events are only on May 7-8, 2026.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate time slot
    if (!VALID_TIME_SLOTS.includes(timeSlot)) {
      return new Response(JSON.stringify({ error: 'Invalid time slot.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate name
    const trimmedName = String(name).trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
      return new Response(JSON.stringify({ error: 'Name must be 1-100 characters.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate email
    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate phone (optional)
    const trimmedPhone = phone ? String(phone).trim() : '';
    if (trimmedPhone.length > 20) {
      return new Response(JSON.stringify({ error: 'Phone number too long.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate group size
    const size = Number(groupSize);
    if (!Number.isInteger(size) || size < 1 || size > MAX_GROUP_SIZE) {
      return new Response(JSON.stringify({ error: `Group size must be between 1 and ${MAX_GROUP_SIZE}.` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check slot availability
    const { data: existing, error: fetchError } = await supabase
      .from('bookings')
      .select('group_size')
      .eq('date', date)
      .eq('time_slot', timeSlot);

    if (fetchError) {
      console.error('Error checking availability:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to check availability.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalBooked = (existing || []).reduce((sum: number, b: { group_size: number }) => sum + b.group_size, 0);
    const available = MAX_GROUP_SIZE - totalBooked;

    if (size > available) {
      return new Response(JSON.stringify({ error: `Only ${available} spot(s) remaining for this time slot.` }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert booking
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        date,
        time_slot: timeSlot,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        group_size: size,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting booking:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create booking.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, booking }), {
      status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
