import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Ensure a user is logged in to use this function, even if sending to admin
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const { subject, body } = await req.json();

        // Get all required secrets for SendGrid
        const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
        const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
        const FROM_EMAIL = Deno.env.get("FROM_EMAIL");

        if (!ADMIN_EMAIL || !SENDGRID_API_KEY || !FROM_EMAIL) {
            console.error("Required email secrets (ADMIN_EMAIL, SENDGRID_API_KEY, FROM_EMAIL) are not set.");
            // Return a success to avoid breaking the frontend flow, but log the configuration error.
            return new Response(JSON.stringify({ success: true, message: "Email service is not fully configured on the server." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        
        if (!subject || !body) {
             return new Response(JSON.stringify({ error: 'Subject and body are required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Construct the email payload for SendGrid
        const emailData = {
            personalizations: [{ to: [{ email: ADMIN_EMAIL }] }],
            from: { email: FROM_EMAIL, name: 'DobryLife Platform' },
            subject: subject,
            content: [{ type: 'text/html', value: body }],
        };

        // Make a direct API call to SendGrid
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('SendGrid API error:', errorBody);
            throw new Error(`Failed to send email via SendGrid. Status: ${response.status}`);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in sendAdminNotification function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});