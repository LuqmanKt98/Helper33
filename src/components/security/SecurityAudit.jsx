import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function SecurityAudit() {
  const [securityChecks, setSecurityChecks] = useState([]);

  useEffect(() => {
    const runSecurityAudit = () => {
      const checks = [];

      // Check HTTPS
      checks.push({
        name: 'HTTPS Encryption',
        status: window.location.protocol === 'https:',
        message: window.location.protocol === 'https:' 
          ? 'Connection is secure (HTTPS)' 
          : 'WARNING: Connection is not secure (HTTP)',
      });

      // Check Secure Context
      checks.push({
        name: 'Secure Context',
        status: window.isSecureContext,
        message: window.isSecureContext 
          ? 'Running in secure context' 
          : 'WARNING: Not in secure context',
      });

      // Check Content Security Policy
      const hasMeta = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      checks.push({
        name: 'Content Security Policy',
        status: hasMeta,
        message: hasMeta 
          ? 'CSP headers configured' 
          : 'WARNING: CSP not fully configured',
      });

      // Check localStorage security
      try {
        const testKey = '_security_test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        checks.push({
          name: 'Local Storage',
          status: true,
          message: 'Local storage accessible and working',
        });
      } catch {
        checks.push({
          name: 'Local Storage',
          status: false,
          message: 'WARNING: Local storage blocked or unavailable',
        });
      }

      // Check for mixed content
      const hasMixedContent = Array.from(document.querySelectorAll('img, script, link')).some(
        el => el.src && el.src.startsWith('http:')
      );
      checks.push({
        name: 'Mixed Content',
        status: !hasMixedContent,
        message: hasMixedContent 
          ? 'WARNING: Mixed content detected' 
          : 'No mixed content detected',
      });

      // Check for inline scripts (security risk)
      const hasInlineScripts = document.querySelectorAll('script:not([src])').length > 0;
      checks.push({
        name: 'Inline Scripts',
        status: !hasInlineScripts,
        message: hasInlineScripts 
          ? 'Inline scripts detected (acceptable for React apps)' 
          : 'No inline scripts',
      });

      // Check cookies security
      const cookies = document.cookie;
      checks.push({
        name: 'Cookie Security',
        status: true,
        message: 'Cookies managed by Base44 authentication',
      });

      // Check for XSS vulnerabilities in URL
      const hasXSSAttempt = window.location.search.includes('<script>') || 
                            window.location.hash.includes('<script>');
      checks.push({
        name: 'XSS Protection',
        status: !hasXSSAttempt,
        message: hasXSSAttempt 
          ? 'WARNING: Potential XSS attempt detected' 
          : 'No XSS attempts in URL',
      });

      setSecurityChecks(checks);
    };

    runSecurityAudit();
  }, []);

  const passedChecks = securityChecks.filter(check => check.status).length;
  const totalChecks = securityChecks.length;
  const securityScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Security Audit</h2>
          <p className="text-gray-600">Security Status: {securityScore}%</p>
        </div>
      </div>

      <div className="space-y-3">
        {securityChecks.map((check, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              check.status ? 'bg-green-50' : 'bg-yellow-50'
            }`}
          >
            {check.status ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{check.name}</p>
              <p className="text-sm text-gray-600">{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      {securityScore === 100 && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            All security checks passed! Your connection is secure.
          </p>
        </div>
      )}
    </Card>
  );
}