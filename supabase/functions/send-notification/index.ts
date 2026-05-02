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
            <h2>Hello, ${to_name}!</h2>
            <p>We have successfully received your application for the ${job_title} role.</p>
            <p>Our team is currently reviewing your submission. You will be notified via email of any</p>
            <p>updates regarding your application status, or if we need any additional documents from you</p>
            <br/>
            <p>Thank you for your time and interest!</p>
            <br/>
            <p>Best regards,</p>
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