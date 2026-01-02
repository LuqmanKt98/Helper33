
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import twilio from 'npm:twilio@4.23.0';

// This function initiates a "click-to-call" flow.
// 1. It receives a 'to' number (the family member to call).
// 2. It gets the current user's phone number from their profile.
// 3. It uses Twilio to first call the USER's phone.
// 4. When the user answers, Twilio plays a message and then dials the family member's 'to' number, connecting the two parties.

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.phone_number) {
            return Response.json({ success: false, error: "Your phone number is not set in your profile. Please add it to use the call feature." }, { status: 400 });
        }

        const { to } = await req.json();
        if (!to) {
            return Response.json({ success: false, error: "Recipient's phone number is required." }, { status: 400 });
        }

        const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

        if (!accountSid || !authToken || !fromNumber) {
            return Response.json({ success: false, error: "Twilio credentials are not configured on the server." }, { status: 500 });
        }

        const client = twilio(accountSid, authToken);

        // TwiML to connect the call after the user picks up
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say('Connecting you now. Please wait.');
        twiml.dial(to); // Dial the family member

        await client.calls.create({
            twiml: twiml.toString(),
            to: user.phone_number, // Call the user first
            from: fromNumber,
        });

        return Response.json({ success: true, message: "Call initiated. Your phone will ring shortly." });

    } catch (error) {
        console.error("Twilio call error:", error);
        return Response.json({ success: false, error: error.message || "Failed to initiate call." }, { status: 500 });
    }
});
