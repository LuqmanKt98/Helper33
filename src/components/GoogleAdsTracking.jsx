import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Google Ads Conversion Tracking
 * Gracefully handles initialization failures
 */
export default function GoogleAdsTracking() {
  const location = useLocation();

  useEffect(() => {
    const initializeGoogleAds = () => {
      try {
        // Check if gtag is available
        if (typeof window.gtag !== 'function') {
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
        }

        const ADS_ID = 'AW-XXXXXXXXXX'; // Replace with actual Google Ads ID when ready
        
        // Only initialize if valid ID is provided
        if (ADS_ID && ADS_ID !== 'AW-XXXXXXXXXX') {
          window.gtag('config', ADS_ID, {
            page_path: location.pathname,
            send_page_view: false // We'll manually track page views
          });

          // Load the Google Ads script
          const script = document.createElement('script');
          script.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
          script.async = true;
          script.onerror = () => {
            console.warn('Google Ads script failed to load (ad blocker or network issue)');
          };
          
          // Only append if not already loaded
          if (!document.querySelector(`script[src*="${ADS_ID}"]`)) {
            document.head.appendChild(script);
          }
        }
      } catch (error) {
        // Silently fail - don't break the app
        console.warn('Google Ads tracking skipped:', error.message);
      }
    };

    initializeGoogleAds();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: location.pathname,
          page_title: document.title
        });
      }
    } catch (error) {
      // Silently fail
      console.warn('Page view tracking skipped');
    }
  }, [location]);

  return null;
}

// Utility function to track conversions
export const trackConversion = (conversionLabel, value = null) => {
  try {
    if (typeof window.gtag === 'function') {
      const conversionData = {
        send_to: `AW-XXXXXXXXXX/${conversionLabel}`, // Replace with actual conversion ID
      };
      
      if (value !== null) {
        conversionData.value = value;
        conversionData.currency = 'USD';
      }
      
      window.gtag('event', 'conversion', conversionData);
    }
  } catch (error) {
    console.warn('Conversion tracking failed:', error);
  }
};