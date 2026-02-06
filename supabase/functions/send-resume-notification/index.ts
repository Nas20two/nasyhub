import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  action: "new_request" | "approved";
  request_id: string;
  requester_name: string;
  requester_email: string;
  notes?: string;
  download_token?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, request_id, requester_name, requester_email, notes, download_token }: NotificationRequest = await req.json();

    console.log(`Processing ${action} for request ${request_id}`);

    if (!action || !request_id || !requester_email) {
      throw new Error("Missing required fields: action, request_id, requester_email");
    }

    // Get base URL from environment or use a default
    const baseUrl = Deno.env.get("SITE_URL") || "https://nasyhub.lovable.app";
    
    // Admin email - in production, fetch this from profiles or config
    const adminEmail = "nasy@nasyhub.com"; // Replace with actual admin email

    if (action === "new_request") {
      // Send notification to admin about new resume request
      const emailResponse = await resend.emails.send({
        from: "NaSy Hub <noreply@nasyhub.com>", // Replace with your verified domain
        to: [adminEmail],
        subject: `New Resume Request from ${requester_name}`,
        html: `
          <h1>New Resume Request</h1>
          <p><strong>Name:</strong> ${requester_name}</p>
          <p><strong>Email:</strong> ${requester_email}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          <p><strong>Request ID:</strong> ${request_id}</p>
          <hr />
          <p>Log in to your admin dashboard to approve or reject this request.</p>
        `,
      });

      console.log("Admin notification sent:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "Admin notified" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else if (action === "approved") {
      if (!download_token) {
        throw new Error("download_token is required for approved action");
      }

      // Send approval email to requester with download link
      const downloadUrl = `${baseUrl}/resume/download/${download_token}`;
      
      const emailResponse = await resend.emails.send({
        from: "NaSy Hub <noreply@nasyhub.com>", // Replace with your verified domain
        to: [requester_email],
        subject: "Your Resume Request Has Been Approved",
        html: `
          <h1>Resume Request Approved!</h1>
          <p>Hi ${requester_name},</p>
          <p>Your request to download the resume has been approved.</p>
          <p>Click the link below to download:</p>
          <p><a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 8px;">Download Resume</a></p>
          <p style="margin-top: 20px;">This link is unique to you and will remain valid for future downloads.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">NaSy Hub</p>
        `,
      });

      console.log("Approval email sent to requester:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "Requester notified" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error("Error in send-resume-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
