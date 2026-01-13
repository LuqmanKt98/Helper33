import { useEffect } from 'react';

export default function SEO({
  title = "Helper33 - Family AI for Health, Learning, Cooking, Kids & Home | All-in-One AI Multitool",
  description = "Complete family AI ecosystem: Wellness AI for mental health & grief support, Student AI for homework help, Cooking AI for meal planning, Kids AI for safe learning games, Business AI for productivity. All-in-one AI health platform. 33+ AI tools, 13+ AI agents. Therapeutic, family-friendly multitool AI.",
  keywords = "family AI, all-in-one AI, AI health, AI for kids, multitool AI, wellness AI, student AI, cooking AI, kids AI, business AI, AI for mental health, AI mental health assistant, AI wellness tool, AI emotional support, grief support AI, AI therapy companion, anxiety support AI, stress management AI, AI homework helper, AI tutor for kids, AI study coach, AI learning assistant, AI meal planner, AI recipe generator, AI cooking assistant, nutrition AI, family meal planning AI, safe AI for kids, kids learning games AI, educational AI games, family hub AI, home management AI, family organizer app, daily routine planner AI, AI productivity tools, AI self-care app, AI wellness app for families, digital grief companion, AI mood tracker, family wellness AI, burnout support AI, coping skills AI, emotional healing technology, AI mindfulness exercises, personalized learning AI, budget meal planner AI, AI for homeschool, kids creative AI, child-safe AI tools, AI bedtime stories, therapeutic games for kids, business automation AI, workflow automation AI, AI content generator, AI email writer, AI social media manager",
  ogTitle = null,
  ogDescription = null,
  ogImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png",
  ogUrl = null,
  twitterCard = "summary_large_image",
  twitterTitle = null,
  twitterDescription = null,
  twitterImage = null,
  canonicalUrl = null,
  author = "Helper33",
  robots = "index, follow",
  languageAlternates = {},
  structuredData = null,
  articleData = null,
  pageType = "website"
}) {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Update title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector, attribute, content) => {
      if (!content) return;

      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (attribute === 'property' || attribute === 'name') {
          const attrValue = selector.match(/\[.*?="(.*?)"\]/)?.[1];
          if (attrValue) {
            element.setAttribute(attribute, attrValue);
          }
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic Meta Tags
    updateMetaTag('meta[name="description"]', 'name', description);
    updateMetaTag('meta[name="keywords"]', 'name', keywords);
    updateMetaTag('meta[name="author"]', 'name', author);
    updateMetaTag('meta[name="robots"]', 'name', robots);
    updateMetaTag('meta[name="viewport"]', 'name', 'width=device-width, initial-scale=1.0');

    // Theme color for mobile browsers
    updateMetaTag('meta[name="theme-color"]', 'name', '#9333ea');
    updateMetaTag('meta[name="msapplication-TileColor"]', 'name', '#9333ea');

    // Open Graph Tags
    updateMetaTag('meta[property="og:title"]', 'property', ogTitle || title);
    updateMetaTag('meta[property="og:description"]', 'property', ogDescription || description);
    updateMetaTag('meta[property="og:image"]', 'property', ogImage);
    updateMetaTag('meta[property="og:url"]', 'property', ogUrl || window.location.href);
    updateMetaTag('meta[property="og:type"]', 'property', pageType);
    updateMetaTag('meta[property="og:site_name"]', 'property', 'Helper33');
    updateMetaTag('meta[property="og:locale"]', 'property', 'en_US');

    // Twitter Card Tags
    updateMetaTag('meta[name="twitter:card"]', 'name', twitterCard);
    updateMetaTag('meta[name="twitter:title"]', 'name', twitterTitle || ogTitle || title);
    updateMetaTag('meta[name="twitter:description"]', 'name', twitterDescription || ogDescription || description);
    updateMetaTag('meta[name="twitter:image"]', 'name', twitterImage || ogImage);
    updateMetaTag('meta[name="twitter:site"]', 'name', '@helper33');
    updateMetaTag('meta[name="twitter:creator"]', 'name', '@helper33');

    // Additional SEO Tags
    updateMetaTag('meta[name="application-name"]', 'name', 'Helper33');
    updateMetaTag('meta[name="apple-mobile-web-app-title"]', 'name', 'Helper33');
    updateMetaTag('meta[name="apple-mobile-web-app-capable"]', 'name', 'yes');
    updateMetaTag('meta[name="mobile-web-app-capable"]', 'name', 'yes');

    // Enhanced category and coverage tags based on keyword clusters
    updateMetaTag('meta[name="category"]', 'name', 'Health, Mental Wellness, Education, Cooking, Family, Lifestyle, AI, Technology, Kids Learning, Home Management, Business Productivity');
    updateMetaTag('meta[name="coverage"]', 'name', 'Worldwide');
    updateMetaTag('meta[name="distribution"]', 'name', 'Global');
    updateMetaTag('meta[name="rating"]', 'name', 'General');
    updateMetaTag('meta[name="target"]', 'name', 'all');

    // Additional discovery tags with cluster focus
    updateMetaTag('meta[name="audience"]', 'name', 'families, parents, students, kids, caregivers, individuals seeking wellness, business professionals, entrepreneurs, homeschoolers');
    updateMetaTag('meta[name="classification"]', 'name', 'Family AI, Wellness AI, Student AI, Cooking AI, Kids AI, Business AI, Health Technology, Educational Technology, Family Management, AI Multitool');

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl || window.location.href.split('?')[0]);

    // Language Alternates
    Object.entries(languageAlternates).forEach(([lang, url]) => {
      let altLink = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!altLink) {
        altLink = document.createElement('link');
        altLink.setAttribute('rel', 'alternate');
        altLink.setAttribute('hreflang', lang);
        document.head.appendChild(altLink);
      }
      altLink.setAttribute('href', url);
    });

    // Enhanced Structured Data with comprehensive keyword integration
    const defaultStructuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "Helper33 - Family AI Multitool Platform",
          "alternateName": [
            "Helper33 Wellness AI",
            "Helper33 Student AI",
            "Helper33 Cooking AI",
            "Helper33 Kids AI",
            "Helper33 Business AI",
            "Helper33 Family AI",
            "All-in-One AI Health Platform"
          ],
          "description": "Comprehensive family AI ecosystem: Wellness AI for mental health, Student AI for homework, Cooking AI for meals, Kids AI for learning, Business AI for productivity. All-in-one AI multitool with 33+ tools and 13+ agents.",
          "url": typeof window !== 'undefined' ? window.location.origin : '',
          "applicationCategory": "HealthApplication, LifestyleApplication, ProductivityApplication, EducationalApplication, FamilyApplication",
          "operatingSystem": "Web, iOS, Android, Progressive Web App",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250",
            "bestRating": "5"
          },
          "featureList": [
            "Wellness AI - Mental health support, grief counseling, anxiety relief",
            "Student AI - Homework helper, AI tutor, study coach",
            "Cooking AI - Meal planner, recipe generator, nutrition tracker",
            "Kids AI - Safe learning games, creative tools, bedtime stories",
            "Business AI - Productivity tools, content generator, workflow automation",
            "Family AI - Home management, shared calendar, task organizer",
            "AI Health Tracker - Mood, wellness, sleep monitoring",
            "AI Therapy Companion - 24/7 emotional support",
            "AI Educational Tools - Personalized learning for students",
            "AI Kitchen Assistant - Smart cooking and meal planning"
          ],
          "screenshot": ogImage,
          "softwareVersion": "3.0",
          "keywords": "family AI, all-in-one AI, AI health, AI for kids, multitool AI, wellness AI, student AI, cooking AI, kids AI, business AI",
          "isAccessibleForFree": true,
          "permissions": "Safe for families, COPPA compliant, trauma-informed, therapeutic AI",
          "availableLanguage": ["English", "Spanish", "French", "German", "Arabic", "Chinese", "Hindi", "Portuguese", "Italian", "Japanese", "Korean", "Russian"]
        },
        {
          "@type": "Organization",
          "name": "Helper33",
          "legalName": "Helper33 Inc.",
          "url": typeof window !== 'undefined' ? window.location.origin : '',
          "logo": ogImage,
          "description": "Leading family AI multitool platform - Wellness AI, Student AI, Cooking AI, Kids AI, Business AI all in one. Making AI accessible, safe, and therapeutic for families worldwide.",
          "foundingDate": "2024",
          "slogan": "Your All-in-One Family AI for Health, Home, Learning & Happiness",
          "founder": {
            "@type": "Person",
            "name": "Dr. Yuriy Dobry & Ruby Dobry",
            "jobTitle": "Founders"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-888-HELPER33",
            "contactType": "Customer Support",
            "email": "support@helper33.com",
            "availableLanguage": ["English", "Spanish", "French", "German", "Arabic", "Chinese", "Hindi", "Portuguese"],
            "areaServed": "Worldwide"
          },
          "sameAs": [
            "https://www.instagram.com/lifewellnessai/",
            "https://facebook.com/helper33",
            "https://twitter.com/helper33",
            "https://linkedin.com/company/helper33"
          ],
          "areaServed": {
            "@type": "Place",
            "name": "Worldwide"
          },
          "knowsAbout": [
            "Wellness AI",
            "Mental Health AI Technology",
            "Student AI and Educational Tools",
            "Cooking AI and Meal Planning",
            "Kids AI and Safe Learning",
            "Business AI and Automation",
            "Family Management AI",
            "Therapeutic AI Design",
            "All-in-One AI Platforms"
          ]
        },
        {
          "@type": "SoftwareApplication",
          "name": "Helper33 All-in-One Family AI Platform",
          "applicationCategory": "HealthApplication, EducationalApplication, LifestyleApplication, ProductivityApplication",
          "operatingSystem": "Web, Progressive Web App, Mobile Responsive",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": "0",
            "highPrice": "55",
            "offerCount": "3"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250",
            "bestRating": "5"
          },
          "description": "All-in-one family AI multitool: Wellness AI for mental health, Student AI for homework, Cooking AI for meals, Kids AI for learning, Business AI for work, Family AI for home management - everything families need in one platform",
          "featureList": [
            "Wellness AI - AI mental health assistant, grief support, anxiety relief, stress management",
            "Student AI - AI homework helper, tutor for kids, study coach, learning assistant",
            "Cooking AI - AI meal planner, recipe generator, cooking assistant, nutrition tracker",
            "Kids AI - Safe AI learning games, creative tools, bedtime stories, educational activities",
            "Business AI - Productivity tools, content generator, email writer, workflow automation",
            "Family AI - Home management, family organizer, shared calendar, task planner",
            "AI Health Tools - Mood tracker, wellness monitoring, sleep tracking, self-care reminders",
            "All-in-One Platform - Everything families need in one therapeutic AI ecosystem"
          ]
        },
        {
          "@type": "WebSite",
          "name": "Helper33 - Family AI Multitool",
          "alternateName": "Helper33 All-in-One AI Platform",
          "url": typeof window !== 'undefined' ? window.location.origin : '',
          "potentialAction": {
            "@type": "SearchAction",
            "target": typeof window !== 'undefined' ? `${window.location.origin}/#/AppSearch?q={search_term_string}` : '',
            "query-input": "required name=search_term_string"
          },
          "inLanguage": ["en", "es", "fr", "de", "ar", "zh", "hi", "pt", "it", "ja", "ko", "ru"],
          "about": {
            "@type": "Thing",
            "name": "Family AI Multitool Platform",
            "description": "All-in-one AI platform combining Wellness AI, Student AI, Cooking AI, Kids AI, and Business AI for complete family support"
          }
        },
        {
          "@type": "MedicalWebPage",
          "name": title,
          "description": description,
          "url": typeof window !== 'undefined' ? window.location.href : '',
          "specialty": "Mental Health AI, Wellness Coaching AI, Family Nutrition AI, Child Development AI, Educational Support AI",
          "medicalAudience": [
            {
              "@type": "MedicalAudience",
              "audienceType": "Patients seeking mental health support via AI"
            },
            {
              "@type": "MedicalAudience",
              "audienceType": "Families and caregivers using wellness AI"
            },
            {
              "@type": "MedicalAudience",
              "audienceType": "Students using AI learning tools"
            },
            {
              "@type": "MedicalAudience",
              "audienceType": "Parents seeking safe AI for kids"
            }
          ],
          "about": [
            {
              "@type": "MedicalCondition",
              "name": "Mental Health & Emotional Wellness"
            },
            {
              "@type": "Thing",
              "name": "Family Health, Nutrition & Education via AI"
            },
            {
              "@type": "Thing",
              "name": "Child Development & Safe AI Learning"
            }
          ],
          "mainEntity": {
            "@type": "MedicalTherapy",
            "name": "AI-Assisted Wellness & Mental Health Support",
            "description": "Comprehensive family AI platform with therapeutic wellness tools, grief support, anxiety management, and emotional healing powered by AI"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is Helper33 family AI platform?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Helper33 is an all-in-one family AI multitool platform combining Wellness AI (mental health support), Student AI (homework help), Cooking AI (meal planning), Kids AI (safe learning games), and Business AI (productivity tools). Everything families need in one therapeutic AI ecosystem."
              }
            },
            {
              "@type": "Question",
              "name": "Is Helper33 Wellness AI safe for mental health?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Helper33 Wellness AI provides supportive tools for emotional wellness with trauma-informed approaches. It includes AI grief support, anxiety relief, and mood tracking. However, it is not a replacement for professional therapy. For mental health crises, call 988."
              }
            },
            {
              "@type": "Question",
              "name": "How does Student AI help with homework?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Helper33 Student AI includes AI homework helper, AI tutor for all subjects, AI study coach, step-by-step problem solving, AI writing helper, and personalized learning plans for K-12 and college students."
              }
            },
            {
              "@type": "Question",
              "name": "What does Cooking AI include?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Helper33 Cooking AI features AI meal planner, AI recipe generator, personalized nutrition tracking, smart grocery list creator, budget meal planning, and recipes for all dietary needs (vegan, keto, gluten-free, family-friendly)."
              }
            },
            {
              "@type": "Question",
              "name": "Is Kids AI safe for children?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Helper33 Kids AI is COPPA-compliant with safe AI learning games, educational activities, creative tools, AI bedtime stories, and age-appropriate content. All kids features include parental controls and child safety measures."
              }
            },
            {
              "@type": "Question",
              "name": "What Business AI tools are included?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Helper33 Business AI includes AI productivity tools, AI content generator, AI email writer, AI social media manager, workflow automation, document creation, and business organization tools for entrepreneurs and small businesses."
              }
            }
          ]
        }
      ]
    };

    // Merge with custom structured data if provided
    const finalStructuredData = structuredData || defaultStructuredData;

    // Add or update structured data script
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(finalStructuredData);

    // Add preconnect hints for performance
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com'
    ];

    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'preconnect');
        link.setAttribute('href', domain);
        link.setAttribute('crossorigin', 'anonymous');
        document.head.appendChild(link);
      }
    });

    // Add DNS prefetch for external resources
    const dnsPrefetchDomains = [
      'https://qtrypzzcjebvfcihiynt.supabase.co',
      'https://cdn.jsdelivr.net'
    ];

    dnsPrefetchDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'dns-prefetch');
        link.setAttribute('href', domain);
        document.head.appendChild(link);
      }
    });

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, twitterCard, twitterTitle, twitterDescription, twitterImage, canonicalUrl, author, robots, languageAlternates, structuredData]);

  return null;
}