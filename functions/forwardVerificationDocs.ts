import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import sgMail from 'npm:@sendgrid/mail@8.1.1';
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

// Initialize SendGrid
const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || 'noreply@dobry.life';
const SUPPORT_EMAIL = 'support@dobrylife.com';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-base44-user-token',
      },
    });
  }

  try {
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY is not configured.");
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    const { coachId } = await req.json();
    if (!coachId) {
      return new Response(JSON.stringify({ error: 'Missing required field: coachId' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // Use service role to fetch data, but validate ownership
    const coach = await base44.asServiceRole.entities.SupportCoach.get(coachId);
    if (coach.created_by !== user.email) {
        return new Response(JSON.stringify({ error: 'Forbidden: You do not own this resource.' }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    const documents = await base44.asServiceRole.entities.AuthorizationDocument.filter({ support_coach_id: coachId });
    if (documents.length === 0) {
        return new Response(JSON.stringify({ message: 'No documents to forward.' }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    
    // Prepare attachments
    const attachments = [];
    for (const doc of documents) {
        try {
            const response = await fetch(doc.file_url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }
            const fileBuffer = await response.arrayBuffer();
            const base64Content = encodeBase64(fileBuffer);
            attachments.push({
                content: base64Content,
                filename: `${doc.document_type}_${doc.id}.pdf`, // Generic name
                type: 'application/pdf',
                disposition: 'attachment',
            });
        } catch (fetchError) {
             console.error(`Could not attach document ${doc.file_url}:`, fetchError.message);
             // Decide if you want to fail the whole process or just skip the attachment
        }
    }
    
    const emailBody = `
      <h3>New Grief Persona Verification Documents Submitted</h3>
      <p>A user has automatically been granted access to build a persona clone after uploading the required documents. Please review the attached files for compliance.</p>
      <ul>
        <li><strong>User Name:</strong> ${user.full_name || 'N/A'}</li>
        <li><strong>User Email:</strong> ${user.email}</li>
        <li><strong>Persona Name:</strong> ${coach.persona_name || 'N/A'}</li>
        <li><strong>Support Coach ID:</strong> ${coach.id}</li>
        <li><strong>Date Submitted:</strong> ${new Date().toUTCString()}</li>
      </ul>
      <p>The user has already proceeded to the next step. This email is for your records and to perform any necessary compliance checks.</p>
    `;

    const msg = {
      to: SUPPORT_EMAIL,
      from: {
        email: FROM_EMAIL,
        name: 'DobryLife System',
      },
      subject: `Verification Docs for Persona: ${coach.persona_name || coach.id}`,
      html: emailBody,
      attachments: attachments,
    };

    await sgMail.send(msg);

    return new Response(JSON.stringify({ success: true, message: 'Documents forwarded successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Error in forwardVerificationDocs function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});