import React, { useState } from 'react';
import { sanitizeInput } from './InputSanitizer';
import { useCSRFProtection } from './CSRFProtection';
import { rateLimiter } from './RateLimiter';
import { toast } from 'sonner';

export default function SecureForm({ onSubmit, children, rateLimitKey, ...props }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csrfToken = useCSRFProtection();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check rate limit
    if (rateLimitKey && !rateLimiter.checkLimit(rateLimitKey, 5, 60000)) {
      toast.error('Too many requests. Please wait a moment.');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData(e.target);
      const sanitizedData = {};

      // Sanitize all form inputs
      for (const [key, value] of formData.entries()) {
        sanitizedData[key] = sanitizeInput(value);
      }

      // Add CSRF token
      sanitizedData._csrf = csrfToken;

      await onSubmit(sanitizedData, e);
    } catch (error) {
      console.error('[Security] Form submission error:', error);
      toast.error('Form submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="_csrf" value={csrfToken || ''} />
      {children}
    </form>
  );
}