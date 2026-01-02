import { createClient } from 'npm:@base44/sdk@0.7.1';

const base44 = createClient(Deno.env.get('BASE44_APP_ID'));
const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const topic = url.searchParams.get('topic') || 'donations';

    if (!token) {
      return new Response("Missing confirmation token.", { status: 400 });
    }

    // Find the request by token and topic
    const { data: results } = await base44.asServiceRole.entities.NotificationRequest.filter(
        { token, topic }, undefined, 1
    );

    if (!results || results.length === 0) {
      return new Response("Invalid or expired confirmation link.", { status: 400 });
    }

    const requestToConfirm = results[0];

    // Update the record to mark it as confirmed
    await base44.asServiceRole.entities.NotificationRequest.update(requestToConfirm.id, {
      confirmed: true,
      confirmed_at: new Date().toISOString()
    });

    // Redirect to a friendly thank-you page
    const redirectUrl = new URL(`/notify-thank-you?topic=${encodeURIComponent(topic)}`, APP_BASE_URL);
    
    return Response.redirect(redirectUrl.href, 302);

  } catch (e) {
    console.error("Confirmation error:", e.message);
    return new Response("Server error during confirmation.", { status: 500 });
  }
});