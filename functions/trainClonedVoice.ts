
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { ElevenLabsClient } from 'npm:elevenlabs@4.5.0';

const elevenlabs = new ElevenLabsClient({
    apiKey: Deno.env.get("ELEVENLABS_API_KEY"),
});

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
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }});
        }

        const { supportCoachId, voiceSamples, personaName } = await req.json();
        
        if (!supportCoachId || !voiceSamples || voiceSamples.length === 0 || !personaName) {
            return new Response(JSON.stringify({ error: 'Missing required fields: supportCoachId, voiceSamples, personaName' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        console.log(`Starting PROFESSIONAL voice training for support coach: ${supportCoachId}`);

        const files = await Promise.all(
            voiceSamples.map(async (sample) => {
                if (!sample.url) throw new Error(`Sample is missing a URL.`);
                const response = await fetch(sample.url);
                if (!response.ok) throw new Error(`Failed to fetch audio sample: ${sample.url}`);
                const buffer = await response.arrayBuffer();
                return {
                    buffer: new Uint8Array(buffer),
                    fileName: sample.url.split('/').pop() || 'sample.mp3'
                };
            })
        );
        
        console.log(`Fetched ${files.length} audio files. Submitting for cloning...`);

        const professionalVoice = await elevenlabs.voices.addProfessional({
            name: `${personaName} (DobryLife Clone - ${supportCoachId.substring(0,5)})`,
            files: files,
            labels: {
                "source": "dobrylife-app",
                "coach_id": supportCoachId,
                "user_id": user.id,
            }
        });

        const professionalVoiceId = professionalVoice.voice_id;
        console.log(`Training submitted. ElevenLabs Professional Voice ID: ${professionalVoiceId}`);

        // Create or update the VoiceProfile and link it to the SupportCoach
        const voiceProfile = await base44.asServiceRole.entities.VoiceProfile.create({
            support_coach_id: supportCoachId,
            display_name: personaName,
            cloning_mode: "fine-tuned",
            training_status: 'training',
            model_artifacts: { model_id: professionalVoiceId, cloning_service: 'elevenlabs_professional' }
        });

        await base44.asServiceRole.entities.SupportCoach.update(supportCoachId, {
            voice_profile_id: voiceProfile.id
        });

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Professional voice training initiated.', 
            professionalVoiceId: professionalVoiceId 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        console.error('Error in trainClonedVoice function:', error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
