Deno.serve((_req) => {
  try {
    const config = {
      mediaEmail: Deno.env.get('MEDIA_EMAIL') || 'press@dobry.life',
      oneSignalAppId: Deno.env.get('ONESIGNAL_APP_ID') || '4a798c34-90cc-47d2-9c0f-bb350eafb514',
    };

    return new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});