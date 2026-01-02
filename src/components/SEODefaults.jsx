// Default SEO configurations for Helper33 pages
export const defaultSEO = {
  siteName: "Helper33",
  siteUrl: "https://www.helper33.com",
  defaultTitle: "Helper33 - All-in-One AI Ecosystem for Life, Family & Business",
  defaultDescription: "33+ AI Tools, 13+ Intelligent Agents, 700+ AI Controls. Comprehensive AI platform for wellness, family management, learning, business, and personal growth. Trusted by families and professionals.",
  defaultKeywords: "AI platform, AI tools, AI ecosystem, AI assistant, family AI, wellness AI, business AI, AI agents, mental health AI, AI productivity, AI learning, AI automation",
  twitterHandle: "@helper33",
  fbAppId: "",
  author: "Helper33 Team",
  image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png"
};

export const pageSEO = {
  Family: {
    title: "AI Family Hub - Smart Calendar, Tasks & Communication | Helper33",
    description: "Manage your family with AI. Smart scheduling, task management, family calendar, communication tools, and collaborative planning. Keep everyone connected and organized.",
    keywords: "AI family hub, family calendar AI, AI family planner, family task manager, family communication app, AI family organizer, smart family calendar, family coordination AI",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Helper33 AI Family Hub",
      "applicationCategory": "LifestyleApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },
  
  Wellness: {
    title: "AI Wellness Coach - Mental Health Support & Mood Tracking | Helper33",
    description: "AI-powered mental health support, mood tracking, wellness journaling, and personalized coping strategies. Professional-grade wellness tools with AI guidance.",
    keywords: "AI wellness coach, mental health AI, mood tracker AI, AI therapy assistant, wellness AI, AI mental health support, mood tracking app, AI wellness journal",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "name": "Helper33 AI Wellness Coach",
      "medicalAudience": [{
        "@type": "MedicalAudience",
        "audienceType": "Patient"
      }]
    }
  },

  HomeworkHub: {
    title: "AI Homework Helper & Student Tutor - Study Groups & Learning | Helper33",
    description: "AI-powered homework help, personalized tutoring, study groups, and learning assistance. Get instant help with assignments, create study plans, and collaborate with peers.",
    keywords: "AI homework helper, AI tutor, student AI, homework AI, AI study assistant, AI learning platform, homework help AI, AI education, study AI, AI tutoring",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "EducationalApplication",
      "name": "Helper33 AI Homework Hub",
      "educationalLevel": "all levels"
    }
  },

  SocialMediaManager: {
    title: "AI Social Media Manager - Content Creation & Automation | Helper33",
    description: "AI-powered social media management, content creation, post scheduling, analytics, and automation. Create engaging content and grow your online presence with AI.",
    keywords: "AI social media manager, social media AI, AI content creator, AI post generator, social media automation AI, AI marketing, content creation AI, AI social media tool",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Helper33 AI Social Media Manager",
      "applicationCategory": "BusinessApplication"
    }
  },

  FindConsultants: {
    title: "Find AI Business Consultants - Expert Professional Services | Helper33",
    description: "Connect with verified AI business consultants, strategists, and experts. Get professional consulting services, strategic advice, and expert guidance for your projects.",
    keywords: "AI consultant, business consultant AI, AI expert, professional services AI, AI strategy consultant, business advisor AI, AI consulting platform"
  },

  FindCare: {
    title: "Find Caregivers & Home Services - Verified Professionals | Helper33",
    description: "Find trusted caregivers, nannies, housekeepers, and home service professionals. Background-checked, verified profiles with reviews and ratings.",
    keywords: "find caregiver, nanny finder, housekeeper, home services, elderly care, childcare, pet care, verified caregivers"
  },

  Marketplace: {
    title: "Helper33 Marketplace - Courses, Products & Digital Goods | Helper33",
    description: "Buy and sell online courses, digital products, and services. AI-powered marketplace with secure payments, reviews, and seller tools.",
    keywords: "online marketplace, digital products, online courses, sell courses, buy digital products, AI marketplace, course platform"
  }
};

export const getSEOForPage = (pageName) => {
  return pageSEO[pageName] || {
    title: `${pageName} - ${defaultSEO.siteName}`,
    description: defaultSEO.defaultDescription,
    keywords: defaultSEO.defaultKeywords
  };
};