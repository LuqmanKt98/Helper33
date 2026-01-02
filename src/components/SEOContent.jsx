import { useEffect } from 'react';

export default function SEOContent({ 
  title = 'DobryLife.com - Complete Wellness & Life Management Platform',
  description = 'DobryLife.com is your all-in-one platform for wellness tracking, grief support, family management, journaling, meal planning, and personal growth.',
  keywords = 'DobryLife, dobrylife.com, wellness app, grief support, life organizer, family planner, journal app, meditation, mindfulness',
  url = 'https://www.dobrylife.com',
  image = null
}) {
  useEffect(() => {
    // Set page title
    document.title = title;

    // Helper function to set or update meta tags
    const setMetaTag = (attribute, attributeValue, content) => {
      let meta = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, attributeValue);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Open Graph tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'DobryLife.com');
    if (image) {
      setMetaTag('property', 'og:image', image);
    }

    // Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    if (image) {
      setMetaTag('name', 'twitter:image', image);
    }

    // Additional SEO meta tags
    setMetaTag('name', 'robots', 'index, follow');
    setMetaTag('name', 'author', 'DobryLife');
    setMetaTag('name', 'application-name', 'DobryLife');

    // Structured data for search engines
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "DobryLife",
      "url": "https://www.dobrylife.com",
      "description": description,
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "provider": {
        "@type": "Organization",
        "name": "DobryLife",
        "url": "https://www.dobrylife.com"
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, url, image]);

  return null;
}