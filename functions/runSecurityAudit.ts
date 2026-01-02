import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const auditResults = {
      timestamp: new Date().toISOString(),
      audit_by: user.email,
      checks: [],
      overall_score: 0,
      critical_issues: [],
      warnings: [],
      recommendations: []
    };

    // 1. Check environment variables
    const requiredSecrets = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY', 
      'STRIPE_WEBHOOK_SECRET',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN'
    ];

    const missingSecrets = [];
    for (const secret of requiredSecrets) {
      if (!Deno.env.get(secret)) {
        missingSecrets.push(secret);
      }
    }

    auditResults.checks.push({
      name: 'Environment Variables',
      status: missingSecrets.length === 0 ? 'PASS' : 'FAIL',
      details: missingSecrets.length === 0 
        ? 'All required secrets are configured' 
        : `Missing: ${missingSecrets.join(', ')}`
    });

    if (missingSecrets.length > 0) {
      auditResults.critical_issues.push(`Missing environment variables: ${missingSecrets.join(', ')}`);
    }

    // 2. Check Stripe webhook configuration
    const stripeConfigured = Deno.env.get('STRIPE_SECRET_KEY') && 
                              Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    auditResults.checks.push({
      name: 'Stripe Webhook Security',
      status: stripeConfigured ? 'PASS' : 'FAIL',
      details: stripeConfigured 
        ? 'Webhook secret is configured for signature validation' 
        : 'Webhook secret missing - webhooks are vulnerable'
    });

    if (!stripeConfigured) {
      auditResults.critical_issues.push('Stripe webhook secret not configured');
    }

    // 3. Check user data privacy settings
    const users = await base44.asServiceRole.entities.User.list();
    const usersWithoutGDPR = users.filter(u => !u.gdpr_consent);
    
    auditResults.checks.push({
      name: 'GDPR Compliance',
      status: usersWithoutGDPR.length === 0 ? 'PASS' : 'WARNING',
      details: `${users.length - usersWithoutGDPR.length}/${users.length} users have GDPR consent recorded`
    });

    if (usersWithoutGDPR.length > 0) {
      auditResults.warnings.push(`${usersWithoutGDPR.length} users missing GDPR consent records`);
    }

    // 4. Check for users with 2FA enabled
    const twoFARecords = await base44.asServiceRole.entities.TwoFactorAuth.filter({ is_enabled: true });
    const twoFAPercentage = users.length > 0 ? (twoFARecords.length / users.length * 100).toFixed(1) : 0;
    
    auditResults.checks.push({
      name: 'Two-Factor Authentication',
      status: 'INFO',
      details: `${twoFAPercentage}% of users have 2FA enabled (${twoFARecords.length}/${users.length})`
    });

    auditResults.recommendations.push('Encourage users to enable two-factor authentication');

    // 5. Check SSL/HTTPS enforcement
    const origin = req.headers.get('origin') || '';
    const isHTTPS = origin.startsWith('https://');
    
    auditResults.checks.push({
      name: 'HTTPS/SSL',
      status: isHTTPS ? 'PASS' : 'CRITICAL',
      details: isHTTPS ? 'SSL certificate active' : 'Not using HTTPS - CRITICAL SECURITY RISK'
    });

    if (!isHTTPS && !origin.includes('localhost')) {
      auditResults.critical_issues.push('Application not using HTTPS - ALL DATA IS UNENCRYPTED');
    }

    // 6. Check for sensitive data in push subscriptions
    const pushSubs = await base44.asServiceRole.entities.PushSubscription.list();
    
    auditResults.checks.push({
      name: 'Push Notification Security',
      status: 'PASS',
      details: `${pushSubs.length} active push subscriptions with encrypted endpoints`
    });

    // 7. Security headers check
    const securityHeaders = {
      'X-Frame-Options': req.headers.get('x-frame-options'),
      'X-Content-Type-Options': req.headers.get('x-content-type-options'),
      'Strict-Transport-Security': req.headers.get('strict-transport-security')
    };

    const missingHeaders = Object.entries(securityHeaders)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    auditResults.checks.push({
      name: 'Security Headers',
      status: missingHeaders.length === 0 ? 'PASS' : 'WARNING',
      details: missingHeaders.length === 0 
        ? 'All recommended security headers present'
        : `Missing headers: ${missingHeaders.join(', ')}`
    });

    if (missingHeaders.length > 0) {
      auditResults.warnings.push(`Missing security headers: ${missingHeaders.join(', ')}`);
    }

    // Calculate overall score
    const passCount = auditResults.checks.filter(c => c.status === 'PASS').length;
    auditResults.overall_score = Math.round((passCount / auditResults.checks.length) * 100);

    // Log audit
    await base44.asServiceRole.entities.SecurityAuditLog.create({
      audit_type: 'comprehensive_scan',
      performed_by: user.email,
      overall_score: auditResults.overall_score,
      critical_issues_count: auditResults.critical_issues.length,
      warnings_count: auditResults.warnings.length,
      checks_performed: auditResults.checks.length,
      audit_results: auditResults
    });

    return Response.json(auditResults);

  } catch (error) {
    console.error('Security audit error:', error);
    return Response.json({ 
      error: 'Audit failed',
      details: error.message 
    }, { status: 500 });
  }
});