export const isAppMySite = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  
  return (
    userAgent.includes('appmysite') || 
    urlParams.get('source') === 'appmysite' ||
    urlParams.get('utm_source') === 'appmysite'
  );
};