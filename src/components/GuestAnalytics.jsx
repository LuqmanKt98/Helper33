import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Enhanced Guest Analytics Tracker
 * Tracks guest behavior, interactions, and conversion funnel
 */
export default function GuestAnalytics() {
  const location = useLocation();

  useEffect(() => {
    initializeGuestTracking();
    trackPageVisit();
    setupInteractionTracking();
  }, [location.pathname]);

  const initializeGuestTracking = () => {
    // Create guest profile if doesn't exist
    if (!localStorage.getItem('guest_profile')) {
      const guestProfile = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstVisit: new Date().toISOString(),
        visitCount: 0,
        pagesViewed: [],
        interactions: [],
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
      };
      localStorage.setItem('guest_profile', JSON.stringify(guestProfile));
      
      // Track new guest in Google Analytics
      if (window.gtag) {
        window.gtag('event', 'new_guest', {
          guest_id: guestProfile.id,
          referrer: document.referrer,
        });
      }
    }
  };

  const trackPageVisit = () => {
    try {
      const profile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      
      // Update visit count
      profile.visitCount = (profile.visitCount || 0) + 1;
      profile.lastVisit = new Date().toISOString();
      
      // Track page view
      if (!profile.pagesViewed) profile.pagesViewed = [];
      profile.pagesViewed.push({
        path: location.pathname,
        timestamp: new Date().toISOString(),
        title: document.title,
      });
      
      // Keep only last 50 pages
      if (profile.pagesViewed.length > 50) {
        profile.pagesViewed = profile.pagesViewed.slice(-50);
      }
      
      localStorage.setItem('guest_profile', JSON.stringify(profile));
      
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'guest_page_view', {
          guest_id: profile.id,
          page_path: location.pathname,
          page_title: document.title,
          visit_number: profile.visitCount,
        });
      }
      
      console.log('📈 Guest page tracked:', location.pathname);
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  };

  const setupInteractionTracking = () => {
    // Track button clicks
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, a');
      if (button) {
        trackInteraction('click', {
          element: button.tagName,
          text: button.textContent?.slice(0, 50),
          href: button.getAttribute('href'),
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form) {
        trackInteraction('form_submit', {
          formId: form.id,
          formAction: form.action,
        });
      }
    });

    // Track time on page
    let pageStartTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.floor((Date.now() - pageStartTime) / 1000);
      trackInteraction('page_exit', {
        path: location.pathname,
        timeOnPage,
      });
    });
  };

  const trackInteraction = (type, data) => {
    try {
      const profile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      
      if (!profile.interactions) profile.interactions = [];
      profile.interactions.push({
        type,
        ...data,
        timestamp: new Date().toISOString(),
        path: location.pathname,
      });
      
      // Keep only last 100 interactions
      if (profile.interactions.length > 100) {
        profile.interactions = profile.interactions.slice(-100);
      }
      
      localStorage.setItem('guest_profile', JSON.stringify(profile));
      
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', `guest_${type}`, {
          guest_id: profile.id,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  return null;
}