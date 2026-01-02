Deno.serve((req) => {
  const manifest = {
    "name": "Helper33 - All-in-One AI Ecosystem",
    "short_name": "Helper33",
    "description": "Your complete AI ecosystem: 33+ AI tools, 13+ intelligent agents, 700+ AI controls for life, family, and business.",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#10b981",
    "orientation": "portrait-primary",
    "icons": [
      {
        "src": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=192&q=80",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&q=80",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "categories": ["health", "lifestyle", "productivity"],
    "shortcuts": [
      {
        "name": "Daily Wellness",
        "url": "/Wellness",
        "description": "Track your daily wellness"
      },
      {
        "name": "Life Organizer",
        "url": "/Organizer",
        "description": "Manage your tasks and life"
      },
      {
        "name": "Digital Journal",
        "url": "/InfinityJournal",
        "description": "Write in your journal"
      },
      {
        "name": "Grief Coach",
        "url": "/GriefCoach",
        "description": "Get compassionate support"
      }
    ],
    "screenshots": [
      {
        "src": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=540&q=80",
        "sizes": "540x720",
        "type": "image/png"
      }
    ]
  };

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});