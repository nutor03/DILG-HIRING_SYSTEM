import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    // Notice we extract `recommended_role` here alongside the standard fields
    const { to_email, to_name, job_title, recommended_role } = await req.json();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'DILG HR <onboarding@resend.dev>', 
        to: [to_email],
        subject: `Update on your application regarding: ${job_title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
            <h2 style="color: #0A1F5C;">Hello ${to_name},</h2>
            <p>Thank you for taking the time to apply for the <strong>${job_title}</strong> position.</p>
            <p>While we were impressed by your background, we have decided to move forward with other candidates whose qualifications more closely match the specific requirements for this particular role.</p>
            <div style="background-color: #f3f4f6; border-left: 4px solid #8b5cf6; padding: 16px; margin: 24px 0;">
              <p style="margin-top: 0;"><strong>Alternative Opportunity</strong></p>
              <p style="margin-bottom: 0;">However, our review team noted that your skills and experience align very well with our current opening for a <strong>${recommended_role}</strong>. We highly encourage you to submit an application for this position.</p>
            </div>
            <p>We appreciate your interest in joining our team and hope to review an application from you for the recommended role soon.</p>
            <br/>
            <p>Best regards,</p>
            <p style="color: #6b7280; font-size: 14px; font-weight: bold;">Human Resources<br/>DILG Regional Office XIII</p>
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