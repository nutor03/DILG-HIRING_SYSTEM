import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Fix
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    // Grabbing the specific rejection_reason variable here!
    const { to_email, to_name, job_title, rejection_reason } = await req.json();

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
            <h2>Dear ${to_name},</h2>
            <p>Thank you for your interest in joining the DILG workforce!</p> 
            <p>Upon thorough review of your application documents, we regret to inform you that you have failed to meet the minimum Qualification Standards requirements for the <strong>${job_title}</strong> position due to the following reason:</p>
            
            <div style=" padding: 16px; border-left: 4px solid margin: 24px 0;">
              <p style="margin: 0; font-weight: bold; color: #111827;">${rejection_reason}</p>
            </div>

            <p>We hope for your understanding. Thank you.</p>
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