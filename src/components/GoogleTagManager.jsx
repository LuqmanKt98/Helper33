import { useEffect } from 'react';

export default function GoogleTagManager() {
  useEffect(() => {
    // Optimized GTM loading for fast page performance
    const initGTM = () => {
      // Check if GTM already exists
      if (window.dataLayer || document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
        return;
      }

      // Initialize dataLayer first
      window.dataLayer = window.dataLayer || [];

      // Add GTM script to head
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NQGLPJN7');`;
      
      // Insert at the beginning of head for proper tracking
      if (document.head.firstChild) {
        document.head.insertBefore(gtmScript, document.head.firstChild);
      } else {
        document.head.appendChild(gtmScript);
      }

      // Add noscript fallback to body
      if (!document.querySelector('noscript iframe[src*="googletagmanager.com"]')) {
        const noscript = document.createElement('noscript');
        noscript.innerHTML = '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NQGLPJN7" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
        
        if (document.body.firstChild) {
          document.body.insertBefore(noscript, document.body.firstChild);
        } else {
          document.body.appendChild(noscript);
        }
      }
    };

    // Use requestIdleCallback for optimal performance, fallback to timeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initGTM, { timeout: 2000 });
    } else {
      setTimeout(initGTM, 100);
    }
  }, []);

  return null;
}