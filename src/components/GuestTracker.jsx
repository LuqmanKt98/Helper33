import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function GuestTracker() {
  const location = useLocation();
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    const isGuest = !user;
    
    // Track page view
    trackPageView(isGuest);
    
    // Track guest session
    if (isGuest) {
      trackGuestSession();
      trackUserLocation();
    }
  }, [location.pathname, user]);

  const trackPageView = (isGuest) => {
    // Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
        user_type: isGuest ? 'guest' : 'authenticated',
      });
      
      console.log('📊 Page view tracked:', {
        path: location.pathname,
        userType: isGuest ? 'guest' : 'authenticated'
      });
    }

    // Custom tracking
    trackCustomEvent('page_view', {
      path: location.pathname,
      isGuest,
      timestamp: new Date().toISOString(),
    });
  };

  const trackGuestSession = () => {
    // Get or create guest ID
    let guestId = localStorage.getItem('guest_session_id');
    const isNewUser = !guestId;
    
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest_session_id', guestId);
      localStorage.setItem('guest_first_visit', new Date().toISOString());
      localStorage.setItem('guest_user_type', 'new');
      
      // Track new guest
      if (window.gtag) {
        window.gtag('event', 'new_guest_session', {
          guest_id: guestId,
          user_type: 'new',
        });
      }
      
      console.log('👤 New guest session:', guestId);
    } else {
      // Returning user
      localStorage.setItem('guest_user_type', 'returning');
      
      if (window.gtag) {
        window.gtag('event', 'returning_guest_session', {
          guest_id: guestId,
          user_type: 'returning',
        });
      }
    }

    // Update visit count
    const visitCount = parseInt(localStorage.getItem('guest_visit_count') || '0') + 1;
    localStorage.setItem('guest_visit_count', visitCount.toString());

    // Update last seen
    localStorage.setItem('guest_last_seen', new Date().toISOString());
    
    // Track session duration
    const firstVisit = localStorage.getItem('guest_first_visit');
    if (firstVisit) {
      const duration = Math.floor((Date.now() - new Date(firstVisit).getTime()) / 1000);
      localStorage.setItem('guest_session_duration', duration.toString());
    }
  };

  const trackUserLocation = async () => {
    try {
      // Check if location is already tracked in this session
      const cachedLocation = sessionStorage.getItem('guest_location');
      if (cachedLocation) {
        return;
      }

      // Fetch location data from IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const locationData = {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        timezone: data.timezone || 'Unknown',
        ip: data.ip || 'Unknown',
        timestamp: new Date().toISOString(),
      };

      // Store in session storage (won't persist across sessions)
      sessionStorage.setItem('guest_location', JSON.stringify(locationData));
      
      // Store in localStorage for analytics
      const guestProfile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      guestProfile.location = locationData;
      localStorage.setItem('guest_profile', JSON.stringify(guestProfile));

      // Track in Google Analytics
      if (window.gtag) {
        window.gtag('event', 'location_detected', {
          country: locationData.country,
          city: locationData.city,
          region: locationData.region,
        });
      }

      console.log('📍 Location tracked:', locationData.city, locationData.country);
    } catch (error) {
      console.error('Error tracking location:', error);
      // Fallback location data
      const fallbackLocation = {
        country: 'Unknown',
        countryCode: 'XX',
        city: 'Unknown',
        region: 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem('guest_location', JSON.stringify(fallbackLocation));
    }
  };

  const trackCustomEvent = (eventName, data) => {
    // Store in localStorage for analytics dashboard
    try {
      const events = JSON.parse(localStorage.getItem('guest_events') || '[]');
      events.push({
        event: eventName,
        ...data,
        guestId: localStorage.getItem('guest_session_id'),
        userType: localStorage.getItem('guest_user_type'),
      });
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      
      localStorage.setItem('guest_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  return null; // This is an invisible tracking component
}