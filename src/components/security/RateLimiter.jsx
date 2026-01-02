// Advanced client-side rate limiting
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.suspiciousIPs = new Set();
  }

  checkLimit(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const record = this.requests.get(key) || { count: 0, resetTime: now + windowMs, timestamps: [] };

    // Clean old timestamps
    record.timestamps = record.timestamps.filter(t => now - t < windowMs);

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
      record.timestamps = [];
    }

    // Check for suspicious patterns
    if (record.timestamps.length >= 3) {
      const recentRequests = record.timestamps.slice(-3);
      const timeDiff = recentRequests[2] - recentRequests[0];
      
      // Rapid-fire detection (3 requests in < 100ms)
      if (timeDiff < 100) {
        this.suspiciousIPs.add(key);
        console.error('[Security] Suspicious rapid-fire detected from:', key);
        return false;
      }
    }

    if (record.count >= limit) {
      console.warn('[Security] Rate limit exceeded for:', key);
      return false;
    }

    record.count++;
    record.timestamps.push(now);
    this.requests.set(key, record);

    return true;
  }

  isSuspicious(key) {
    return this.suspiciousIPs.has(key);
  }

  reset(key) {
    this.requests.delete(key);
    this.suspiciousIPs.delete(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime + 60000) {
        this.requests.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);