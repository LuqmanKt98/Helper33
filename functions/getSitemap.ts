Deno.serve(async (req) => {
  const baseUrl = new URL(req.url).origin;
  
  const pages = [
    // Main pages - High priority
    { url: `${baseUrl}/#/Home`, priority: 1.0, changefreq: 'daily', title: 'AI for Health, Wellness, Cooking & Home Support' },
    { url: `${baseUrl}/#/About`, priority: 0.9, changefreq: 'weekly', title: 'About Our AI Health Platform' },
    { url: `${baseUrl}/#/Dashboard`, priority: 0.9, changefreq: 'daily', title: 'AI Health & Wellness Dashboard' },
    
    // Core AI Health Features
    { url: `${baseUrl}/#/Wellness`, priority: 0.9, changefreq: 'daily', title: 'AI Wellness Tracker & Health Support' },
    { url: `${baseUrl}/#/GriefCoach`, priority: 0.9, changefreq: 'daily', title: 'AI Grief Support & Counseling' },
    { url: `${baseUrl}/#/LifeCoach`, priority: 0.9, changefreq: 'daily', title: 'AI Life Coach & Personal Development' },
    { url: `${baseUrl}/#/MindfulnessHub`, priority: 0.8, changefreq: 'daily', title: 'AI Mindfulness & Mental Wellness' },
    { url: `${baseUrl}/#/CrisisHub`, priority: 1.0, changefreq: 'always', title: 'Crisis Support & Mental Health Emergency' },
    
    // AI Cooking & Nutrition
    { url: `${baseUrl}/#/MealPlanner`, priority: 0.9, changefreq: 'daily', title: 'AI Meal Planner & Recipe Generator' },
    
    // AI Home & Family
    { url: `${baseUrl}/#/Organizer`, priority: 0.9, changefreq: 'daily', title: 'AI Home Organizer & Task Manager' },
    { url: `${baseUrl}/#/Family`, priority: 0.8, changefreq: 'daily', title: 'AI Family Hub & Parenting Support' },
    { url: `${baseUrl}/#/CareHub`, priority: 0.8, changefreq: 'weekly', title: 'AI Caregiver Services & Support' },
    
    // Community & Social
    { url: `${baseUrl}/#/Community`, priority: 0.8, changefreq: 'daily', title: 'AI Wellness Community & Support Groups' },
    { url: `${baseUrl}/#/FindConsultants`, priority: 0.8, changefreq: 'weekly', title: 'Find AI Consultants & Experts' },
    
    // Additional Features
    { url: `${baseUrl}/#/JournalStudio`, priority: 0.7, changefreq: 'daily', title: 'AI Journaling & Self-Reflection' },
    { url: `${baseUrl}/#/Workspace`, priority: 0.7, changefreq: 'weekly', title: 'AI Document Management & Workspace' },
    { url: `${baseUrl}/#/HomeworkHub`, priority: 0.7, changefreq: 'daily', title: 'AI Homework Helper & Study Support' },
    { url: `${baseUrl}/#/KidsCreativeStudio`, priority: 0.7, changefreq: 'weekly', title: 'AI Kids Learning Studio' },
    { url: `${baseUrl}/#/StoryHub`, priority: 0.6, changefreq: 'weekly', title: 'AI Storytelling & Creative Writing' },
    { url: `${baseUrl}/#/Marketplace`, priority: 0.7, changefreq: 'daily', title: 'AI Wellness Marketplace' },
    { url: `${baseUrl}/#/IntegrationsHub`, priority: 0.6, changefreq: 'monthly', title: 'AI Platform Integrations' },
    
    // Legal & Info
    { url: `${baseUrl}/#/PrivacyPolicy`, priority: 0.5, changefreq: 'monthly', title: 'Privacy Policy' },
    { url: `${baseUrl}/#/TermsOfService`, priority: 0.5, changefreq: 'monthly', title: 'Terms of Service' },
    { url: `${baseUrl}/#/LegalDisclaimer`, priority: 0.5, changefreq: 'monthly', title: 'Legal Disclaimer' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${pages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <news:news>
      <news:publication>
        <news:name>Helper33</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:title>${page.title}</news:title>
    </news:news>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});