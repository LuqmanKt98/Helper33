import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import sgMail from 'npm:@sendgrid/mail@8.1.1';

// Initialize SendGrid
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Admin notification emails will not be sent.');
}

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || 'support@dobry.life';
const ADMIN_EMAIL = 'contact@dobrylife.com'; // Changed to contact@dobrylife.com

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { submissionId } = await req.json();
    const appUrl = req.headers.get('origin');

    if (!submissionId) {
      throw new Error("Submission ID is required.");
    }

    // --- Fetch the submission data using service role for guaranteed access ---
    const submission = await base44.asServiceRole.entities.StorytellerApplication.get(submissionId);
    if (!submission) {
      throw new Error(`Submission with ID ${submissionId} not found.`);
    }

    // --- Construct the email ---
    const reviewUrl = `${appUrl}/AdminStoryReview`;
    
    let fileLinksHtml = '';
    if (submission.file_evidence && submission.file_evidence.length > 0) {
        fileLinksHtml = '<h3>Uploaded Files:</h3><ul>';
        submission.file_evidence.forEach(file => {
            fileLinksHtml += `<li><a href="${file.url}" target="_blank">${file.filename || 'View File'}</a></li>`;
        });
        fileLinksHtml += '</ul>';
    }

    let supportingLinksHtml = '';
    if (submission.supporting_links && submission.supporting_links.length > 0) {
        supportingLinksHtml = '<h3>Supporting Links:</h3><ul>';
        submission.supporting_links.forEach(link => {
            supportingLinksHtml += `<li><a href="${link}" target="_blank">${link}</a></li>`;
        });
        supportingLinksHtml += '</ul>';
    }

    const emailBody = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>New Story Submission on DobryLife</h2>
        <p>A new story has been submitted for your review.</p>
        <hr>
        <h3>Submission Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${submission.name}</li>
          <li><strong>Email:</strong> ${submission.email}</li>
          <li><strong>Story Topic:</strong> ${submission.story_topic}</li>
          <li><strong>Short Bio:</strong> ${submission.bio}</li>
        </ul>
        <h3>Story Content:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${submission.story_submission}</div>
        
        ${submission.primary_link ? `<h3>Primary Link:</h3><p><a href="${submission.primary_link}">${submission.primary_link}</a></p>` : ''}
        
        ${supportingLinksHtml}
        
        ${fileLinksHtml}

        <hr>
        <p style="text-align: center;">
          <a href="${reviewUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Review Submissions
          </a>
        </p>
      </div>
    `;

    // --- Send the email ---
    if (SENDGRID_API_KEY) {
        await sgMail.send({
            to: ADMIN_EMAIL,
            from: {
                email: FROM_EMAIL,
                name: 'DobryLife Story Hub'
            },
            subject: `New Story Submission: "${submission.story_topic}"`,
            html: emailBody,
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in notifyAdminOnStorySubmission function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});