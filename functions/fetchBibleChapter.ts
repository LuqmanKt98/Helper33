import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
        }

        const { book, chapter, translation = 'kjv' } = await req.json();

        if (!book || !chapter) {
            return new Response(JSON.stringify({ error: 'Book and chapter are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const apiUrl = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Bible API error: ${response.status} ${errorText}`);
            return new Response(JSON.stringify({ error: `Failed to fetch Bible chapter. Status: ${response.status}`, details: errorText }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in fetchBibleChapter function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});