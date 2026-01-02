import sgMail from 'npm:@sendgrid/mail@8.1.1';
import { encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

sgMail.setApiKey(Deno.env.get("SENDGRID_API_KEY"));

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || 'support@dobry.life';
const ARCHIVE_EMAIL = Deno.env.get("ARCHIVE_EMAIL") || 'archive@dobry.life';

export async function sendAgencyEmail({ to, cc, subject, text, pdfBytes, filename }) {
  const msg = {
    to,
    cc,
    bcc: ARCHIVE_EMAIL,
    from: {
      email: FROM_EMAIL,
      name: 'DobryLife Community Action'
    },
    subject,
    html: text.replace(/\n/g, '<br>'),
    attachments: pdfBytes ? [{
      content: encode(pdfBytes), // Deno-compatible base64 encoding
      filename: filename || "submission.pdf",
      type: "application/pdf",
      disposition: "attachment"
    }] : []
  };
  await sgMail.send(msg);
}

export async function sendSupporterCopy({ email, subject, text, pdfBytes, filename }) {
  await sgMail.send({
    to: email,
    from: {
      email: FROM_EMAIL,
      name: 'DobryLife Community Action'
    },
    subject,
    html: text.replace(/\n/g, '<br>'),
    attachments: pdfBytes ? [{
      content: encode(pdfBytes),
      filename: filename || "your_copy.pdf",
      type: "application/pdf",
      disposition: "attachment"
    }] : []
  });
}