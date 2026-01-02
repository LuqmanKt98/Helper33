
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import sgMail from 'npm:@sendgrid/mail@8.1.1';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Emails will not be sent.');
}

// --- Moderation Logic ---
const RE_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const RE_PHONE = /\b(\+?\d[\d\-\s().]{7,}\d)\b/g;

const BLOCKLIST = ["murdered by", "i know who did it", "kill yourself", "address is", "ssn", "bank account"];
const GRAPHIC = ["blood everywhere", "open wound", "needle in", "corpse"];

function cleanMemory(text) {
    let cleanedText = text.replace(RE_EMAIL, "[redacted email]");
    cleanedText = cleanedText.replace(RE_PHONE, "[redacted phone]");
    return cleanedText;
}

function scoreRisk(text) {
    const t = text.toLowerCase();
    let score = 0;
    if (BLOCKLIST.some(p => t.includes(p))) score += 2;
    if (GRAPHIC.some(g => t.includes(g))) score += 1;
    if (t.includes("http://") || t.includes("https://")) score += 1;
    return score;
}

function moderate(payload) {
    const m = payload.memoryText || "";
    const m_clean = cleanMemory(m);
    const risk = scoreRisk(m_clean);
    const status = risk >= 2 ? "pending" : "approved";
    return { ...payload, memoryText: m_clean, status: status, riskScore: risk };
}
// --- End Moderation Logic ---


Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // 1. Moderate the submission
    const moderatedPayload = moderate(payload);

    // 2. Save submission to the database
    const { data: memory, error } = await base44.asServiceRole.entities.Memory.create(moderatedPayload);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // 3. Send emails if SendGrid is configured
    if (SENDGRID_API_KEY) {
        const fromEmail = Deno.env.get('FROM_EMAIL') || 'support@dobry.life';
        const archiveEmail = Deno.env.get('ARCHIVE_EMAIL') || 'archive@dobry.life';

        // Confirmation to user
        const userConfirmationMsg = {
            to: moderatedPayload.email,
            from: {
                email: fromEmail,
                name: 'DobryLife Memorials'
            },
            subject: 'Thank You for Sharing Your Memory of Yuriy',
            html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2>Thank You, ${moderatedPayload.fullName}.</h2>
                    <p>We have safely received your beautiful memory of Dr. Yuriy Dobry. Your story is a gift that helps keep his legacy of compassion alive, and we are deeply grateful.</p>
                    <p>Our team will review it with care. If approved, it may appear on our public memorial page.</p>
                    <p>With gratitude,</p>
                    <p><strong>The DobryLife Team</strong></p>
                    <hr>
                    <p style="font-size: 12px; color: #777;">
                        <em>Your Submission:</em><br>
                        ${moderatedPayload.memoryText.substring(0, 200)}...
                    </p>
                </div>
            `,
        };
        await sgMail.send(userConfirmationMsg);

        // Notification to admin
        const adminNotificationMsg = {
            to: archiveEmail,
            from: {
                email: fromEmail,
                name: 'DobryLife System'
            },
            subject: `New Memory Submitted: ${moderatedPayload.status} (Risk: ${moderatedPayload.riskScore})`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2>New Memory Submission</h2>
                    <p>A new memory has been submitted and processed by the moderation bot.</p>
                    <ul>
                        <li><strong>Author:</strong> ${moderatedPayload.fullName}</li>
                        <li><strong>Email:</strong> ${moderatedPayload.email}</li>
                        <li><strong>Status:</strong> ${moderatedPayload.status}</li>
                        <li><strong>Risk Score:</strong> ${moderatedPayload.riskScore}</li>
                    </ul>
                    <hr>
                    <h3>Memory Text:</h3>
                    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${moderatedPayload.memoryText}</p>
                    <p>You can review this submission in the DobryLife admin dashboard under the 'Memory' entity.</p>
                </div>
            `
        };
        await sgMail.send(adminNotificationMsg);
    }

    return new Response(JSON.stringify({ success: true, memoryId: memory.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in submitMemory function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
