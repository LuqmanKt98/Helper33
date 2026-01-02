// Backend security validation utilities

export const validateRequest = (req) => {
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|python|java/i,
    /nikto|sqlmap|nmap|metasploit/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isSuspicious && !userAgent.includes('Googlebot')) {
    console.warn('[Security] Suspicious user agent:', userAgent);
  }

  return {
    ip,
    userAgent,
    isSuspicious,
  };
};

export const getClientIP = (req) => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');

  return cfIP || (forwarded ? forwarded.split(',')[0].trim() : realIP) || 'unknown';
};

export const sanitizeForSQL = (input) => {
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

export const detectSQLInjection = (input) => {
  if (typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(union.*select)/gi,
    /(concat.*\()/gi,
    /(\|{2})/g, // ||
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

export const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateURL = (url) => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};