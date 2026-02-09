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
    const body: NotificationRequest = await req.json();
    const { action, request_id, requester_name, requester_email, notes, download_token } = body;

    console.log(`Processing ${action} for request ${request_id}`);

    // Validate required fields
    if (!action || !request_id || !requester_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: action, request_id, requester_email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate action type
    if (!["new_request", "approved"].includes(action)) {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // For "approved" action, require authentication and admin role
    if (action === "approved") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        console.error("Missing or invalid Authorization header for approved action");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Create Supabase client with the user's auth token
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      // Verify the JWT and get user claims
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

      if (claimsError || !claimsData?.claims) {
        console.error("Failed to verify JWT:", claimsError);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const userId = claimsData.claims.sub;

      // Check if user has admin role using service role client for RLS bypass
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: roleData, error: roleError } = await serviceClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        console.error("User is not an admin:", userId);
        return new Response(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Validate download_token for approved action
      if (!download_token) {
        return new Response(
          JSON.stringify({ error: "download_token is required for approved action" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log(`Admin ${userId} approved request ${request_id}`);
    }

    // For "new_request" action, verify the request exists in the database
    // This prevents arbitrary email spam since requests must be created first via RLS-protected insert
    if (action === "new_request") {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: requestData, error: requestError } = await serviceClient
        .from("resume_requests")
        .select("id, requester_email, requester_name")
        .eq("id", request_id)
        .maybeSingle();

      if (requestError || !requestData) {
        console.error("Request not found:", request_id);
        return new Response(
          JSON.stringify({ error: "Request not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify the email matches what's in the database to prevent spoofing
      if (requestData.requester_email !== requester_email) {
        console.error("Email mismatch for request:", request_id);
        return new Response(
          JSON.stringify({ error: "Invalid request data" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Get base URL from environment or use a default
    const baseUrl = Deno.env.get("SITE_URL") || "https://nasyhub.lovable.app";
    
    // Admin email - in production, fetch this from profiles or config
    const adminEmail = "nasy@nasyhub.com";

    if (action === "new_request") {
      // Send notification to admin about new resume request
      const emailResponse = await resend.emails.send({
        from: "NaSy Hub <noreply@nasyhub.com>",
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
      // Send approval email to requester with download link
      const downloadUrl = `${baseUrl}/resume/download/${download_token}`;
      
      const emailResponse = await resend.emails.send({
        from: "NaSy Hub <noreply@nasyhub.com>",
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
    }

    // This shouldn't be reached due to earlier validation
    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-resume-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
