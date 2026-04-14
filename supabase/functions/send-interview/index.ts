import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // ✅ Read body ONCE and destructure everything from it

    const {
      to_email,
      to_name,
      job_title,
      interview_date,
      written_time,
      f2f_time,
    } = await req.json();

    console.log("Payload received:", {
      to_email,
      to_name,
      job_title,
      interview_date,
      written_time,
      f2f_time,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DILG HR <onboarding@resend.dev>",
        to: [to_email],
        subject: `Interview Invitation: ${job_title}`,
        html: `     
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151; line-height: 1.6;">
            <h2 style="color: #111827;">Interview & Assessment Invitation</h2>
            
            <p>Dear ${to_name},</p>
            
            <p>Thank you for your interest in applying for the <strong>${job_title}</strong> position at the <strong>DILG Regional Office XIII</strong>.</p>
            
            <p>We are pleased to inform you that you have been shortlisted and are hereby invited to attend the interview and assessment process. Please note that this session includes a written examination.</p>

            <div style="background-color: #EFF6FF; padding: 20px; border-left: 4px solid #3B82F6; margin: 24px 0;">
              <p style="margin: 0 0 12px 0; color: #1e3a8a; font-weight: bold; text-transform: uppercase; font-size: 14px;">Schedule Details:</p>
              
              <p style="margin: 4px 0;"><strong>Date:</strong> ${interview_date}</p>
              
              <p style="margin: 8px 0 4px 0;"><strong>Time:</strong></p>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>${written_time}</strong> - Written Examination</li>
                <li><strong>${f2f_time}</strong> - Face-to-Face Interview</li>
              </ul>
              
              <p style="margin: 12px 0 0 0;"><strong>Venue:</strong><br>
              LGRRC, DILG Regional Office XIII<br>
              Purok 1A, Upper Doongan, Butuan City</p>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ul>
              <li><strong>Confirm Attendance:</strong> Please reply to this email or contact the Personnel Section at <strong>0977-835-4100</strong>.</li>
              <li><strong>Arrival:</strong> We request that you arrive at least <strong>ten (10) minutes</strong> before your scheduled time.</li>
            </ul>

            <p>Should you have any questions or require further assistance, please feel free to contact us. We look forward to your participation.</p>
            
            <br/>
            <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              <strong>Personnel Section</strong><br>
              DILG Regional Office XIII
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.error("Resend API Error:", data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
