import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const IP_BLACKLIST = new Set([]);
const rateLimitStore = new Map();

const validateRequestSignature = (req) => {
  const signature = req.headers.get('x-request-signature');
  const timestamp = req.headers.get('x-request-timestamp');
  
  if (!signature || !timestamp) {
    return true;
  }
  
  const requestTime = parseInt(timestamp);
  const now = Date.now();
  const maxAge = 5 * 60 * 1000;
  
  if (Math.abs(now - requestTime) > maxAge) {
    return false;
  }
  
  return true;
};

const checkRateLimit = (ip, limit = 100, windowMs = 60000) => {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, resetTime: now + windowMs };
  
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  rateLimitStore.set(ip, record);
  
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  return true;
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

Deno.serve(async (req) => {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
    
    if (IP_BLACKLIST.has(ip)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Too Many Requests' },
        { 
          status: 429,
          headers: { 'Retry-After': '60' }
        }
      );
    }
    
    if (!validateRequestSignature(req)) {
      return Response.json({ error: 'Invalid Request Signature' }, { status: 401 });
    }
    
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
    
    return Response.json({ 
      success: true, 
      user: { id: user.id, email: user.email },
      ip,
      timestamp: new Date().toISOString()
    }, {
      headers: securityHeaders
    });
    
  } catch (error) {
    console.error('Security middleware error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});