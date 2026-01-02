import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { memoryId } = await req.json();

        if (!memoryId) {
            throw new Error('memoryId is required');
        }

        const memory = await base44.entities.Memory.get(memoryId);

        if (!memory) {
            throw new Error(`Memory with ID ${memoryId} not found.`);
        }
        
        // Ensure the user owns this memory
        if (memory.created_by !== user.email) {
             return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const prompt = `
            Analyze the following memory. Create a concise, keyword-rich, searchable description. 
            Include visual details from the media (if present), and identify key themes, people, places, objects, and emotions from the text.
            The description should be a single paragraph of text, optimized for semantic search. Do not use markdown or special formatting.

            Memory Details:
            - Title: ${memory.title || 'N/A'}
            - Content: ${memory.content || 'N/A'}
            - Tags: ${(memory.tags || []).join(', ')}
            - Category: ${memory.category || 'N/A'}
        `;

        const invokeLLMParams = {
            prompt,
            add_context_from_internet: false,
        };

        if (memory.media_url && ['image', 'video'].includes(memory.media_type)) {
            invokeLLMParams.file_urls = [memory.media_url];
        }

        const aiDescription = await base44.integrations.Core.InvokeLLM(invokeLLMParams);

        if (aiDescription) {
            await base44.entities.Memory.update(memoryId, { ai_description: aiDescription });
        }

        return Response.json({ success: true, description: aiDescription });

    } catch (error) {
        console.error('Error generating memory description:', error);
        return Response.json({ 
            error: error.message || 'Failed to generate memory description' 
        }, { status: 500 });
    }
});