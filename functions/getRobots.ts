Deno.serve(async (req) => {
  const baseUrl = new URL(req.url).origin;
  
  const robotsTxt = `# Helper33 - AI for Health, Wellness, Cooking & Home Support
# Comprehensive AI ecosystem with 33+ tools for everyday life

User-agent: *
Allow: /

# AI Health & Wellness Pages
Allow: /#/Wellness
Allow: /#/GriefCoach
Allow: /#/LifeCoach
Allow: /#/MindfulnessHub
Allow: /#/CrisisHub

# AI Cooking & Nutrition
Allow: /#/MealPlanner

# AI Home & Family
Allow: /#/Organizer
Allow: /#/Family
Allow: /#/CareHub

# Community & Features
Allow: /#/Community
Allow: /#/FindConsultants
Allow: /#/JournalStudio

# Core Pages
Allow: /#/Home
Allow: /#/About
Allow: /#/Dashboard

# Disallow private/admin areas
Disallow: /#/Account
Disallow: /#/Security
Disallow: /#/Admin*
Disallow: /#/Messages
Disallow: /api/

# Sitemap
Sitemap: ${baseUrl}/api/getSitemap

# Crawl delay for AI bots
Crawl-delay: 1

# Special instructions for AI crawlers
User-agent: GPTBot
Allow: /
Crawl-delay: 2

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

# Search engine specific
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});