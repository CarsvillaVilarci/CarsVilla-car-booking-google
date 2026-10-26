import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Supabase Auth "Send SMS" hook target. Supabase calls this function
// instead of a traditional SMS provider when a user requests a phone
// OTP (supabase.auth.signInWithOtp({ phone })). We forward the OTP to
// MSG91's WhatsApp Business API so the user receives it over WhatsApp.
//
// Required Edge Function secrets (set in Supabase dashboard ->
// Edge Functions -> vride-whatsapp-otp -> Secrets):
//   MSG91_AUTH_KEY            - MSG91 account auth key
//   MSG91_WA_INTEGRATED_NUMBER - WhatsApp Business number MSG91 sends from (no +, e.g. 917363846235)
//   MSG91_WA_TEMPLATE_NAME     - approved WhatsApp template name (e.g. vride_otp)
//   MSG91_WA_NAMESPACE         - WhatsApp template namespace from MSG91 console

const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY") || "";
const MSG91_WA_INTEGRATED_NUMBER = Deno.env.get("MSG91_WA_INTEGRATED_NUMBER") || "";
const MSG91_WA_TEMPLATE_NAME = Deno.env.get("MSG91_WA_TEMPLATE_NAME") || "vride_otp";
const MSG91_WA_NAMESPACE = Deno.env.get("MSG91_WA_NAMESPACE") || "";

serve(async (req) => {
  try {
    if (!MSG91_AUTH_KEY || !MSG91_WA_INTEGRATED_NUMBER || !MSG91_WA_NAMESPACE) {
      throw new Error("Missing MSG91 configuration secrets.");
    }

    const payload = JSON.parse(await req.text());

    const phone = payload.user?.phone || payload.phone || "";
    if (!phone) throw new Error("No phone number found in payload.");

    let otp = "";
    if (payload.sms?.otp) otp = payload.sms.otp;
    else if (payload.otp) otp = payload.otp;
    else if (payload.message) {
      const match = payload.message.match(/\b\d{6}\b/);
      if (match) otp = match[0];
    }
    if (!otp) throw new Error("Could not locate the 6-digit OTP.");

    const cleanPhone = phone.replace("+", "");

    const body = JSON.stringify({
      integrated_number: MSG91_WA_INTEGRATED_NUMBER,
      content_type: "template",
      payload: {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: MSG91_WA_TEMPLATE_NAME,
          language: { code: "en", policy: "deterministic" },
          namespace: MSG91_WA_NAMESPACE,
          to_and_components: [
            {
              to: [cleanPhone],
              components: {
                body_1: { type: "text", value: otp },
                button_1: { subtype: "url", type: "text", value: otp },
              },
            },
          ],
        },
      },
    });

    const response = await fetch(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: MSG91_AUTH_KEY,
        },
        body,
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`MSG91 API failed: ${errText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("vride-whatsapp-otp error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
