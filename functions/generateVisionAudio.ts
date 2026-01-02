import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// A standard, calming voice (Rachel)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; 

Deno.serve(async (req) => {
    // CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
    
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders, status: 204 });
    }

    try {
        // This function is called via GET request from the <Audio> element
        const url = new URL(req.url);
        const { title, affirmation, goal } = Object.fromEntries(url.searchParams.entries());

        if (!title || !affirmation || !goal) {
            return new Response(JSON.stringify({ error: 'Missing required query parameters' }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
        if (!apiKey) {
            throw new Error("ElevenLabs API Key is not configured.");
        }

        // Construct the visualization script from URL-decoded parameters
        const script = `
            Take a deep, calming breath.
            Let's visualize your goal: ${decodeURIComponent(title)}.
            Bring to mind the feeling of achieving this. What does it feel like?
            Repeat this affirmation to yourself, feeling its truth: ${decodeURIComponent(affirmation)}.
            Your clear outcome is: ${decodeURIComponent(goal)}.
            You are capable. You are on the path.
            Hold this feeling for a moment.
            When you are ready, take another deep breath, and open your eyes.
        `;

        const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: script,
                model_id: "eleven_multilingual_v2",
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} ${errorBody}`);
        }

        return new Response(response.body, {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });

    } catch (error) {
        console.error('Error generating audio:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});