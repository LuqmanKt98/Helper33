import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Rate limiter implementation (inlined for deployment compatibility)
const requestCounts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 0) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
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

function getClientIdentifier(req, user = null) {
  if (user?.email) {
    return `user:${user.email}`;
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

function rateLimitResponse(resetTime) {
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    // Rate limiting: 20 emails per hour per user/IP
    const identifier = getClientIdentifier(req, user);
    const rateCheck = checkRateLimit(identifier, 20, 60 * 60 * 1000);

    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetTime);
    }

    const { to, subject, body, from_name } = await req.json();

    if (!to || !subject || !body) {
      return Response.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return Response.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@dobrylife.com';

    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject,
        }],
        from: {
          email: FROM_EMAIL,
          name: from_name || 'DobryLife',
        },
        content: [{
          type: 'text/plain',
          value: body,
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    return Response.json({
      success: true,
      message: 'Email sent successfully',
      remaining: rateCheck.remaining
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return Response.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
});