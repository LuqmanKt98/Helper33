// Security utilities for input validation and sanitization

// Text Sanitization - removes potentially dangerous content
export const sanitizeText = (text) => {
  if (!text) return '';
  
  // Remove HTML tags and scripts using regex
  const withoutTags = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return withoutTags.trim();
};

// HTML Sanitization - for rich text content
export const sanitizeHTML = (html) => {
  if (!html) return '';
  
  // Basic HTML sanitization - removes dangerous tags and attributes
  const dangerous = /<script|<iframe|<object|<embed|javascript:|on\w+=/gi;
  
  if (dangerous.test(html)) {
    // If dangerous content detected, strip all HTML
    return sanitizeText(html);
  }
  
  // Allow basic formatting tags only
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return cleaned.trim();
};

// Email Validation
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// URL Validation
export const validateURL = (url) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Phone Number Validation
export const validatePhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Content Moderation - Check for inappropriate content
const inappropriateWords = ['spam', 'scam', 'fraud', 'hack', 'exploit'];

export const checkInappropriateContent = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
};

// Rate Limiting - Client-side basic rate limiting
const rateLimitStore = {};

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { attempts: [], lastReset: now };
  }
  
  const store = rateLimitStore[key];
  
  // Remove old attempts outside the window
  store.attempts = store.attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (store.attempts.length >= maxAttempts) {
    const oldestAttempt = Math.min(...store.attempts);
    const retryAfter = windowMs - (now - oldestAttempt);
    return { allowed: false, retryAfter };
  }
  
  store.attempts.push(now);
  return { allowed: true, retryAfter: 0 };
};

// File Upload Validation
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check filename
  const filename = file.name || '';
  if (filename.length > 255 || /[<>:"|?*]/.test(filename)) {
    return { valid: false, error: 'Invalid filename' };
  }

  return { valid: true };
};

// CSRF Token Management
const CSRF_TOKEN_KEY = 'helper33_csrf_token';

export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const getCSRFToken = () => {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  return token;
};

export const setCSRFToken = (token) => {
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
};

export const clearCSRFToken = () => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
};