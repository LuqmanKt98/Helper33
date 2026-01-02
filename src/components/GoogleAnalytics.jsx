import { useEffect } from 'react';

export default function GoogleAnalytics() {
  useEffect(() => {
    // Check if gtag script already exists
    if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      return;
    }

    // Add gtag script
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-FX4SME694Z';
    document.head.appendChild(gtagScript);

    // Add gtag configuration script
    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-FX4SME694Z');
    `;
    document.head.appendChild(configScript);
  }, []);

  return null;
}