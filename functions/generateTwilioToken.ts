import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import twilio from 'npm:twilio@5.2.0';

const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const apiKey = Deno.env.get("TWILIO_API_KEY_SID");
const apiSecret = Deno.env.get("TWILIO_API_KEY_SECRET");

Deno.serve(async (req) => {
  try {
    // Add validation for all required environment variables
    if (!accountSid || !apiKey || !apiSecret) {
      console.error("One or more Twilio environment variables are not configured correctly. Please check TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, and TWILIO_API_KEY_SECRET.");
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing required Twilio credentials for video.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { room } = await req.json();
    if (!room) {
      return new Response(JSON.stringify({ error: 'Missing `room` parameter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const videoGrant = new VideoGrant({
      room: room,
    });

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: user.email, // Use a unique identifier for the user
    });

    token.addGrant(videoGrant);

    return new Response(JSON.stringify({ token: token.toJwt() }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating Twilio token:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});