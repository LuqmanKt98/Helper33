import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { designBrief } = await req.json();
        
        // Extract image prompt from design brief
        const imagePrompt = designBrief.imagePrompt || 
            `Create a professional social media graphic with the headline "${designBrief.headline}". 
            Style: modern, clean, ${designBrief.layout}. 
            Colors: ${designBrief.colors?.join(', ')}. 
            Visual elements: ${designBrief.visualElements?.join(', ')}.
            Professional photography style, high quality.`;
        
        // Use Base44's GenerateImage integration
        const result = await base44.integrations.Core.GenerateImage({
            prompt: imagePrompt
        });
        
        return Response.json({ 
            success: true,
            image_url: result.url 
        });
        
    } catch (error) {
        console.error('Error generating image:', error);
        return Response.json({ 
            error: error.message || 'Failed to generate image' 
        }, { status: 500 });
    }
});