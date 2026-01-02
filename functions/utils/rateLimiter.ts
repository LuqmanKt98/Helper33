/**
 * Simple in-memory rate limiter for backend functions
 * For production, consider using Deno KV or Redis for distributed rate limiting
 */

const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 0) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter middleware
 * @param {string} identifier - Unique identifier (IP, email, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  const data = requestCounts.get(key);

  // Check if window has expired
  if (now > data.resetTime) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Increment counter
  data.count += 1;

  if (data.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - data.count,
    resetTime: data.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses IP address, or user email if authenticated
 */
export function getClientIdentifier(req, user = null) {
  if (user?.email) {
    return `user:${user.email}`;
  }

  // Try to get IP from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Create rate limit response
 */
export function rateLimitResponse(resetTime) {
  const resetDate = new Date(resetTime);
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      resetTime: resetDate.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': resetDate.toISOString(),
      },
    }
  );
}