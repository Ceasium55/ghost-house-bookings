import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';


const VALID_CATEGORIES = ['s1-s3', 's4-s7'];
const CATEGORY_CAPACITY = 16;

const generateId = () => Math.floor(1000000 + Math.random() * 9000000).toString();

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Capacity check
    const { count, error: countErr } = await supabase
      .from('chess_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);

    if (countErr) {
      console.error('Count error:', countErr);
      return new Response(JSON.stringify({ error: 'Failed to check capacity' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if ((count ?? 0) >= CATEGORY_CAPACITY) {
      return new Response(JSON.stringify({ error: 'Category is full', full: true }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try a few times to avoid 7-digit collision
    for (let i = 0; i < 5; i++) {
      const tournamentId = generateId();
      const { data, error } = await supabase
        .from('chess_registrations')
        .insert({ tournament_id: tournamentId, category })
        .select()
        .single();

      if (!error && data) {
        return new Response(JSON.stringify({ registration: data }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // If unique violation, retry; otherwise fail
      if (error && error.code !== '23505') {
        console.error('Insert error:', error);
        return new Response(JSON.stringify({ error: 'Failed to register' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Could not generate ID' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
