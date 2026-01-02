import { checkRateLimit, getClientIdentifier, rateLimitResponse } from './rateLimiter.js';

/**
 * Security middleware for backend functions
 * Provides authentication, rate limiting, and input validation
 */

export const getClientIP = (req) => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  return cfIP || (forwarded ? forwarded.split(',')[0].trim() : realIP) || 'unknown';
};

export const detectSQLInjection = (input) => {
  if (typeof input !== 'string') return false;
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(union.*select)/gi,
    /(concat.*\()/gi,
    /(\|{2})/g,
    /(\/\*|\*\/)/g,
    /(;|\-\-)/g,
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
};

export const detectXSS = (input) => {
  if (typeof input !== 'string') return false;
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];
  return xssPatterns.some(pattern => pattern.test(input));
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Apply security middleware to a request
 */
export const applySecurityMiddleware = async (req, base44, options = {}) => {
  const {
    requireAuth = true,
    requireAdmin = false,
    rateLimit = { max: 30, window: 60000 },
    validateInput = true
  } = options;

  // 1. Authentication
  let user = null;
  if (requireAuth) {
    user = await base44.auth.me();
    if (!user) {
      return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    if (requireAdmin && user.role !== 'admin') {
      return { error: Response.json({ error: 'Admin access required' }, { status: 403 }) };
    }
  }

  // 2. Rate Limiting
  if (rateLimit) {
    const identifier = getClientIdentifier(req, user);
    const limitCheck = checkRateLimit(identifier, rateLimit.max, rateLimit.window);
    
    if (!limitCheck.allowed) {
      return { error: rateLimitResponse(limitCheck.resetTime) };
    }
  }

  // 3. Input Validation
  if (validateInput && req.method === 'POST') {
    try {
      const body = await req.json();
      
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string') {
          if (detectSQLInjection(value)) {
            console.error('[Security] SQL injection detected:', key);
            return { 
              error: Response.json({ error: 'Invalid input detected' }, { status: 400 }) 
            };
          }
          
          if (detectXSS(value)) {
            console.error('[Security] XSS attempt detected:', key);
            return { 
              error: Response.json({ error: 'Invalid input detected' }, { status: 400 }) 
            };
          }
        }
      }
      
      return { user, body };
    } catch (e) {
      return { 
        error: Response.json({ error: 'Invalid request body' }, { status: 400 }) 
      };
    }
  }

  return { user };
};

/**
 * Log security event
 */
export const logSecurityEvent = async (base44, eventType, details, severity = 'info') => {
  try {
    await base44.asServiceRole.entities.SecurityAuditLog.create({
      audit_type: eventType,
      severity,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};