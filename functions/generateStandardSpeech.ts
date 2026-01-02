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
        
        // Try to get user but don't require authentication
        // This allows the function to work even if user is not logged in
        let user = null;
        try {
            user = await base44.auth.me();
        } catch (authError) {
            console.log('User not authenticated, proceeding with public access');
        }

        const { text, voiceId = '21m00Tcm4TlvDq8ikWAM', stability = 0.5, similarity_boost = 0.75, style = 0, use_speaker_boost = true } = await req.json();
        
        if (!text) {
            return new Response(JSON.stringify({ error: 'Missing text parameter' }), { 
                status: 400, 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': '*' 
                } 
            });
        }

        const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
        if (!apiKey) {
            console.log('ElevenLabs API Key not configured, returning fallback');
            return new Response(JSON.stringify({ 
                error: 'ElevenLabs API Key not configured',
                fallback: true 
            }), { 
                status: 200, // Return 200 so client knows to use fallback
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': '*' 
                } 
            });
        }
        
        const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
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
                        stability: stability,
                        similarity_boost: similarity_boost,
                        style: style,
                        use_speaker_boost: use_speaker_boost,
                    },
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error(`ElevenLabs API error (${response.status}):`, errorText);
                
                // Return fallback flag with 200 status for client to use browser TTS
                return new Response(JSON.stringify({ 
                    error: `ElevenLabs API returned ${response.status}`,
                    fallback: true,
                    details: response.status === 503 ? 'Service temporarily unavailable' : errorText
                }), {
                    status: 200, // Changed from response.status to 200
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            const audioBuffer = await response.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

            return new Response(JSON.stringify({ audio_base64: base64Audio }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error('ElevenLabs API timeout');
                return new Response(JSON.stringify({ 
                    error: 'Request timeout',
                    fallback: true 
                }), {
                    status: 200, // Changed to 200
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }
            
            throw fetchError;
        }

    } catch (error) {
        console.error("Error in generateStandardSpeech function:", error.message);
        
        // Always return a valid response with fallback flag instead of error
        return new Response(JSON.stringify({ 
            error: `Failed to generate speech: ${error.message}`,
            fallback: true 
        }), {
            status: 200, // Changed from 500 to 200
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
});