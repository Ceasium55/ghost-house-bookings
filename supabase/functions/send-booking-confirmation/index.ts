import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, date, timeSlot, groupSize } = await req.json();

    if (!name || !email || !date || !timeSlot || !groupSize) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY');
    const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN');
    const MAILGUN_BASE_URL = Deno.env.get('MAILGUN_BASE_URL');

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_BASE_URL) {
      console.error('Missing Mailgun configuration');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f0a; color: #e0e8e0; padding: 40px 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00ff88; font-size: 28px; margin: 0;">👻 Booking Confirmed!</h1>
          <p style="color: #888; margin-top: 8px;">EEB3 Haunted House</p>
        </div>
        <div style="background: #111; border: 1px solid #222; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; color: #ccc;">Hello <strong style="color: #fff;">${name}</strong>,</p>
          <p style="margin: 0 0 20px; color: #ccc;">Your ghost tour has been booked! Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888;">📅 Date</td><td style="padding: 8px 0; color: #fff; text-align: right;">${formattedDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">🕐 Time</td><td style="padding: 8px 0; color: #fff; text-align: right;">${timeSlot}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">👥 Group Size</td><td style="padding: 8px 0; color: #fff; text-align: right;">${groupSize} person(s)</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">⏱ Duration</td><td style="padding: 8px 0; color: #fff; text-align: right;">15 minutes</td></tr>
          </table>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">See you if you dare... 👻</p>
      </div>
    `;

    const formData = new FormData();
    formData.append('from', `EEB3 Haunted House <noreply@${MAILGUN_DOMAIN}>`);
    formData.append('to', email);
    formData.append('subject', `👻 Booking Confirmed - ${formattedDate} at ${timeSlot}`);
    formData.append('html', htmlBody);

    const response = await fetch(`${MAILGUN_BASE_URL}/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Mailgun error:', result);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: result }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Confirmation email sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
