import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactRequest {
  name: string;
  email?: string;
  eventType?: string;
  message: string;
}

const ADMIN_INBOX = "info@vibelinkevent.com";
const FROM_ADDRESS = "VibeLink Event <orders@vibelinkevent.com>";

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;

async function checkRateLimit(supabase: any, clientIp: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_function_name: "send-contact-message",
      p_client_ip: clientIp,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("VL_RESEND_API_KEY") ?? Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: "Email service not configured." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const resend = new Resend(resendKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const clientIp = getClientIp(req);
    const allowed = await checkRateLimit(supabase, clientIp);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many messages from this address. Try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: ContactRequest = await req.json();

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const eventType = (body.eventType ?? "").trim();
    const message = (body.message ?? "").trim();

    if (name.length < 2 || name.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name." }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (message.length < 10 || message.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid message length." }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email." }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Save to DB (service role bypasses RLS — that's fine, this function is the
    // only writer; anon never touches the table).
    const { data: inserted, error: insertErr } = await supabase
      .from("vl_contact_messages")
      .insert({
        name,
        email: email || null,
        event_type: eventType || null,
        message,
        user_agent: req.headers.get("user-agent") || null,
        ip_address: clientIp,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("contact_messages insert failed:", insertErr);
      return new Response(
        JSON.stringify({ error: "Could not save message. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messageId = inserted?.id ?? "unknown";
    const escapedMessage = escapeHtml(message).replace(/\n/g, "<br>");

    // Admin notification — send to info@, forwards to vibelinkevent@gmail.com
    const adminHtml = `
      <!DOCTYPE html>
      <html><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px 16px 0 0;padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">New Contact Message</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:14px;">VibeLink Event website</p>
          </div>
          <div style="background:#fff;padding:30px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
              <tr><td style="padding:8px 0;color:#666;width:120px;">Name:</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(name)}</td></tr>
              ${email ? `<tr><td style="padding:8px 0;color:#666;">Email:</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#667eea;">${escapeHtml(email)}</a></td></tr>` : ""}
              ${eventType ? `<tr><td style="padding:8px 0;color:#666;">Event Type:</td><td style="padding:8px 0;">${escapeHtml(eventType)}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#666;">Message ID:</td><td style="padding:8px 0;color:#888;font-family:monospace;font-size:12px;">#${messageId.toString().substring(0, 8).toUpperCase()}</td></tr>
            </table>
            <div style="margin-top:20px;padding-top:20px;border-top:2px dashed #ddd;">
              <p style="color:#666;font-size:13px;margin:0 0 10px 0;">Message:</p>
              <div style="background:#f8f9fa;padding:16px;border-radius:8px;color:#333;font-size:14px;line-height:1.6;">${escapedMessage}</div>
            </div>
            ${email ? `
            <div style="text-align:center;margin-top:25px;">
              <a href="mailto:${escapeHtml(email)}?subject=Re: Your message to VibeLink Event" style="display:inline-block;background:#667eea;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Reply to ${escapeHtml(name)}</a>
            </div>` : ""}
          </div>
          <div style="text-align:center;padding:20px;color:#888;font-size:12px;">
            View all messages in your <a href="https://vibelinkevent.com/admin" style="color:#667eea;">admin panel</a>.
          </div>
        </div>
      </body></html>
    `;

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [ADMIN_INBOX],
      reply_to: email || undefined,
      subject: `📨 New Contact: ${name}${eventType ? ` (${eventType})` : ""}`,
      html: adminHtml,
    });

    // Visitor auto-acknowledgement — only if they gave an email
    if (email) {
      const ackHtml = `
        <!DOCTYPE html>
        <html><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;">
          <div style="max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px 16px 0 0;padding:40px 30px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:26px;">We got your message</h1>
              <p style="color:rgba(255,255,255,0.9);margin:10px 0 0 0;font-size:15px;">VibeLink Event</p>
            </div>
            <div style="background:#fff;padding:30px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <p style="color:#333;font-size:16px;margin:0 0 20px 0;">Hi <strong>${escapeHtml(name)}</strong>,</p>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px 0;">
                Thanks for reaching out to VibeLink Event. We've received your message and a member of our team will respond within <strong>2 hours</strong> during working hours.
              </p>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 25px 0;">
                If your event is urgent, the fastest way to reach us is on WhatsApp.
              </p>
              <div style="background:#f8f9fa;padding:16px;border-radius:8px;border-left:4px solid #667eea;margin-bottom:25px;">
                <p style="color:#666;font-size:13px;margin:0 0 6px 0;">Your message:</p>
                <div style="color:#333;font-size:14px;line-height:1.6;">${escapedMessage}</div>
              </div>
              <div style="text-align:center;margin-top:20px;">
                <a href="https://wa.me/4915757178561" style="display:inline-block;background:linear-gradient(135deg,#25D366 0%,#128C7E 100%);color:#fff;text-decoration:none;padding:14px 30px;border-radius:8px;font-weight:600;font-size:14px;">💬 Chat with Us on WhatsApp</a>
              </div>
              <p style="color:#888;font-size:13px;margin:30px 0 0 0;text-align:center;">
                Reference: #${messageId.toString().substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div style="text-align:center;padding:20px;color:#888;font-size:12px;">
              © ${new Date().getFullYear()} VibeLink Event. Accra & Berlin.
            </div>
          </div>
        </body></html>
      `;

      await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject: `We got your message — VibeLink Event`,
        html: ackHtml,
      });
    }

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("send-contact-message error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
