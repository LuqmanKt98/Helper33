import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Missing image URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Attempt to fetch the image
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch image: ${response.statusText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const imageBody = await response.blob();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Set cache headers to improve performance
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    return new Response(imageBody, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Error fetching image: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});