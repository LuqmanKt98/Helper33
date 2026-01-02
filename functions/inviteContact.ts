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
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 50 invites per day per user
    const identifier = getClientIdentifier(req, user);
    const rateCheck = checkRateLimit(identifier, 50, 24 * 60 * 60 * 1000);

    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetTime);
    }

    const { phone_number, sms_enabled, email, email_enabled, message } = await req.json();

    let result = { sms_sent: false, email_sent: false };

    if (sms_enabled && phone_number) {
      try {
        const smsResponse = await base44.functions.invoke('sendSMS', {
          to: phone_number,
          message: message || `${user.full_name} has invited you to join DobryLife! Download the app: https://dobrylife.com`
        });
        result.sms_sent = smsResponse.data?.success || false;
      } catch (error) {
        console.error('SMS send error:', error);
      }
    }

    if (email_enabled && email) {
      try {
        await base44.integrations.Core.SendEmail({
          from_name: user.full_name || 'DobryLife',
          to: email,
          subject: `${user.full_name} invited you to DobryLife`,
          body: message || `You've been invited to join DobryLife by ${user.full_name}!\n\nVisit https://dobrylife.com to get started.`
        });
        result.email_sent = true;
      } catch (error) {
        console.error('Email send error:', error);
      }
    }

    return Response.json({
      success: true,
      ...result,
      remaining: rateCheck.remaining
    });

  } catch (error) {
    console.error('Invite error:', error);
    return Response.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
});