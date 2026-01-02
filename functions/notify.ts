import { createClient } from 'npm:@base44/sdk@0.7.1';
import sgMail from 'npm:@sendgrid/mail@8.1.1';

// Initialize SDK and SendGrid
const base44 = createClient(Deno.env.get('BASE44_APP_ID'));
if (Deno.env.get("SENDGRID_API_KEY")) {
  sgMail.setApiKey(Deno.env.get("SENDGRID_API_KEY"));
}

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || 'notice@dobry.life';
const ARCHIVE_EMAIL = Deno.env.get("ARCHIVE_EMAIL");
const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  try {
    const { email, topic = 'donations' } = await req.json();
    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
    }

    const token = crypto.randomUUID();
    const ip_address = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("host") || null;

    // "Upsert" logic: find existing request or create a new one.
    const { data: existing } = await base44.asServiceRole.entities.NotificationRequest.filter({ email, topic }, undefined, 1);

    if (existing && existing.length > 0) {
      // If it exists, update token and reset confirmation status
      await base44.asServiceRole.entities.NotificationRequest.update(existing[0].id, {
        token: token,
        confirmed: false,
        confirmed_at: null,
        ip_address: ip_address
      });
    } else {
      // Otherwise, create a new request
      await base44.asServiceRole.entities.NotificationRequest.create({
        email,
        topic,
        token,
        ip_address,
        confirmed: false,
      });
    }

    // Send double opt-in email
    const confirmUrl = `${APP_BASE_URL}/functions/confirmNotification?token=${token}&topic=${encodeURIComponent(topic)}`;
    const msg = {
      to: email,
      bcc: ARCHIVE_EMAIL,
      from: {
          email: FROM_EMAIL,
          name: 'DobryLife'
      },
      subject: `Confirm your DobryLife notification for: ${topic}`,
      text: `Please confirm you'd like updates from DobryLife.\n\nTopic: ${topic}\nConfirm here: ${confirmUrl}\n\nIf you didn’t request this, you can ignore this email.`,
      html: `<p>Please confirm you'd like updates from DobryLife regarding <strong>${topic}</strong>.</p><p><a href="${confirmUrl}"><strong>Click here to confirm</strong></a></p><p>If you didn’t request this, you can safely ignore this email.</p>`
    };
    
    if (Deno.env.get("SENDGRID_API_KEY")) {
        await sgMail.send(msg);
    } else {
        console.warn("SENDGRID_API_KEY not set. Skipping email.")
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error("notify error:", e.message);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});