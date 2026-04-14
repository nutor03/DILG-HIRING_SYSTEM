import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. This is the block that fixes the CORS error!
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    const { to_email, to_name, job_title } = await req.json();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'DILG HR <onboarding@resend.dev>', 
        to: [to_email],
        subject: `Update on your application for ${job_title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Congratulations ${to_name}!</h2>
            <p>We are thrilled to inform you that you have been <strong>approved</strong> for the <strong>${job_title}</strong> position at DILG.</p>
            <p>Our Human Resources team will be reaching out to you shortly with your official onboarding packet and next steps.</p>
            <p>Welcome to the team!</p>
            <br/>
            <p style="color: #6b7280; font-size: 14px;">- DILG Human Resources</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    
    if (res.ok) {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});