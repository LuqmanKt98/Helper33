import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function VisitorTracker({ pageName }) {
  const [tracked, setTracked] = useState(false);

  // Get user data (may be null for guests)
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: 300000 // 5 minutes
  });

  useEffect(() => {
    const trackVisit = async () => {
      // Only track once per page load
      if (tracked || !pageName) return;

      try {
        // Generate visitor ID from browser fingerprint
        const visitorId = getVisitorId();
        const sessionId = getSessionId();
        const deviceType = getDeviceType();

        const visitData = {
          visitor_id: visitorId,
          session_id: sessionId,
          page_path: window.location.pathname,
          page_name: pageName,
          referrer: document.referrer || 'direct',
          user_agent: navigator.userAgent,
          device_type: deviceType,
          is_authenticated: !!user
        };

        // Create visitor analytics record
        await base44.entities.VisitorAnalytics.create(visitData);
        
        console.log('✅ Visitor tracked:', pageName);
        setTracked(true);

        // Also send to Google Analytics if available
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            page_title: pageName,
            page_location: window.location.href,
            page_path: window.location.pathname,
            is_authenticated: !!user
          });
          console.log('📊 GA4 page view sent:', pageName);
        }
      } catch (error) {
        // Silently fail for guests or if RLS blocks it
        console.log('Visitor tracking skipped:', error.message);
      }
    };

    trackVisit();
  }, [pageName, user, tracked]);

  // Reset tracked state when page changes
  useEffect(() => {
    setTracked(false);
  }, [pageName]);

  return null;
}

// Generate consistent visitor ID from browser fingerprint
function getVisitorId() {
  let visitorId = localStorage.getItem('visitor_id');
  
  if (!visitorId) {
    // Create fingerprint from browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    visitorId = 'visitor_' + Math.abs(hash).toString(36);
    localStorage.setItem('visitor_id', visitorId);
  }
  
  return visitorId;
}

// Generate session ID (expires with browser session)
function getSessionId() {
  let sessionId = sessionStorage.getItem('session_id');
  
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
}

// Detect device type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}