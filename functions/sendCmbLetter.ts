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

    // Rate limiting: 5 letters per hour per user/IP
    const identifier = getClientIdentifier(req, user);
    const rateCheck = checkRateLimit(identifier, 5, 60 * 60 * 1000);

    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetTime);
    }

    const { letterContent, fullName, email } = await req.json();

    if (!letterContent || !fullName || !email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await base44.asServiceRole.entities.LetterSubmission.create({
      form_type: 'cmb_support',
      letter_content: letterContent,
      full_name: fullName,
      email: email,
      source_ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    const emailBody = `
New Letter of Support for Dr. Yuriy Dobry Investigation

From: ${fullName}
Email: ${email}

Letter Content:
${letterContent}

---
Submitted via DobryLife platform
Time: ${new Date().toISOString()}
    `.trim();

    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'DobryLife Support System',
        to: 'support@dobrylife.com',
        subject: `CMB Letter: Support for Dr. Yuriy Dobry Investigation - ${fullName}`,
        body: emailBody
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    return Response.json({
      success: true,
      message: 'Letter submitted successfully. Thank you for your support.',
      remaining: rateCheck.remaining
    });

  } catch (error) {
    console.error('CMB letter submission error:', error);
    return Response.json(
      { error: 'Failed to submit letter' },
      { status: 500 }
    );
  }
});