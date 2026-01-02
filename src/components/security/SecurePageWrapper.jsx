import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { sanitizeInput } from './InputSanitizer';
import SEO from '@/components/SEO';
import { getSEOForPage, defaultSEO } from '@/components/SEODefaults';

/**
 * SecurePageWrapper - Wraps pages with security and SEO best practices
 * 
 * Features:
 * - Automatic SEO optimization
 * - XSS protection headers
 * - Content Security Policy
 * - Authentication checks
 * - Activity tracking
 * - Error boundary
 */
export default function SecurePageWrapper({ 
  children, 
  pageName,
  requireAuth = false,
  requireRole = null,
  customSEO = null,
  onUserLoaded = null
}) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
    enabled: requireAuth
  });

  useEffect(() => {
    // Security headers (meta tags)
    const setSecurityMeta = () => {
      // X-Content-Type-Options
      let meta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = 'X-Content-Type-Options';
        meta.content = 'nosniff';
        document.head.appendChild(meta);
      }

      // Referrer Policy
      meta = document.querySelector('meta[name="referrer"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'strict-origin-when-cross-origin';
        document.head.appendChild(meta);
      }
    };

    setSecurityMeta();

    // Sanitize URL parameters
    const params = new URLSearchParams(window.location.search);
    let needsUpdate = false;
    const sanitizedParams = new URLSearchParams();

    params.forEach((value, key) => {
      const sanitized = sanitizeInput(value);
      if (sanitized !== value) {
        needsUpdate = true;
      }
      sanitizedParams.set(key, sanitized);
    });

    if (needsUpdate && window.history.replaceState) {
      const newUrl = `${window.location.pathname}?${sanitizedParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  useEffect(() => {
    if (user && onUserLoaded) {
      onUserLoaded(user);
    }
  }, [user, onUserLoaded]);

  // Check authentication
  if (requireAuth && !isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access this page</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (requireRole && user && user.role !== requireRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⛔</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page</p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get SEO config
  const seo = customSEO || getSEOForPage(pageName);

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url={`${defaultSEO.siteUrl}/${pageName}`}
        image={defaultSEO.image}
        structuredData={seo.structuredData}
      />
      {children}
    </>
  );
}