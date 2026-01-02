import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// This function creates a new private video call room using the Daily.co API.
// It returns the URL of the room, which the frontend can use to join the call.
Deno.serve(async (req) => {
    try {
        // Authenticate the user
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const apiKey = Deno.env.get("DAILY_API_KEY");
        if (!apiKey) {
            console.error("DAILY_API_KEY is not set.");
            return new Response(JSON.stringify({ error: 'Video calling is not configured on the server.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Create a new private room that expires in 1 hour
        const exp = Math.round(Date.now() / 1000) + 3600;
        const options = {
            privacy: 'private',
            properties: {
                exp: exp,
                eject_at_room_exp: true,
            },
        };

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Daily.co API error:", errorBody);
            throw new Error(`Failed to create video room. Status: ${response.status}`);
        }

        const room = await response.json();
        return new Response(JSON.stringify({ url: room.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error("Create Daily room error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});