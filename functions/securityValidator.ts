import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Backend security validation utilities
const getClientIP = (req) => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  return cfIP || (forwarded ? forwarded.split(',')[0].trim() : realIP) || 'unknown';
};

const validateRequest = (req) => {
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';

  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|python|java/i,
    /nikto|sqlmap|nmap|metasploit/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isSuspicious && !userAgent.includes('Googlebot')) {
    console.warn('[Security] Suspicious user agent:', userAgent);
  }

  return { ip, userAgent, isSuspicious };
};

const sanitizeForSQL = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '');
};

const detectSQLInjection = (input) => {
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

const detectXSS = (input) => {
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

const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateURL = (url) => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate request security
    const validation = validateRequest(req);
    
    if (validation.isSuspicious) {
      return Response.json(
        { 
          error: 'Suspicious request detected',
          ip: validation.ip 
        },
        { status: 403 }
      );
    }

    // Get request body if POST
    let body = null;
    if (req.method === 'POST') {
      body = await req.json();
      
      // Validate for SQL injection
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string') {
          if (detectSQLInjection(value)) {
            console.error('[Security] SQL injection attempt detected:', key);
            return Response.json(
              { error: 'Invalid input detected' },
              { status: 400 }
            );
          }
          
          if (detectXSS(value)) {
            console.error('[Security] XSS attempt detected:', key);
            return Response.json(
              { error: 'Invalid input detected' },
              { status: 400 }
            );
          }
        }
      }
    }

    return Response.json({
      success: true,
      validation,
      message: 'Request validated successfully'
    });

  } catch (error) {
    console.error('[Security] Validation error:', error);
    return Response.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
});