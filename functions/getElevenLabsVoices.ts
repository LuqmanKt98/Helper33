
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { ElevenLabsClient } from 'npm:elevenlabs@4.5.2';

const elevenlabs = new ElevenLabsClient({
    apiKey: Deno.env.get("ELEVENLABS_API_KEY"),
});

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-base44-user-token',
            },
        });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }});
        }

        const voices = await elevenlabs.voices.getAll();
        
        const simplifiedVoices = voices.map(voice => ({
            voice_id: voice.voice_id,
            name: voice.name,
            category: voice.category,
            labels: voice.labels,
            preview_url: voice.preview_url,
        }));

        return new Response(JSON.stringify(simplifiedVoices), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        console.error('Error in getElevenLabsVoices function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
