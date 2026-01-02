import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
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
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        const { text, supportCoachId } = await req.json();
        if (!text || !supportCoachId) {
            return new Response(JSON.stringify({ error: 'Missing text or supportCoachId' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        const coach = await base44.entities.SupportCoach.get(supportCoachId);
        const voiceId = coach?.voice_profile_id;
        
        if (!voiceId) {
            const errorMessage = "No voice profile ID is associated with this coach.";
            console.error(errorMessage, "Coach ID:", supportCoachId);
            return new Response(JSON.stringify({ error: errorMessage }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
        if (!apiKey) {
            const errorMessage = "ElevenLabs API Key is not set in app secrets.";
            console.error(errorMessage);
            return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        
        const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => response.text());
            const errorMessage = typeof errorBody === 'string' ? errorBody : (errorBody.detail?.message || JSON.stringify(errorBody));
            console.error("ElevenLabs API error:", errorMessage);
            throw new Error(`ElevenLabs API error: ${errorMessage}`);
        }

        return new Response(response.body, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error("Error in generateClonedSpeech function:", error.message);
        return new Response(JSON.stringify({ error: `Failed to generate speech: ${error.message}` }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
});